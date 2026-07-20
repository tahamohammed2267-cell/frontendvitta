import {
  aggregateKPIs, findIndustry, findProject, findRegion, portfolioProjects, projectsForIndustry, projectsForRegion,
  type ComparisonKey, type DashboardScope, type IndustryKey, type MetricKey, type PortfolioProject, type TimeRange,
} from "../../../lib/portfolioData";
import { getGlobalBenchmarkValue } from "../../../lib/globalBenchmarks";
import type { ComparableEntity } from "../comparisons/comparisonEntities";

export interface SeriesPoint { label: string; value: number }

// Shared display formatting so "€M" metrics render as our "€…m" convention.
export function formatMetric(value: number, unit: string) {
  if (unit === "€M") return `${value < 0 ? "-" : ""}€${Math.abs(value).toLocaleString()}m`;
  return `${value.toLocaleString()}${unit}`;
}

function scopedProjects(scope: DashboardScope, scopeId: string) {
  if (scope === "industry") return projectsForIndustry(scopeId as "solar" | "wind" | "infrastructure");
  if (scope === "region") return projectsForRegion(scopeId);
  if (scope === "project") { const p = findProject(scopeId); return p ? [p] : []; }
  return portfolioProjects; // health / firm-wide
}

function metricValueFor(metric: MetricKey, projects: ReturnType<typeof scopedProjects>) {
  const s = aggregateKPIs(projects);
  switch (metric) {
    case "revenue": return s.totalRevenueM;
    case "revenueGrowth": return s.yoyGrowthPct;
    case "ebitda": return s.totalEbitdaM;
    case "ebitdaMargin": return s.totalRevenueM > 0 ? Math.round((s.totalEbitdaM / s.totalRevenueM) * 1000) / 10 : 0;
    case "netIncome": return Math.round(projects.reduce((a, p) => a + p.financials.earnings.netIncomeM, 0) * 10) / 10;
    case "generation": return Math.round(projects.reduce((a, p) => a + (p.drivers.metrics[0]?.value ?? 0), 0));
    case "capacityUtilization": return s.capacityUtilizationPct;
    case "assetHealth": return s.avgAssetHealth;
    case "cashFlow": return s.cashFlowM;
    case "maintenanceCost": return Math.round(projects.reduce((a, p) => a + p.financials.costs.maintenanceM, 0) * 10) / 10;
    case "opex": return Math.round(projects.reduce((a, p) => a + p.financials.costs.opexM, 0) * 10) / 10;
    case "capex": return Math.round(projects.reduce((a, p) => a + p.financials.costs.capexM, 0) * 10) / 10;
    case "debtService": return Math.round(projects.reduce((a, p) => a + p.financials.costs.debtServiceM, 0) * 10) / 10;
    case "panelEfficiency": return projects.length ? Math.round((projects.reduce((a, p) => a + (p.drivers.metrics.find((m) => m.label.includes("Efficiency"))?.value ?? 0), 0) / projects.length) * 10) / 10 : 0;
    case "availability": return projects.length ? Math.round((projects.reduce((a, p) => a + (p.drivers.metrics.find((m) => m.label.includes("Availability"))?.value ?? 0), 0) / projects.length) * 10) / 10 : 0;
    case "debtOutstanding": return Math.round(projects.reduce((a, p) => a + p.kpis.debtOutstandingM, 0) * 10) / 10;
    case "openIssues": return projects.reduce((a, p) => a + p.assetHealth.openIssues, 0);
    default: return 0;
  }
}

export const metricLabels: Record<MetricKey, string> = {
  revenue: "Revenue", revenueGrowth: "Revenue Growth", ebitda: "EBITDA", ebitdaMargin: "EBITDA Margin",
  netIncome: "Net Income", generation: "Generation", capacityUtilization: "Capacity Utilization",
  assetHealth: "Asset Health", cashFlow: "Cash Flow", maintenanceCost: "Maintenance Cost",
  opex: "OPEX", capex: "CAPEX", debtService: "Debt Service", panelEfficiency: "Panel Efficiency", availability: "Availability",
  debtOutstanding: "Debt Outstanding", openIssues: "Open Issues",
};

