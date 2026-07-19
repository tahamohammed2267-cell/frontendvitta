import { useSyncExternalStore } from "react";
import { makeEntityId, type ComparableEntity, type SavedComparison } from "./comparisonEntities";

function entity(kind: ComparableEntity["kind"], refId: string, label: string, industryKey?: ComparableEntity["industryKey"]): ComparableEntity {
  return { kind, refId, label, industryKey, id: makeEntityId(kind, refId) };
}

const seedComparisons: SavedComparison[] = [
  {
    id: "cmp-solar-vs-wind",
    name: "Solar vs Wind — Industry Comparison",
    entities: [
      entity("industry", "solar", "Renewables — Solar", "solar"),
      entity("industry", "wind", "Renewables — Wind", "wind"),
    ],
    metrics: ["revenue", "ebitda", "ebitdaMargin", "assetHealth"],
    timeRange: "YTD",
    comparisonFilters: {},
    createdAt: "Jul 10, 09:00", updatedAt: "Jul 10, 09:00", owner: "Jane Moreau", sharedWith: ["A. Lindqvist"],
  },
  {
    id: "cmp-gujarat-vs-solar-avg",
    name: "Gujarat 140 MW vs Solar Industry Average",
    entities: [
      entity("project", "gujarat-140", "Gujarat 140 MW Project", "solar"),
      entity("industryAverage", "solar", "Renewables — Solar — Industry Average", "solar"),
    ],
    metrics: ["revenue", "capacityUtilization", "assetHealth", "maintenanceCost"],
    timeRange: "YTD",
    comparisonFilters: {},
    createdAt: "Jul 14, 15:20", updatedAt: "Jul 14, 15:20", owner: "R. Chen", sharedWith: [],
  },
  {
    id: "cmp-india-vs-global",
    name: "India Regions vs Global Portfolio",
    entities: [
      entity("region", "solar-india", "India · Solar", "solar"),
      entity("region", "wind-india", "India · Wind", "wind"),
      entity("globalPortfolio", "", "Global Portfolio"),
    ],
    metrics: ["revenue", "ebitda", "cashFlow"],
    timeRange: "YTD",
    comparisonFilters: {},
    createdAt: "Jul 17, 11:40", updatedAt: "Jul 17, 11:40", owner: "Jane Moreau", sharedWith: ["S. Okafor", "M. Ferreira"],
  },
];

let comparisons: SavedComparison[] = [...seedComparisons];
const listeners = new Set<() => void>();
function emit() { listeners.forEach((l) => l()); }

export function useComparisons() {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => comparisons
  );
}

export function getComparison(id: string) {
  return comparisons.find((c) => c.id === id);
}

export function addComparison(def: SavedComparison) {
  comparisons = [...comparisons, def];
  emit();
  return def;
}

export function updateComparison(id: string, patch: Partial<SavedComparison>) {
  comparisons = comparisons.map((c) => (c.id === id ? { ...c, ...patch, updatedAt: "Just now" } : c));
  emit();
}

export function removeComparison(id: string) {
  comparisons = comparisons.filter((c) => c.id !== id);
  emit();
}
