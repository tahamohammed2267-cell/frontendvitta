import type { IndustryKey, MetricKey, ProjectStatus, TimeRange } from "../../../lib/portfolioData";

export type ComparableEntityKind = "project" | "region" | "industry" | "industryAverage" | "globalPortfolio";

export interface ComparableEntity {
  kind: ComparableEntityKind;
  id: string; // "project:rajasthan-250", "industryAverage:solar", "globalPortfolio:"
  refId: string; // underlying id: project id / region id / industry key / "" for globalPortfolio
  label: string;
  industryKey?: IndustryKey;
}

export interface ComparisonFilters {
  status?: ProjectStatus[];
}

export interface SavedComparison {
  id: string;
  name: string;
  entities: ComparableEntity[];
  metrics: MetricKey[];
  timeRange: TimeRange;
  comparisonFilters: ComparisonFilters;
  createdAt: string;
  updatedAt: string;
  owner: string;
  sharedWith: string[];
}

export function makeEntityId(kind: ComparableEntityKind, refId: string) {
  return `${kind}:${refId}`;
}
