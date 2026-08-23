"use client";

import type { XpRoundGrade } from "@/lib/api";
import { passGradeGradientColor, passGradePct } from "@/lib/gradeColors";
import { useI18n } from "@/lib/i18n/context";

type Props = {
  point: XpRoundGrade;
  accent?: string;
};

function formatXpv(value?: number | null): string {
  if (value == null || Number.isNaN(value)) return "—";
  return value.toFixed(2);
}

export function ReportRoundCard({ point, accent = "#a78bfa" }: Props) {
  const { m } = useI18n();
  const grade = point.grade;
  const gradeColor =
    grade != null ? passGradeGradientColor(passGradePct(grade)) : "var(--muted)";
  const header = `R${point.round}${point.opponent ? ` · ${point.opponent}` : ""}`;

  return (
    <article
      className="report-round-card"
      style={{ "--round-accent": accent, "--round-grade-color": gradeColor } as React.CSSProperties}
    >
      <div className="report-round-card-head">
        <span className="report-round-card-label tabular">{header}</span>
        <span className="report-round-card-grade tabular">
          {grade != null ? grade.toFixed(1) : "—"}
        </span>
      </div>
      <div className="report-round-card-stats">
        <span>
          <em>{m.roundStats.passes}</em>
          <strong className="tabular">{point.passes ?? "—"}</strong>
        </span>
        <span>
          <em>{m.roundStats.xpv}</em>
          <strong className="tabular">{formatXpv(point.xp)}</strong>
        </span>
        <span>
          <em>{m.roundStats.impact}</em>
          <strong className="tabular">{point.impact ?? "—"}</strong>
        </span>
      </div>
    </article>
  );
}
