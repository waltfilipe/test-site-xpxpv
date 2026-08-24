const LEAGUE_LABELS: Record<string, string> = {
  premier_league: "Premier League",
  italia_seriea: "Serie A",
  laliga: "La Liga",
  bundesliga: "Bundesliga",
  ligue1: "Ligue 1",
};

export function formatLeagueName(
  league?: string | null,
  leagueSource?: string | null,
): string {
  const named = league?.trim();
  if (named) return named;
  const source = leagueSource?.trim();
  if (!source) return "—";
  return LEAGUE_LABELS[source] ?? source.replace(/_/g, " ");
}

export function formatPlayerHeight(value: unknown): string | null {
  if (value == null || value === "") return null;
  const text = String(value).trim().replace(",", ".");
  if (!text) return null;

  const metersMatch = text.match(/(\d+(?:\.\d+)?)\s*m\b/i);
  if (metersMatch) {
    const meters = Number(metersMatch[1]);
    if (Number.isFinite(meters) && meters >= 1.4 && meters <= 2.2) {
      return `${meters.toFixed(2)} m`;
    }
  }

  const cmMatch = text.match(/(\d{2,3})\s*cm\b/i);
  if (cmMatch) {
    const cm = Number(cmMatch[1]);
    if (Number.isFinite(cm) && cm >= 140 && cm <= 220) {
      return `${(cm / 100).toFixed(2)} m`;
    }
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const meters = value > 3 ? value / 100 : value;
    if (meters >= 1.4 && meters <= 2.2) {
      return `${meters.toFixed(2)} m`;
    }
  }

  return null;
}

export function formatDominantFoot(value: unknown): string | null {
  if (value == null) return null;
  const text = String(value).trim();
  if (!text) return null;
  const lower = text.toLowerCase();
  if (lower === "both") return "Both";
  if (lower.startsWith("left")) return "Left";
  if (lower.startsWith("right")) return "Right";
  return text;
}

export function formatContractUntil(value: unknown): string {
  if (value == null || value === "") return "—";
  const s = String(value).trim();
  const ymd = s.match(/^(\d{4})[-/](\d{1,2})/);
  if (ymd) return `${ymd[1]}/${ymd[2].padStart(2, "0")}`;
  const year = s.match(/^(\d{4})/);
  if (year) return year[1];
  return s;
}

const XPV_PER_PASS_KEYS = new Set([
  "xpv_per_pass",
  "leth_xpv_per_pass",
  "chance_creation_xpv_per_pass",
]);

const CHANCE_CREATION_METRIC_KEYS = new Set([
  "key_passes",
  "passes_to_box",
  "test_impact_v2_start_final_third_p90",
  "chance_creation_xpv",
  "chance_creation_xpv_per_game",
  "chance_creation_xpv_per_pass",
]);

const SHARE_PCT_KEYS = new Set([
  "vol_passes_team_share_pct",
  "vol_long_team_share_pct",
  "build_prog_share_pct",
  "build_final_third_share_pct",
  "build_line_break_share_pct",
  "chance_key_share_pct",
  "chance_box_share_pct",
  "chance_impact_ft_share_pct",
]);

export function formatMetric(value: unknown, key?: string): string {
  if (value == null) return "—";
  if (typeof value === "number") {
    if (key && SHARE_PCT_KEYS.has(key)) {
      return `${value.toFixed(1)}%`;
    }
    if (key?.endsWith("_share_pct")) {
      return `${value.toFixed(1)}%`;
    }
    if (key?.endsWith("_delta_pp")) {
      return `${value >= 0 ? "+" : ""}${value.toFixed(1)} pp`;
    }
    if (key?.startsWith("def_") && key.endsWith("_pct")) {
      return `${value.toFixed(1)}%`;
    }
    if (key?.includes("pct") || key?.includes("coe")) {
      return `${value >= 0 ? "+" : ""}${value.toFixed(1)} pp`;
    }
    if (key && XPV_PER_PASS_KEYS.has(key)) {
      return value.toFixed(2);
    }
    if (key && CHANCE_CREATION_METRIC_KEYS.has(key)) {
      if (key === "chance_creation_xpv") return value.toFixed(2);
      return value.toFixed(2);
    }
    if (Number.isInteger(value) && !key?.includes("p90") && !key?.includes("score")) {
      return value.toLocaleString();
    }
    return value.toFixed(1);
  }
  return String(value);
}
