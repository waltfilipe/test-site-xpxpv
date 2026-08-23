"use client";

import type { ReactNode } from "react";

const METRICS_WITH_HELP = new Set([
  "test_impact_v2_start_final_third_p90",
  "chance_creation_xpv_per_game",
]);

type Props = {
  metricKey: string;
  label: string;
  showHelp?: boolean;
  children?: ReactNode;
};

export function PassMetricLabel({
  metricKey,
  label,
  showHelp = true,
  children,
}: Props) {
  const withHelp = showHelp && METRICS_WITH_HELP.has(metricKey);

  return (
    <span className="pass-metric-label">
      {label}
      {withHelp ? (
        <span className="pass-metric-help" aria-hidden="true">
          ?
        </span>
      ) : null}
      {children}
    </span>
  );
}
