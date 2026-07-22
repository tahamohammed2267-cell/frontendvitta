// ─────────────────────────────────────────────────────────────
// The single state + derivation hook behind the Benchmarking tab.
// Two-tier memoization: (1) buildRows — the expensive part, calling
// getComparisonEntityMetricValue/getComparisonValue/getMetricSeries/
// deriveExplanation for every metric×column combination — recomputes
// only when project/metrics/columns/thresholds change, never on a
// search keystroke or sort click. (2) filter+sort — operates on the
// already-computed rows, cheap even at hundreds of rows.
//
// At today's real scale (17 metrics × ~3-6 columns × 14 projects) row
// virtualization would add a dependency and complexity for zero
// visible benefit. If the real dataset grows materially, the next
// step is @tanstack/react-virtual on BenchmarkTable's <tbody> — this
// two-tier split is structured so that swap wouldn't require touching
// buildRows/filterRows/sortRows.
// ─────────────────────────────────────────────────────────────

import { useMemo, useState } from "react";
import type { MetricKey, PortfolioProject } from "../../../../lib/portfolioData";
import { getMetricSeries, metricCategories, metricLabels, type SeriesPoint } from "../../builder/metricSeries";
import { currentColumn, getColumnValue, type BenchmarkColumn } from "./benchmarkColumns";
import {
  classifyVariance, computePctDifference, defaultVarianceThresholds, type VarianceThresholds, type VarianceVerdict,
} from "./varianceVerdict";
import { deriveExplanation } from "./aiExplanation";
import {
  defaultFilters, baseColumnKeys, type BaseColumnKey, type BenchmarkFilters, type BenchmarkPreset, type BenchmarkSortState,
} from "./benchmarkPresetStore";

export interface BenchmarkCell {
  columnId: string;
  value: number | null;
  pctDifference: number | null;
  verdict: VarianceVerdict | null;
}

export interface BenchmarkRow {
  metric: MetricKey;
  currentValue: number;
  cells: BenchmarkCell[];
  trend: SeriesPoint[];
  aiExplanation: string;
}

const defaultMetrics: MetricKey[] = ["revenue", "ebitdaMargin", "assetHealth", "capacityUtilization"];
export const allMetrics: MetricKey[] = Object.keys(metricLabels) as MetricKey[];

function buildRows(
  project: PortfolioProject, metrics: MetricKey[], columns: BenchmarkColumn[], thresholds: VarianceThresholds,
): BenchmarkRow[] {
  return metrics.map((metric) => {
    const currentValue = getColumnValue(currentColumn, metric, project) ?? 0;
    const cells: BenchmarkCell[] = columns
      .filter((c) => c.kind !== "current")
      .map((col) => {
        const value = getColumnValue(col, metric, project);
        const pctDifference = value !== null ? computePctDifference(currentValue, value) : null;
        const verdict = pctDifference !== null ? classifyVariance(metric, pctDifference, thresholds) : null;
        return { columnId: col.id, value, pctDifference, verdict };
      });

    const trend = getMetricSeries(metric, "project", project.id, "YTD");
    const primaryColumn = columns.find((c) => c.kind !== "current");
    const primaryCell = primaryColumn ? cells.find((c) => c.columnId === primaryColumn.id) : undefined;

    const aiExplanation = primaryColumn
      ? deriveExplanation({
          project, metric, column: primaryColumn,
          pctDifference: primaryCell?.pctDifference ?? null,
          verdict: primaryCell?.verdict ?? null,
          trend,
        })
      : `Add a comparison column to see how ${metricLabels[metric]} benchmarks.`;

    return { metric, currentValue, cells, trend, aiExplanation };
  });
}

function filterRows(rows: BenchmarkRow[], filters: BenchmarkFilters): BenchmarkRow[] {
  let out = rows;
  if (filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    out = out.filter((r) => metricLabels[r.metric].toLowerCase().includes(q) || metricCategories[r.metric].toLowerCase().includes(q));
  }
  if (filters.verdicts.length > 0) {
    out = out.filter((r) => {
      const primary = r.cells[0];
      return primary?.verdict && filters.verdicts.includes(primary.verdict);
    });
  }
  return out;
}

