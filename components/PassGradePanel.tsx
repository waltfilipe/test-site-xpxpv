"use client";

import { passGradeGradientColor, passGradePct } from "@/lib/gradeColors";
import { Tooltip } from "@/components/ui/Tooltip";
import { useI18n } from "@/lib/i18n/context";
import type { Messages } from "@/lib/i18n/messages";

type Props = {
  score?: number | null | undefined;
  rating?: number | null | undefined;
  showMeter?: boolean;
  embedded?: boolean;
};

function tierKey(score: number): keyof Messages["passGrade"]["tiers"] {
  if (score >= 8.2) return "elite";
  if (score >= 7) return "veryGood";
  if (score >= 6) return "good";
  if (score >= 5) return "average";
  return "belowAverage";
}

const TIER_CSS: Record<keyof Messages["passGrade"]["tiers"], string> = {
  elite: "elite",
  veryGood: "very-good",
  good: "good",
  average: "average",
  belowAverage: "below-average",
};

export function PassGradePanel({ score, rating, showMeter = false, embedded = false }: Props) {
  const { m } = useI18n();
  const resolvedScore = score ?? (rating != null ? rating * 10 : null);
  const shellClass = embedded ? "pass-grade-section" : "player-card pass-grade-card";

  if (resolvedScore == null) {
    return (
      <div className={shellClass}>
        <div className="pass-grade-head">
          <span className="pass-grade-title">{m.passGrade.title}</span>
        </div>
        <p className="placeholder-note">{m.passGrade.unavailable}</p>
      </div>
    );
  }

  const displayScore = resolvedScore;
  const color = passGradeGradientColor(passGradePct(displayScore));
  const tierId = tierKey(displayScore);
  const tier = m.passGrade.tiers[tierId];
  const tierKeyClass = TIER_CSS[tierId];
  const markerPct = Math.max(2, Math.min(98, passGradePct(displayScore)));
  const shadeLeft = Math.max(0, Math.min(100, passGradePct(displayScore)));

  const panel = embedded ? (
    <div className={`${shellClass} pass-grade-inline pass-grade-tier-${tierKeyClass}`}>
      <div className="pass-grade-inline-row">
        <span className="pass-grade-title">{m.passGrade.title}</span>
        <span
          className="pass-grade-tier"
          style={{ color, borderColor: `${color}55`, background: `${color}1a` }}
        >
          {tier}
        </span>
        <div className="pass-grade-value">
          <span className="pass-grade-score tabular" style={{ color }}>
            {displayScore.toFixed(1)}
          </span>
          <span className="pass-grade-scale">/ 10</span>
        </div>
      </div>

      {showMeter ? (
        <div className="pass-grade-meter">
          <div className="pass-grade-track">
            <span className="pass-grade-shade">
              <span className="pass-grade-rest" style={{ left: `${shadeLeft}%` }} />
            </span>
            <span className="pass-grade-marker" style={{ left: `${markerPct}%` }} />
          </div>
        </div>
      ) : null}
    </div>
  ) : (
    <div className={`${shellClass} pass-grade-tier-${tierKeyClass}`}>
      <div className="pass-grade-head">
        <span className="pass-grade-title">{m.passGrade.title}</span>
        <span
          className="pass-grade-tier"
          style={{ color, borderColor: `${color}55`, background: `${color}1a` }}
        >
          {tier}
        </span>
      </div>

      <div className={`pass-grade-body${showMeter ? " pass-grade-body-horizontal" : " pass-grade-body-score-only"}`}>
        <div className="pass-grade-value">
          <span className="pass-grade-score tabular" style={{ color }}>
            {displayScore.toFixed(1)}
          </span>
          <span className="pass-grade-scale">/ 10</span>
        </div>

        {showMeter ? (
          <div className="pass-grade-meter">
            <div className="pass-grade-track">
              <span className="pass-grade-shade">
                <span className="pass-grade-rest" style={{ left: `${shadeLeft}%` }} />
              </span>
              <span className="pass-grade-marker" style={{ left: `${markerPct}%` }} />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );

  return <Tooltip content={m.tooltips.passGrade} block>{panel}</Tooltip>;
}
