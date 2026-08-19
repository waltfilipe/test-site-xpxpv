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

function SubMetricBar({
  label,
  value,
  barValue,
  rawKey,
  tip,
  formatValue,
}: {
  label: string;
  value: unknown;
  barValue: number | null | undefined;
  rawKey?: string;
  tip?: string;
  formatValue?: (value: unknown) => string;
}) {
  const formatted = formatValue ? formatValue(value) : formatMetric(value, rawKey);
  const content = (
    <div className="xp-profile-sub-metric">
      <div className="pass-metric-head">
        <span className="pass-metric-label">{label}</span>
        <span className="pass-metric-value tabular">{formatted}</span>
      </div>
      <XpHeatBar value={barValue} />
    </div>
  );
  if (!tip) return content;
  return (
    <Tooltip content={tip} block>
      {content}
    </Tooltip>
  );
}

function ProductivityAccordion({ xp }: { xp: XpRecord }) {
  const { m } = useI18n();
  const display = xp.prod_geral_display as number | null | undefined;
  const grade = xp.prod_grade_pass_pool as number | null | undefined;
  const gradeLabel =
    grade != null && Number.isFinite(grade) ? grade.toFixed(1).replace(".", ",") : "—";
  const residual = xp.prod_rel_xpv as number | null | undefined;
  const actual = xp.prod_xpv_per_game as number | null | undefined;
  const expected = xp.prod_xpv_expected as number | null | undefined;

  return (
    <details className="xp-profile-accordion-item">
      <summary className="xp-profile-accordion-trigger">
        <span className="xp-profile-accordion-left">
          <i className="fa-solid fa-chevron-right xp-profile-accordion-chevron" aria-hidden="true" />
          <span className="xp-profile-accordion-title">
            <i className="fa-solid fa-chart-simple xp-metric-icon" aria-hidden="true" />
            {m.productivity.title}
          </span>
        </span>
        <GradeBadge
          letter={gradeLabel}
          displayScore={grade ?? undefined}
          size="sm"
        />
      </summary>
      <div className="xp-profile-accordion-panel">
        <Tooltip content={m.productivity.generalTip} block>
          <div className="xp-metric-block">
            <div className="pass-metric-head">
              <span className="pass-metric-label">{m.profile.xpvPerGame}</span>
              <span className="pass-metric-value tabular">
                {formatMetric(xp.prod_xpv_per_game, "prod_xpv_per_game")}
              </span>
            </div>
            <XpHeatBar value={display} />
          </div>
        </Tooltip>
        <SubMetricBar
          label={m.productivity.relative}
          value={residual}
          barValue={xp.prod_rel_display as number | null | undefined}
          tip={relativeTip(m.productivity.relativeTip, residual, actual, expected)}
          formatValue={formatRelativeDelta}
        />
      </div>
    </details>
  );
}

function PrecisionAccordion({ xp }: { xp: XpRecord }) {
  const { m } = useI18n();
  const display =
    (xp.prec_coe_league_bar as number | null | undefined) ??
    (xp.prec_display as number | null | undefined);
  const grade = xp.prec_grade_pass_pool as number | null | undefined;
  const gradeLabel =
    grade != null && Number.isFinite(grade) ? grade.toFixed(1).replace(".", ",") : "—";
  const shortBar =
    (xp.xpass_coe_pct_pool_bar as number | null | undefined) ??
    (xp.xpass_coe_pct_league_bar as number | null | undefined);
  const longBar =
    (xp.xpass_long_coe_pct_pool_bar as number | null | undefined) ??
    (xp.xpass_long_coe_pct_league_bar as number | null | undefined);

  return (
    <details className="xp-profile-accordion-item">
      <summary className="xp-profile-accordion-trigger">
        <span className="xp-profile-accordion-left">
          <i className="fa-solid fa-chevron-right xp-profile-accordion-chevron" aria-hidden="true" />
          <span className="xp-profile-accordion-title">
            <i className="fa-solid fa-gauge-high xp-metric-icon" aria-hidden="true" />
            {m.precision.title}
          </span>
        </span>
        <GradeBadge
          letter={gradeLabel}
          displayScore={grade ?? undefined}
          size="sm"
        />
      </summary>
      <div className="xp-profile-accordion-panel">
        <Tooltip content={m.precision.generalCoeTip} block>
          <div className="xp-metric-block">
            <div className="pass-metric-head">
              <span className="pass-metric-label">{m.profile.coePerPass}</span>
              <span className="pass-metric-value tabular">
                {formatMetric(xp.prec_coe_per_pass, "prec_coe_per_pass")}
              </span>
            </div>
            <XpHeatBar value={display} />
          </div>
        </Tooltip>
        <SubMetricBar
          label={m.profile.coeShortPass}
          value={xp.xpass_coe_pct}
          barValue={shortBar}
          rawKey="xpass_coe_pct"
        />
        <SubMetricBar
          label={m.profile.coeLongPass}
          value={xp.xpass_long_coe_pct}
          barValue={longBar}
          rawKey="xpass_long_coe_pct"
        />
      </div>
    </details>
  );
}

export function XpProfilePanel({ xp }: Props) {
  const { m } = useI18n();

  return (
    <div className="player-card xp-profile-panel-card">
      <h3 className="section-label">{m.sections.xpProfile}</h3>
      <div className="xp-profile-accordion">
        <ProductivityAccordion xp={xp} />
        <PrecisionAccordion xp={xp} />
      </div>
    </div>
  );
}
