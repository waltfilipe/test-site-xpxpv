export const PLAYER_BADGE_KEYS = [
  "organizador",
  "criativo",
  "progressor",
  "mestre_curto",
  "bombeiro_longo",
  "motor",
] as const;

export type PlayerBadgeKey = (typeof PLAYER_BADGE_KEYS)[number];

export type PlayerBadgeSpec = {
  icon: string;
  accent: string;
};

export const PLAYER_BADGE_CATALOG: Record<PlayerBadgeKey, PlayerBadgeSpec> = {
  organizador: { icon: "fa-sitemap", accent: "#38bdf8" },
  criativo: { icon: "fa-wand-magic-sparkles", accent: "#f472b6" },
  progressor: { icon: "fa-arrow-trend-up", accent: "#a3e635" },
  mestre_curto: { icon: "fa-compress", accent: "#22d3ee" },
  bombeiro_longo: { icon: "fa-bullseye", accent: "#fb923c" },
  motor: { icon: "fa-bolt", accent: "#facc15" },
};

export function sortPlayerBadges(badges: Iterable<PlayerBadgeKey>): PlayerBadgeKey[] {
  const set = new Set(badges);
  return PLAYER_BADGE_KEYS.filter((key) => set.has(key));
}

export function isPlayerBadgeKey(value: string): value is PlayerBadgeKey {
  return (PLAYER_BADGE_KEYS as readonly string[]).includes(value);
}
