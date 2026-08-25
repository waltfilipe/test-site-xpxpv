export const PLAYER_BADGE_KEYS = [
  "elite_passer",
  "metronome",
  "organizador",
  "progressor",
  "criativo",
  "mestre_curto",
  "bombeiro_longo",
] as const;

export type PlayerBadgeKey = (typeof PLAYER_BADGE_KEYS)[number];

export type PlayerBadgeSpec = {
  icon: string;
  accent: string;
};

export const PLAYER_BADGE_CATALOG: Record<PlayerBadgeKey, PlayerBadgeSpec> = {
  elite_passer: { icon: "fa-star", accent: "#fbbf24" },
  metronome: { icon: "fa-clock", accent: "#c4b5fd" },
  organizador: { icon: "fa-sitemap", accent: "#38bdf8" },
  progressor: { icon: "fa-arrow-trend-up", accent: "#a3e635" },
  criativo: { icon: "fa-wand-magic-sparkles", accent: "#f472b6" },
  mestre_curto: { icon: "fa-compress", accent: "#22d3ee" },
  bombeiro_longo: { icon: "fa-bullseye", accent: "#fb923c" },
};

export function sortPlayerBadges(badges: Iterable<PlayerBadgeKey>): PlayerBadgeKey[] {
  const set = new Set(badges);
  return PLAYER_BADGE_KEYS.filter((key) => set.has(key));
}

export function isPlayerBadgeKey(value: string): value is PlayerBadgeKey {
  return (PLAYER_BADGE_KEYS as readonly string[]).includes(value);
}
