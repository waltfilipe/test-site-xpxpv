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

  if (!caption.stats.length && !caption.summary) return null;

  return (
    <div className="report-map-caption report-print-only">
      {caption.stats.length > 0 ? (
        <ul className="report-map-caption-stats">
          {caption.stats.map((line) => (
            <li key={line} className="report-map-caption-stat">
              {line}
            </li>
          ))}
        </ul>
      ) : null}
      {caption.summary ? (
        <p className="report-map-caption-summary">{caption.summary}</p>
      ) : null}
    </div>
  );
}
