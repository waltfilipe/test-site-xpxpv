"use client";

import type { BadgeCriteriaMetricKey } from "@/lib/badgeCriteria";
import { BADGE_CRITERIA } from "@/lib/badgeCriteria";
import type { PlayerBadgeKey } from "@/lib/playerBadges";
import { useI18n } from "@/lib/i18n/context";

type Props = {
  badgeKey: PlayerBadgeKey;
};

function CriteriaArrow({ kind }: { kind: "up" | "down" }) {
  const className =
    kind === "up"
      ? "badge-criteria-arrow badge-criteria-arrow-up fa-solid fa-arrow-up"
      : "badge-criteria-arrow badge-criteria-arrow-down fa-solid fa-arrow-down";
  return <i className={className} aria-hidden="true" />;
}

function CriteriaRow({
  label,
  kind,
}: {
  label: string;
  kind: "up" | "down";
}) {
  return (
    <li className={`badge-criteria-row badge-criteria-row-${kind}`}>
      <CriteriaArrow kind={kind} />
      <span className="badge-criteria-label">{label}</span>
    </li>
  );
}

export function BadgeCriteriaTooltip({ badgeKey }: Props) {
  const { m } = useI18n();
  const copy = m.profileBadges[badgeKey];
  const spec = BADGE_CRITERIA[badgeKey];
  const metrics = m.profileBadges.criteriaMetrics;

  const labelFor = (key: BadgeCriteriaMetricKey) => metrics[key];

  if (spec.allOnly) {
    return (
      <div className="badge-criteria-tooltip">
        <p className="badge-criteria-title">{copy.label}</p>
        {copy.tooltip ? <p className="badge-criteria-lead">{copy.tooltip}</p> : null}
        <ul className="badge-criteria-list">
          <CriteriaRow label={m.profileBadges.criteriaAll} kind="up" />
        </ul>
      </div>
    );
  }

  return (
    <div className="badge-criteria-tooltip">
      <p className="badge-criteria-title">{copy.label}</p>
      {copy.tooltip ? <p className="badge-criteria-lead">{copy.tooltip}</p> : null}
      <ul className="badge-criteria-list">
        {(spec.valued ?? []).map((key) => (
          <CriteriaRow key={`up-${key}`} label={labelFor(key)} kind="up" />
        ))}
        {(spec.devalued ?? []).map((key) => (
          <CriteriaRow key={`down-${key}`} label={labelFor(key)} kind="down" />
        ))}
      </ul>
    </div>
  );
}