function sortRows(rows: BenchmarkRow[], sort: BenchmarkSortState): BenchmarkRow[] {
  if (sort.length === 0) return rows;
  return [...rows].sort((a, b) => {
    for (const spec of sort) {
      const av = sortValue(a, spec.key);
      const bv = sortValue(b, spec.key);
      if (av === bv) continue;
      if (av === null) return 1;
      if (bv === null) return -1;
      const cmp = av < bv ? -1 : 1;
      return spec.direction === "asc" ? cmp : -cmp;
    }
    return 0;
  });
}

function sortValue(row: BenchmarkRow, key: string): number | string | null {
  if (key === "metric") return metricLabels[row.metric];
  if (key === "current") return row.currentValue;
  const [field, columnId] = key.split(":", 2);
  const cell = row.cells.find((c) => c.columnId === columnId);
  if (!cell) return null;
  if (field === "value") return cell.value;
  if (field === "pctDifference") return cell.pctDifference;
  return null;
}

export function useBenchmarkTable(project: PortfolioProject, initialColumns: BenchmarkColumn[]) {
  const [selectedMetrics, setSelectedMetrics] = useState<MetricKey[]>(defaultMetrics);
  const [columns, setColumns] = useState<BenchmarkColumn[]>(initialColumns);
  const [filters, setFilters] = useState<BenchmarkFilters>(defaultFilters);
  const [sort, setSort] = useState<BenchmarkSortState>([]);
  const [thresholds, setThresholds] = useState<VarianceThresholds>(defaultVarianceThresholds);
  const [visibleColumnKeys, setVisibleColumnKeys] = useState<BaseColumnKey[]>([...baseColumnKeys]);

  const allRows = useMemo(
    () => buildRows(project, selectedMetrics, columns, thresholds),
    [project, selectedMetrics, columns, thresholds],
  );

  const rows = useMemo(() => sortRows(filterRows(allRows, filters), sort), [allRows, filters, sort]);

  function addColumn(col: BenchmarkColumn) {
    setColumns((cs) => (cs.some((c) => c.id === col.id) ? cs : [...cs, col]));
  }
  function removeColumn(id: string) {
    setColumns((cs) => cs.filter((c) => c.id !== id));
  }
  function toggleMetric(metric: MetricKey) {
    setSelectedMetrics((ms) => (ms.includes(metric) ? ms.filter((m) => m !== metric) : [...ms, metric]));
  }
  function selectAllMetrics() {
    setSelectedMetrics(allMetrics);
  }
  function clearAllMetrics() {
    setSelectedMetrics([]);
  }
  function toggleSort(key: string, multi: boolean) {
    setSort((s) => {
      const existing = s.find((spec) => spec.key === key);
      if (!multi) {
        if (!existing) return [{ key, direction: "asc" }];
        if (existing.direction === "asc") return [{ key, direction: "desc" }];
        return [];
      }
      if (!existing) return [...s, { key, direction: "asc" }];
      if (existing.direction === "asc") return s.map((spec) => (spec.key === key ? { ...spec, direction: "desc" } : spec));
      return s.filter((spec) => spec.key !== key);
    });
  }
  function applyPreset(preset: BenchmarkPreset) {
    setSelectedMetrics(preset.metrics);
    setColumns(preset.columns);
    setFilters(preset.filters);
    setSort(preset.sort);
    setVisibleColumnKeys(preset.visibleColumnKeys);
  }

  return {
    selectedMetrics, toggleMetric, selectAllMetrics, clearAllMetrics,
    columns, addColumn, removeColumn,
    filters, setFilters,
    sort, toggleSort,
    thresholds, setThresholds,
    visibleColumnKeys, setVisibleColumnKeys,
    rows, allRowCount: allRows.length,
    applyPreset,
  };
}
