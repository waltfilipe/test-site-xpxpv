"use client";

import { Tooltip } from "@/components/ui/Tooltip";
import { useI18n } from "@/lib/i18n/context";

const REF_LONG_LEAGUE_AVG_PCT = 11.4;
const REF_DEFENSIVE_CENTER_PCT = 50;

function longShareBarPosition(playerLong: number, leagueAvg: number): number {
  const avg = leagueAvg > 0 ? leagueAvg : REF_LONG_LEAGUE_AVG_PCT;
  const pos = 50 + ((playerLong - avg) / avg) * 50;
  return Math.max(4, Math.min(96, pos));
}

export type PassLengthData = {
  long_pass_share_pct?: number | null;
  long_pass_share_ref_avg_pct?: number | null;
  long_pass_share_pctile?: number | null;
  defensive_origin_pct?: number | null;
  midfield_offensive_origin_pct?: number | null;
  player?: Record<string, unknown>;
  xp?: Record<string, unknown>;
};

function resolveDefensiveOriginPct(data: PassLengthData): number | null {
  if (data.defensive_origin_pct != null && Number.isFinite(data.defensive_origin_pct)) {
    return Number(data.defensive_origin_pct);
  }
  const offensive =
    data.midfield_offensive_origin_pct
    ?? data.player?.midfield_offensive_origin_pct
    ?? data.xp?.midfield_offensive_origin_pct;
  if (offensive == null || !Number.isFinite(Number(offensive))) return null;
  return Math.round((100 - Number(offensive)) * 10) / 10;
}

function MixBar({
  leftLabel,
  rightLabel,
  markerPct,
  refCenterPct,
  markerTitle,
  refTitle,
  leftLegend,
  rightLegend,
  markerClassName = "pass-mix-marker",
}: {
  leftLabel: string;
  rightLabel: string;
  markerPct: number;
  refCenterPct: number;
  markerTitle: string;
  refTitle: string;
  leftLegend: string;
  rightLegend: string;
  markerClassName?: string;
}) {
  const markerPos = Math.max(4, Math.min(96, markerPct));
  const refPos = Math.max(4, Math.min(96, refCenterPct));

  return (
    <>
      <div className="pass-mix-track">
        <span className="pass-mix-center" style={{ left: `${refPos}%` }} title={refTitle} />
        <span
          className={markerClassName}
          style={{ left: `${markerPos}%` }}
          title={markerTitle}
        />
      </div>
      <div className="pass-mix-axis">
        <span className="axis-short">{leftLabel}</span>
        <span className="axis-long">{rightLabel}</span>
      </div>
      <div className="pass-mix-legend">
        <span className="legend-short">
          <strong>{leftLegend}</strong>
        </span>
        <span className="legend-long">
          <strong>{rightLegend}</strong>
        </span>
      </div>
    </>
  );
}

export function PassLengthMix({ data }: { data: PassLengthData }) {
  const { m } = useI18n();
  const longShare = data.long_pass_share_pct;
  const defensiveShare = resolveDefensiveOriginPct(data);
  if (longShare == null && defensiveShare == null) return null;

  const shortShare = longShare != null ? 100 - longShare : null;
  const offensiveShare = defensiveShare != null ? 100 - defensiveShare : null;

  const card = (
    <div className="pass-location-length-card">
      <div className="pass-mix-head">
        <span className="pass-mix-icon">
          <i className="fa-solid fa-ruler-horizontal" />
        </span>
        <span className="pass-mix-title">{m.passLengthMix.title}</span>
      </div>

      {defensiveShare != null && offensiveShare != null && (
        <div className="pass-mix-section">
          <span className="pass-mix-section-label">{m.passLengthMix.locationSection}</span>
          <MixBar
            leftLabel={m.passLengthMix.defensive}
            rightLabel={m.passLengthMix.offensive}
            markerPct={defensiveShare}
            refCenterPct={REF_DEFENSIVE_CENTER_PCT}
            markerTitle={m.passLengthMix.playerDefensiveTitle.replace(
              "{pct}",
              defensiveShare.toFixed(1),
            )}
            refTitle={m.passLengthMix.halfLineRefTitle.replace(
              "{pct}",
              String(REF_DEFENSIVE_CENTER_PCT),
            )}
            leftLegend={m.passLengthMix.defensiveLegend.replace(
              "{pct}",
              defensiveShare.toFixed(1),
            )}
            rightLegend={m.passLengthMix.offensiveLegend.replace(
              "{pct}",
              offensiveShare.toFixed(1),
            )}
            markerClassName="pass-mix-marker pass-mix-marker-location"
          />
        </div>
      )}

      {longShare != null && shortShare != null && (
        <div className="pass-mix-section">
          <span className="pass-mix-section-label">{m.passLengthMix.lengthSection}</span>
          <MixBar
            leftLabel={m.passLengthMix.short}
            rightLabel={m.passLengthMix.long}
            markerPct={longShareBarPosition(
              longShare,
              data.long_pass_share_ref_avg_pct ?? REF_LONG_LEAGUE_AVG_PCT,
            )}
            refCenterPct={50}
            markerTitle={m.passLengthMix.playerLongTitle.replace("{pct}", longShare.toFixed(1))}
            refTitle={m.passLengthMix.leagueRefTitle.replace(
              "{pct}",
              String(data.long_pass_share_ref_avg_pct ?? REF_LONG_LEAGUE_AVG_PCT),
            )}
            leftLegend={m.passLengthMix.shortLegend.replace("{pct}", shortShare.toFixed(1))}
            rightLegend={m.passLengthMix.longLegend.replace("{pct}", longShare.toFixed(1))}
          />
        </div>
      )}
    </div>
  );

  return (
    <Tooltip
      content={`${m.tooltips.passLocation} ${m.tooltips.passLength}`}
      block
    >
      {card}
    </Tooltip>
  );
}
