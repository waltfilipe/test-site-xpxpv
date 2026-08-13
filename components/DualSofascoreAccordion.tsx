"use client";

import { passGradeGradientColor, sofascoreBarPosition, sofascoreGradePct } from "@/lib/gradeColors";
import { useBarRevealAnimation } from "@/lib/useBarRevealAnimation";
import { Tooltip } from "@/components/ui/Tooltip";

function GradeMeter({
  grade,
  animate,
  animationKey,
  delayMs = 0,
  size = "md",
}: {
  grade?: number | null;
  animate?: boolean;
  animationKey?: string;
  delayMs?: number;
  size?: "sm" | "md";
}) {
  const revealKey = animationKey ?? grade ?? "meter";
  const revealed = useBarRevealAnimation(revealKey, animate && grade != null);
  const pct = grade != null ? sofascoreGradePct(grade) : 0;
  const markerPct = grade != null ? sofascoreBarPosition(grade) : 0;
  const shownPct = revealed ? pct : 0;
  const shownMarker = revealed ? markerPct : 0;

  if (grade == null) return null;

  return (
    <div className={`sofascore-grade-meter sofascore-grade-meter-${size}`}>
      <div className="pass-grade-track">
        <span className="pass-grade-shade">
          <span
            className={`pass-grade-rest${animate ? " pass-grade-rest-animated" : ""}`}
            style={{
              left: `${shownPct}%`,
              transitionDelay: animate ? `${delayMs}ms` : undefined,
            }}
          />
        </span>
        <span
          className={`pass-grade-marker${animate ? " pass-grade-marker-animated" : ""}`}
          style={{
            left: `${shownMarker}%`,
            transitionDelay: animate ? `${delayMs}ms` : undefined,
          }}
        />
      </div>
    </div>
  );
}

function GradeRow({
  label,
  weightPct,
  grade,
  tip,
  animate,
  animationKey,
  delayMs,
}: {
  label: string;
  weightPct?: number;
  grade?: number | null;
  tip: string;
  animate?: boolean;
  animationKey?: string;
  delayMs?: number;
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
      <GradeMeter
        grade={grade}
        animate={animate}
        animationKey={animationKey}
        delayMs={delayMs}
      />
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
        <span className="sofascore-pillar-summary">
          <span className="sofascore-pillar-score tabular" style={{ color: headColor }}>
            {computedBlend != null ? computedBlend.toFixed(1) : "—"}
          </span>
          <GradeMeter
            grade={computedBlend}
            animate={animate}
            animationKey={animationKey ? `${animationKey}-summary` : "summary"}
            size="sm"
          />
        </span>
      </summary>
      <div className="sofascore-pillar-panel consistency-accordion-panel">
        <div className="sofascore-pillar-rows">
          <GradeRow
            label={primaryLabel}
            weightPct={primaryWeightPct}
            grade={gradePrimary}
            tip={primaryTip}
            animate={animate}
            animationKey={animationKey ? `${animationKey}-primary` : "primary"}
            delayMs={animate ? 80 : 0}
          />
          <GradeRow
            label={secondaryLabel}
            weightPct={secondaryWeightPct}
            grade={gradeSecondary}
            tip={secondaryTip}
            animate={animate}
            animationKey={animationKey ? `${animationKey}-secondary` : "secondary"}
            delayMs={animate ? 140 : 0}
          />
        </div>
      </div>
    </details>
  );
}
