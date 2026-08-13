"use client";

import { passGradeGradientColor, sofascoreGradePct } from "@/lib/gradeColors";
import { Tooltip } from "@/components/ui/Tooltip";

function GradeRow({
  label,
  weightPct,
  grade,
  tip,
}: {
  label: string;
  weightPct?: number;
  grade?: number | null;
  tip: string;
}) {
  const color =
    grade != null ? passGradeGradientColor(sofascoreGradePct(grade)) : "#64748b";

  const row = (
    <div className="sofascore-grade-row">
      <div className="sofascore-grade-head">
        <span className="sofascore-grade-label">
          {label}
          {weightPct != null && (
            <span className="sofascore-grade-weight">{weightPct}%</span>
          )}
        </span>
        <span className="sofascore-grade-value tabular" style={{ color }}>
          {grade != null ? grade.toFixed(1) : "—"}
        </span>
      </div>
    </div>
  );

  return (
    <Tooltip content={tip} block>
      {row}
    </Tooltip>
  );
}

type Props = {
  title: string;
  summaryTip?: string;
  icon: string;
  primaryLabel: string;
  secondaryLabel: string;
  primaryTip: string;
  secondaryTip: string;
  gradePrimary?: number | null;
  gradeSecondary?: number | null;
  gradeBlend?: number | null;
  blendWeight?: number;
  animate?: boolean;
  animationKey?: string;
};

export function DualSofascoreAccordion({
  title,
  summaryTip,
  icon,
  primaryLabel,
  secondaryLabel,
  primaryTip,
  secondaryTip,
  gradePrimary,
  gradeSecondary,
  gradeBlend,
  blendWeight = 0.7,
}: Props) {
  const w = blendWeight;
  const computedBlend =
    gradeBlend ??
    (gradePrimary != null && gradeSecondary != null
      ? w * gradePrimary + (1 - w) * gradeSecondary
      : gradePrimary ?? gradeSecondary);
  const headPct = computedBlend != null ? sofascoreGradePct(computedBlend) : 0;
  const headColor =
    computedBlend != null ? passGradeGradientColor(headPct) : "#94a3b8";
  const primaryWeightPct = Math.round(w * 100);
  const secondaryWeightPct = 100 - primaryWeightPct;

  return (
    <details className="sofascore-pillar-accordion consistency-accordion">
      <summary className="sofascore-pillar-trigger consistency-accordion-trigger" title={summaryTip}>
        <span className="sofascore-pillar-trigger-left consistency-accordion-left">
          <i
            className="fa-solid fa-chevron-right consistency-accordion-chevron sofascore-pillar-chevron"
            aria-hidden="true"
          />
          <span className="xp-index-row-icon sofascore-pillar-icon">
            <i className={`fa-solid ${icon}`} />
          </span>
          <span className="sofascore-pillar-title consistency-accordion-title">{title}</span>
        </span>
        <span className="sofascore-pillar-score tabular" style={{ color: headColor }}>
          {computedBlend != null ? computedBlend.toFixed(1) : "—"}
        </span>
      </summary>
      <div className="sofascore-pillar-panel consistency-accordion-panel">
        <div className="sofascore-pillar-rows">
          <GradeRow
            label={primaryLabel}
            weightPct={primaryWeightPct}
            grade={gradePrimary}
            tip={primaryTip}
          />
          <GradeRow
            label={secondaryLabel}
            weightPct={secondaryWeightPct}
            grade={gradeSecondary}
            tip={secondaryTip}
          />
        </div>
      </div>
    </details>
  );
}
