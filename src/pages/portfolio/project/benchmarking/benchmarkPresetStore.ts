import { useSyncExternalStore } from "react";
import type { MetricKey } from "../../../../lib/portfolioData";
import { makeEntityId } from "../../comparisons/comparisonEntities";
import type { VarianceVerdict } from "./varianceVerdict";
import { currentColumn, makeEntityColumn, makeTimeColumn, type BenchmarkColumn } from "./benchmarkColumns";

// Metric Presets and Benchmark Presets are the same underlying concept —
// a "metric preset" is just a BenchmarkPreset saved with default columns/
// filters/sort. One store, one save/load flow, two entry points in the UI.

export interface BenchmarkFilters {
  search: string;
  verdicts: VarianceVerdict[]; // empty = no filter
}

export type SortDirection = "asc" | "desc";
export interface SortSpec { key: string; direction: SortDirection } // key = "metric" | a column id
export type BenchmarkSortState = SortSpec[];

export const defaultFilters: BenchmarkFilters = { search: "", verdicts: [] };

export const baseColumnKeys = ["difference", "pctDifference", "trend", "aiExplanation", "evidence"] as const;
export type BaseColumnKey = (typeof baseColumnKeys)[number];
export const baseColumnLabels: Record<BaseColumnKey, string> = {
  difference: "Difference", pctDifference: "% Difference", trend: "Trend", aiExplanation: "AI Explanation", evidence: "Evidence",
};

export interface BenchmarkPreset {
  id: string;
  name: string;
  metrics: MetricKey[];
  columns: BenchmarkColumn[]; // includes the "current" column
  filters: BenchmarkFilters;
  sort: BenchmarkSortState;
  visibleColumnKeys: BaseColumnKey[];
  createdAt: string;
  updatedAt: string;
}

const allBaseColumns: BaseColumnKey[] = [...baseColumnKeys];

// Seed content — 2 realistic presets, matching how a debt fund analyst
// would actually configure a view for these two review types.
function seedPresets(): BenchmarkPreset[] {
  const now = "Jul 1, 2026";
  return [
    {
      id: "bp-quarterly-review", name: "Quarterly Asset Review", createdAt: now, updatedAt: now,
      metrics: [
        "revenue", "revenueGrowth", "ebitda", "ebitdaMargin", "netIncome", "generation",
        "capacityUtilization", "assetHealth", "cashFlow", "maintenanceCost", "opex", "capex",
        "debtService", "panelEfficiency", "availability", "debtOutstanding", "openIssues",
      ] as MetricKey[],
      columns: [
        currentColumn,
        makeTimeColumn("prevQuarter"),
        makeEntityColumn({ kind: "portfolioAverage", id: makeEntityId("portfolioAverage", ""), refId: "", label: "Portfolio Average" }),
      ],
      filters: { search: "", verdicts: [] },
      sort: [{ key: "pctDifference:time:prevQuarter", direction: "desc" }],
      visibleColumnKeys: allBaseColumns,
    },
    {
      id: "bp-credit-review", name: "Credit Review", createdAt: now, updatedAt: now,
      metrics: ["ebitda", "ebitdaMargin", "cashFlow", "debtService", "debtOutstanding", "maintenanceCost", "opex", "capex"] as MetricKey[],
      columns: [
        currentColumn,
        makeTimeColumn("lastYear"),
        makeEntityColumn({ kind: "portfolioAverage", id: makeEntityId("portfolioAverage", ""), refId: "", label: "Portfolio Average" }),
      ],
      filters: { search: "", verdicts: [] },
      sort: [],
      visibleColumnKeys: allBaseColumns,
    },
  ];
}

let presets: BenchmarkPreset[] = seedPresets();
const listeners = new Set<() => void>();
function emit() { listeners.forEach((l) => l()); }

export function useBenchmarkPresets() {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => presets
  );
}

export function addBenchmarkPreset(preset: Omit<BenchmarkPreset, "id" | "createdAt" | "updatedAt">): BenchmarkPreset {
  const created: BenchmarkPreset = { ...preset, id: `bp-${Date.now()}`, createdAt: "Just now", updatedAt: "Just now" };
  presets = [...presets, created];
  emit();
  return created;
}

export function removeBenchmarkPreset(id: string) {
  presets = presets.filter((p) => p.id !== id);
  emit();
}

export function getBenchmarkPreset(id: string) {
  return presets.find((p) => p.id === id);
}
