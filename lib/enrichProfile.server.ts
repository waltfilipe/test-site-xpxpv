import "server-only";

import fs from "fs";
import path from "path";
import { rankToPercentileBar } from "@/lib/gradeColors";

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

type ProfileClusterFile = {
  by_player_id?: Record<string, JsonRecord>;
};

type LeaguePrecisionBars = {
  xpass_coe_pct_league_bar?: number;
  xpass_long_coe_pct_league_bar?: number;
};

type ProfilePeer = {
  playerId: string;
  league: string;
  group: string;
  short: number | null;
  long: number | null;
};

const DEFENSE_REPLACE_KEYS = new Set([
  "def_won_tackle_p90",
  "def_interception_p90",
  "def_clearance_p90",
]);

const PRECISION_LEAGUE_BAR_KEYS = [
  ["short", "xpass_coe_pct_league_bar"],
  ["long", "xpass_long_coe_pct_league_bar"],
] as const;

let derivedCache: DerivedPoolFile | null = null;
let profileClustersCache: ProfileClusterFile | null = null;
let leaguePrecisionBarsCache: Map<string, LeaguePrecisionBars> | null = null;

function getDerivedPool(): DerivedPoolFile {
  if (!derivedCache) {
    const filePath = path.join(process.cwd(), "data", "pool-derived-metrics.json");
    derivedCache = JSON.parse(fs.readFileSync(filePath, "utf-8")) as DerivedPoolFile;
  }
  return derivedCache;
}

function getProfileClusters(): ProfileClusterFile {
  if (!profileClustersCache) {
    const filePath = path.join(process.cwd(), "data", "profile-clusters.json");
    profileClustersCache = JSON.parse(fs.readFileSync(filePath, "utf-8")) as ProfileClusterFile;
  }
  return profileClustersCache;
}

function getDerivedForPlayer(playerId: string): DerivedPlayerMetrics | null {
  return getDerivedPool().players[playerId] ?? null;
}

function getProfileCluster(playerId: string): JsonRecord | null {
  const cluster = getProfileClusters().by_player_id?.[playerId];
  return cluster ?? null;
}

function loadProfilePeers(): ProfilePeer[] {
  const profilesDir = path.join(process.cwd(), "data", "profiles");
  const files = fs.readdirSync(profilesDir).filter((name) => name.endsWith(".json"));
  const peers: ProfilePeer[] = [];

  for (const file of files) {
    const profile = JSON.parse(fs.readFileSync(path.join(profilesDir, file), "utf-8")) as JsonRecord;
    const player = profile.player as JsonRecord | undefined;
    const xp = profile.xp as JsonRecord | undefined;
    if (!player || !xp) continue;

    const short = xp.xpass_coe_pct;
    const long = xp.xpass_long_coe_pct;
    peers.push({
      playerId: String(player.player_id),
      league: String(player.league_source ?? "unknown"),
      group: String(player.position_group ?? "unknown"),
      short: typeof short === "number" && Number.isFinite(short) ? short : null,
      long: typeof long === "number" && Number.isFinite(long) ? long : null,
    });
  }

  return peers;
}

function buildLeaguePrecisionBarsCache(): Map<string, LeaguePrecisionBars> {
  const peers = loadProfilePeers();
  const out = new Map<string, LeaguePrecisionBars>();

  for (const [metric, barKey] of PRECISION_LEAGUE_BAR_KEYS) {
    const groups = new Map<string, { playerId: string; value: number }[]>();

    for (const peer of peers) {
      const value = metric === "short" ? peer.short : peer.long;
      if (value == null) continue;
      const groupKey = `${peer.league}\0${peer.group}`;
      const bucket = groups.get(groupKey) ?? [];
      bucket.push({ playerId: peer.playerId, value });
      groups.set(groupKey, bucket);
    }

    for (const group of groups.values()) {
      group.sort((a, b) => b.value - a.value);
      const pool = group.length;
      group.forEach(({ playerId }, index) => {
        const bar = rankToPercentileBar(index + 1, pool);
        if (bar == null) return;
        const existing = out.get(playerId) ?? {};
        out.set(playerId, { ...existing, [barKey]: bar });
      });
    }
  }

  return out;
}

function getLeaguePrecisionBars(playerId: string): LeaguePrecisionBars {
  if (!leaguePrecisionBarsCache) {
    leaguePrecisionBarsCache = buildLeaguePrecisionBarsCache();
  }
  return leaguePrecisionBarsCache.get(playerId) ?? {};
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

function enrichXpMetrics(
  xp: JsonRecord | undefined,
  playerId: string,
  derived: DerivedPlayerMetrics | null,
): JsonRecord {
  const next: JsonRecord = { ...(xp ?? {}) };
  const leagueBars = getLeaguePrecisionBars(playerId);

  if (next.xpass_coe_pct_league_bar == null && leagueBars.xpass_coe_pct_league_bar != null) {
    next.xpass_coe_pct_league_bar = leagueBars.xpass_coe_pct_league_bar;
  }
  if (next.xpass_long_coe_pct_league_bar == null && leagueBars.xpass_long_coe_pct_league_bar != null) {
    next.xpass_long_coe_pct_league_bar = leagueBars.xpass_long_coe_pct_league_bar;
  }

  if (derived) {
    if (derived.chance_creation_xpv_per_game != null) {
      next.chance_creation_xpv_per_game = derived.chance_creation_xpv_per_game;
    }
    if (derived.chance_creation_xpv != null) {
      next.chance_creation_xpv = derived.chance_creation_xpv;
    }
  }

  return next;
}

export function enrichPlayerProfile(profile: JsonRecord): JsonRecord {
  const playerId = String((profile.player as JsonRecord | undefined)?.player_id ?? "");
  if (!playerId) return profile;

  const derived = getDerivedForPlayer(playerId);
  const cluster = profile.profile_cluster ?? getProfileCluster(playerId);

  let next: JsonRecord = cluster ? { ...profile, profile_cluster: cluster } : { ...profile };
  next = {
    ...next,
    xp: enrichXpMetrics(next.xp as JsonRecord | undefined, playerId, derived),
  };

  if (!derived) return next;

  const xpIndices = (next.xp_indices as JsonRecord[] | undefined)?.map((item) => {
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

  const passScores = (next.pass_scores as JsonRecord[] | undefined)?.map((section) =>
    enrichChanceCreationSection(section, derived),
  );

  return {
    ...next,
    ...(xpIndices ? { xp_indices: xpIndices } : {}),
    ...(passScores ? { pass_scores: passScores } : {}),
  };
}
