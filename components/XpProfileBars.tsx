"use client";

import type { ReactNode } from "react";
import type { XpBar } from "@/lib/api";
import { ProdRelLiftBadge } from "@/components/ui/ProdRelLiftBadge";
import { SofascoreGradeBar } from "@/components/ui/SofascoreGradeBar";
import { Tooltip } from "@/components/ui/Tooltip";
import { useI18n } from "@/lib/i18n/context";

type ProductivityGrades = {
  gradeGeral?: number | null;
  gradeExpected?: number | null;
  gradeGap?: number | null;
  relGap?: number | null;
  relLiftBadge?: boolean;
  relGapPoolMean?: number | null;
  relGapPoolP70?: number | null;
  xpvPerGame?: number | null;
  xpvExpected?: number | null;
};

type PrecisionGrades = {
  gradeGeral?: number | null;
  gradeExpected?: number | null;
  coePerPass?: number | null;
  expectedPct?: number | null;
  completionPct?: number | null;
};

function XpPillarCard({
  icon,
  title,
  pillarTip,
  animate,
  animationKey,
  rows,
}: {
  icon: string;
  title: string;
  pillarTip: string;
  animate?: boolean;
  animationKey?: string;
  rows: Array<{
    key: string;
    label: string;
    grade?: number | null;
    tip: string;
    trailing?: ReactNode;
  }>;
}) {
  let animIndex = 0;
  const nextDelay = () => {
    const delay = animIndex * 90;
    animIndex += 1;
    return delay;
  };

  const block = (
    <div className="xp-pillar-card">
      <div className="xp-pillar-head">
        <span className="pass-metric-label xp-metric-label">
          <i className={`fa-solid ${icon} xp-metric-icon`} aria-hidden="true" />
          {title}
        </span>
      </div>
      <div className="xp-pillar-rows">
        {rows.map((row) => (
          <SofascoreGradeBar
            key={row.key}
            label={row.label}
            grade={row.grade}
            tip={row.tip}
            animate={animate}
            animationKey={animationKey ? `${animationKey}-${row.key}` : row.key}
            animationDelayMs={animate ? nextDelay() : 0}
            trailing={row.trailing}
          />
        ))}
      </div>
    </div>
  );

  return (
    <Tooltip content={pillarTip} block>
      {block}
    </Tooltip>
  );
}

export function XpProfileBars({
  bars,
  productivity,
  precision,
  animate = false,
  animationKey,
}: {
  bars: XpBar[];
  productivity?: ProductivityGrades;
  precision?: PrecisionGrades;
  animate?: boolean;
  animationKey?: string;
}) {
  const { m } = useI18n();
  const tips = m.tooltips.xpProfileBars;

  const expTip = productivity
    ? m.productivity.expectedTip
        .replace(
          "{gap}",
          productivity.relGap != null
            ? (productivity.relGap >= 0
              ? `+${productivity.relGap.toFixed(2)}`
              : productivity.relGap.toFixed(2))
            : "—",
        )
        .replace("{actual}", productivity.xpvPerGame != null ? productivity.xpvPerGame.toFixed(2) : "—")
        .replace("{expected}", productivity.xpvExpected != null ? productivity.xpvExpected.toFixed(2) : "—")
    : "";

  const coeTip = precision
    ? m.precision.coeTip
        .replace(
          "{coe}",
          precision.coePerPass != null
            ? (precision.coePerPass >= 0
              ? `+${precision.coePerPass.toFixed(2)}`
              : precision.coePerPass.toFixed(2))
            : "—",
        )
        .replace(
          "{actual}",
          precision.completionPct != null ? precision.completionPct.toFixed(1) : "—",
        )
        .replace(
          "{expected}",
          precision.expectedPct != null ? precision.expectedPct.toFixed(1) : "—",
        )
    : "";

  return (
    <div className="xp-profile-bars">
      {bars.map((bar) => {
        if (bar.key === "xp_activity_display" && productivity) {
          return (
            <XpPillarCard
              key={bar.key}
              icon="fa-chart-simple"
              title={m.productivity.title}
              pillarTip={tips.xp_activity_display}
              animate={animate}
              animationKey={animationKey ? `${animationKey}-prod` : "prod"}
              rows={[
                {
                  key: "geral",
                  label: m.productivity.general,
                  grade: productivity.gradeGeral,
                  tip: m.productivity.generalTip,
                },
                {
                  key: "expected",
                  label: m.productivity.expected,
                  grade: productivity.gradeExpected,
                  tip: expTip,
                  trailing: productivity.relLiftBadge ? (
                    <ProdRelLiftBadge
                      gap={productivity.gradeGap}
                      poolMean={productivity.relGapPoolMean}
                      poolP70={productivity.relGapPoolP70}
                    />
                  ) : null,
                },
              ]}
            />
          );
        }

        if (bar.key === "xp_efficiency_display" && precision) {
          return (
            <XpPillarCard
              key={bar.key}
              icon="fa-gauge-high"
              title={m.precision.title}
              pillarTip={tips.xp_efficiency_display}
              animate={animate}
              animationKey={animationKey ? `${animationKey}-prec` : "prec"}
              rows={[
                {
                  key: "geral",
                  label: m.precision.general,
                  grade: precision.gradeGeral,
                  tip: coeTip,
                },
                {
                  key: "expected",
                  label: m.precision.expected,
                  grade: precision.gradeExpected,
                  tip: m.precision.stratumCoeTip,
                },
              ]}
            />
          );
        }

        return null;
      })}
    </div>
  );
}
