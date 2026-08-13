"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  passGradeGradientColor,
  sofascoreBarPosition,
  sofascoreGradePct,
} from "@/lib/gradeColors";
import { Tooltip } from "@/components/ui/Tooltip";

type Props = {
  label: string;
  icon?: string;
  grade?: number | null;
  tip?: string;
  animate?: boolean;
  animationKey?: string;
  animationDelayMs?: number;
  size?: "default" | "sm";
  trailing?: ReactNode;
};

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function SofascoreGradeBar({
  label,
  icon,
  grade,
  tip,
  animate = false,
  animationKey,
  animationDelayMs = 0,
  size = "default",
  trailing,
}: Props) {
  const revealKey = animationKey ?? grade ?? label;
  const [revealed, setRevealed] = useState(!animate || grade == null);

  useEffect(() => {
    if (!animate || grade == null || prefersReducedMotion()) {
      setRevealed(true);
      return;
    }

    setRevealed(false);
    const timer = window.setTimeout(() => {
      requestAnimationFrame(() => setRevealed(true));
    }, animationDelayMs);

    return () => window.clearTimeout(timer);
  }, [animate, grade, revealKey, animationDelayMs]);

  const pct = grade != null ? sofascoreGradePct(grade) : 0;
  const markerPct = grade != null ? sofascoreBarPosition(grade) : 0;
  const shownPct = revealed ? pct : 0;
  const shownMarkerPct = revealed ? markerPct : 0;
  const color = grade != null ? passGradeGradientColor(pct) : "#94a3b8";

  const block = (
    <div className={`xp-pillar-block${size === "sm" ? " xp-pillar-block-sm" : ""}`}>
      <div className="pass-metric-head">
        <span className="pass-metric-label xp-metric-label">
          {icon && <i className={`fa-solid ${icon} xp-metric-icon`} aria-hidden="true" />}
          {label}
        </span>
        <span className="pass-metric-value-wrap">
          {trailing}
          <span className="pass-metric-value tabular" style={{ color }}>
            {grade != null ? grade.toFixed(1) : "—"}
          </span>
        </span>
      </div>
      <div
        className={`sofascore-grade-meter${size === "sm" ? " sofascore-grade-meter-sm" : ""}`}
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
            style={{ left: `${shownMarkerPct}%` }}
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
