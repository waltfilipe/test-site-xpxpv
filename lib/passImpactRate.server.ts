import "server-only";

import fs from "fs";
import path from "path";

export type ImpactRateStats = {
  value: number | null;
  rank: number | null;
  rankPool: number | null;
  letter: string | null;
  displayScore: number | null;
};

const RANK_PERCENTILE_LETTER_TIERS: [number, string][] = [
  [0.02, "A+"],
  [0.045, "A"],
  [0.08, "A-"],
  [0.13, "B+"],
  [0.22, "B"],
  [0.34, "B-"],
  [0.46, "C+"],
  [0.58, "C"],
  [0.72, "C-"],
  [1.01, "D"],
];

const LETTER_GRADE_COLOR_SCORES: Record<string, number> = {
  "A+": 8.9,
  A: 8.4,
  "A-": 7.9,
  "B+": 7.4,
  B: 6.9,
  "B-": 6.4,
  "C+": 5.9,
  C: 5.4,
  "C-": 4.9,
  D: 4.2,
};

let impactRateCache: Map<string, ImpactRateStats> | null = null;

function letterFromRank(rank: number, pool: number): string {
  if (rank <= 0 || pool <= 0) return "—";
  const pct = rank / pool;
  for (const [ceiling, letter] of RANK_PERCENTILE_LETTER_TIERS) {
    if (pct <= ceiling) return letter;
  }
  return "D";
}

function displayFromLetter(letter: string | null): number | null {
  if (!letter || letter === "—") return null;
  return LETTER_GRADE_COLOR_SCORES[letter] ?? null;
}

function loadImpactRatePool(): Map<string, ImpactRateStats> {
  if (impactRateCache) return impactRateCache;

  const filePath = path.join(process.cwd(), "data", "pool-metrics.json");
  const rows = JSON.parse(fs.readFileSync(filePath, "utf-8")) as Record<string, unknown>[];

  const grouped = new Map<string, { playerId: string; value: number }[]>();
  for (const row of rows) {
    const playerId = String(row.player_id ?? "");
    const value = row.threat_pass_pct;
    if (!playerId || value == null || Number.isNaN(Number(value))) continue;
    const group = String(row.position_group ?? "central_midfielders");
    const bucket = grouped.get(group) ?? [];
    bucket.push({ playerId, value: Number(value) });
    grouped.set(group, bucket);
  }

  const out = new Map<string, ImpactRateStats>();
  for (const bucket of grouped.values()) {
    const pool = bucket.length;
    const ordered = [...bucket].sort((a, b) => b.value - a.value);
    ordered.forEach((entry, index) => {
      const rank = index + 1;
      const letter = letterFromRank(rank, pool);
      out.set(entry.playerId, {
        value: entry.value,
        rank,
        rankPool: pool,
        letter,
        displayScore: displayFromLetter(letter),
      });
    });
  }

  impactRateCache = out;
  return out;
}

export function getImpactRateStats(playerId: string): ImpactRateStats | null {
  return loadImpactRatePool().get(playerId) ?? null;
}

export function getImpactRatePoolSize(): number {
  return loadImpactRatePool().size;
}
