// ─────────────────────────────────────────────────────────────
// State + derivation hook behind the Institutional Signals table.
// Mirrors the Benchmarking tab's useBenchmarkTable.ts pattern:
// signals+stats are joined once (cheap — 6 signals today), then
// filtered/sorted/expanded via memoized derivations so typing in
// search or toggling a filter never re-derives signal stats.
// ─────────────────────────────────────────────────────────────

import { useMemo, useState } from "react";
import {
  institutionalSignals, institutionalSignalStats,
  type FrequencyLabel, type ImpactLevel, type InstitutionalSignal, type OutcomeTag, type SignalStats, type SignalStatus,
} from "../../lib/intelligence/institutionalSignals";
import type { IndustryKey } from "../../lib/portfolioData";

export interface SignalRow {
  signal: InstitutionalSignal;
  stats: SignalStats;
}

export type SortDirection = "asc" | "desc";
export interface SortSpec { key: string; direction: SortDirection }
export type SortState = SortSpec[];

export interface SignalFilters {
  search: string;
  industries: IndustryKey[];
  regions: string[];
  severities: ("critical" | "high" | "medium" | "low")[];
  outcomes: OutcomeTag[];
  status: SignalStatus[];
  minConfidence: number; // 0 = any
  minDealCount: number;  // 0 = any
  yearFrom: number;
  yearTo: number;
  relatedFilterId: string | null; // set when user clicks a "Related Signals" chip
}

export const defaultFilters: SignalFilters = {
  search: "", industries: [], regions: [], severities: [], outcomes: [], status: [],
  minConfidence: 0, minDealCount: 0, yearFrom: 2018, yearTo: 2026, relatedFilterId: null,
};

const frequencyOrder: Record<FrequencyLabel, number> = { Increasing: 4, "Every Year": 3, Stable: 2, Declining: 1, Isolated: 0 };
const impactOrder: Record<ImpactLevel, number> = { High: 3, Medium: 2, Low: 1 };

function allRows(): SignalRow[] {
  return institutionalSignals.map((signal) => ({ signal, stats: institutionalSignalStats[signal.id] }));
}

function matchesFilters(row: SignalRow, filters: SignalFilters): boolean {
  const { signal, stats } = row;
  if (filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    if (!signal.title.toLowerCase().includes(q) && !signal.insight.toLowerCase().includes(q)) return false;
  }
  if (filters.industries.length > 0 && !signal.occurrences.some((o) => filters.industries.includes(o.industry))) return false;
  if (filters.regions.length > 0 && !signal.occurrences.some((o) => filters.regions.includes(o.region))) return false;
  if (filters.severities.length > 0 && !signal.occurrences.some((o) => filters.severities.includes(o.severity))) return false;
  if (filters.outcomes.length > 0 && !signal.occurrences.some((o) => filters.outcomes.includes(o.outcome))) return false;
  if (filters.status.length > 0 && !filters.status.includes(stats.status)) return false;
  if (stats.confidence.score < filters.minConfidence) return false;
  if (stats.projectCount < filters.minDealCount) return false;
  if (stats.lastSeenYear < filters.yearFrom || stats.firstSeenYear > filters.yearTo) return false;
  if (filters.relatedFilterId) {
    const anchor = institutionalSignals.find((s) => s.id === filters.relatedFilterId);
    if (!anchor) return true;
    const allowed = new Set([anchor.id, ...anchor.relatedSignalIds]);
    if (!allowed.has(signal.id)) return false;
  }
  return true;
}

function sortValue(row: SignalRow, key: string): number | string {
  const { signal, stats } = row;
  switch (key) {
    case "title": return signal.title;
    case "impact": return impactOrder[stats.impact];
    case "projectCount": return stats.projectCount;
    case "industryCount": return stats.industryCount;
    case "regionCount": return stats.regionCount;
    case "firstSeenYear": return stats.firstSeenYear;
    case "lastSeenYear": return stats.lastSeenYear;
    case "confidence": return stats.confidence.score;
    case "outcomePct": return stats.outcomeStat.pct;
    case "recurringSince": return signal.recurringSinceYear;
    case "frequency": return frequencyOrder[signal.frequency];
    default: return 0;
  }
}

function sortRows(rows: SignalRow[], sort: SortState): SignalRow[] {
  if (sort.length === 0) return rows;
  return [...rows].sort((a, b) => {
    for (const spec of sort) {
      const av = sortValue(a, spec.key);
      const bv = sortValue(b, spec.key);
      if (av === bv) continue;
      const cmp = av < bv ? -1 : 1;
      return spec.direction === "asc" ? cmp : -cmp;
    }
    return 0;
  });
}

export function useInstitutionalSignalsTable() {
  const [filters, setFilters] = useState<SignalFilters>(defaultFilters);
  const [sort, setSort] = useState<SortState>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const base = useMemo(allRows, []);
  const rows = useMemo(() => sortRows(base.filter((r) => matchesFilters(r, filters)), sort), [base, filters, sort]);

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

  function toggleExpanded(id: string) {
    setExpandedId((cur) => (cur === id ? null : id));
  }

  function filterByRelated(signalId: string) {
    setFilters((f) => ({ ...f, relatedFilterId: signalId }));
  }
  function clearRelatedFilter() {
    setFilters((f) => ({ ...f, relatedFilterId: null }));
  }

  return {
    allCount: base.length,
    rows, filters, setFilters, sort, toggleSort, expandedId, toggleExpanded,
    filterByRelated, clearRelatedFilter,
  };
}
