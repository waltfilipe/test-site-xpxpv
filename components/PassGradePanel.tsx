"use client";

import { passGradeGradientColor, passGradePct } from "@/lib/gradeColors";
import { Tooltip } from "@/components/ui/Tooltip";
import { useI18n } from "@/lib/i18n/context";
import type { Messages } from "@/lib/i18n/messages";

type Props = { rating: number | null | undefined };

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

export function PassGradePanel({ rating }: Props) {
  const { m } = useI18n();

  const displayScore = rating != null ? rating * 10 : null;

  if (rating == null || displayScore == null) {
    return (
      <div className="player-card pass-grade-card">
        <div className="pass-grade-head">
          <span className="pass-grade-title">{m.passGrade.title}</span>
        </div>
        <p className="placeholder-note">{m.passGrade.unavailable}</p>
      </div>
    );
  }

  const pct = passGradePct(displayScore);
  const markerPct = Math.max(1.5, Math.min(98.5, pct));
  const color = passGradeGradientColor(pct);
  const tierId = tierKey(displayScore);
  const tier = m.passGrade.tiers[tierId];
  const tierKeyClass = TIER_CSS[tierId];

  const panel = (
    <div className={`player-card pass-grade-card pass-grade-tier-${tierKeyClass}`}>
      <div className="pass-grade-head">
        <span className="pass-grade-title">{m.passGrade.title}</span>
        <span
          className="pass-grade-tier"
          style={{ color, borderColor: `${color}55`, background: `${color}1a` }}
        >
          {tier}
        </span>
      </div>

      <div className="pass-grade-body pass-grade-body-horizontal">
        <div className="pass-grade-value">
          <span className="pass-grade-score tabular" style={{ color }}>
            {displayScore.toFixed(1)}
          </span>
          <span className="pass-grade-scale">/ 10</span>
        </div>

        <div className="pass-grade-meter">
          <div className="pass-grade-track">
            <span className="pass-grade-shade">
              <span className="pass-grade-rest" style={{ left: `${pct}%` }} />
            </span>
            <span className="pass-grade-marker" style={{ left: `${markerPct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );

  return <Tooltip content={m.tooltips.passGrade} block>{panel}</Tooltip>;
}
