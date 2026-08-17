"use client";

import type { XpBar } from "@/lib/api";
import { XpHeatBar } from "@/components/ui/XpHeatBar";
import { Tooltip } from "@/components/ui/Tooltip";
import { formatMetric } from "@/lib/formatters";
import { useI18n } from "@/lib/i18n/context";

const ICONS: Record<string, string> = {
  productivity: "fa-chart-simple",
  precision: "fa-gauge-high",
};

export function XpProfileBars({ bars }: { bars: XpBar[] }) {
  const { m } = useI18n();
  const tips = m.tooltips.xpProfileBars;

  return (
    <div className="xp-profile-bars">
      {bars.map((bar) => {
        const tipKey = bar.key === "productivity" ? "xp_activity_display" : "xp_efficiency_display";
        return (
          <Tooltip key={bar.key} content={tips[tipKey] ?? ""} block>
            <div className="xp-metric-block">
              <div className="pass-metric-head">
                <span className="pass-metric-label xp-metric-label">
                  {ICONS[bar.key] && (
                    <i className={`fa-solid ${ICONS[bar.key]} xp-metric-icon`} aria-hidden="true" />
                  )}
                  {bar.label}
                </span>
                {bar.raw_value != null && (
                  <span className="pass-metric-value tabular">
                    {formatMetric(bar.raw_value, bar.raw_key ?? bar.key)}
                  </span>
                )}
              </div>
              <XpHeatBar value={bar.value} />
            </div>
          </Tooltip>
        );
      })}
    </div>
  );
}
