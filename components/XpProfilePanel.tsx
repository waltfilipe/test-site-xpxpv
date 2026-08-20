"use client";

import { GradeBadge } from "@/components/ui/GradeBadge";
import { XpHeatBar } from "@/components/ui/XpHeatBar";
import { Tooltip } from "@/components/ui/Tooltip";
import { formatMetric } from "@/lib/formatters";
import { useI18n } from "@/lib/i18n/context";

type XpRecord = Record<string, unknown>;

type Props = {
  xp: XpRecord;
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

function relativeTip(
  template: string,
  residual: number | null | undefined,
  actual: number | null | undefined,
  expected: number | null | undefined,
): string {
  const gap =
    residual != null && Number.isFinite(residual)
      ? formatRelativeDelta(residual)
      : "—";
  const act =
    actual != null && Number.isFinite(actual) ? actual.toFixed(1) : "—";
  const exp =
    expected != null && Number.isFinite(expected) ? expected.toFixed(1) : "—";
  return template
    .replaceAll("{gap}", gap)
    .replaceAll("{actual}", act)
    .replaceAll("{expected}", exp);
}

function gradeLabel(grade: number | null | undefined) {
  return grade != null && Number.isFinite(grade) ? grade.toFixed(1) : "—";
}

function MetricRow({
  label,
  value,
  barValue,
  rawKey,
  tip,
  formatValue,
}: {
  label: string;
  value: unknown;
  barValue?: number | null;
  rawKey?: string;
  tip?: string;
  formatValue?: (value: unknown) => string;
}) {
  const formatted = formatValue ? formatValue(value) : formatMetric(value, rawKey);
  const body = (
    <div className="xp-profile-metric-row">
      <div className="pass-metric-head">
        <span className="pass-metric-label">{label}</span>
        <span className="pass-metric-value tabular">{formatted}</span>
      </div>
      {barValue != null && <XpHeatBar value={barValue} />}
    </div>
  );
  if (!tip) return body;
  return (
    <Tooltip content={tip} block>
      {body}
    </Tooltip>
  );
}

function ProductivityCard({ xp }: { xp: XpRecord }) {
  const { m } = useI18n();
  const display = xp.prod_geral_display as number | null | undefined;
  const grade = xp.prod_grade_geral as number | null | undefined;
  const residual = xp.prod_rel_xpv as number | null | undefined;
  const actual = xp.prod_xpv_per_game as number | null | undefined;
  const expected = xp.prod_xpv_expected as number | null | undefined;

  return (
    <article className="xp-profile-pillar-card xp-profile-pillar-productivity">
      <header className="xp-profile-pillar-head">
        <span className="xp-profile-pillar-icon" aria-hidden="true">
          <i className="fa-solid fa-chart-simple" />
        </span>
        <div className="xp-profile-pillar-title-wrap">
          <h4 className="xp-profile-pillar-title">{m.productivity.title}</h4>
        </div>
        <GradeBadge
          letter={gradeLabel(grade)}
          displayScore={grade ?? undefined}
          size="sm"
        />
      </header>
      <div className="xp-profile-pillar-body">
        <MetricRow
          label={m.profile.xpvPerGame}
          value={xp.prod_xpv_per_game}
          barValue={display}
          rawKey="prod_xpv_per_game"
          tip={m.productivity.generalTip}
        />
        <MetricRow
          label={m.productivity.relative}
          value={residual}
          barValue={xp.prod_rel_display as number | null | undefined}
          tip={relativeTip(m.productivity.relativeTip, residual, actual, expected)}
          formatValue={formatRelativeDelta}
        />
      </div>
    </article>
  );
}

function PrecisionCard({ xp }: { xp: XpRecord }) {
  const { m } = useI18n();
  const display =
    (xp.prec_coe_league_bar as number | null | undefined) ??
    (xp.prec_display as number | null | undefined);
  const grade = xp.prec_grade_geral as number | null | undefined;
  const shortBar =
    (xp.xpass_coe_pct_pool_bar as number | null | undefined) ??
    (xp.xpass_coe_pct_league_bar as number | null | undefined);
  const longBar =
    (xp.xpass_long_coe_pct_pool_bar as number | null | undefined) ??
    (xp.xpass_long_coe_pct_league_bar as number | null | undefined);

  return (
    <article className="xp-profile-pillar-card xp-profile-pillar-precision">
      <header className="xp-profile-pillar-head">
        <span className="xp-profile-pillar-icon" aria-hidden="true">
          <i className="fa-solid fa-gauge-high" />
        </span>
        <div className="xp-profile-pillar-title-wrap">
          <h4 className="xp-profile-pillar-title">{m.precision.title}</h4>
        </div>
        <GradeBadge
          letter={gradeLabel(grade)}
          displayScore={grade ?? undefined}
          size="sm"
        />
      </header>
      <div className="xp-profile-pillar-body">
        <MetricRow
          label={m.profile.coePerPass}
          value={xp.prec_coe_per_pass}
          barValue={display}
          tip={m.precision.generalCoeTip}
          formatValue={formatXAccPlus}
        />
        <MetricRow
          label={m.profile.coeShortPass}
          value={xp.xpass_coe_pct}
          barValue={shortBar}
          tip={m.precision.generalCoeTip}
          formatValue={formatXAccPlus}
        />
        <MetricRow
          label={m.profile.coeLongPass}
          value={xp.xpass_long_coe_pct}
          barValue={longBar}
          tip={m.precision.generalCoeTip}
          formatValue={formatXAccPlus}
        />
      </div>
    </article>
  );
}

export function XpProfilePanel({ xp }: Props) {
  const { m } = useI18n();

  return (
    <div className="player-card xp-profile-panel-card">
      <h3 className="section-label">{m.sections.xpProfile}</h3>
      <div className="xp-profile-pillar-grid">
        <ProductivityCard xp={xp} />
        <PrecisionCard xp={xp} />
      </div>
    </div>
  );
}
