import {
  aggregateKPIs, findProject, findRegion, portfolioProjects, projectsForIndustry, projectsForRegion,
  type ComparisonKey, type DashboardScope, type MetricKey, type TimeRange,
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

export function getMetricSeries(metric: MetricKey, scope: DashboardScope, scopeId: string, _timeRange: TimeRange): SeriesPoint[] {
  const projects = scopedProjects(scope, scopeId);
  if (scope === "project" && projects[0]) {
    return projects[0].financials.topline.byMonth.map((m) => ({ label: m.month, value: metricKeyFromMonth(metric, m.revenueM, projects[0]) }));
  }
  // group by region within scope for bar/pie/table/heatmap widgets
  const regionIds = [...new Set(projects.map((p) => p.regionId))];
  return regionIds.map((rid) => {
    const label = findRegion(rid)?.name ?? rid;
    const value = metricValueFor(metric, projects.filter((p) => p.regionId === rid));
    return { label, value };
  });
}

function metricKeyFromMonth(metric: MetricKey, revenueM: number, project: ReturnType<typeof scopedProjects>[number]) {
  if (metric === "revenue") return revenueM;
  if (metric === "ebitda") return Math.round(revenueM * (project.financials.earnings.marginPct / 100) * 10) / 10;
  return revenueM;
}

export function getTableRows(scope: DashboardScope, scopeId: string) {
  return scopedProjects(scope, scopeId).map((p) => ({
    name: p.name, revenue: p.financials.topline.revenueM, ebitda: p.financials.earnings.ebitdaM,
    health: p.assetHealth.score, status: p.status,
  }));
}

export function getHeatmapData(scope: DashboardScope, scopeId: string) {
  const projects = scopedProjects(scope, scopeId);
  return projects.map((p) => ({ row: p.name, col: "Asset Health", value: p.assetHealth.score }));
}
