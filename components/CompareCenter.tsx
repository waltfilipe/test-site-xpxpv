"use client";

import type { CompareMetric } from "@/lib/api";
import { ComparePassGridTable } from "@/components/ComparePassGridTable";
import { CompareXpProfileSection } from "@/components/CompareXpProfileSection";
import { useI18n } from "@/lib/i18n/context";

type Props = {
  xpA: Record<string, unknown>;
  xpB: Record<string, unknown>;
  passGrid: CompareMetric[];
  nameA: string;
  nameB: string;
};

export function CompareCenter({ xpA, xpB, passGrid, nameA, nameB }: Props) {
  const { m } = useI18n();

  return (
    <div className="compare-center">
      <section className="compare-chart-section">
        <h3 className="section-label">{m.sections.xpProfile}</h3>
        <CompareXpProfileSection xpA={xpA} xpB={xpB} nameA={nameA} nameB={nameB} />
      </section>

      <section className="compare-chart-section">
        <h3 className="section-label">{m.sections.passScores}</h3>
        <ComparePassGridTable metrics={passGrid} nameA={nameA} nameB={nameB} />
      </section>
    </div>
  );
}
