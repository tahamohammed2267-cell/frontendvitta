// ─────────────────────────────────────────────────────────────
// Variance classification — five-tier verdict with user-configurable
// thresholds (not hardcoded), plus the "lower is better" inversion
// for cost/debt metrics so a cost that's below its comparison target
// is correctly classified as outperformance, not underperformance.
// ─────────────────────────────────────────────────────────────

import type { MetricKey } from "../../../../lib/portfolioData";

export type VarianceVerdict =
  | "significantOutperformance" | "moderateOutperformance" | "inLine"
  | "moderateUnderperformance" | "significantUnderperformance";

export interface VarianceThresholds {
  moderateThresholdPct: number;
  significantThresholdPct: number;
}

export const defaultVarianceThresholds: VarianceThresholds = {
  moderateThresholdPct: 5,
  significantThresholdPct: 15,
};

const lowerIsBetterMetrics = new Set<MetricKey>([
  "maintenanceCost", "opex", "capex", "debtService", "debtOutstanding", "openIssues",
]);

export function isLowerBetter(metric: MetricKey) {
  return lowerIsBetterMetrics.has(metric);
}

export function classifyVariance(
  metric: MetricKey,
  pctDifference: number,
  thresholds: VarianceThresholds = defaultVarianceThresholds,
): VarianceVerdict {
  const signed = lowerIsBetterMetrics.has(metric) ? -pctDifference : pctDifference;
  const mag = Math.abs(signed);
  if (mag < thresholds.moderateThresholdPct) return "inLine";
  if (mag < thresholds.significantThresholdPct) return signed > 0 ? "moderateOutperformance" : "moderateUnderperformance";
  return signed > 0 ? "significantOutperformance" : "significantUnderperformance";
}

export const varianceVerdictMeta: Record<VarianceVerdict, { label: string; tone: "green" | "blue" | "gray" | "orange" | "red" }> = {
  significantOutperformance: { label: "Significant Outperformance", tone: "green" },
  moderateOutperformance: { label: "Moderate Outperformance", tone: "blue" },
  inLine: { label: "In Line", tone: "gray" },
  moderateUnderperformance: { label: "Moderate Underperformance", tone: "orange" },
  significantUnderperformance: { label: "Significant Underperformance", tone: "red" },
};

export const varianceVerdictOrder: VarianceVerdict[] = [
  "significantOutperformance", "moderateOutperformance", "inLine", "moderateUnderperformance", "significantUnderperformance",
];

// pctDifference = (current - target) / |target| * 100, guarded against
// target === 0 (several metrics can be legitimately zero for a given
// project, e.g. openIssues) — returns null rather than Infinity/NaN.
export function computePctDifference(current: number, target: number): number | null {
  if (target === 0) return null;
  return Math.round(((current - target) / Math.abs(target)) * 1000) / 10;
}
