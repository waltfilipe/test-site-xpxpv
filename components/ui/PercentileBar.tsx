"use client";

import { useEffect, useState } from "react";
import { passGradeGradientColor } from "@/lib/gradeColors";
import { Tooltip } from "@/components/ui/Tooltip";

type Props = {
  label: string;
  value?: number | null;
  tip?: string;
  animate?: boolean;
  animationKey?: string;
  animationDelayMs?: number;
  size?: "default" | "sm";
};

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function barMarkerPct(value: number): number {
  return Math.max(2, Math.min(98, value));
}

export function PercentileBar({
  label,
  value,
  tip,
  animate = false,
  animationKey,
  animationDelayMs = 0,
  size = "default",
}: Props) {
  const revealKey = animationKey ?? value ?? label;
  const [revealed, setRevealed] = useState(!animate || value == null);

  useEffect(() => {
    if (!animate || value == null || prefersReducedMotion()) {
      setRevealed(true);
      return;
    }

    setRevealed(false);
    const timer = window.setTimeout(() => {
      requestAnimationFrame(() => setRevealed(true));
    }, animationDelayMs);

    return () => window.clearTimeout(timer);
  }, [animate, value, revealKey, animationDelayMs]);

  const pct = value != null ? Math.max(0, Math.min(100, value)) : 0;
  const shownPct = revealed ? pct : 0;
  const markerPct = revealed ? barMarkerPct(pct) : 0;
  const color = value != null ? passGradeGradientColor(pct) : "#94a3b8";

  const block = (
    <div className={`xp-pillar-block${size === "sm" ? " xp-pillar-block-sm" : ""}`}>
      <div className="pass-metric-head">
        <span className="pass-metric-label xp-metric-label">{label}</span>
        <span className="pass-metric-value tabular" style={{ color }}>
          {value != null ? Math.round(value) : "—"}
        </span>
      </div>
      <div
        className={`sofascore-grade-meter percentile-bar-meter${size === "sm" ? " sofascore-grade-meter-sm" : ""}`}
      >
        <div className="pass-grade-track">
          <span className="pass-grade-shade">
            <span
              className={`pass-grade-rest${animate ? " pass-grade-rest-animated" : ""}`}
              style={{ left: `${shownPct}%` }}
            />
          </span>
          <span
            className={`pass-grade-marker${animate ? " pass-grade-marker-animated" : ""}`}
            style={{ left: `${markerPct}%` }}
          />
        </div>
      </div>
    </div>
  );

  if (!tip) return block;
  return (
    <Tooltip content={tip} block>
      {block}
    </Tooltip>
  );
}
