"use client";

import type { XpBar } from "@/lib/api";
import { ProdRelLiftBadge } from "@/components/ui/ProdRelLiftBadge";
import { SofascoreGradeBar } from "@/components/ui/SofascoreGradeBar";
import { useI18n } from "@/lib/i18n/context";

const ICONS: Record<string, string> = {
  xp_activity_display: "fa-chart-simple",
  xp_efficiency_display: "fa-gauge-high",
  xp_edge_display: "fa-bolt",
};

type ProductivityGrades = {
  blend?: number | null;
  relLiftBadge?: boolean;
  relGap?: number | null;
  relGapPoolMean?: number | null;
  relGapPoolP70?: number | null;
};

type PrecisionGrades = {
  blend?: number | null;
};

type LethalityGrades = {
  blend?: number | null;
  xpv?: number | null;
  threat?: number | null;
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
          const delay = nextDelay();
          return (
            <SofascoreGradeBar
              key={bar.key}
              label={m.productivity.title}
              icon={ICONS[bar.key]}
              grade={productivity.blend ?? bar.value}
              tip={tips.xp_activity_display}
              animate={animate}
              animationKey={animationKey ? `${animationKey}-${bar.key}` : bar.key}
              animationDelayMs={animate ? delay : 0}
              trailing={
                productivity.relLiftBadge
                  ? (
                    <ProdRelLiftBadge
                      gap={productivity.relGap}
                      poolMean={productivity.relGapPoolMean}
                      poolP70={productivity.relGapPoolP70}
                    />
                  )
                  : undefined
              }
            />
          );
        }

        if (bar.key === "xp_efficiency_display" && precision) {
          const delay = nextDelay();
          return (
            <SofascoreGradeBar
              key={bar.key}
              label={m.precision.title}
              icon={ICONS[bar.key]}
              grade={precision.blend ?? bar.value}
              tip={tips.xp_efficiency_display}
              animate={animate}
              animationKey={animationKey ? `${animationKey}-${bar.key}` : bar.key}
              animationDelayMs={animate ? delay : 0}
            />
          );
        }

        if (bar.key === "xp_edge_display" && lethality) {
          const mainDelay = nextDelay();
          const subDelay1 = nextDelay();
          const subDelay2 = nextDelay();
          const blend = lethality.blend ?? bar.value;

          return (
            <div key={bar.key} className="xp-lethality-block">
              <SofascoreGradeBar
                label={m.lethality.title}
                icon={ICONS[bar.key]}
                grade={blend}
                tip={tips.xp_edge_display}
                animate={animate}
                animationKey={animationKey ? `${animationKey}-${bar.key}` : bar.key}
                animationDelayMs={animate ? mainDelay : 0}
              />
              <div className="xp-lethality-subrows">
                <SofascoreGradeBar
                  label={m.lethality.xpvPerPass}
                  grade={lethality.xpv}
                  tip={m.lethality.xpvPerPassTip}
                  size="sm"
                  animate={animate}
                  animationKey={
                    animationKey ? `${animationKey}-leth-xpv` : "leth-xpv"
                  }
                  animationDelayMs={animate ? subDelay1 : 0}
                />
                <SofascoreGradeBar
                  label={m.lethality.impactRate}
                  grade={lethality.threat}
                  tip={m.lethality.impactRateTip}
                  size="sm"
                  animate={animate}
                  animationKey={
                    animationKey ? `${animationKey}-leth-threat` : "leth-threat"
                  }
                  animationDelayMs={animate ? subDelay2 : 0}
                />
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
