"use client";

import { DualSofascoreAccordion } from "@/components/DualSofascoreAccordion";
import { useI18n } from "@/lib/i18n/context";

type Props = {
  gradeGeral?: number | null;
  gradeStratum?: number | null;
  gradeBlend?: number | null;
  animate?: boolean;
  animationKey?: string;
};

export function PrecisionAccordion({
  gradeGeral,
  gradeStratum,
  gradeBlend,
}: Props) {
  const { m } = useI18n();

  return (
    <DualSofascoreAccordion
      title={m.precision.title}
      summaryTip={m.tooltips.xpProfileBars.xp_efficiency_display}
      icon="fa-gauge-high"
      primaryLabel={m.precision.generalCoe}
      secondaryLabel={m.precision.stratumCoe}
      primaryTip={m.precision.generalCoeTip}
      secondaryTip={m.precision.stratumCoeTip}
      gradePrimary={gradeGeral}
      gradeSecondary={gradeStratum}
      gradeBlend={gradeBlend}
      blendWeight={0.7}
    />
  );
}
