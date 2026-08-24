import type { PlayerProfile } from "@/lib/api";
import type { Messages } from "@/lib/i18n/messages";
import type { ReportMapFilterKey } from "@/lib/reportMapKeys";

export type ReportMapCaption = {
  stats: string[];
  summary: string;
};

function num(source: Record<string, unknown>, key: string): number | null {
  const val = source[key];
  if (val == null || val === "") return null;
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
}

function fmt1(value: number | null): string {
  if (value == null) return "—";
  return (Math.round(value * 10) / 10).toFixed(1);
}

function fmtPct(value: number | null): string {
  if (value == null) return "—";
  return (Math.round(value * 10) / 10).toFixed(1);
}

function fmt2(value: number | null): string {
  if (value == null) return "—";
  return (Math.round(value * 100) / 100).toFixed(2);
}

function replaceAll(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (out, [key, value]) => out.replaceAll(`{${key}}`, value),
    template,
  );
}

function profileSource(profile: PlayerProfile): Record<string, unknown> {
  const player = profile.player as Record<string, unknown>;
  const xp = (profile.xp ?? {}) as Record<string, unknown>;
  return { ...player, ...xp };
}

function originZoneLabel(
  source: Record<string, unknown>,
  c: Messages["reports"]["mapCaptions"],
): string | null {
  const profile = String(source.midfield_origin_profile ?? "").trim();
  if (profile === "campo_defensivo") return c.dominantOriginDefensive;
  if (profile === "campo_ofensivo") return c.dominantOriginOffensive;
  return null;
}

function progressivePenaltyAreaShare(source: Record<string, unknown>): number | null {
  const progressive = num(source, "special_progressive");
  const inBox = num(source, "special_in_box");
  if (progressive == null || inBox == null || progressive <= 0) return null;
  return (inBox / progressive) * 100;
}

function buildOriginCaption(
  source: Record<string, unknown>,
  c: Messages["reports"]["mapCaptions"],
): ReportMapCaption {
  const prog = num(source, "progressive_passes");
  const passesTotal = num(source, "passes_total");
  const offensivePct = num(source, "midfield_offensive_origin_pct");
  const defensivePct =
    offensivePct != null ? Math.max(0, Math.min(100, 100 - offensivePct)) : null;
  const progShare =
    prog != null && passesTotal != null && passesTotal > 0
      ? (prog / passesTotal) * 100
      : num(source, "build_prog_share_pct");
  const leagueBar = num(source, "progressive_passes_league_bar");
  const zone = originZoneLabel(source, c);

  const stats: string[] = [
    replaceAll(c.progVolume, {
      prog: fmt1(prog),
      share: fmtPct(progShare),
    }),
  ];

  if (defensivePct != null) {
    stats.push(replaceAll(c.defensiveHalf, { def: fmtPct(defensivePct) }));
  }

  if (zone) {
    stats.push(replaceAll(c.dominantOrigin, { zone }));
  }

  if (leagueBar != null) {
    stats.push(
      replaceAll(c.leagueRank, {
        pct: String(Math.round(leagueBar)),
      }),
    );
  }

  let summary = c.summaryOriginBalanced;
  if (offensivePct != null && offensivePct >= 58) {
    summary = c.summaryOriginAttacking;
  } else if (defensivePct != null && defensivePct >= 58) {
    summary = c.summaryOriginDeep;
  }

  return { stats, summary };
}

function buildDestCaption(
  source: Record<string, unknown>,
  c: Messages["reports"]["mapCaptions"],
): ReportMapCaption {
  const finalThirdShare = num(source, "build_final_third_share_pct");
  const penaltyAreaShare = progressivePenaltyAreaShare(source);
  const finalThirdVol = num(source, "final_third_passes");
  const lineBreakShare = num(source, "build_line_break_share_pct");

  const stats: string[] = [];

  if (finalThirdShare != null) {
    stats.push(replaceAll(c.finalThirdShare, { pct: fmtPct(finalThirdShare) }));
  }

  if (penaltyAreaShare != null) {
    stats.push(replaceAll(c.penaltyAreaShare, { pct: fmtPct(penaltyAreaShare) }));
  }

  stats.push(replaceAll(c.finalThirdVolume, { value: fmt1(finalThirdVol) }));

  if (lineBreakShare != null) {
    stats.push(replaceAll(c.lineBreakShare, { pct: fmtPct(lineBreakShare) }));
  }

  const summary =
    finalThirdShare != null && finalThirdShare >= 32
      ? c.summaryDestFinalThird
      : c.summaryDestMiddle;

  return { stats, summary };
}

function buildImpactCaption(
  source: Record<string, unknown>,
  c: Messages["reports"]["mapCaptions"],
): ReportMapCaption {
  const ipFtCount = num(source, "test_impact_v2_start_final_third_count");
  const ipFtPerGame = num(source, "test_impact_v2_start_final_third_p90");
  const threatPct = num(source, "threat_pass_pct");
  const creationXpv = num(source, "chance_creation_xpv_per_game");

  const stats: string[] = [
    replaceAll(c.ipFtTotal, {
      count: ipFtCount != null ? String(Math.round(ipFtCount)) : "—",
    }),
    replaceAll(c.impactPassesGame, { value: fmt1(ipFtPerGame) }),
    replaceAll(c.impactRate, { rate: fmtPct(threatPct) }),
    replaceAll(c.creationXpv, { value: fmt2(creationXpv) }),
  ];

  const summary =
    threatPct != null && threatPct >= 7 ? c.summaryImpactActive : c.summaryImpactSelective;

  return { stats, summary };
}

export function buildReportMapCaption(
  mapKey: ReportMapFilterKey,
  profile: PlayerProfile,
  m: Messages,
): ReportMapCaption {
  const source = profileSource(profile);
  const c = m.reports.mapCaptions;

  switch (mapKey) {
    case "report_progressive_origin":
      return buildOriginCaption(source, c);
    case "report_progressive_dest":
      return buildDestCaption(source, c);
    case "report_impact_final_third":
      return buildImpactCaption(source, c);
    default:
      return { stats: [], summary: "" };
  }
}
