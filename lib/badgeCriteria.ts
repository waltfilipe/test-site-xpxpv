import type { PlayerBadgeKey } from "@/lib/playerBadges";

export const BADGE_CRITERIA_METRIC_KEYS = [
  "volume",
  "buildup",
  "precision",
  "chanceCreation",
  "lethality",
  "xpvPerPass",
  "shortPass",
  "longPass",
] as const;

export type BadgeCriteriaMetricKey = (typeof BADGE_CRITERIA_METRIC_KEYS)[number];

export type BadgeCriteriaSpec = {
  allOnly?: boolean;
  valued?: BadgeCriteriaMetricKey[];
  devalued?: BadgeCriteriaMetricKey[];
};

export const BADGE_CRITERIA: Record<PlayerBadgeKey, BadgeCriteriaSpec> = {
  elite_passer: { allOnly: true },
  metronome: {
    valued: ["volume", "precision"],
    devalued: ["chanceCreation"],
  },
  organizador: {
    valued: ["volume", "buildup"],
    devalued: ["xpvPerPass", "precision"],
  },
  progressor: {
    valued: ["buildup", "xpvPerPass"],
    devalued: ["volume"],
  },
  criativo: {
    valued: ["chanceCreation", "lethality"],
    devalued: ["volume"],
  },
  mestre_curto: {
    valued: ["shortPass"],
    devalued: ["longPass"],
  },
  bombeiro_longo: {
    valued: ["longPass"],
    devalued: ["shortPass"],
  },
};
