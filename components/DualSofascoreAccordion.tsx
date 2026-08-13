"use client";

import { passGradeGradientColor, sofascoreBarPosition, sofascoreGradePct } from "@/lib/gradeColors";
import { useBarRevealAnimation } from "@/lib/useBarRevealAnimation";
import { Tooltip } from "@/components/ui/Tooltip";

function GradeRow({
  label,
  grade,
  tip,
  animate,
  animationKey,
  delayMs,
}: {
  label: string;
  grade?: number | null;
  tip: string;
  animate?: boolean;
  animationKey?: string;
  delayMs?: number;
}) {
  const revealKey = animationKey ?? grade ?? label;
  const revealed = useBarRevealAnimation(revealKey, animate && grade != null);
  const pct = grade != null ? sofascoreGradePct(grade) : 0;
  const markerPct = grade != null ? sofascoreBarPosition(grade) : 0;
  const shownPct = revealed ? pct : 0;
  const shownMarker = revealed ? markerPct : 0;
  const color = grade != null ? passGradeGradientColor(pct) : "#64748b";

  const row = (
    <div className="productivity-grade-row">
      <div className="productivity-grade-head">
        <span className="productivity-grade-label">{label}</span>
        <span className="productivity-grade-value tabular" style={{ color }}>
          {grade != null ? grade.toFixed(1) : "—"}
        </span>
      </div>
      {grade != null && (
        <div className="productivity-grade-meter">
          <div className="pass-grade-track">
            <span className="pass-grade-shade">
              <span
                className={`pass-grade-rest${animate ? " pass-grade-rest-animated" : ""}`}
                style={{ left: `${shownPct}%`, transitionDelay: animate ? `${delayMs ?? 0}ms` : undefined }}
              />
            </span>
            <span
              className={`pass-grade-marker${animate ? " pass-grade-marker-animated" : ""}`}
              style={{
                left: `${shownMarker}%`,
                transitionDelay: animate ? `${delayMs ?? 0}ms` : undefined,
              }}
            />
          </div>
        </div>
      )}
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
  animate = false,
  animationKey,
}: Props) {
  const w = blendWeight;
  const computedBlend =
    gradeBlend ??
    (gradePrimary != null && gradeSecondary != null
      ? w * gradePrimary + (1 - w) * gradeSecondary
      : gradePrimary ?? gradeSecondary);
  const headPct = computedBlend != null ? sofascoreGradePct(computedBlend) : 0;
  const headColor = computedBlend != null ? passGradeGradientColor(headPct) : "#94a3b8";

  return (
    <details className="productivity-accordion consistency-accordion">
      <summary className="consistency-accordion-trigger" title={summaryTip}>
        <span className="consistency-accordion-left">
          <i
            className="fa-solid fa-chevron-right consistency-accordion-chevron productivity-accordion-chevron"
            aria-hidden="true"
          />
          <span className="xp-index-row-icon">
            <i className={`fa-solid ${icon}`} />
          </span>
          <span className="consistency-accordion-title">{title}</span>
        </span>
        <span className="productivity-accordion-blend tabular" style={{ color: headColor }}>
          {computedBlend != null ? computedBlend.toFixed(1) : "—"}
        </span>
      </summary>
      <div className="consistency-accordion-panel productivity-accordion-panel">
        <GradeRow
          label={primaryLabel}
          grade={gradePrimary}
          tip={primaryTip}
          animate={animate}
          animationKey={animationKey ? `${animationKey}-primary` : "primary"}
          delayMs={animate ? 60 : 0}
        />
        <GradeRow
          label={secondaryLabel}
          grade={gradeSecondary}
          tip={secondaryTip}
          animate={animate}
          animationKey={animationKey ? `${animationKey}-secondary` : "secondary"}
          delayMs={animate ? 120 : 0}
        />
      </div>
    </details>
  );
}
