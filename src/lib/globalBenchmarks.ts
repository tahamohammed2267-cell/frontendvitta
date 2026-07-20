// ─────────────────────────────────────────────────────────────
// Vitta Project Workspace — Global Industry Benchmarks.
// A static, hand-authored external reference dataset — explicitly
// NOT derived from this portfolio's own projects. This is the honest
// mock meaning of "global industry benchmark": an outside data point
// to measure a project against, distinct from industryAverage/
// regionAverage/portfolioAverage, which ARE derived from our own data.
// ─────────────────────────────────────────────────────────────

import type { BusinessDriverKind, MetricKey } from "./portfolioData";

export interface GlobalBenchmark {
  metric: MetricKey;
  driverKind?: BusinessDriverKind;
  typicalValue: number;
  topQuartileValue: number;
  unit: string;
  source: string;
}

export const globalIndustryBenchmarks: GlobalBenchmark[] = [
  { metric: "availability", driverKind: "solar", typicalValue: 97.5, topQuartileValue: 99.2, unit: "%", source: "Global Solar Asset Benchmark Survey 2026 (mock)" },
  { metric: "capacityUtilization", driverKind: "solar", typicalValue: 22, topQuartileValue: 27, unit: "%", source: "Global Solar Asset Benchmark Survey 2026 (mock)" },
  { metric: "maintenanceCost", driverKind: "solar", typicalValue: 1.9, topQuartileValue: 1.4, unit: "€M", source: "Global Solar O&M Cost Survey 2026 (mock)" },
  { metric: "availability", driverKind: "wind", typicalValue: 96.8, topQuartileValue: 98.5, unit: "%", source: "Global Wind O&M Benchmark 2026 (mock)" },
  { metric: "capacityUtilization", driverKind: "wind", typicalValue: 32, topQuartileValue: 38, unit: "%", source: "Global Wind O&M Benchmark 2026 (mock)" },
  { metric: "maintenanceCost", driverKind: "wind", typicalValue: 2.6, topQuartileValue: 2.0, unit: "€M", source: "Global Wind O&M Benchmark 2026 (mock)" },
  { metric: "ebitdaMargin", typicalValue: 68, topQuartileValue: 78, unit: "%", source: "Global Renewables Asset Performance Report 2026 (mock)" },
  { metric: "assetHealth", typicalValue: 82, topQuartileValue: 92, unit: "", source: "Global Renewables Asset Performance Report 2026 (mock)" },
];

export function findGlobalBenchmark(metric: MetricKey, driverKind?: BusinessDriverKind) {
  return (
    globalIndustryBenchmarks.find((b) => b.metric === metric && b.driverKind === driverKind) ??
    globalIndustryBenchmarks.find((b) => b.metric === metric && !b.driverKind)
  );
}

export function getGlobalBenchmarkValue(metric: MetricKey, driverKind?: BusinessDriverKind): number | null {
  return findGlobalBenchmark(metric, driverKind)?.typicalValue ?? null;
}
