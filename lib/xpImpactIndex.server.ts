import "server-only";

import fs from "fs";
import path from "path";

const XP_INDEX_ELITE_TOP_N = 10;
const PROFILES_DIR = path.join(process.cwd(), "data", "profiles");

export type ImpactIndexComponent = {
  key: string;
  label: string;
  value: number;
  rank: number | null;
  rank_pool: number | null;
};

export type ImpactIndexStats = {
  tier: string;
  components: ImpactIndexComponent[];
};

type ImpactRow = {
  playerId: string;
  positionGroup: string;
  xpvPerPass: number;
  threatPassPct: number;
  xpvRank: number | null;
  xpvRankPool: number | null;
};

let impactIndexCache: Map<string, ImpactIndexStats> | null = null;

function tierFromRank(rank: number, pool: number): string {
  if (rank <= 0 || pool <= 0) return "mid";
  if (rank <= XP_INDEX_ELITE_TOP_N) return "elite";
  const pct = rank / pool;
  if (pct <= 1 / 3) return "above";
  if (pct <= 2 / 3) return "mid";
  return "below";
}

function zScores(values: number[]): number[] {
  if (!values.length) return [];
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  const std = Math.sqrt(variance);
  if (!std || !Number.isFinite(std)) return values.map(() => 0);
  return values.map((value) => (value - mean) / std);
}

function rankDescending(
  entries: { playerId: string; value: number }[],
): Map<string, { rank: number; rankPool: number }> {
  const pool = entries.length;
  const ordered = [...entries].sort((a, b) => b.value - a.value);
  const out = new Map<string, { rank: number; rankPool: number }>();
  ordered.forEach((entry, index) => {
    out.set(entry.playerId, { rank: index + 1, rankPool: pool });
  });
  return out;
}

function readImpactRows(): ImpactRow[] {
  const files = fs.readdirSync(PROFILES_DIR).filter((name) => name.endsWith(".json"));
  const rows: ImpactRow[] = [];

  for (const file of files) {
    const profile = JSON.parse(fs.readFileSync(path.join(PROFILES_DIR, file), "utf-8")) as Record<
      string,
      unknown
    >;
    const player = (profile.player as Record<string, unknown> | undefined) ?? {};
    const xp = (profile.xp as Record<string, unknown> | undefined) ?? {};
    const playerId = String(player.player_id ?? "");
    const impactItem = (profile.xp_indices as {
      key?: string;
      components?: { key?: string; rank?: number; rank_pool?: number; value?: unknown }[];
    }[] | undefined)?.find((item) => item.key === "impact");
    const xpvComponent = impactItem?.components?.find((c) => c.key === "xpv_per_pass");
    const xpvPerPass = xpvComponent?.value ?? xp.xpv_per_pass;
    const threatPassPct = player.threat_pass_pct;

    if (
      !playerId
      || xpvPerPass == null
      || threatPassPct == null
      || Number.isNaN(Number(xpvPerPass))
      || Number.isNaN(Number(threatPassPct))
    ) {
      continue;
    }

    rows.push({
      playerId,
      positionGroup: String(player.position_group ?? "central_midfielders"),
      xpvPerPass: Number(xpvPerPass),
      threatPassPct: Number(threatPassPct),
      xpvRank: xpvComponent?.rank ?? (xp.xpv_per_pass_rank_in_group as number | null) ?? null,
      xpvRankPool: xpvComponent?.rank_pool ?? (xp.xpv_per_pass_rank_pool_in_group as number | null) ?? null,
    });
  }

  return rows;
}

function buildImpactIndexCache(): Map<string, ImpactIndexStats> {
  const rows = readImpactRows();
  const grouped = new Map<string, ImpactRow[]>();

  for (const row of rows) {
    const bucket = grouped.get(row.positionGroup) ?? [];
    bucket.push(row);
    grouped.set(row.positionGroup, bucket);
  }

  const out = new Map<string, ImpactIndexStats>();

  for (const bucket of grouped.values()) {
    const pool = bucket.length;
    if (!pool) continue;

    const xpvZs = zScores(bucket.map((row) => row.xpvPerPass));
    const rateZs = zScores(bucket.map((row) => row.threatPassPct));
    const composites = bucket.map((row, index) => ({
      playerId: row.playerId,
      composite: (xpvZs[index] + rateZs[index]) / 2,
      row,
    }));

    const compositeRanks = rankDescending(
      composites.map((entry) => ({ playerId: entry.playerId, value: entry.composite })),
    );
    const rateRanks = rankDescending(
      bucket.map((row) => ({ playerId: row.playerId, value: row.threatPassPct })),
    );

    composites.forEach((entry) => {
      const rankInfo = compositeRanks.get(entry.playerId);
      const rateRank = rateRanks.get(entry.playerId);
      const tier = rankInfo ? tierFromRank(rankInfo.rank, rankInfo.rankPool) : "mid";

      out.set(entry.playerId, {
        tier,
        components: [
          {
            key: "xpv_per_pass",
            label: "xPV/Pass",
            value: entry.row.xpvPerPass,
            rank: entry.row.xpvRank,
            rank_pool: entry.row.xpvRankPool,
          },
          {
            key: "threat_pass_pct",
            label: "Impact Rate",
            value: entry.row.threatPassPct,
            rank: rateRank?.rank ?? null,
            rank_pool: rateRank?.rankPool ?? null,
          },
        ],
      });
    });
  }

  return out;
}

export function getImpactIndexStats(playerId: string): ImpactIndexStats | null {
  if (!impactIndexCache) impactIndexCache = buildImpactIndexCache();
  return impactIndexCache.get(playerId) ?? null;
}
