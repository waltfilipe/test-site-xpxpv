"use client";

import { passGradeGradientColor, sofascoreBarPosition, sofascoreGradePct } from "@/lib/gradeColors";
import { useBarRevealAnimation } from "@/lib/useBarRevealAnimation";
import { Tooltip } from "@/components/ui/Tooltip";
import { useI18n } from "@/lib/i18n/context";

type Props = {
  gradeGeral?: number | null;
  gradeRel?: number | null;
  gradeBlend?: number | null;
  animate?: boolean;
  animationKey?: string;
};

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

export function ProductivityAccordion({
  gradeGeral,
  gradeRel,
  gradeBlend,
  animate = false,
  animationKey,
}: Props) {
  const { m } = useI18n();
  const blend = gradeBlend ?? (
    gradeGeral != null && gradeRel != null
      ? 0.7 * gradeGeral + 0.3 * gradeRel
      : gradeGeral ?? gradeRel
  );
  const headPct = blend != null ? sofascoreGradePct(blend) : 0;
  const headColor = blend != null ? passGradeGradientColor(headPct) : "#94a3b8";

  return (
    <details className="productivity-accordion consistency-accordion">
      <summary className="consistency-accordion-trigger" title={m.tooltips.xpProfileBars.xp_activity_display}>
        <span className="consistency-accordion-left">
          <i className="fa-solid fa-chevron-right consistency-accordion-chevron productivity-accordion-chevron" aria-hidden="true" />
          <span className="xp-index-row-icon">
            <i className="fa-solid fa-chart-simple" />
          </span>
          <span className="consistency-accordion-title">{m.productivity.title}</span>
        </span>
        <span className="productivity-accordion-blend tabular" style={{ color: headColor }}>
          {blend != null ? blend.toFixed(1) : "—"}
        </span>
      </summary>
      <div className="consistency-accordion-panel productivity-accordion-panel">
        <GradeRow
          label={m.productivity.general}
          grade={gradeGeral}
          tip={m.productivity.generalTip}
          animate={animate}
          animationKey={animationKey ? `${animationKey}-geral` : "geral"}
          delayMs={animate ? 60 : 0}
        />
        <GradeRow
          label={m.productivity.relative}
          grade={gradeRel}
          tip={m.productivity.relativeTip}
          animate={animate}
          animationKey={animationKey ? `${animationKey}-rel` : "rel"}
          delayMs={animate ? 120 : 0}
        />
      </div>
    </details>
  );
}
