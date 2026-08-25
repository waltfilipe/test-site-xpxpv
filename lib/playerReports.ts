import cohortData from "@/data/profile-cohort-blocks.json";

export type ReportPlayerRef = {
  playerId: string;
  positionFamily?: string;
  note?: string;
};

export type ReportPlayerGroup = {
  label?: string;
  players: ReportPlayerRef[];
};

export type PlayerReportCategory = {
  id: string;
  title?: string;
  subtitle?: string;
  description?: string;
  accent: string;
  groups: ReportPlayerGroup[];
};

const mid = "midfielders" as const;

function p(playerId: string, note?: string): ReportPlayerRef {
  return { playerId, positionFamily: mid, note };
}

export const PROFILE_ALL_GROUP = {
  id: "all",
  title: "All Players",
  subtitle: "Report watchlist",
  description: "All report profiles ranked by overall pass grade.",
  accent: "#cbd5e1",
} as const;

export const PLAYER_REPORT_CATEGORIES: PlayerReportCategory[] = cohortData.categories.map((cat) => ({
  id: cat.id,
  accent: cat.accent,
  groups: cat.groups.map((group) => ({
    label: group.label,
    players: group.players.map((player) => p(player.player_id, player.note)),
  })),
}));

export function allReportPlayerRefs(): ReportPlayerRef[] {
  const seen = new Set<string>();
  const out: ReportPlayerRef[] = [];
  for (const category of PLAYER_REPORT_CATEGORIES) {
    for (const group of category.groups) {
      for (const player of group.players) {
        if (seen.has(player.playerId)) continue;
        seen.add(player.playerId);
        out.push(player);
      }
    }
  }
  return out;
}

/** Unique player ids published on the site (top-5 / top-10 / top-u23 cohorts, overlaps allowed). */
export function siteCohortPlayerIds(): Set<string> {
  const ids = cohortData.all_player_ids;
  if (Array.isArray(ids) && ids.length) {
    return new Set(ids.map(String));
  }
  return new Set(allReportPlayerRefs().map((entry) => entry.playerId));
}

export function isSiteCohortPlayer(playerId: string): boolean {
  return siteCohortPlayerIds().has(String(playerId));
}

export function totalReportCount(): number {
  return allReportPlayerRefs().length;
}

export type EnrichedReportPlayer = ReportPlayerRef & {
  category: PlayerReportCategory;
  groupLabel?: string;
  categoryIndex: number;
};

export type MergedReportPlayer = EnrichedReportPlayer & {
  groupLabels: string[];
  categoryIds: string[];
};

export function enrichedReportPlayers(): EnrichedReportPlayer[] {
  const out: EnrichedReportPlayer[] = [];
  for (const category of PLAYER_REPORT_CATEGORIES) {
    let categoryIndex = 0;
    for (const group of category.groups) {
      for (const player of group.players) {
        categoryIndex += 1;
        out.push({
          ...player,
          category,
          groupLabel: group.label,
          categoryIndex,
        });
      }
    }
  }
  return out;
}

export function mergedReportPlayers(): MergedReportPlayer[] {
  const byId = new Map<string, MergedReportPlayer>();

  for (const entry of enrichedReportPlayers()) {
    const existing = byId.get(entry.playerId);
    if (!existing) {
      byId.set(entry.playerId, {
        ...entry,
        groupLabels: entry.groupLabel ? [entry.groupLabel] : [],
        categoryIds: [entry.category.id],
      });
      continue;
    }

    if (entry.groupLabel && !existing.groupLabels.includes(entry.groupLabel)) {
      existing.groupLabels.push(entry.groupLabel);
    }
    if (!existing.categoryIds.includes(entry.category.id)) {
      existing.categoryIds.push(entry.category.id);
    }
  }

  return Array.from(byId.values());
}

export function reportEntryForPlayer(playerId: string): EnrichedReportPlayer | null {
  return enrichedReportPlayers().find((entry) => entry.playerId === playerId) ?? null;
}

export function playerIdsForProfileGroup(groupId: string): Set<string> {
  const category = PLAYER_REPORT_CATEGORIES.find((cat) => cat.id === groupId);
  if (!category) return new Set();
  const ids = new Set<string>();
  for (const group of category.groups) {
    for (const player of group.players) {
      ids.add(player.playerId);
    }
  }
  return ids;
}

export function profileLeagueCounts(
  players: { player_id?: string | number | null; league_source?: string | null }[],
  profileGroupId: string = PROFILE_ALL_GROUP.id,
): Record<string, number> {
  let list = players;
  if (profileGroupId !== PROFILE_ALL_GROUP.id) {
    const allowed = playerIdsForProfileGroup(profileGroupId);
    list = players.filter((player) => allowed.has(String(player.player_id)));
  }

  const counts: Record<string, number> = {};
  for (const player of list) {
    const league = String(player.league_source ?? "");
    if (!league) continue;
    counts[league] = (counts[league] ?? 0) + 1;
  }
  return counts;
}

export function profileGroupCounts(
  players: { player_id?: string | number | null }[],
): Record<string, number> {
  const available = new Set(players.map((p) => String(p.player_id)));
  const counts: Record<string, number> = {
    [PROFILE_ALL_GROUP.id]: players.length,
  };
  for (const category of PLAYER_REPORT_CATEGORIES) {
    const ids = playerIdsForProfileGroup(category.id);
    counts[category.id] = [...ids].filter((id) => available.has(id)).length;
  }
  return counts;
}
