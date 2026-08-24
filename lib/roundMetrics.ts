import type { XpRoundGrade } from "@/lib/api";

export function roundXAccPct(point: XpRoundGrade): number | null {
  const vals = [point.short_pass_eff_pct, point.long_pass_eff_pct].filter(
    (value): value is number => value != null && Number.isFinite(value),
  );
  if (!vals.length) return null;
  return vals.reduce((sum, value) => sum + value, 0) / vals.length;
}

export function formatRoundXAcc(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export function formatRoundXpv(value?: number | null): string {
  if (value == null || Number.isNaN(value)) return "—";
  return value.toFixed(2);
}
