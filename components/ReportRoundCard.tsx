"use client";

import type { XpRoundGrade } from "@/lib/api";
import { passGradeGradientColor, passGradePct } from "@/lib/gradeColors";
import { formatRoundXAcc, formatRoundXpv, roundXAccPct } from "@/lib/roundMetrics";
import { useI18n } from "@/lib/i18n/context";

type Props = {
  point: XpRoundGrade;
  accent?: string;
};

export function ReportRoundCard({ point, accent = "#a78bfa" }: Props) {
  const { m } = useI18n();
  const grade = point.grade;
  const gradeColor =
    grade != null ? passGradeGradientColor(passGradePct(grade)) : "var(--muted)";
  const xAcc = roundXAccPct(point);

  return (
    <article
      className="report-round-card"
      style={{ "--round-accent": accent, "--round-grade-color": gradeColor } as React.CSSProperties}
    >
      <div className="report-round-card-head">
        <span className="report-round-card-match tabular">
          R{point.round}
          {point.opponent ? (
            <>
              <span className="report-round-card-vs">vs</span>
              <span className="report-round-card-opponent">{point.opponent}</span>
            </>
          ) : null}
        </span>
        <span className="report-round-card-divider" aria-hidden="true" />
        <span className="report-round-card-grade tabular">
          {grade != null ? grade.toFixed(1) : "—"}
        </span>
      </div>
      <dl className="report-round-card-metrics">
        <div>
          <dt>{m.roundStats.passes}</dt>
          <dd className="tabular">{point.passes ?? "—"}</dd>
        </div>
        <div>
          <dt>{m.roundStats.xpv}</dt>
          <dd className="tabular">{formatRoundXpv(point.xp)}</dd>
        </div>
        <div>
          <dt>{m.roundStats.ip}</dt>
          <dd className="tabular">{point.impact ?? "—"}</dd>
        </div>
        <div>
          <dt>{m.roundStats.xAcc}</dt>
          <dd className="tabular">{formatRoundXAcc(xAcc)}</dd>
        </div>
      </dl>
    </article>
  );
}
