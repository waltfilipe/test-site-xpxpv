"use client";

import { SofascoreGradeBar } from "@/components/ui/SofascoreGradeBar";
import { Tooltip } from "@/components/ui/Tooltip";
import { useI18n } from "@/lib/i18n/context";

type Props = {
  generalGrade?: number | null;
  expectedGrade?: number | null;
  animate?: boolean;
  animationKey?: string;
};

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
    <div className="player-card pass-grade-card pass-grade-card-dual">
      <div className="pass-grade-head">
        <span className="pass-grade-title">{m.passGrade.title}</span>
      </div>
      <div className="pass-grade-dual-rows">
        <SofascoreGradeBar
          label={m.passGrade.general}
          grade={generalGrade}
          tip={m.passGrade.generalTip}
          animate={animate}
          animationKey={animationKey ? `${animationKey}-pass-gen` : "pass-gen"}
          animationDelayMs={0}
        />
        <SofascoreGradeBar
          label={m.passGrade.expected}
          grade={expectedGrade}
          tip={m.passGrade.expectedTip}
          size="sm"
          animate={animate}
          animationKey={animationKey ? `${animationKey}-pass-exp` : "pass-exp"}
          animationDelayMs={animate ? 90 : 0}
        />
      </div>
    </div>
  );

  return <Tooltip content={m.tooltips.passGrade} block>{panel}</Tooltip>;
}
