"use client";

import { passGradeGradientColor, passGradePct } from "@/lib/gradeColors";
import { Tooltip } from "@/components/ui/Tooltip";
import { useI18n } from "@/lib/i18n/context";

type Props = {
  score: number | null;
  rankInPool?: number | null;
  rankPoolSize?: number | null;
};

function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

function describeArc(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

export function PassGradeGauge({ score, rankInPool, rankPoolSize }: Props) {
  const { m } = useI18n();

  if (score == null || !Number.isFinite(score)) {
    return (
      <div className="player-card pass-grade-gauge-card">
        <p className="placeholder-note">{m.passGrade.unavailable}</p>
      </div>
    );
  }

  const color = passGradeGradientColor(passGradePct(score));
  const minAngle = 135;
  const maxAngle = 405;
  const span = maxAngle - minAngle;
  const fillAngle = minAngle + (Math.min(10, Math.max(0, score)) / 10) * span;
  const benchmarkAngle = minAngle + 0.6 * span;

  const cx = 100;
  const cy = 100;
  const radius = 72;
  const trackPath = describeArc(cx, cy, radius, minAngle, maxAngle);
  const fillPath = describeArc(cx, cy, radius, minAngle, fillAngle);
  const benchmarkInner = polarToCartesian(cx, cy, radius - 10, benchmarkAngle);
  const benchmarkOuter = polarToCartesian(cx, cy, radius + 4, benchmarkAngle);

  const poolSize = rankPoolSize ?? 0;
  const rank = rankInPool ?? null;
  const topPct =
    rank != null && poolSize > 0
      ? Math.max(1, Math.round((rank / poolSize) * 100))
      : null;

  return (
    <Tooltip content={m.passGrade.overallTip} block>
      <div className="player-card pass-grade-gauge-card">
        <div className="pass-grade-gauge-wrap">
          <svg
            className="pass-grade-gauge-svg"
            viewBox="0 0 200 120"
            role="img"
            aria-label={`${m.passGrade.overallTitle} ${score.toFixed(1)}`}
          >
            <path
              d={trackPath}
              className="pass-grade-gauge-track"
              pathLength={100}
            />
            <path
              d={fillPath}
              className="pass-grade-gauge-fill"
              pathLength={100}
              style={{ stroke: color }}
            />
            <line
              x1={benchmarkInner.x}
              y1={benchmarkInner.y}
              x2={benchmarkOuter.x}
              y2={benchmarkOuter.y}
              className="pass-grade-gauge-benchmark"
            />
          </svg>
          <div className="pass-grade-gauge-center">
            <span className="pass-grade-gauge-score tabular" style={{ color }}>
              {score.toFixed(1).replace(".", ",")}
            </span>
            <span className="pass-grade-gauge-label">{m.passGrade.overallTitle}</span>
          </div>
        </div>
        {rank != null && poolSize > 0 && (
          <p className="pass-grade-gauge-rank">
            <strong className="tabular">#{rank}</strong>
            <span className="pass-grade-gauge-rank-muted">
              {m.profile.rankOf} {poolSize}
            </span>
            {topPct != null && (
              <span className="pass-grade-gauge-rank-top" style={{ color }}>
                {m.profile.rankTopPct.replace("{pct}", String(topPct))}
              </span>
            )}
          </p>
        )}
      </div>
    </Tooltip>
  );
}
