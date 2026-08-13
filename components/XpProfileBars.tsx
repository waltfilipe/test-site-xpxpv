"use client";

import type { XpBar } from "@/lib/api";
import { PrecisionAccordion } from "@/components/PrecisionAccordion";
import { ProductivityAccordion } from "@/components/ProductivityAccordion";
import { XpHeatBar } from "@/components/ui/XpHeatBar";
import { Tooltip } from "@/components/ui/Tooltip";
import { useI18n } from "@/lib/i18n/context";

const ICONS: Record<string, string> = {
  xp_activity_display: "fa-chart-simple",
  xp_efficiency_display: "fa-gauge-high",
  xp_edge_display: "fa-bolt",
};

type DualGrades = {
  geral?: number | null;
  secondary?: number | null;
  blend?: number | null;
};

export function XpProfileBars({
  bars,
  productivity,
  precision,
  animate = false,
  animationKey,
}: {
  bars: XpBar[];
  productivity?: DualGrades;
  precision?: DualGrades;
  animate?: boolean;
  animationKey?: string;
}) {
  const { m } = useI18n();
  const tips = m.tooltips.xpProfileBars;

  return (
    <div className="xp-profile-bars">
      {bars.map((bar, index) => {
        if (bar.key === "xp_activity_display" && productivity) {
          return (
            <ProductivityAccordion
              key={bar.key}
              gradeGeral={productivity.geral}
              gradeRel={productivity.secondary}
              gradeBlend={productivity.blend ?? bar.value}
              animate={animate}
              animationKey={animationKey}
            />
          );
        }

        if (bar.key === "xp_efficiency_display" && precision) {
          return (
            <PrecisionAccordion
              key={bar.key}
              gradeGeral={precision.geral}
              gradeStratum={precision.secondary}
              gradeBlend={precision.blend ?? bar.value}
              animate={animate}
              animationKey={animationKey}
            />
          );
        }

        return (
          <Tooltip key={bar.key} content={tips[bar.key] ?? ""} block>
            <div className="xp-metric-block">
              <div className="pass-metric-head">
                <span className="pass-metric-label xp-metric-label">
                  {ICONS[bar.key] && (
                    <i className={`fa-solid ${ICONS[bar.key]} xp-metric-icon`} aria-hidden="true" />
                  )}
                  {bar.label}
                </span>
              </div>
              <XpHeatBar
                value={bar.value}
                animate={animate}
                animationKey={animationKey ? `${animationKey}-${bar.key}` : bar.key}
                animationDelayMs={animate ? index * 90 : 0}
              />
            </div>
          </Tooltip>
        );
      })}
    </div>
  );
}
