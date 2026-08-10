import "server-only";

import fs from "fs";
import path from "path";
import { getImpactRateStats } from "@/lib/passImpactRate.server";

type JsonRecord = Record<string, unknown>;

type DerivedPlayerMetrics = {
  defensive_actions_p90?: number | null;
  defensive_actions_p90_rank_in_league?: number | null;
  defensive_actions_p90_rank_pool_in_league?: number | null;
  chance_creation_xpv?: number | null;
  chance_creation_xpv_rank_in_group?: number | null;
  chance_creation_xpv_rank_pool_in_group?: number | null;
};

type DerivedPoolFile = {
  players: Record<string, DerivedPlayerMetrics>;
};

const DEFENSE_REPLACE_KEYS = new Set([
  "def_won_tackle_p90",
  "def_interception_p90",
  "def_clearance_p90",
]);

let derivedCache: DerivedPoolFile | null = null;

function getDerivedPool(): DerivedPoolFile {
  if (!derivedCache) {
    const filePath = path.join(process.cwd(), "data", "pool-derived-metrics.json");
    derivedCache = JSON.parse(fs.readFileSync(filePath, "utf-8")) as DerivedPoolFile;
  }
  return derivedCache;
}

function getDerivedForPlayer(playerId: string): DerivedPlayerMetrics | null {
  return getDerivedPool().players[playerId] ?? null;
}

function enrichDefenseComponents(
  components: { key: string; label: string; value?: number | null; rank?: number | null; rank_pool?: number | null }[],
  derived: DerivedPlayerMetrics,
) {
  const kept = components.filter((c) => !DEFENSE_REPLACE_KEYS.has(c.key));
  if (derived.defensive_actions_p90 == null) return kept;

  return [
    {
      key: "defensive_actions_p90",
      label: "Defensive actions / 90",
      value: derived.defensive_actions_p90,
      rank: derived.defensive_actions_p90_rank_in_league ?? null,
      rank_pool: derived.defensive_actions_p90_rank_pool_in_league ?? null,
    },
    ...kept,
  ];
}

function enrichChanceCreationSection(section: JsonRecord, derived: DerivedPlayerMetrics): JsonRecord {
  if (section.title !== "Chance creation") return section;
  const components = (section.components as JsonRecord[] | undefined) ?? [];
  if (derived.chance_creation_xpv == null) return section;

  return {
    ...section,
    components: [
      ...components,
      {
        key: "chance_creation_xpv",
        value: derived.chance_creation_xpv,
        rank: derived.chance_creation_xpv_rank_in_group ?? null,
        rank_pool: derived.chance_creation_xpv_rank_pool_in_group ?? null,
        stratum_star: false,
      },
    ],
  };
}

function enrichImpactIndex(indices: JsonRecord[] | undefined, playerId: string): JsonRecord[] | undefined {
  if (!indices) return indices;

  const impactRate = getImpactRateStats(playerId);
  if (impactRate?.value == null) return indices;

  return indices.map((item) => {
    if (item.key !== "impact" || !Array.isArray(item.components)) return item;

    const residual = (item.components as JsonRecord[]).find((c) => c.key === "xp_residual_mean");
    const components: JsonRecord[] = [
      {
        key: "threat_pass_pct",
        label: "Impact Rate",
        value: impactRate.value,
        rank: impactRate.rank,
        rank_pool: impactRate.rankPool,
      },
    ];
    if (residual) components.push(residual);

    return { ...item, components };
  });
}

function buildImpactPassScoreSection(playerId: string, xp: JsonRecord): JsonRecord | null {
  const impactRate = getImpactRateStats(playerId);
  if (impactRate?.value == null) return null;

  return {
    title: "Impact",
    display_score: impactRate.displayScore ?? xp.pass_impact_display ?? null,
    letter: impactRate.letter ?? xp.pass_impact_letter ?? null,
    index: xp.pass_impact_index ?? null,
    rank: impactRate.rank ?? xp.pass_impact_index_rank_in_group ?? null,
    rank_pool: impactRate.rankPool ?? xp.pass_impact_index_rank_pool_in_group ?? null,
    components: [
      {
        key: "threat_pass_pct",
        value: impactRate.value,
        rank: impactRate.rank,
        rank_pool: impactRate.rankPool,
        stratum_star: false,
      },
    ],
  };
}

function enrichPassScores(
  passScores: JsonRecord[] | undefined,
  derived: DerivedPlayerMetrics | null,
  playerId: string,
  xp: JsonRecord,
): JsonRecord[] | undefined {
  const base = (passScores ?? [])
    .filter((section) => section.title !== "Impact")
    .map((section) => (derived ? enrichChanceCreationSection(section, derived) : section));

  const impactSection = buildImpactPassScoreSection(playerId, xp);
  if (!impactSection) return base.length ? base : passScores;

  return [...base, impactSection];
}

export function enrichPlayerProfile(profile: JsonRecord): JsonRecord {
  const playerId = String((profile.player as JsonRecord | undefined)?.player_id ?? "");
  if (!playerId) return profile;

  const derived = getDerivedForPlayer(playerId);
  const xp = (profile.xp as JsonRecord | undefined) ?? {};

  let xpIndices = (profile.xp_indices as JsonRecord[] | undefined)?.map((item) => {
    if (!derived || item.key !== "defense" || !Array.isArray(item.components)) return item;
    return {
      ...item,
      components: enrichDefenseComponents(
        item.components as {
          key: string;
          label: string;
          value?: number | null;
          rank?: number | null;
          rank_pool?: number | null;
        }[],
        derived,
      ),
    };
  });

  xpIndices = enrichImpactIndex(xpIndices, playerId);

  const passScores = enrichPassScores(
    profile.pass_scores as JsonRecord[] | undefined,
    derived,
    playerId,
    xp,
  );

  return {
    ...profile,
    ...(xpIndices ? { xp_indices: xpIndices } : {}),
    ...(passScores ? { pass_scores: passScores } : {}),
  };
}