export const metricUnits: Record<MetricKey, string> = {
  revenue: "€M", revenueGrowth: "%", ebitda: "€M", ebitdaMargin: "%", netIncome: "€M", generation: "GWh",
  capacityUtilization: "%", assetHealth: "", cashFlow: "€M", maintenanceCost: "€M", opex: "€M", capex: "€M",
  debtService: "€M", panelEfficiency: "%", availability: "%",
  debtOutstanding: "€M", openIssues: "",
};

export type MetricCategory = "businessDrivers" | "topline" | "earnings" | "costBreakdown" | "operationalKPIs" | "financialKPIs" | "custom";

export const metricCategoryLabels: Record<MetricCategory, string> = {
  businessDrivers: "Business Drivers", topline: "Topline", earnings: "Earnings", costBreakdown: "Cost Breakdown",
  operationalKPIs: "Operational KPIs", financialKPIs: "Financial KPIs", custom: "Custom Metrics",
};

export const metricCategories: Record<MetricKey, MetricCategory> = {
  revenue: "topline", revenueGrowth: "topline",
  ebitda: "earnings", ebitdaMargin: "earnings", netIncome: "earnings",
  generation: "operationalKPIs", capacityUtilization: "operationalKPIs", panelEfficiency: "operationalKPIs", availability: "operationalKPIs",
  assetHealth: "financialKPIs", cashFlow: "financialKPIs", debtService: "financialKPIs",
  maintenanceCost: "costBreakdown", opex: "costBreakdown", capex: "costBreakdown",
  debtOutstanding: "custom", openIssues: "custom",
};

const comparisonFactor: Record<ComparisonKey, number> = {
  none: 1, prevMonth: 0.96, prevQuarter: 0.9, budget: 1.05, forecast: 1.02, target: 1.1, lastYear: 0.93,
};

export function getMetricValue(metric: MetricKey, scope: DashboardScope, scopeId: string) {
  return metricValueFor(metric, scopedProjects(scope, scopeId));
}

export function getComparisonValue(metric: MetricKey, scope: DashboardScope, scopeId: string, comparison: ComparisonKey) {
  if (comparison === "none") return null;
  return Math.round(getMetricValue(metric, scope, scopeId) * comparisonFactor[comparison] * 10) / 10;
}

// Deterministic pseudo-random trend seeded by a string key, anchored so the
// final point lands exactly on `target` — every metric gets a plausible,
// non-flat month-over-month shape without being literally random per render.
function seededTrend(seedKey: string, points: number, target: number, volatility: number): number[] {
  let seed = 0;
  for (let i = 0; i < seedKey.length; i++) seed = (seed * 31 + seedKey.charCodeAt(i)) >>> 0;
  function rand() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  }
  const raw: number[] = [];
  let v = 1;
  for (let i = 0; i < points; i++) {
    v += (rand() - 0.5) * volatility * 2;
    raw.push(Math.max(v, 0.1));
  }
  const last = raw[raw.length - 1] || 1;
  return raw.map((r) => Math.round(target * (r / last) * 100) / 100);
}

const lowVolatilityMetrics = new Set<MetricKey>(["ebitdaMargin", "assetHealth", "panelEfficiency", "availability", "capacityUtilization"]);

function projectMonthlySeries(metric: MetricKey, project: PortfolioProject): SeriesPoint[] {
  const months = project.financials.topline.byMonth;
  if (metric === "revenue") return months.map((m) => ({ label: m.month, value: m.revenueM }));
  if (metric === "ebitda") {
    return months.map((m) => ({ label: m.month, value: Math.round(m.revenueM * (project.financials.earnings.marginPct / 100) * 10) / 10 }));
  }
  const target = metricValueFor(metric, [project]);
  const volatility = lowVolatilityMetrics.has(metric) ? 0.03 : 0.09;
  const values = seededTrend(`${project.id}:${metric}`, months.length, target, volatility);
  return months.map((m, i) => ({ label: m.month, value: values[i] }));
}

