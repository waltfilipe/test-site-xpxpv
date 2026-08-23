"use client";

import { useId, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { XpRoundGrade } from "@/lib/api";
import { passGradeGradientColor, passGradePct } from "@/lib/gradeColors";
import { RoundGradeStatsPanel } from "@/components/RoundGradeStatsPanel";
import { useI18n } from "@/lib/i18n/context";

const CHART_SIZES = {
  embedded: { width: 280, height: 58, padX: 8, padY: 6, dotR: 1.25, hitR: 6, stroke: 1.2 },
  print: { width: 720, height: 132, padX: 14, padY: 10, dotR: 2.4, hitR: 0, stroke: 2.2 },
  default: { width: 280, height: 58, padX: 8, padY: 6, dotR: 1.25, hitR: 6, stroke: 1.2 },
} as const;

type Props = {
  points: XpRoundGrade[];
  accent?: string;
  embedded?: boolean;
  printPage?: boolean;
  tier?: string | null;
  onPointClick?: (point: XpRoundGrade) => void;
};

type ChartCoord = {
  x: number;
  y: number;
  grade: number;
  round: number;
  opponent?: string | null;
  point: XpRoundGrade;
};

type ActiveCoord = ChartCoord & {
  tipX: number;
  tipY: number;
};

export function RoundGradeChart({
  points,
  accent = "#a78bfa",
  embedded = false,
  printPage = false,
  onPointClick,
}: Props) {
  const { m } = useI18n();
  const gradId = useId().replace(/:/g, "");
  const [active, setActive] = useState<ActiveCoord | null>(null);
  const [mounted, setMounted] = useState(false);
  const size = printPage ? CHART_SIZES.print : embedded ? CHART_SIZES.embedded : CHART_SIZES.default;
  const interactive = !printPage;

  useEffect(() => {
    setMounted(true);
  }, []);

  const data = points.filter((p) => p.grade != null);
  if (data.length < 2) return null;

  const grades = data.map((p) => p.grade as number);
  const minG = Math.max(4, Math.min(...grades) - 0.4);
  const maxG = Math.min(10, Math.max(...grades) + 0.4);
  const span = maxG - minG || 1;
  const innerW = size.width - size.padX * 2;
  const innerH = size.height - size.padY * 2;

  const setActiveFromEvent = (coord: ChartCoord, target: SVGCircleElement) => {
    const rect = target.getBoundingClientRect();
    setActive({
      ...coord,
      tipX: rect.left + rect.width / 2,
      tipY: rect.top,
    });
  };

  const coords: ChartCoord[] = data.map((point, i) => {
    const x = size.padX + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
    const grade = point.grade as number;
    const y = size.padY + innerH - ((grade - minG) / span) * innerH;
    return { x, y, grade, round: point.round, opponent: point.opponent, point };
  });

  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${(size.padY + innerH).toFixed(1)} L ${coords[0].x.toFixed(1)} ${(size.padY + innerH).toFixed(1)} Z`;

  const tooltip =
    interactive && active && mounted
      ? createPortal(
          <div
            className="round-grade-tooltip-portal"
            style={{ left: active.tipX, top: active.tipY }}
          >
            <RoundGradeStatsPanel point={active.point} accent={accent} layout="tooltip" />
          </div>,
          document.body,
        )
      : null;

  const chartClass = [
    "round-grade-chart",
    embedded ? "round-grade-chart-embedded" : "",
    printPage ? "round-grade-chart-print" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={chartClass}>
      {!embedded && !printPage && (
        <div className="round-grade-chart-head">
          <span className="round-grade-chart-title">{m.roundStats.chartAria}</span>
        </div>
      )}

      {printPage && (
        <div className="round-grade-chart-head">
          <span className="round-grade-chart-title">{m.reports.performancePageTitle}</span>
          <span className="round-grade-chart-range muted">{m.reports.performancePageLead}</span>
        </div>
      )}

      <div className="round-grade-chart-body">
        <div className="round-grade-chart-wrap">
          <svg
            viewBox={`0 0 ${size.width} ${size.height}`}
            className="round-grade-chart-svg"
            role="img"
            aria-label={m.roundStats.chartAria}
            onMouseLeave={interactive ? () => setActive(null) : undefined}
          >
          <defs>
            <linearGradient id={`round-grade-fill-${gradId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accent} stopOpacity={embedded || printPage ? 0.14 : 0.22} />
              <stop offset="100%" stopColor={accent} stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0.25, 0.5, 0.75].map((level) => {
            const y = size.padY + innerH * (1 - level);
            return (
              <line
                key={level}
                x1={size.padX}
                y1={y}
                x2={size.width - size.padX}
                y2={y}
                className="round-grade-grid-line"
                strokeWidth="1"
              />
            );
          })}

          <path d={areaPath} fill={`url(#round-grade-fill-${gradId})`} />
          <path
            d={linePath}
            fill="none"
            stroke={accent}
            strokeWidth={size.stroke}
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity={0.9}
          />

          {coords.map((c) => {
            const color = passGradeGradientColor(passGradePct(c.grade));
            return (
              <g key={c.round}>
                {interactive && size.hitR > 0 ? (
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={size.hitR}
                    fill="transparent"
                    className="round-grade-hit"
                    onMouseEnter={(e) => setActiveFromEvent(c, e.currentTarget)}
                    onFocus={(e) => setActiveFromEvent(c, e.currentTarget)}
                    onClick={() => onPointClick?.(c.point)}
                  />
                ) : null}
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={size.dotR}
                  fill={color}
                  stroke="#0f172a"
                  strokeWidth={printPage ? "0.8" : "0.5"}
                  pointerEvents="none"
                />
              </g>
            );
          })}
          </svg>
        </div>
      </div>
      {tooltip}
    </div>
  );
}
