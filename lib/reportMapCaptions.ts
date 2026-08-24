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
      : null;
  const construction = num(source, "construction_aip");
  const aggression = num(source, "aggression_aip");
  const leagueBar = num(source, "progressive_passes_league_bar");
  const zone = originZoneLabel(source, c);

  const stats: string[] = [
    replaceAll(c.progVolume, {
      prog: fmt1(prog),
      share: fmtPct(progShare),
    }),
  ];

  if (defensivePct != null && offensivePct != null) {
    stats.push(
      replaceAll(c.halfSplit, {
        def: fmtPct(defensivePct),
        off: fmtPct(offensivePct),
      }),
    );
  }

  if (zone) {
    stats.push(replaceAll(c.dominantOrigin, { zone }));
  }

  if (construction != null && aggression != null) {
    stats.push(
      replaceAll(c.constructionSplit, {
        con: String(Math.round(construction)),
        agg: String(Math.round(aggression)),
      }),
    );
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
  const finalThirdVol = num(source, "final_third_passes");
  const lineBreakShare = num(source, "build_line_break_share_pct");
  const creationXpv = num(source, "chance_creation_xpv_per_game");

  const stats: string[] = [];

  if (finalThirdShare != null) {
    stats.push(replaceAll(c.finalThirdShare, { pct: fmtPct(finalThirdShare) }));
  }

  stats.push(replaceAll(c.finalThirdVolume, { value: fmt1(finalThirdVol) }));

  if (lineBreakShare != null) {
    stats.push(replaceAll(c.lineBreakShare, { pct: fmtPct(lineBreakShare) }));
  }

  stats.push(replaceAll(c.creationXpv, { value: fmt2(creationXpv) }));

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
  const threatPct = num(source, "threat_pass_pct");
  const impactPasses = num(source, "impact_passes");
  const highImpact = num(source, "high_impact_passes");
  const keyPasses = num(source, "key_passes");
  const boxPasses = num(source, "passes_to_box");
  const creationXpv = num(source, "chance_creation_xpv_per_game");
  const riskPct = num(source, "risk_pass_pct");

  const highImpactShare =
    highImpact != null && impactPasses != null && impactPasses > 0
      ? (highImpact / impactPasses) * 100
      : null;

  const stats: string[] = [
    replaceAll(c.impactRate, {
      rate: fmtPct(threatPct),
      count: impactPasses != null ? String(Math.round(impactPasses)) : "—",
    }),
  ];

  if (highImpact != null && highImpactShare != null) {
    stats.push(
      replaceAll(c.highImpactShare, {
        count: String(Math.round(highImpact)),
        share: fmtPct(highImpactShare),
      }),
    );
  }

  stats.push(
    replaceAll(c.keyBox, {
      key: fmt1(keyPasses),
      box: fmt1(boxPasses),
    }),
  );

  stats.push(replaceAll(c.creationXpv, { value: fmt2(creationXpv) }));

  if (riskPct != null && threatPct != null) {
    stats.push(
      replaceAll(c.riskThreat, {
        risk: fmtPct(riskPct),
        threat: fmtPct(threatPct),
      }),
    );
  }

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
