"use client";

import type { PlayerProfile } from "@/lib/api";
import { buildReportMapCaption } from "@/lib/reportMapCaptions";
import type { ReportMapFilterKey } from "@/lib/reportMapKeys";
import { useI18n } from "@/lib/i18n/context";

type Props = {
  mapKey: ReportMapFilterKey;
  profile: PlayerProfile;
};

export function ReportMapCaption({ mapKey, profile }: Props) {
  const { m } = useI18n();
  const caption = buildReportMapCaption(mapKey, profile, m);

  if (!caption.stats.length) return null;

  return (
    <div className="report-map-caption report-print-only" data-map-key={mapKey}>
      <div className="report-map-caption-card">
        <div className="report-map-caption-head">
          <span className="report-map-caption-kicker">{m.reports.mapCaptions.insights}</span>
        </div>
        {caption.stats.length > 0 ? (
          <ul className="report-map-caption-stats">
            {caption.stats.map((line) => {
              const parts = line.split(" · ");
              const primary = parts[0] ?? line;
              const secondary = parts.slice(1).join(" · ");
              return (
                <li key={line} className="report-map-caption-stat">
                  <span className="report-map-caption-stat-main">{primary}</span>
                  {secondary ? (
                    <span className="report-map-caption-stat-meta">{secondary}</span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
