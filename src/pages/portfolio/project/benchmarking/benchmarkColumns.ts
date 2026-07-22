// ─────────────────────────────────────────────────────────────
// Benchmarking table — column model. The single "add a column"
// mechanism: every comparison target (an individual project, an
// industry/region/portfolio/custom-group average, or a time-based
// comparison) is represented as one BenchmarkColumn and rendered
// through the same UI. No new data-layer computation is added here
// — everything resolves through the existing, real
// getMetricValue/getComparisonValue/getComparisonEntityMetricValue
// machinery in metricSeries.ts, so this stays a pure leaf module
// with no circular-import risk.
// ─────────────────────────────────────────────────────────────

import {
  getComparisonEntityMetricValue, getComparisonValue, getMetricValue, resolveEntityProjects,
} from "../../builder/metricSeries";
import type { ComparableEntity } from "../../comparisons/comparisonEntities";
import { findGlobalBenchmark } from "../../../../lib/globalBenchmarks";
import { findIndustry, type ComparisonKey, type MetricKey, type PortfolioProject } from "../../../../lib/portfolioData";

// "none" is excluded — it isn't a real comparison, it's the sentinel the
// underlying getComparisonValue uses to mean "no comparison requested."
export type TimeComparisonKind = Exclude<ComparisonKey, "none">;

export interface TimeComparisonMeta {
  kind: TimeComparisonKind;
  label: string;
  shortLabel: string;
}

// "Custom Reporting Period" has no real period-selection data model behind
// it (only 6 fixed hard-coded months exist anywhere) — shown as a disabled
// option in the column picker rather than omitted, so the full requested
// list is visible even though it isn't wired to real data yet.
export const timeComparisonMeta: Record<TimeComparisonKind, TimeComparisonMeta> = {
  prevMonth: { kind: "prevMonth", label: "Previous Reporting Period", shortLabel: "Prev Period" },
  prevQuarter: { kind: "prevQuarter", label: "Previous Quarter", shortLabel: "Prev Qtr" },
  lastYear: { kind: "lastYear", label: "Same Quarter Last Year", shortLabel: "SQLY" },
  budget: { kind: "budget", label: "vs. Budget", shortLabel: "Budget" },
  forecast: { kind: "forecast", label: "vs. Forecast", shortLabel: "Forecast" },
  target: { kind: "target", label: "vs. Target", shortLabel: "Target" },
};

export type BenchmarkColumn =
  | { id: "current"; kind: "current" }
  | { id: string; kind: "entity"; entity: ComparableEntity }
  | { id: string; kind: "time"; time: TimeComparisonKind };

export const currentColumn: BenchmarkColumn = { id: "current", kind: "current" };

export function makeTimeColumn(time: TimeComparisonKind): BenchmarkColumn {
  return { id: `time:${time}`, kind: "time", time };
}

export function makeEntityColumn(entity: ComparableEntity): BenchmarkColumn {
  return { id: `entity:${entity.id}`, kind: "entity", entity };
}

// getComparisonEntityMetricValue returns 0 (not null) when a globalBenchmark
// entity has no row for this metric — distinguish a genuine zero reading
// from "no data," so the table can render "—" honestly instead of a
// misleading 0.
function hasGlobalBenchmarkCoverage(metric: MetricKey, entity: ComparableEntity): boolean {
  const driverKind = entity.industryKey ? findIndustry(entity.industryKey)?.driverKind : undefined;
  return !!findGlobalBenchmark(metric, driverKind);
}

export function getColumnValue(col: BenchmarkColumn, metric: MetricKey, baseProject: PortfolioProject): number | null {
  if (col.kind === "current") return getMetricValue(metric, "project", baseProject.id);
  if (col.kind === "entity") {
    if (col.entity.kind === "globalBenchmark" && !hasGlobalBenchmarkCoverage(metric, col.entity)) return null;
    return getComparisonEntityMetricValue(metric, col.entity);
  }
  return getComparisonValue(metric, "project", baseProject.id, col.time);
}

// Describes what a column IS, in plain language, reused by both column
// headers and the AI-explanation derivation so the two surfaces never
// disagree about what's being compared.
export function describeColumn(col: BenchmarkColumn, baseProject: PortfolioProject): string {
  if (col.kind === "current") return baseProject.name;
  if (col.kind === "time") return `${timeComparisonMeta[col.time].label} (modeled)`;
  const e = col.entity;
  if (e.kind === "project") return e.label;
  if (e.kind === "customGroup") {
    const n = e.refId ? e.refId.split(",").length : 0;
    return `${e.label} (${n} project${n === 1 ? "" : "s"})`;
  }
  if (e.kind === "industryAverage" || e.kind === "regionAverage" || e.kind === "portfolioAverage" || e.kind === "globalPortfolio") {
    const n = resolveEntityProjects(e).length;
    return `${e.label} (${n} project${n === 1 ? "" : "s"})`;
  }
  return e.label; // industry, region, globalBenchmark
}

export function columnShortLabel(col: BenchmarkColumn): string {
  if (col.kind === "current") return "Current";
  if (col.kind === "time") return timeComparisonMeta[col.time].shortLabel;
  return col.entity.label;
}
