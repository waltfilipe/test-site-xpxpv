"use client";

import { CompareDualMetricTip } from "@/components/CompareDualMetricTip";
import { GradeBadge } from "@/components/ui/GradeBadge";
import { XpHeatBar } from "@/components/ui/XpHeatBar";
import { Tooltip } from "@/components/ui/Tooltip";
import { displayScoreLetterGrade } from "@/lib/gradeColors";
import { formatMetric } from "@/lib/formatters";
import { useI18n } from "@/lib/i18n/context";

type XpRecord = Record<string, unknown>;

type Props = {
  xpA: XpRecord;
  xpB: XpRecord;
  nameA: string;
  nameB: string;
};

type MetricSpec = {
  label: string;
  valueKey: string;
  barKeys: string[];
  tip?: string;
  formatValue?: (value: unknown) => string;
};

function formatXAccPlus(value: unknown): string {
  if (value == null || typeof value !== "number" || !Number.isFinite(value)) {
    return "—";
  }
  const abs = Math.abs(value);
  const rounded = abs.toFixed(1);
  if (value > 0) return `+${rounded}`;
  if (value < 0) return `−${rounded}`;
  return "0.0";
}

function formatRelativeDelta(value: unknown): string {
  if (value == null || typeof value !== "number" || !Number.isFinite(value)) {
    return "—";
  }
  const abs = Math.abs(value);
  const rounded = abs >= 10 ? abs.toFixed(1) : abs.toFixed(2);
  if (value > 0) return `+${rounded}`;
  if (value < 0) return `−${rounded}`;
  return "0.00";
}

function gradeLabel(grade: unknown) {
  if (typeof grade !== "number" || !Number.isFinite(grade)) return "—";
  return displayScoreLetterGrade(grade);
}

function metricValue(xp: XpRecord, key: string): number | null {
  const val = xp[key];
  if (val == null) return null;
  const num = Number(val);
  return Number.isFinite(num) ? num : null;
}

function firstMetric(xp: XpRecord, keys: string[]): number | null {
  for (const key of keys) {
    const value = metricValue(xp, key);
    if (value != null) return value;
  }
  return null;
}

function BarRow({
  side,
  value,
  barValue,
  formatValue,
  valueKey,
}: {
  side: "a" | "b";
  value: number | null;
  barValue: number | null | undefined;
  formatValue?: (value: unknown) => string;
  valueKey: string;
}) {
  const formatted = formatValue
    ? formatValue(value)
    : formatMetric(value, valueKey);
  return (
    <div className={`compare-pillar-row compare-pillar-row-${side}`}>
      <span className={`compare-pillar-dot compare-pillar-dot-${side}`} aria-hidden="true" />
      <XpHeatBar value={barValue} />
      <span className="compare-pillar-value tabular">{formatted}</span>
    </div>
  );
}

function ComparePillarCard({
  title,
  icon,
  shellClass,
  gradeA,
  gradeB,
  metrics,
  xpA,
  xpB,
  nameA,
  nameB,
}: {
  title: string;
  icon: string;
  shellClass: string;
  gradeA: unknown;
  gradeB: unknown;
  metrics: MetricSpec[];
  xpA: XpRecord;
  xpB: XpRecord;
  nameA: string;
  nameB: string;
}) {
  return (
    <article className={`compare-xp-pillar-card ${shellClass}`}>
      <header className="compare-xp-pillar-head">
        <span className="compare-xp-pillar-icon" aria-hidden="true">
          <i className={`fa-solid ${icon}`} />
        </span>
        <h4 className="compare-xp-pillar-title">{title}</h4>
        <div className="compare-xp-pillar-grades">
          <GradeBadge letter={gradeLabel(gradeA)} size="sm" />
          <GradeBadge letter={gradeLabel(gradeB)} size="sm" />
        </div>
      </header>
      <div className="compare-xp-pillar-body">
        {metrics.map((spec) => {
          const valA = metricValue(xpA, spec.valueKey);
          const valB = metricValue(xpB, spec.valueKey);
          const barA = firstMetric(xpA, spec.barKeys);
          const barB = firstMetric(xpB, spec.barKeys);
          return (
            <div key={spec.valueKey} className="compare-xp-metric-block">
              <Tooltip
                content={
                  <CompareDualMetricTip
                    nameA={nameA}
                    nameB={nameB}
                    components={[{
                      key: spec.valueKey,
                      label: spec.label,
                      value_a: valA,
                      value_b: valB,
                    }]}
                    summary={spec.tip}
                  />
                }
                block
              >
                <div className="compare-xp-metric-label">{spec.label}</div>
              </Tooltip>
              <BarRow
                side="a"
                value={valA}
                barValue={barA}
                formatValue={spec.formatValue}
                valueKey={spec.valueKey}
              />
              <BarRow
                side="b"
                value={valB}
                barValue={barB}
                formatValue={spec.formatValue}
                valueKey={spec.valueKey}
              />
            </div>
          );
        })}
      </div>
    </article>
  );
}

export function CompareXpProfileSection({ xpA, xpB, nameA, nameB }: Props) {
  const { m } = useI18n();

  const productivityMetrics: MetricSpec[] = [
    {
      label: m.profile.xpvPerGame,
      valueKey: "prod_xpv_per_game",
      barKeys: ["prod_xpv_per_game_pool_bar"],
      tip: m.productivity.generalTip,
    },
    {
      label: m.productivity.relative,
      valueKey: "prod_rel_xpv",
      barKeys: ["prod_rel_xpv_pool_bar"],
      tip: m.productivity.relativeTip,
      formatValue: formatRelativeDelta,
    },
  ];

  const precisionMetrics: MetricSpec[] = [
    {
      label: m.profile.coePerPass,
      valueKey: "prec_coe_per_pass",
      barKeys: ["prec_coe_per_pass_pool_bar"],
      tip: m.precision.generalCoeTip,
      formatValue: formatXAccPlus,
    },
    {
      label: m.profile.coeShortPass,
      valueKey: "xpass_coe_pct",
      barKeys: ["xpass_coe_pct_pool_bar"],
      tip: m.precision.generalCoeTip,
      formatValue: formatXAccPlus,
    },
    {
      label: m.profile.coeLongPass,
      valueKey: "xpass_long_coe_pct",
      barKeys: ["xpass_long_coe_pct_pool_bar"],
      tip: m.precision.generalCoeTip,
      formatValue: formatXAccPlus,
    },
  ];

  return (
    <div className="compare-xp-profile-section">
      <div className="compare-pillar-legend">
        <span className="compare-legend-item compare-legend-a">
          <span className="compare-legend-dot" />
          <span className="compare-legend-name">{nameA}</span>
        </span>
        <span className="compare-legend-item compare-legend-b">
          <span className="compare-legend-dot" />
          <span className="compare-legend-name">{nameB}</span>
        </span>
      </div>
      <ComparePillarCard
        title={m.productivity.title}
        icon="fa-chart-simple"
        shellClass="compare-xp-pillar-productivity"
        gradeA={xpA.prod_grade_geral}
        gradeB={xpB.prod_grade_geral}
        metrics={productivityMetrics}
        xpA={xpA}
        xpB={xpB}
        nameA={nameA}
        nameB={nameB}
      />
      <ComparePillarCard
        title={m.precision.title}
        icon="fa-gauge-high"
        shellClass="compare-xp-pillar-precision"
        gradeA={xpA.prec_grade_geral}
        gradeB={xpB.prec_grade_geral}
        metrics={precisionMetrics}
        xpA={xpA}
        xpB={xpB}
        nameA={nameA}
        nameB={nameB}
      />
    </div>
  );
}
