"use client";

import type { XpBar } from "@/lib/api";
import { ProdRelLiftBadge } from "@/components/ui/ProdRelLiftBadge";
import { SofascoreGradeBar } from "@/components/ui/SofascoreGradeBar";
import { Tooltip } from "@/components/ui/Tooltip";
import { useI18n } from "@/lib/i18n/context";

const ICONS: Record<string, string> = {
  xp_activity_display: "fa-chart-simple",
  xp_efficiency_display: "fa-gauge-high",
};

type ProductivityGrades = {
  gradeGeral?: number | null;
  gradeExpected?: number | null;
  gradeGap?: number | null;
  relGap?: number | null;
  relLiftBadge?: boolean;
  relGapPoolMean?: number | null;
  relGapPoolP70?: number | null;
  xpvPerGame?: number | null;
  xpvExpected?: number | null;
};

type PrecisionGrades = {
  gradeGeral?: number | null;
  gradeExpected?: number | null;
  coePerPass?: number | null;
  stratumGap?: number | null;
  stratumLiftBadge?: boolean;
  stratumGapPoolMean?: number | null;
  stratumGapPoolP70?: number | null;
  expectedPct?: number | null;
  completionPct?: number | null;
};

export function XpProfileBars({
  bars,
  productivity,
  precision,
  animate = false,
  animationKey,
}: {
  bars: XpBar[];
  productivity?: ProductivityGrades;
  precision?: PrecisionGrades;
  animate?: boolean;
  animationKey?: string;
}) {
  const { m } = useI18n();
  const tips = m.tooltips.xpProfileBars;

  let animIndex = 0;
  const nextDelay = () => {
    const delay = animIndex * 90;
    animIndex += 1;
    return delay;
  };

  return (
    <div className="xp-profile-bars">
      {bars.map((bar) => {
        if (bar.key === "xp_activity_display" && productivity) {
          const geralDelay = nextDelay();
          const expDelay = nextDelay();
          const expTip = m.productivity.expectedTip
            .replace(
              "{gap}",
              productivity.relGap != null
                ? (productivity.relGap >= 0
                  ? `+${productivity.relGap.toFixed(2)}`
                  : productivity.relGap.toFixed(2))
                : "—",
            )
            .replace("{actual}", productivity.xpvPerGame != null ? productivity.xpvPerGame.toFixed(2) : "—")
            .replace("{expected}", productivity.xpvExpected != null ? productivity.xpvExpected.toFixed(2) : "—");
          const productivityBlock = (
            <div className="xp-productivity-block">
              <div className="xp-pillar-section-head">
                <span className="pass-metric-label xp-metric-label">
                  <i className={`fa-solid ${ICONS[bar.key]} xp-metric-icon`} aria-hidden="true" />
                  {m.productivity.title}
                </span>
              </div>
              <div className="xp-productivity-subrows">
                <SofascoreGradeBar
                  label={m.productivity.general}
                  grade={productivity.gradeGeral}
                  tip={m.productivity.generalTip}
                  animate={animate}
                  animationKey={animationKey ? `${animationKey}-prod-geral` : "prod-geral"}
                  animationDelayMs={animate ? geralDelay : 0}
                />
                <SofascoreGradeBar
                  label={m.productivity.expected}
                  grade={productivity.gradeExpected}
                  tip={expTip}
                  size="sm"
                  animate={animate}
                  animationKey={animationKey ? `${animationKey}-prod-exp` : "prod-exp"}
                  animationDelayMs={animate ? expDelay : 0}
                  trailing={
                    productivity.relLiftBadge ? (
                      <ProdRelLiftBadge
                        gap={productivity.gradeGap}
                        poolMean={productivity.relGapPoolMean}
                        poolP70={productivity.relGapPoolP70}
                      />
                    ) : null
                  }
                />
              </div>
            </div>
          );

          return (
            <Tooltip key={bar.key} content={tips.xp_activity_display} block>
              {productivityBlock}
            </Tooltip>
          );
        }

        if (bar.key === "xp_efficiency_display" && precision) {
          const geralDelay = nextDelay();
          const expDelay = nextDelay();
          const coeTip = m.precision.coeTip
            .replace(
              "{coe}",
              precision.coePerPass != null
                ? (precision.coePerPass >= 0
                  ? `+${precision.coePerPass.toFixed(2)}`
                  : precision.coePerPass.toFixed(2))
                : "—",
            )
            .replace(
              "{actual}",
              precision.completionPct != null ? precision.completionPct.toFixed(1) : "—",
            )
            .replace(
              "{expected}",
              precision.expectedPct != null ? precision.expectedPct.toFixed(1) : "—",
            );
          const precisionBlock = (
            <div className="xp-precision-block">
              <div className="xp-pillar-section-head">
                <span className="pass-metric-label xp-metric-label">
                  <i className={`fa-solid ${ICONS[bar.key]} xp-metric-icon`} aria-hidden="true" />
                  {m.precision.title}
                </span>
              </div>
              <div className="xp-precision-subrows">
                <SofascoreGradeBar
                  label={m.precision.general}
                  grade={precision.gradeGeral}
                  tip={coeTip}
                  animate={animate}
                  animationKey={animationKey ? `${animationKey}-prec-geral` : "prec-geral"}
                  animationDelayMs={animate ? geralDelay : 0}
                />
                <SofascoreGradeBar
                  label={m.precision.expected}
                  grade={precision.gradeExpected}
                  tip={m.precision.stratumCoeTip}
                  size="sm"
                  animate={animate}
                  animationKey={animationKey ? `${animationKey}-prec-exp` : "prec-exp"}
                  animationDelayMs={animate ? expDelay : 0}
                />
              </div>
            </div>
          );

          return (
            <Tooltip key={bar.key} content={tips.xp_efficiency_display} block>
              {precisionBlock}
            </Tooltip>
          );
        }

        return null;
      })}
    </div>
  );
}
