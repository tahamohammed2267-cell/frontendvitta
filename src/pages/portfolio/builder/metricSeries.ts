import {
  aggregateKPIs, findProject, findRegion, portfolioProjects, projectsForIndustry, projectsForRegion,
  type ComparisonKey, type DashboardScope, type MetricKey, type PortfolioProject, type TimeRange,
} from "../../../lib/portfolioData";

export interface SeriesPoint { label: string; value: number }

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
    default: return 0;
  }
}

export const metricLabels: Record<MetricKey, string> = {
  revenue: "Revenue", revenueGrowth: "Revenue Growth", ebitda: "EBITDA", ebitdaMargin: "EBITDA Margin",
  netIncome: "Net Income", generation: "Generation", capacityUtilization: "Capacity Utilization",
  assetHealth: "Asset Health", cashFlow: "Cash Flow", maintenanceCost: "Maintenance Cost",
  opex: "OPEX", capex: "CAPEX", debtService: "Debt Service", panelEfficiency: "Panel Efficiency", availability: "Availability",
};

export const metricUnits: Record<MetricKey, string> = {
  revenue: "€M", revenueGrowth: "%", ebitda: "€M", ebitdaMargin: "%", netIncome: "€M", generation: "GWh",
  capacityUtilization: "%", assetHealth: "", cashFlow: "€M", maintenanceCost: "€M", opex: "€M", capex: "€M",
  debtService: "€M", panelEfficiency: "%", availability: "%",
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
