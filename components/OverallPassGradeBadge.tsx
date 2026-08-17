"use client";

import { passGradeGradientColor, passGradePct } from "@/lib/gradeColors";
import { Tooltip } from "@/components/ui/Tooltip";
import { useI18n } from "@/lib/i18n/context";
import type { Messages } from "@/lib/i18n/messages";

type Props = {
  score: number | null;
  absolute?: number | null;
  relative?: number | null;
};

function tierKey(score: number): keyof Messages["passGrade"]["tiers"] {
  if (score >= 8.2) return "elite";
  if (score >= 7) return "veryGood";
  if (score >= 6) return "good";
  if (score >= 5) return "average";
  return "belowAverage";
}

export function OverallPassGradeBadge({ score, absolute, relative }: Props) {
  const { m } = useI18n();

  if (score == null || !Number.isFinite(score)) {
    return null;
  }

  const color = passGradeGradientColor(passGradePct(score));
  const tier = m.passGrade.tiers[tierKey(score)];
  const tipParts = [m.passGrade.overallTip, tier];
  if (absolute != null && relative != null) {
    tipParts.push(
      `${m.profile.modeAbsolute}: ${absolute.toFixed(1)} · ${m.profile.modeRelative}: ${relative.toFixed(1)}`,
    );
  }

  return (
    <Tooltip content={tipParts.join(" — ")} block>
      <div
        className="overall-pass-grade-badge"
        style={{
          borderColor: `${color}40`,
          boxShadow: `inset 0 1px 0 ${color}12`,
        }}
      >
        <span className="overall-pass-grade-label">{m.passGrade.overallTitle}</span>
        <div className="overall-pass-grade-scoreline tabular" style={{ color }}>
          {score.toFixed(1)}
          <span className="overall-pass-grade-scale">/10</span>
        </div>
      </div>
    </Tooltip>
  );
}
