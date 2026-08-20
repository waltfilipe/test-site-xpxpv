"use client";

import { ConsistencyAccordion } from "@/components/ConsistencyAccordion";
import {
  formatImpactValue,
  type ImpactIndexComponent,
} from "@/components/ImpactAccordion";
import type { XpRoundGrade } from "@/lib/api";
import { Tooltip } from "@/components/ui/Tooltip";
import { XP_INDEX_TIER_LABELS, xpIndexTierClass } from "@/lib/gradeColors";
import { useI18n } from "@/lib/i18n/context";

export type XpIndexItem = {
  key: string;
  label: string;
  tier?: string | null;
  tier_key?: string | null;
  value?: number | null;
  icon?: string;
  components?: ImpactIndexComponent[];
};

type Props = {
  indices: XpIndexItem[];
  roundGrades?: XpRoundGrade[];
  gameGradeMad?: number | null;
  accent?: string;
  expandAll?: boolean;
};

function DefenseTooltipRow({
  label,
  tier,
  tierKey,
  icon,
  components,
  indexTips,
}: {
  label: string;
  tier?: string | null;
  tierKey: string;
  icon: string;
  components: ImpactIndexComponent[];
  indexTips: Record<string, string>;
}) {
  const tierLabel = XP_INDEX_TIER_LABELS[tier ?? "mid"] ?? tier ?? "—";
  const summary = indexTips[tierKey] ?? indexTips[label] ?? "";

  const tooltip = (
    <div className="defense-index-tooltip">
      {summary ? <p className="defense-index-tooltip-lead">{summary}</p> : null}
      <ul className="defense-index-tooltip-metrics">
        {components.map((item) => (
          <li key={item.key} className="defense-index-tooltip-metric">
            <span className="defense-index-tooltip-label">{item.label}</span>
            <span className="defense-index-tooltip-value tabular">
              {formatImpactValue(item.key, item.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <Tooltip content={tooltip} block>
      <div
        className={`xp-index-row ${xpIndexTierClass(tier)}`}
        title={summary || undefined}
      >
        <span className="xp-index-row-icon">
          <i className={`fa-solid ${icon}`} />
        </span>
        <span className="xp-index-row-name">{label}</span>
        <span className="xp-index-row-sep" aria-hidden="true" />
        <span className="xp-index-row-val">{tierLabel}</span>
      </div>
    </Tooltip>
  );
}

function IndexRow({
  label,
  tier,
  tierKey,
  icon,
  indexTips,
}: {
  label: string;
  tier?: string | null;
  tierKey: string;
  icon: string;
  indexTips: Record<string, string>;
}) {
  const tierLabel = XP_INDEX_TIER_LABELS[tier ?? "mid"] ?? tier ?? "—";
  const tip = indexTips[tierKey] ?? indexTips[label] ?? "";

  return (
    <Tooltip content={tip} block>
      <div className={`xp-index-row ${xpIndexTierClass(tier)}`} title={tip}>
        <span className="xp-index-row-icon">
          <i className={`fa-solid ${icon}`} />
        </span>
        <span className="xp-index-row-name">{label}</span>
        <span className="xp-index-row-sep" aria-hidden="true" />
        <span className="xp-index-row-val">{tierLabel}</span>
      </div>
    </Tooltip>
  );
}

function ConsistencyTooltipRow({
  label,
  tier,
  tierKey,
  icon,
  gameGradeMad,
  indexTips,
  madLabel,
  madTip,
}: {
  label: string;
  tier?: string | null;
  tierKey: string;
  icon: string;
  gameGradeMad?: number | null;
  indexTips: Record<string, string>;
  madLabel: string;
  madTip: string;
}) {
  const tierLabel = XP_INDEX_TIER_LABELS[tier ?? "mid"] ?? tier ?? "—";
  const summary = indexTips[tierKey] ?? indexTips[label] ?? "";
  const madFormatted =
    gameGradeMad != null && Number.isFinite(gameGradeMad)
      ? gameGradeMad.toFixed(2)
      : "—";

  const tooltip = (
    <div className="index-detail-tooltip">
      {summary ? <p className="index-detail-tooltip-lead">{summary}</p> : null}
      <div className="index-detail-tooltip-metric">
        <span className="index-detail-tooltip-label">{madLabel}</span>
        <span className="index-detail-tooltip-value tabular">{madFormatted}</span>
      </div>
      {madTip ? <p className="index-detail-tooltip-note">{madTip}</p> : null}
    </div>
  );

  return (
    <Tooltip content={tooltip} block>
      <div
        className={`xp-index-row ${xpIndexTierClass(tier)}`}
        title={summary || undefined}
      >
        <span className="xp-index-row-icon">
          <i className={`fa-solid ${icon}`} />
        </span>
        <span className="xp-index-row-name">{label}</span>
        <span className="xp-index-row-sep" aria-hidden="true" />
        <span className="xp-index-row-val">{tierLabel}</span>
      </div>
    </Tooltip>
  );
}

export function XpIndicesPanel({
  indices,
  roundGrades = [],
  gameGradeMad,
  accent,
  expandAll = false,
}: Props) {
  const { m } = useI18n();
  const indexTips = m.tooltips.index;
  const rows = indices.filter((i) => i.tier);
  if (!rows.length) return null;

  const consistency = rows.find((i) => i.key === "consistency");
  const defense = rows.find((i) => i.key === "defense");
  const other = rows.filter(
    (i) => i.key !== "consistency" && i.key !== "defense",
  );

  return (
    <div className="xp-indices-panel">
      <h4 className="section-label-sm">{m.sections.xpIndices}</h4>
      <div className="xp-indices-list">
        {consistency && !expandAll && (
          <ConsistencyTooltipRow
            label={consistency.label}
            tier={consistency.tier}
            tierKey={consistency.tier_key ?? consistency.label}
            icon={consistency.icon ?? "fa-wave-square"}
            gameGradeMad={gameGradeMad}
            indexTips={indexTips}
            madLabel={m.profile.consistencyMadLabel}
            madTip={m.profile.consistencyMadTip}
          />
        )}
        {consistency && expandAll && (
          <ConsistencyAccordion
            label={consistency.label}
            tier={consistency.tier}
            tierKey={consistency.tier_key ?? consistency.label}
            icon={consistency.icon ?? "fa-wave-square"}
            points={roundGrades}
            accent={accent}
            expandAll={expandAll}
          />
        )}
        {defense && defense.components && defense.components.length > 0 && (
          <DefenseTooltipRow
            label={defense.label}
            tier={defense.tier}
            tierKey={defense.tier_key ?? defense.label}
            icon={defense.icon ?? "fa-shield-halved"}
            components={defense.components}
            indexTips={indexTips}
          />
        )}
        {defense && (!defense.components || defense.components.length === 0) && (
          <IndexRow
            label={defense.label}
            tier={defense.tier}
            tierKey={defense.tier_key ?? defense.label}
            icon={defense.icon ?? "fa-shield-halved"}
            indexTips={indexTips}
          />
        )}
        {other.map((item) => (
          <IndexRow
            key={item.key}
            label={item.label}
            tier={item.tier}
            tierKey={item.tier_key ?? item.label}
            icon={item.icon ?? "fa-circle"}
            indexTips={indexTips}
          />
        ))}
      </div>
    </div>
  );
}
