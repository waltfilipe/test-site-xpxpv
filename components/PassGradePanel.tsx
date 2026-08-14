"use client";

import { useEffect, useState } from "react";
import {
  passGradeGradientColor,
  sofascoreBarPosition,
  sofascoreGradePct,
} from "@/lib/gradeColors";
import { useCountUp } from "@/lib/useBarRevealAnimation";
import { Tooltip } from "@/components/ui/Tooltip";
import { useI18n } from "@/lib/i18n/context";

type Props = {
  generalGrade?: number | null;
  expectedGrade?: number | null;
  animate?: boolean;
  animationKey?: string;
};

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function GradeHeroBox({
  label,
  grade,
  tip,
  animate,
  animationKey,
  animationDelayMs = 0,
}: {
  label: string;
  grade?: number | null;
  tip: string;
  animate?: boolean;
  animationKey?: string;
  animationDelayMs?: number;
}) {
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
  const animatedScore = useCountUp(grade ?? 0, revealKey, animate && grade != null && revealed);
  const shownScore = animate && grade != null ? animatedScore : grade;

  const box = (
    <div
      className="pass-grade-hero-box"
      style={{
        borderColor: `${color}44`,
        background: `linear-gradient(155deg, ${color}18 0%, rgba(15, 23, 42, 0.55) 58%)`,
      }}
    >
      <span className="pass-grade-hero-label">{label}</span>
      <div className="pass-grade-hero-value">
        <span className="pass-grade-hero-score tabular" style={{ color }}>
          {shownScore != null ? shownScore.toFixed(1) : "—"}
        </span>
        {grade != null && <span className="pass-grade-hero-scale">/ 10</span>}
      </div>
      <div className="pass-grade-hero-meter">
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

  return (
    <Tooltip content={tip} block>
      {box}
    </Tooltip>
  );
}

export function PassGradePanel({
  generalGrade,
  expectedGrade,
  animate = false,
  animationKey,
}: Props) {
  const { m } = useI18n();

  if (generalGrade == null && expectedGrade == null) {
    return (
      <div className="player-card pass-grade-card">
        <div className="pass-grade-head">
          <span className="pass-grade-title">{m.passGrade.title}</span>
        </div>
        <p className="placeholder-note">{m.passGrade.unavailable}</p>
      </div>
    );
  }

  const panel = (
    <div className="player-card pass-grade-card pass-grade-hero-card">
      <div className="pass-grade-head">
        <span className="pass-grade-icon" aria-hidden="true">
          <i className="fa-solid fa-star" />
        </span>
        <span className="pass-grade-title">{m.passGrade.title}</span>
      </div>
      <div className="pass-grade-hero-grid">
        <GradeHeroBox
          label={m.passGrade.general}
          grade={generalGrade}
          tip={m.passGrade.generalTip}
          animate={animate}
          animationKey={animationKey ? `${animationKey}-gen` : "pass-gen"}
          animationDelayMs={0}
        />
        <GradeHeroBox
          label={m.passGrade.expected}
          grade={expectedGrade}
          tip={m.passGrade.expectedTip}
          animate={animate}
          animationKey={animationKey ? `${animationKey}-exp` : "pass-exp"}
          animationDelayMs={animate ? 120 : 0}
        />
      </div>
    </div>
  );

  return <Tooltip content={m.tooltips.passGrade} block>{panel}</Tooltip>;
}
