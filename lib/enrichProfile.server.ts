import "server-only";

import fs from "fs";
import path from "path";

type JsonRecord = Record<string, unknown>;

type DerivedPlayerMetrics = {
  defensive_actions_p90?: number | null;
  defensive_actions_p90_rank_in_league?: number | null;
  defensive_actions_p90_rank_pool_in_league?: number | null;
  chance_creation_xpv?: number | null;
  chance_creation_xpv_per_game?: number | null;
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
  return section;
}

export function enrichPlayerProfile(profile: JsonRecord): JsonRecord {
  const playerId = String((profile.player as JsonRecord | undefined)?.player_id ?? "");
  if (!playerId) return profile;

  const derived = getDerivedForPlayer(playerId);
  if (!derived) return profile;

  const xpIndices = (profile.xp_indices as JsonRecord[] | undefined)?.map((item) => {
    if (item.key !== "defense" || !Array.isArray(item.components)) return item;
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

  const passScores = (profile.pass_scores as JsonRecord[] | undefined)?.map((section) =>
    enrichChanceCreationSection(section, derived),
  );

  return {
    ...profile,
    ...(xpIndices ? { xp_indices: xpIndices } : {}),
    ...(passScores ? { pass_scores: passScores } : {}),
    xp: {
      ...(profile.xp as JsonRecord | undefined),
      ...(derived.chance_creation_xpv_per_game != null
        ? { chance_creation_xpv_per_game: derived.chance_creation_xpv_per_game }
        : {}),
      ...(derived.chance_creation_xpv != null ? { chance_creation_xpv: derived.chance_creation_xpv } : {}),
    },
  };
}