export function getMetricSeries(metric: MetricKey, scope: DashboardScope, scopeId: string, _timeRange: TimeRange): SeriesPoint[] {
  const projects = scopedProjects(scope, scopeId);
  if (scope === "project" && projects[0]) {
    return projectMonthlySeries(metric, projects[0]);
  }
  // group by region within scope for bar/pie/table/heatmap widgets
  const regionIds = [...new Set(projects.map((p) => p.regionId))];
  return regionIds.map((rid) => {
    const label = findRegion(rid)?.name ?? rid;
    const value = metricValueFor(metric, projects.filter((p) => p.regionId === rid));
    return { label, value };
  });
}

export function getTableRows(scope: DashboardScope, scopeId: string, metric: MetricKey) {
  return scopedProjects(scope, scopeId).map((p) => ({
    name: p.name,
    metricValue: metricValueFor(metric, [p]),
    health: p.assetHealth.score,
    status: p.status,
  }));
}

export function getHeatmapData(scope: DashboardScope, scopeId: string, metric: MetricKey) {
  const projects = scopedProjects(scope, scopeId);
  return projects.map((p) => ({ row: p.name, col: metricLabels[metric], value: metricValueFor(metric, [p]) }));
}

// ── Comparison entity resolution ────────────────────────────
// Parallel to scopedProjects/DashboardScope above, but for the comparisons
// feature: a ComparableEntity can be a single project, a region, an
// industry (total or per-project average), or the whole portfolio —
// shapes DashboardScope can't express. Delegates to the same metricValueFor
// switch so every MetricKey computation stays defined in one place.

const perProjectAdditiveMetrics: MetricKey[] = [
  "revenue", "ebitda", "netIncome", "generation", "cashFlow", "maintenanceCost", "opex", "capex", "debtService", "debtOutstanding", "openIssues",
];

const averagedEntityKinds: ComparableEntity["kind"][] = ["industryAverage", "regionAverage", "portfolioAverage"];

export function resolveEntityProjects(entity: ComparableEntity): PortfolioProject[] {
  switch (entity.kind) {
    case "project": { const p = findProject(entity.refId); return p ? [p] : []; }
    case "region": return projectsForRegion(entity.refId);
    case "regionAverage": return projectsForRegion(entity.refId);
    case "industry": return projectsForIndustry(entity.refId as IndustryKey);
    case "industryAverage": return projectsForIndustry(entity.refId as IndustryKey);
    case "portfolioAverage": return portfolioProjects;
    case "globalPortfolio": return portfolioProjects;
    case "customGroup": return entity.refId.split(",").map(findProject).filter((p): p is PortfolioProject => !!p);
    case "globalBenchmark": return [];
  }
}

export function getComparisonEntityMetricValue(metric: MetricKey, entity: ComparableEntity): number {
  if (entity.kind === "globalBenchmark") {
    return getGlobalBenchmarkValue(metric, entity.industryKey ? findIndustry(entity.industryKey)?.driverKind : undefined) ?? 0;
  }
  const projects = resolveEntityProjects(entity);
  const raw = metricValueFor(metric, projects);
  if (averagedEntityKinds.includes(entity.kind) && projects.length > 0 && perProjectAdditiveMetrics.includes(metric)) {
    return Math.round((raw / projects.length) * 10) / 10;
  }
  return raw;
}

export function getEntityMetricSeries(metric: MetricKey, entity: ComparableEntity, _timeRange: TimeRange): SeriesPoint[] {
  if (entity.kind === "globalBenchmark") return [];
  const projects = resolveEntityProjects(entity);
  if (projects.length === 0) return [];
  if (entity.kind === "project") return projectMonthlySeries(metric, projects[0]);

  // Non-project entities have no per-entity monthly series in the data model —
  // aggregate each constituent project's monthly series index-for-index (all
  // seed projects share the same 6 month labels). Additive metrics sum;
  // ratio/score metrics average; averaged kinds divide additive by count.
  const months = projects[0].financials.topline.byMonth.map((m) => m.month);
  const additive = perProjectAdditiveMetrics.includes(metric);
  const divisor = averagedEntityKinds.includes(entity.kind) && additive ? projects.length : 1;
  return months.map((month, i) => {
    const summed = projects.reduce((a, p) => a + (projectMonthlySeries(metric, p)[i]?.value ?? 0), 0);
    const value = additive ? summed / divisor : summed / projects.length;
    return { label: month, value: Math.round(value * 10) / 10 };
  });
}
