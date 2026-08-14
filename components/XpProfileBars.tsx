"use client";

import type { XpBar } from "@/lib/api";
import { PercentileBar } from "@/components/ui/PercentileBar";
import { Tooltip } from "@/components/ui/Tooltip";
import { useI18n } from "@/lib/i18n/context";

const ICONS: Record<string, string> = {
  xp_activity_display: "fa-chart-simple",
  xp_efficiency_display: "fa-gauge-high",
  xp_edge_display: "fa-bolt",
};

type ProductivityGrades = {
  geralDisplay?: number | null;
  relDisplay?: number | null;
  relGap?: number | null;
  xpvPerGame?: number | null;
  xpvExpected?: number | null;
};

type PrecisionGrades = {
  display?: number | null;
  coePerPass?: number | null;
  expectedPct?: number | null;
  completionPct?: number | null;
};

type LethalityGrades = {
  xpvDisplay?: number | null;
  threatDisplay?: number | null;
  xpvPerPass?: number | null;
  impactRatePct?: number | null;
};

export function XpProfileBars({
  bars,
  productivity,
  precision,
  lethality,
  animate = false,
  animationKey,
}: {
  bars: XpBar[];
  productivity?: ProductivityGrades;
  precision?: PrecisionGrades;
  lethality?: LethalityGrades;
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
          const relDelay = nextDelay();
          const relTip = m.productivity.relativeTip
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
                <PercentileBar
                  label={m.productivity.general}
                  value={productivity.geralDisplay ?? bar.value}
                  tip={m.productivity.generalTip}
                  animate={animate}
                  animationKey={animationKey ? `${animationKey}-prod-geral` : "prod-geral"}
                  animationDelayMs={animate ? geralDelay : 0}
                />
                <PercentileBar
                  label={m.productivity.relative}
                  value={productivity.relDisplay}
                  tip={relTip}
                  size="sm"
                  animate={animate}
                  animationKey={animationKey ? `${animationKey}-prod-rel` : "prod-rel"}
                  animationDelayMs={animate ? relDelay : 0}
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
          const delay = nextDelay();
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
          return (
            <Tooltip key={bar.key} content={tips.xp_efficiency_display} block>
              <PercentileBar
                label={m.precision.title}
                value={precision.display ?? bar.value}
                tip={coeTip}
                animate={animate}
                animationKey={animationKey ? `${animationKey}-${bar.key}` : bar.key}
                animationDelayMs={animate ? delay : 0}
              />
            </Tooltip>
          );
        }

        if (bar.key === "xp_edge_display" && lethality) {
          const xpvDelay = nextDelay();
          const threatDelay = nextDelay();
          const xpvTip = m.lethality.xpvPerPassTip.replace(
            "{value}",
            lethality.xpvPerPass != null ? lethality.xpvPerPass.toFixed(3) : "—",
          );
          const threatTip = m.lethality.impactRateTip.replace(
            "{value}",
            lethality.impactRatePct != null ? lethality.impactRatePct.toFixed(1) : "—",
          );
          const lethalityBlock = (
            <div className="xp-lethality-block">
              <div className="xp-pillar-section-head">
                <span className="pass-metric-label xp-metric-label">
                  <i className={`fa-solid ${ICONS[bar.key]} xp-metric-icon`} aria-hidden="true" />
                  {m.lethality.title}
                </span>
              </div>
              <div className="xp-lethality-subrows">
                <PercentileBar
                  label={m.lethality.xpvPerPass}
                  value={lethality.xpvDisplay}
                  tip={xpvTip}
                  size="sm"
                  animate={animate}
                  animationKey={
                    animationKey ? `${animationKey}-leth-xpv` : "leth-xpv"
                  }
                  animationDelayMs={animate ? xpvDelay : 0}
                />
                <PercentileBar
                  label={m.lethality.impactRate}
                  value={lethality.threatDisplay}
                  tip={threatTip}
                  size="sm"
                  animate={animate}
                  animationKey={
                    animationKey ? `${animationKey}-leth-threat` : "leth-threat"
                  }
                  animationDelayMs={animate ? threatDelay : 0}
                />
              </div>
            </div>
          );

          return (
            <Tooltip key={bar.key} content={tips.xp_edge_display} block>
              {lethalityBlock}
            </Tooltip>
          );
        }

        return null;
      })}
    </div>
  );
}
