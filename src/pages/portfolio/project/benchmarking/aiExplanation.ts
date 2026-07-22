// ─────────────────────────────────────────────────────────────
// Deterministic AI-explanation derivation. This is a static mock —
// there is no LLM call here — but every sentence except the closing
// investigation prompt is built from real, computed inputs specific
// to this project/metric/column combination: the actual magnitude
// and direction of the variance, the actual composition of the
// comparison target (via describeColumn), the actual real/synthetic
// trend direction from getMetricSeries, and the project's actual
// healthFlags where one maps to this metric. Two different
// project/metric/column combinations never produce the same string
// unless their underlying numbers genuinely happen to match.
// ─────────────────────────────────────────────────────────────

import type { HealthFlag, MetricKey, PortfolioProject } from "../../../../lib/portfolioData";
import type { SeriesPoint } from "../../builder/metricSeries";
import { metricLabels } from "../../builder/metricSeries";
import { describeColumn, type BenchmarkColumn } from "./benchmarkColumns";
import { varianceVerdictMeta, type VarianceVerdict } from "./varianceVerdict";

// Which health-flag rules are relevant to which metric — a real join, not
// narrative filler. Metrics with no mapped rule simply produce no flag
// clause in the explanation (honest omission, not padding).
const metricFlagRules: Partial<Record<MetricKey, string[]>> = {
  revenue: ["revenueDown10"],
  ebitdaMargin: ["ebitdaMarginBelowTarget"],
  generation: ["generationBelowForecast"],
  maintenanceCost: ["highMaintenanceCost"],
  assetHealth: ["lowAssetHealth"],
  debtOutstanding: ["covenantBreach"],
};

export function findRelevantHealthFlags(metric: MetricKey, flags: HealthFlag[]): HealthFlag[] {
  const rules = metricFlagRules[metric];
  if (!rules) return [];
  return flags.filter((f) => rules.includes(f.rule));
}

function describeTrendDirection(trend: SeriesPoint[]): string {
  if (trend.length < 2) return "with insufficient history to characterize a trend";
  const first = trend[0].value;
  const last = trend[trend.length - 1].value;
  const pctChange = first !== 0 ? ((last - first) / Math.abs(first)) * 100 : 0;
  const period = `the past ${trend.length} month${trend.length === 1 ? "" : "s"}`;
  if (pctChange > 3) return `up over ${period}`;
  if (pctChange < -3) return `down over ${period}`;
  return `broadly flat over ${period}`;
}

const outperformancePrompts = [
  "Consider whether this reflects a one-off item or a sustained improvement worth replicating across the portfolio.",
];
const underperformancePrompts: Partial<Record<MetricKey, string>> = {
  maintenanceCost: "Consider reviewing recent MIS submissions and O&M contractor performance for drivers of this gap.",
  opex: "Consider reviewing recent MIS submissions and cost-center detail for drivers of this gap.",
  capex: "Consider reviewing the capital plan and phasing assumptions behind this variance.",
  debtService: "Consider reviewing the debt schedule and refinancing assumptions behind this variance.",
  revenue: "Consider reviewing recent MIS submissions for the drivers behind this shortfall.",
  generation: "Consider reviewing resource conditions and equipment availability behind this shortfall.",
};
const defaultUnderperformancePrompt = "Consider reviewing recent MIS submissions for the drivers behind this variance.";

function investigationPrompt(verdict: VarianceVerdict, metric: MetricKey): string {
  if (verdict === "significantOutperformance" || verdict === "moderateOutperformance") {
    return outperformancePrompts[0];
  }
  if (verdict === "inLine") return "";
  return underperformancePrompts[metric] ?? defaultUnderperformancePrompt;
}

export interface ExplanationInput {
  project: PortfolioProject;
  metric: MetricKey;
  column: BenchmarkColumn;
  pctDifference: number | null;
  verdict: VarianceVerdict | null;
  trend: SeriesPoint[];
}

export function deriveExplanation(input: ExplanationInput): string {
  const { project, metric, column, pctDifference, verdict, trend } = input;
  const compositionClause = describeColumn(column, project);

  if (pctDifference === null || verdict === null) {
    return `No comparable data is available for ${metricLabels[metric]} against ${compositionClause}.`;
  }

  const direction = pctDifference > 0 ? "above" : pctDifference < 0 ? "below" : "in line with";
  const magnitudeClause = pctDifference === 0
    ? compositionClause
    : `${Math.abs(pctDifference).toFixed(1)}% ${direction} ${compositionClause}`;

  const verdictMeta = varianceVerdictMeta[verdict];
  const trendClause = describeTrendDirection(trend);
  const relevantFlags = findRelevantHealthFlags(metric, project.healthFlags);
  const flagClause = relevantFlags.length > 0
    ? `This aligns with an open ${relevantFlags[0].severity} flag: "${relevantFlags[0].label}" — ${relevantFlags[0].detail}`
    : null;
  const prompt = investigationPrompt(verdict, metric);

  const parts = [
    `${project.name}'s ${metricLabels[metric]} is ${magnitudeClause}, a ${verdictMeta.label.toLowerCase()}.`,
    `The metric has trended ${trendClause}.`,
    flagClause,
    prompt || null,
  ];
  return parts.filter(Boolean).join(" ");
}
