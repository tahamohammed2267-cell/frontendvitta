// ─────────────────────────────────────────────────────────────
// Vitta Portfolio Monitoring — mock data.
// Industry → Region → Company → Project hierarchy, aggregated
// KPIs, dynamic business drivers, MIS uploads, dashboards,
// health flags and AI insights. Everything here simulates what
// the backend API would return.
// ─────────────────────────────────────────────────────────────

import type { Severity } from "./mockData";
export type { Severity };

// ── Hierarchy ───────────────────────────────────────────────

export type IndustryKey = "solar" | "wind" | "infrastructure";

export type BusinessDriverKind = "solar" | "wind" | "water" | "transportation" | "healthcare" | "manufacturing" | "realEstate";

export interface Industry {
  key: IndustryKey;
  name: string;
  sector: string;
  driverKind: BusinessDriverKind;
  regionIds: string[];
}

export interface Region {
  id: string;
  industryKey: IndustryKey;
  name: string;
  countryCode: string;
  companyIds: string[];
}

export interface Company {
  id: string;
  regionId: string;
  industryKey: IndustryKey;
  name: string;
  projectIds: string[];
}

export type ProjectStatus = "Operational" | "Ramp-up" | "Under Construction" | "Watch" | "At Risk";

export interface DriverMetric {
  label: string;
  value: number;
  unit: string;
  target?: number;
  trend: number[];
}

export interface BusinessDriverValues {
  kind: BusinessDriverKind;
  metrics: DriverMetric[];
}

export interface FinancialBreakdown {
  topline: {
    revenueM: number;
    revenueGrowthPct: number;
    byMonth: { month: string; revenueM: number }[];
    byGeography: { region: string; revenueM: number }[];
  };
  earnings: { ebitdaM: number; ebitM: number; netIncomeM: number; marginPct: number };
  costs: { opexM: number; capexM: number; maintenanceM: number; payrollM: number; fuelM: number; insuranceM: number; adminM: number; debtServiceM: number };
}

export interface AssetHealth {
  score: number; // 0-100
  equipment: { name: string; health: number; nextMaintenance: string }[];
  openIssues: number;
  alerts: { id: string; severity: Severity; text: string; raisedAt: string }[];
}

export interface ProjectKPIs {
  portfolioValueM: number;
  capacityUtilizationPct: number;
  cashFlowM: number;
  yoyGrowthPct: number;
  debtOutstandingM: number;
}

export type MISFormat = "XLSX" | "CSV" | "PDF";
export type MISDocKind = "MIS" | "Financial Statement" | "Contract" | "EPC Report";

export interface ProjectDocument {
  id: string;
  name: string;
  kind: MISDocKind;
  format: MISFormat;
  uploadedAt: string;
  uploadedBy: string;
}

export type ChangeCategory = "Revenue" | "Expenses" | "Generation" | "Utilization" | "KPI";
export type ChangeDecision = "pending" | "accepted" | "rejected";

export interface DetectedChange {
  id: string;
  field: string;
  category: ChangeCategory;
  previousValue: string;
  newValue: string;
  confidence: number;
  decision: ChangeDecision;
}

export type MISVersionStatus = "pending-review" | "partially-applied" | "applied";

export interface MISVersion {
  id: string;
  version: number;
  uploadedAt: string;
  uploadedBy: string;
  sourceDoc: string;
  detectedChanges: DetectedChange[];
  status: MISVersionStatus;
}

export interface AuditEntry {
  id: string;
  at: string;
  user: string;
  action: string;
  detail: string;
}

export type HealthFlagRule =
  | "revenueDown10"
  | "ebitdaMarginBelowTarget"
  | "generationBelowForecast"
  | "highMaintenanceCost"
  | "misOverdue"
  | "missingData"
  | "covenantBreach"
  | "lowAssetHealth";

export interface HealthFlag {
  rule: HealthFlagRule;
  label: string;
  severity: Severity;
  detail: string;
}

export interface PortfolioProject {
  id: string;
  companyId: string;
  regionId: string;
  industryKey: IndustryKey;
  name: string;
  country: string;
  capacityMW?: number;
  status: ProjectStatus;
  linkedDealId?: string;
  kpis: ProjectKPIs;
  drivers: BusinessDriverValues;
  financials: FinancialBreakdown;
  assetHealth: AssetHealth;
  documents: ProjectDocument[];
  misVersions: MISVersion[];
  auditTrail: AuditEntry[];
  healthFlags: HealthFlag[];
}

// ── Dashboard builder ───────────────────────────────────────

export type WidgetType = "kpi" | "bar" | "pie" | "line" | "area" | "table" | "heatmap" | "geo" | "waterfall" | "gauge" | "scatter";

export type MetricKey =
  | "revenue" | "revenueGrowth" | "ebitda" | "ebitdaMargin" | "netIncome"
  | "generation" | "capacityUtilization" | "assetHealth" | "cashFlow"
  | "maintenanceCost" | "opex" | "capex" | "debtService"
  | "panelEfficiency" | "availability"
  | "debtOutstanding" | "openIssues";

export type TimeRange = "MTD" | "QTD" | "YTD" | "Custom";
export type ComparisonKey = "none" | "prevMonth" | "prevQuarter" | "budget" | "forecast" | "target" | "lastYear";

export interface WidgetLayout { x: number; y: number; w: number; h: number }

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  metric: MetricKey;
  timeRange: TimeRange;
  comparison: ComparisonKey;
  layout: WidgetLayout;
}

export type DashboardScope = "industry" | "region" | "project" | "health";
export type DashboardPreset = "Executive" | "Operations" | "Finance" | "Investment";

export interface DashboardDef {
  id: string;
  name: string;
  scope: DashboardScope;
  scopeId: string;
  preset?: DashboardPreset;
  widgets: WidgetConfig[];
  owner: string;
  sharedWith: string[];
  updatedAt: string;
}

// ── Insights ────────────────────────────────────────────────

export interface Insight {
  id: string;
  scope: string; // industry key, region id, or project id — "" for firm-wide
  text: string;
  tone: "positive" | "negative" | "neutral";
  metric: string;
  generatedAt: string;
}

export interface PortfolioChatMessage {
  role: "user" | "ai";
  text: string;
  citations?: { n: number; ref: string }[];
}

// ── Industries ──────────────────────────────────────────────

export const industries: Industry[] = [
  { key: "solar", name: "Renewables — Solar", sector: "Renewables", driverKind: "solar", regionIds: ["solar-india", "solar-europe", "solar-mena"] },
  { key: "wind", name: "Renewables — Wind", sector: "Renewables", driverKind: "wind", regionIds: ["wind-europe", "wind-india"] },
  { key: "infrastructure", name: "Infrastructure", sector: "Infrastructure", driverKind: "realEstate", regionIds: ["infra-europe", "infra-mena"] },
];

// driver schema lookup — spec's full 6-industry list, only some populated with real projects
export const driverSchemaLabels: Record<BusinessDriverKind, string[]> = {
  solar: ["Power Generated", "Plant Load Factor", "Irradiance", "Panel Efficiency", "Availability"],
  wind: ["Wind Speed", "Turbine Efficiency", "Capacity Factor", "Turbine Availability"],
  water: ["Water Output", "Reservoir Level", "Pump Efficiency", "Leakage Rate"],
  transportation: ["Passengers", "Utilization", "Trips", "On-time %"],
  healthcare: ["Bed Occupancy", "Patients", "Revenue per Bed", "Equipment Utilization"],
  manufacturing: ["Units Produced", "OEE", "Downtime", "Scrap %"],
  realEstate: ["Occupancy", "Footfall", "Revenue per Sq Ft", "Lease Renewal Rate"],
};

// ── Regions ─────────────────────────────────────────────────

export const regions: Region[] = [
  { id: "solar-india", industryKey: "solar", name: "India", countryCode: "IN", companyIds: ["abc-solar", "sungrid-india"] },
  { id: "solar-europe", industryKey: "solar", name: "Europe", countryCode: "ES", companyIds: ["helios-sponsor", "solara-holdings"] },
  { id: "solar-mena", industryKey: "solar", name: "Middle East", countryCode: "AE", companyIds: ["desert-sun-energy"] },

  { id: "wind-europe", industryKey: "wind", name: "Europe", countryCode: "DE", companyIds: ["boreas-sponsor", "nordwind-holdings"] },
  { id: "wind-india", industryKey: "wind", name: "India", countryCode: "IN", companyIds: ["windforce-india"] },

  { id: "infra-europe", industryKey: "infrastructure", name: "Europe", countryCode: "GB", companyIds: ["meridian-retail-ltd", "atlas-living-ltd"] },
  { id: "infra-mena", industryKey: "infrastructure", name: "Middle East", countryCode: "AE", companyIds: ["koper-logistics-holdings"] },
];

// ── Companies ───────────────────────────────────────────────

export const companies: Company[] = [
  { id: "abc-solar", regionId: "solar-india", industryKey: "solar", name: "ABC Solar Pvt Ltd", projectIds: ["rajasthan-250", "gujarat-140"] },
  { id: "sungrid-india", regionId: "solar-india", industryKey: "solar", name: "SunGrid India Ltd", projectIds: ["karnataka-90"] },
  { id: "helios-sponsor", regionId: "solar-europe", industryKey: "solar", name: "Helios Energy Sponsor SL", projectIds: ["helios-project"] },
  { id: "solara-holdings", regionId: "solar-europe", industryKey: "solar", name: "Solara Holdings SA", projectIds: ["solara-one"] },
  { id: "desert-sun-energy", regionId: "solar-mena", industryKey: "solar", name: "Desert Sun Energy LLC", projectIds: ["abu-dhabi-200"] },

  { id: "boreas-sponsor", regionId: "wind-europe", industryKey: "wind", name: "Boreas Wind Sponsor GmbH", projectIds: ["boreas-project"] },
  { id: "nordwind-holdings", regionId: "wind-europe", industryKey: "wind", name: "Nordwind Holdings ApS", projectIds: ["nordwind-park-ii", "zephyr-project"] },
  { id: "windforce-india", regionId: "wind-india", industryKey: "wind", name: "WindForce India Pvt Ltd", projectIds: ["tamil-nadu-120"] },

  { id: "meridian-retail-ltd", regionId: "infra-europe", industryKey: "infrastructure", name: "Meridian Retail Park Ltd", projectIds: ["meridian-project"] },
  { id: "atlas-living-ltd", regionId: "infra-europe", industryKey: "infrastructure", name: "Atlas Student Living Ltd", projectIds: ["atlas-project"] },
  { id: "koper-logistics-holdings", regionId: "infra-mena", industryKey: "infrastructure", name: "Koper Logistics Holdings", projectIds: ["koper-hub", "dubai-logistics"] },
];

// ── Helpers to build repeated shapes ────────────────────────

function trend(base: number, n = 6, vol = 0.05): number[] {
  const out: number[] = [];
  let v = base;
  for (let i = 0; i < n; i++) {
    v = v * (1 + (Math.sin(i * 1.7 + base) * vol));
    out.push(Math.round(v * 100) / 100);
  }
  return out;
}

function months(base: number, growth = 0.02): { month: string; revenueM: number }[] {
  const names = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  return names.map((m, i) => ({ month: m, revenueM: Math.round(base * (1 + growth * i) * 100) / 100 }));
}

// ── Projects ────────────────────────────────────────────────

export const portfolioProjects: PortfolioProject[] = [
  // ── Solar / India ──
  {
    id: "rajasthan-250", companyId: "abc-solar", regionId: "solar-india", industryKey: "solar",
    name: "Rajasthan 250 MW Project", country: "India", capacityMW: 250, status: "Operational",
    kpis: { portfolioValueM: 210, capacityUtilizationPct: 91, cashFlowM: 14.2, yoyGrowthPct: 6.4, debtOutstandingM: 132 },
    drivers: { kind: "solar", metrics: [
      { label: "Power Generated", value: 412, unit: "GWh", target: 430, trend: trend(400, 6, 0.04) },
      { label: "Plant Load Factor", value: 22.4, unit: "%", target: 24, trend: trend(22, 6, 0.03) },
      { label: "Irradiance", value: 5.6, unit: "kWh/m²/day", trend: trend(5.6, 6, 0.02) },
      { label: "Panel Efficiency", value: 20.1, unit: "%", trend: trend(20.3, 6, 0.01) },
      { label: "Availability", value: 98.2, unit: "%", target: 99, trend: trend(98, 6, 0.005) },
    ] },
    financials: {
      topline: { revenueM: 28.4, revenueGrowthPct: 6.4, byMonth: months(4.6), byGeography: [{ region: "India", revenueM: 28.4 }] },
      earnings: { ebitdaM: 21.8, ebitM: 16.1, netIncomeM: 8.9, marginPct: 76.8 },
      costs: { opexM: 6.6, capexM: 2.1, maintenanceM: 2.4, payrollM: 1.1, fuelM: 0, insuranceM: 0.6, adminM: 0.8, debtServiceM: 9.4 },
    },
    assetHealth: { score: 88, equipment: [
      { name: "Inverter Block A", health: 92, nextMaintenance: "Aug 12" },
      { name: "Inverter Block B", health: 81, nextMaintenance: "Jul 28" },
      { name: "Tracking System", health: 90, nextMaintenance: "Sep 04" },
    ], openIssues: 2, alerts: [
      { id: "al1", severity: "medium", text: "Inverter Block B showing elevated thermal readings", raisedAt: "Jul 15" },
    ] },
    documents: [
      { id: "pd1", name: "Rajasthan_MIS_Jun2026.xlsx", kind: "MIS", format: "XLSX", uploadedAt: "Jul 05", uploadedBy: "R. Chen" },
      { id: "pd2", name: "Rajasthan_FinStatement_Q2.pdf", kind: "Financial Statement", format: "PDF", uploadedAt: "Jul 08", uploadedBy: "R. Chen" },
      { id: "pd3", name: "ABC_Solar_PPA.pdf", kind: "Contract", format: "PDF", uploadedAt: "Mar 02", uploadedBy: "J. Moreau" },
      { id: "pd4", name: "Rajasthan_EPC_CompletionReport.pdf", kind: "EPC Report", format: "PDF", uploadedAt: "Jan 20", uploadedBy: "S. Okafor" },
    ],
    misVersions: [
      { id: "mv1", version: 2, uploadedAt: "Jul 05, 09:12", uploadedBy: "R. Chen", sourceDoc: "Rajasthan_MIS_Jun2026.xlsx", status: "applied", detectedChanges: [
        { id: "dc1", field: "Revenue", category: "Revenue", previousValue: "₹150 Cr", newValue: "₹162 Cr", confidence: 0.94, decision: "accepted" },
        { id: "dc2", field: "Power Generated", category: "Generation", previousValue: "398 GWh", newValue: "412 GWh", confidence: 0.97, decision: "accepted" },
        { id: "dc3", field: "O&M Cost", category: "Expenses", previousValue: "₹18.2 Cr", newValue: "₹19.8 Cr", confidence: 0.81, decision: "accepted" },
      ] },
      { id: "mv0", version: 1, uploadedAt: "Jun 04, 10:03", uploadedBy: "R. Chen", sourceDoc: "Rajasthan_MIS_May2026.xlsx", status: "applied", detectedChanges: [] },
    ],
    auditTrail: [
      { id: "au1", at: "Jul 05, 09:20", user: "R. Chen", action: "MIS applied", detail: "v2 — 3 of 3 detected changes accepted" },
      { id: "au2", at: "Jun 04, 10:10", user: "R. Chen", action: "MIS applied", detail: "v1 — initial baseline load" },
    ],
    healthFlags: [],
  },
  {
    id: "gujarat-140", companyId: "abc-solar", regionId: "solar-india", industryKey: "solar",
    name: "Gujarat 140 MW Project", country: "India", capacityMW: 140, status: "Watch",
    kpis: { portfolioValueM: 118, capacityUtilizationPct: 79, cashFlowM: 4.1, yoyGrowthPct: -3.2, debtOutstandingM: 81 },
    drivers: { kind: "solar", metrics: [
      { label: "Power Generated", value: 198, unit: "GWh", target: 232, trend: trend(210, 6, 0.05) },
      { label: "Plant Load Factor", value: 16.1, unit: "%", target: 19, trend: trend(17, 6, 0.04) },
      { label: "Irradiance", value: 5.3, unit: "kWh/m²/day", trend: trend(5.3, 6, 0.02) },
      { label: "Panel Efficiency", value: 18.6, unit: "%", trend: trend(19, 6, 0.02) },
      { label: "Availability", value: 94.1, unit: "%", target: 99, trend: trend(95, 6, 0.02) },
    ] },
    financials: {
      topline: { revenueM: 12.9, revenueGrowthPct: -3.2, byMonth: months(2.2, -0.01), byGeography: [{ region: "India", revenueM: 12.9 }] },
      earnings: { ebitdaM: 7.4, ebitM: 4.0, netIncomeM: 0.8, marginPct: 57.4 },
      costs: { opexM: 5.5, capexM: 1.2, maintenanceM: 3.1, payrollM: 0.7, fuelM: 0, insuranceM: 0.4, adminM: 0.5, debtServiceM: 5.9 },
    },
    assetHealth: { score: 61, equipment: [
      { name: "Inverter Block A", health: 58, nextMaintenance: "Jul 22" },
      { name: "Tracking System", health: 64, nextMaintenance: "Jul 30" },
    ], openIssues: 5, alerts: [
      { id: "al2", severity: "high", text: "Recurring inverter faults driving generation below forecast", raisedAt: "Jul 10" },
      { id: "al3", severity: "medium", text: "Tracking system firmware update overdue", raisedAt: "Jul 02" },
    ] },
    documents: [
      { id: "pd5", name: "Gujarat_MIS_Jun2026.xlsx", kind: "MIS", format: "XLSX", uploadedAt: "Jun 28", uploadedBy: "R. Chen" },
      { id: "pd6", name: "Gujarat_FinStatement_Q2.pdf", kind: "Financial Statement", format: "PDF", uploadedAt: "Jul 02", uploadedBy: "R. Chen" },
    ],
    misVersions: [
      { id: "mv2", version: 3, uploadedAt: "Jun 28, 14:44", uploadedBy: "R. Chen", sourceDoc: "Gujarat_MIS_Jun2026.xlsx", status: "partially-applied", detectedChanges: [
        { id: "dc4", field: "Revenue", category: "Revenue", previousValue: "₹98 Cr", newValue: "₹94 Cr", confidence: 0.9, decision: "accepted" },
        { id: "dc5", field: "Maintenance Cost", category: "Expenses", previousValue: "₹22.1 Cr", newValue: "₹26.8 Cr", confidence: 0.72, decision: "pending" },
      ] },
    ],
    auditTrail: [
      { id: "au3", at: "Jun 28, 14:50", user: "R. Chen", action: "MIS partially applied", detail: "v3 — 1 of 2 detected changes accepted, 1 pending review" },
    ],
    healthFlags: [
      { rule: "revenueDown10", label: "Revenue down >10%", severity: "high", detail: "Revenue down 3.2% YoY and trending lower — approaching the 10% threshold." },
      { rule: "generationBelowForecast", label: "Generation below forecast", severity: "high", detail: "198 GWh vs 232 GWh forecast (-14.7%) — recurring inverter faults." },
      { rule: "highMaintenanceCost", label: "High maintenance costs", severity: "medium", detail: "Maintenance cost 22% above portfolio average due to repeated inverter failures." },
      { rule: "lowAssetHealth", label: "Low asset health score", severity: "medium", detail: "Asset health score of 61 — below the 70 threshold." },
    ],
  },
  {
    id: "karnataka-90", companyId: "sungrid-india", regionId: "solar-india", industryKey: "solar",
    name: "Karnataka 90 MW Project", country: "India", capacityMW: 90, status: "Operational",
    kpis: { portfolioValueM: 76, capacityUtilizationPct: 88, cashFlowM: 5.6, yoyGrowthPct: 9.1, debtOutstandingM: 44 },
    drivers: { kind: "solar", metrics: [
      { label: "Power Generated", value: 152, unit: "GWh", target: 150, trend: trend(148, 6, 0.03) },
      { label: "Plant Load Factor", value: 21.8, unit: "%", target: 21, trend: trend(21.5, 6, 0.02) },
      { label: "Irradiance", value: 5.4, unit: "kWh/m²/day", trend: trend(5.4, 6, 0.02) },
      { label: "Panel Efficiency", value: 20.4, unit: "%", trend: trend(20.4, 6, 0.01) },
      { label: "Availability", value: 99.1, unit: "%", target: 99, trend: trend(99, 6, 0.003) },
    ] },
    financials: {
      topline: { revenueM: 10.8, revenueGrowthPct: 9.1, byMonth: months(1.8, 0.03), byGeography: [{ region: "India", revenueM: 10.8 }] },
      earnings: { ebitdaM: 8.6, ebitM: 6.4, netIncomeM: 3.7, marginPct: 79.6 },
      costs: { opexM: 2.2, capexM: 0.6, maintenanceM: 0.9, payrollM: 0.4, fuelM: 0, insuranceM: 0.2, adminM: 0.3, debtServiceM: 3.1 },
    },
    assetHealth: { score: 94, equipment: [{ name: "Inverter Block A", health: 95, nextMaintenance: "Oct 10" }], openIssues: 0, alerts: [] },
    documents: [{ id: "pd7", name: "Karnataka_MIS_Jun2026.xlsx", kind: "MIS", format: "XLSX", uploadedAt: "Jul 03", uploadedBy: "S. Okafor" }],
    misVersions: [{ id: "mv3", version: 1, uploadedAt: "Jul 03, 08:40", uploadedBy: "S. Okafor", sourceDoc: "Karnataka_MIS_Jun2026.xlsx", status: "applied", detectedChanges: [] }],
    auditTrail: [{ id: "au4", at: "Jul 03, 08:45", user: "S. Okafor", action: "MIS applied", detail: "v1 — initial baseline load" }],
    healthFlags: [],
  },

  // ── Solar / Europe ──
  {
    id: "helios-project", companyId: "helios-sponsor", regionId: "solar-europe", industryKey: "solar",
    name: "Helios 120 MWp Project", country: "Spain", capacityMW: 120, status: "Ramp-up", linkedDealId: "helios",
    kpis: { portfolioValueM: 96, capacityUtilizationPct: 68, cashFlowM: 3.2, yoyGrowthPct: 0, debtOutstandingM: 67.5 },
    drivers: { kind: "solar", metrics: [
      { label: "Power Generated", value: 58, unit: "GWh", target: 62, trend: trend(56, 6, 0.06) },
      { label: "Plant Load Factor", value: 24.1, unit: "%", target: 24.8, trend: trend(24, 6, 0.02) },
      { label: "Irradiance", value: 5.9, unit: "kWh/m²/day", trend: trend(5.9, 6, 0.02) },
      { label: "Panel Efficiency", value: 21.2, unit: "%", trend: trend(21.2, 6, 0.01) },
      { label: "Availability", value: 96.4, unit: "%", target: 99, trend: trend(96, 6, 0.01) },
    ] },
    financials: {
      topline: { revenueM: 8.2, revenueGrowthPct: 4.1, byMonth: months(1.35, 0.02), byGeography: [{ region: "Spain", revenueM: 8.2 }] },
      earnings: { ebitdaM: 6.1, ebitM: 4.0, netIncomeM: 1.1, marginPct: 74.4 },
      costs: { opexM: 2.1, capexM: 0.4, maintenanceM: 0.9, payrollM: 0.3, fuelM: 0, insuranceM: 0.3, adminM: 0.3, debtServiceM: 4.8 },
    },
    assetHealth: { score: 82, equipment: [{ name: "Substation", health: 85, nextMaintenance: "Aug 20" }], openIssues: 1, alerts: [
      { id: "al4", severity: "low", text: "Commissioning punch-list item outstanding on Block 3", raisedAt: "Jul 12" },
    ] },
    documents: [
      { id: "pd8", name: "Helios_MIS_Jun2026.xlsx", kind: "MIS", format: "XLSX", uploadedAt: "Jul 10", uploadedBy: "J. Moreau" },
      { id: "pd9", name: "Helios_PPA_Executed_vFinal.pdf", kind: "Contract", format: "PDF", uploadedAt: "Jul 12", uploadedBy: "J. Moreau" },
    ],
    misVersions: [{ id: "mv4", version: 1, uploadedAt: "Jul 10, 11:02", uploadedBy: "J. Moreau", sourceDoc: "Helios_MIS_Jun2026.xlsx", status: "applied", detectedChanges: [] }],
    auditTrail: [{ id: "au5", at: "Jul 10, 11:10", user: "J. Moreau", action: "MIS applied", detail: "v1 — first post-COD reporting period" }],
    healthFlags: [],
  },
  {
    id: "solara-one", companyId: "solara-holdings", regionId: "solar-europe", industryKey: "solar",
    name: "Solara One", country: "Spain", capacityMW: 145, status: "Operational",
    kpis: { portfolioValueM: 74, capacityUtilizationPct: 93, cashFlowM: 7.8, yoyGrowthPct: 5.6, debtOutstandingM: 41 },
    drivers: { kind: "solar", metrics: [
      { label: "Power Generated", value: 71, unit: "GWh", target: 70, trend: trend(70, 6, 0.02) },
      { label: "Plant Load Factor", value: 25.2, unit: "%", target: 24.5, trend: trend(25, 6, 0.01) },
      { label: "Irradiance", value: 5.9, unit: "kWh/m²/day", trend: trend(5.9, 6, 0.02) },
      { label: "Panel Efficiency", value: 21.8, unit: "%", trend: trend(21.8, 6, 0.01) },
      { label: "Availability", value: 99.3, unit: "%", target: 99, trend: trend(99.2, 6, 0.002) },
    ] },
    financials: {
      topline: { revenueM: 11.4, revenueGrowthPct: 5.6, byMonth: months(1.9, 0.02), byGeography: [{ region: "Spain", revenueM: 11.4 }] },
      earnings: { ebitdaM: 8.9, ebitM: 6.6, netIncomeM: 3.8, marginPct: 78.1 },
      costs: { opexM: 2.5, capexM: 0.5, maintenanceM: 1.1, payrollM: 0.4, fuelM: 0, insuranceM: 0.3, adminM: 0.3, debtServiceM: 3.6 },
    },
    assetHealth: { score: 91, equipment: [{ name: "Inverter Block A", health: 93, nextMaintenance: "Sep 15" }], openIssues: 0, alerts: [] },
    documents: [{ id: "pd10", name: "Solara_MIS_Jun2026.xlsx", kind: "MIS", format: "XLSX", uploadedAt: "Jul 06", uploadedBy: "J. Moreau" }],
    misVersions: [{ id: "mv5", version: 4, uploadedAt: "Jul 06, 09:30", uploadedBy: "J. Moreau", sourceDoc: "Solara_MIS_Jun2026.xlsx", status: "applied", detectedChanges: [
      { id: "dc6", field: "Revenue", category: "Revenue", previousValue: "€10.8M", newValue: "€11.4M", confidence: 0.96, decision: "accepted" },
    ] }],
    auditTrail: [{ id: "au6", at: "Jul 06, 09:35", user: "J. Moreau", action: "MIS applied", detail: "v4 — 1 of 1 detected changes accepted" }],
    healthFlags: [],
  },

  // ── Solar / MENA ──
  {
    id: "abu-dhabi-200", companyId: "desert-sun-energy", regionId: "solar-mena", industryKey: "solar",
    name: "Abu Dhabi 200 MW Project", country: "UAE", capacityMW: 200, status: "Operational",
    kpis: { portfolioValueM: 165, capacityUtilizationPct: 96, cashFlowM: 12.4, yoyGrowthPct: 7.8, debtOutstandingM: 98 },
    drivers: { kind: "solar", metrics: [
      { label: "Power Generated", value: 402, unit: "GWh", target: 390, trend: trend(395, 6, 0.02) },
      { label: "Plant Load Factor", value: 26.5, unit: "%", target: 25.5, trend: trend(26, 6, 0.01) },
      { label: "Irradiance", value: 6.4, unit: "kWh/m²/day", trend: trend(6.4, 6, 0.01) },
      { label: "Panel Efficiency", value: 21.6, unit: "%", trend: trend(21.6, 6, 0.01) },
      { label: "Availability", value: 99.5, unit: "%", target: 99, trend: trend(99.4, 6, 0.001) },
    ] },
    financials: {
      topline: { revenueM: 24.1, revenueGrowthPct: 7.8, byMonth: months(4.0, 0.03), byGeography: [{ region: "UAE", revenueM: 24.1 }] },
      earnings: { ebitdaM: 19.9, ebitM: 15.2, netIncomeM: 9.1, marginPct: 82.6 },
      costs: { opexM: 4.2, capexM: 1.0, maintenanceM: 1.6, payrollM: 0.8, fuelM: 0, insuranceM: 0.4, adminM: 0.5, debtServiceM: 6.9 },
    },
    assetHealth: { score: 96, equipment: [{ name: "Inverter Block A", health: 97, nextMaintenance: "Nov 02" }], openIssues: 0, alerts: [] },
    documents: [{ id: "pd11", name: "AbuDhabi_MIS_Jun2026.xlsx", kind: "MIS", format: "XLSX", uploadedAt: "Jul 04", uploadedBy: "A. Lindqvist" }],
    misVersions: [{ id: "mv6", version: 2, uploadedAt: "Jul 04, 07:55", uploadedBy: "A. Lindqvist", sourceDoc: "AbuDhabi_MIS_Jun2026.xlsx", status: "applied", detectedChanges: [] }],
    auditTrail: [{ id: "au7", at: "Jul 04, 08:00", user: "A. Lindqvist", action: "MIS applied", detail: "v2 — no material changes detected" }],
    healthFlags: [],
  },

  // ── Wind / Europe ──
  {
    id: "boreas-project", companyId: "boreas-sponsor", regionId: "wind-europe", industryKey: "wind",
    name: "Boreas 210 MW Project", country: "Germany", capacityMW: 210, status: "Ramp-up", linkedDealId: "boreas",
    kpis: { portfolioValueM: 284, capacityUtilizationPct: 71, cashFlowM: 9.6, yoyGrowthPct: 2.1, debtOutstandingM: 190 },
    drivers: { kind: "wind", metrics: [
      { label: "Wind Speed", value: 7.8, unit: "m/s", target: 8.2, trend: trend(7.9, 6, 0.05) },
      { label: "Turbine Efficiency", value: 88.4, unit: "%", target: 90, trend: trend(88, 6, 0.02) },
      { label: "Capacity Factor", value: 34.2, unit: "%", target: 36, trend: trend(34, 6, 0.03) },
      { label: "Turbine Availability", value: 96.8, unit: "%", target: 98, trend: trend(97, 6, 0.01) },
    ] },
    financials: {
      topline: { revenueM: 19.6, revenueGrowthPct: 2.1, byMonth: months(3.2, 0.01), byGeography: [{ region: "Germany", revenueM: 19.6 }] },
      earnings: { ebitdaM: 15.1, ebitM: 10.8, netIncomeM: 3.4, marginPct: 77.0 },
      costs: { opexM: 4.5, capexM: 1.8, maintenanceM: 2.6, payrollM: 0.9, fuelM: 0, insuranceM: 0.7, adminM: 0.6, debtServiceM: 11.2 },
    },
    assetHealth: { score: 79, equipment: [
      { name: "Turbine Cluster North", health: 82, nextMaintenance: "Aug 08" },
      { name: "Turbine Cluster South", health: 74, nextMaintenance: "Jul 25" },
    ], openIssues: 3, alerts: [{ id: "al5", severity: "medium", text: "Gearbox vibration trending up on Cluster South", raisedAt: "Jul 14" }] },
    documents: [
      { id: "pd12", name: "Boreas_MIS_Jun2026.xlsx", kind: "MIS", format: "XLSX", uploadedAt: "Jul 09", uploadedBy: "A. Lindqvist" },
      { id: "pd13", name: "Boreas_IC_Memo_v2.pdf", kind: "Financial Statement", format: "PDF", uploadedAt: "Jul 17", uploadedBy: "A. Lindqvist" },
    ],
    misVersions: [{ id: "mv7", version: 1, uploadedAt: "Jul 09, 13:20", uploadedBy: "A. Lindqvist", sourceDoc: "Boreas_MIS_Jun2026.xlsx", status: "applied", detectedChanges: [] }],
    auditTrail: [{ id: "au8", at: "Jul 09, 13:25", user: "A. Lindqvist", action: "MIS applied", detail: "v1 — first reporting period post financial close" }],
    healthFlags: [],
  },
  {
    id: "nordwind-park-ii", companyId: "nordwind-holdings", regionId: "wind-europe", industryKey: "wind",
    name: "Nordwind Park II", country: "Denmark", capacityMW: 132, status: "Watch",
    kpis: { portfolioValueM: 132, capacityUtilizationPct: 58, cashFlowM: 3.1, yoyGrowthPct: -6.8, debtOutstandingM: 88 },
    drivers: { kind: "wind", metrics: [
      { label: "Wind Speed", value: 6.9, unit: "m/s", target: 7.6, trend: trend(7.0, 6, 0.06) },
      { label: "Turbine Efficiency", value: 82.1, unit: "%", target: 89, trend: trend(83, 6, 0.03) },
      { label: "Capacity Factor", value: 27.4, unit: "%", target: 33, trend: trend(28, 6, 0.05) },
      { label: "Turbine Availability", value: 93.2, unit: "%", target: 98, trend: trend(94, 6, 0.02) },
    ] },
    financials: {
      topline: { revenueM: 9.8, revenueGrowthPct: -6.8, byMonth: months(1.7, -0.02), byGeography: [{ region: "Denmark", revenueM: 9.8 }] },
      earnings: { ebitdaM: 6.2, ebitM: 3.1, netIncomeM: -0.6, marginPct: 63.3 },
      costs: { opexM: 3.6, capexM: 0.9, maintenanceM: 2.2, payrollM: 0.5, fuelM: 0, insuranceM: 0.4, adminM: 0.4, debtServiceM: 5.8 },
    },
    assetHealth: { score: 64, equipment: [
      { name: "Turbine Cluster A", health: 61, nextMaintenance: "Jul 24" },
      { name: "Turbine Cluster B", health: 67, nextMaintenance: "Aug 02" },
    ], openIssues: 4, alerts: [
      { id: "al6", severity: "high", text: "Q2 production 4.1% below P50 due to below-average wind speeds", raisedAt: "Jul 16" },
    ] },
    documents: [{ id: "pd14", name: "Nordwind_MIS_Jun2026.xlsx", kind: "MIS", format: "XLSX", uploadedAt: "Jun 30", uploadedBy: "S. Okafor" }],
    misVersions: [{ id: "mv8", version: 5, uploadedAt: "Jun 30, 16:12", uploadedBy: "S. Okafor", sourceDoc: "Nordwind_MIS_Jun2026.xlsx", status: "applied", detectedChanges: [
      { id: "dc7", field: "Revenue", category: "Revenue", previousValue: "€10.7M", newValue: "€9.8M", confidence: 0.92, decision: "accepted" },
      { id: "dc8", field: "Capacity Factor", category: "Utilization", previousValue: "31.2%", newValue: "27.4%", confidence: 0.89, decision: "accepted" },
    ] }],
    auditTrail: [{ id: "au9", at: "Jun 30, 16:20", user: "S. Okafor", action: "MIS applied", detail: "v5 — 2 of 2 detected changes accepted" }],
    healthFlags: [
      { rule: "revenueDown10", label: "Revenue down >10%", severity: "high", detail: "Revenue down 6.8% YoY and worsening — approaching the 10% threshold." },
      { rule: "generationBelowForecast", label: "Generation below forecast", severity: "critical", detail: "Q2 production 4.1% below P50; wind speeds running below the long-term average." },
      { rule: "lowAssetHealth", label: "Low asset health score", severity: "medium", detail: "Asset health score of 64 — below the 70 threshold." },
    ],
  },
  {
    id: "zephyr-project", companyId: "nordwind-holdings", regionId: "wind-europe", industryKey: "wind",
    name: "Zephyr 96 MW Project", country: "Denmark", capacityMW: 96, status: "At Risk", linkedDealId: "zephyr",
    kpis: { portfolioValueM: 121, capacityUtilizationPct: 52, cashFlowM: 1.2, yoyGrowthPct: -11.4, debtOutstandingM: 76 },
    drivers: { kind: "wind", metrics: [
      { label: "Wind Speed", value: 6.4, unit: "m/s", target: 7.4, trend: trend(6.5, 6, 0.06) },
      { label: "Turbine Efficiency", value: 78.6, unit: "%", target: 89, trend: trend(79, 6, 0.03) },
      { label: "Capacity Factor", value: 24.1, unit: "%", target: 32, trend: trend(25, 6, 0.06) },
      { label: "Turbine Availability", value: 90.4, unit: "%", target: 98, trend: trend(91, 6, 0.02) },
    ] },
    financials: {
      topline: { revenueM: 6.1, revenueGrowthPct: -11.4, byMonth: months(1.05, -0.03), byGeography: [{ region: "Denmark", revenueM: 6.1 }] },
      earnings: { ebitdaM: 3.2, ebitM: 0.6, netIncomeM: -2.1, marginPct: 52.5 },
      costs: { opexM: 2.9, capexM: 0.5, maintenanceM: 1.9, payrollM: 0.4, fuelM: 0, insuranceM: 0.3, adminM: 0.3, debtServiceM: 4.9 },
    },
    assetHealth: { score: 55, equipment: [{ name: "Turbine Cluster A", health: 52, nextMaintenance: "Overdue" }], openIssues: 6, alerts: [
      { id: "al7", severity: "critical", text: "DSCR trending below covenant minimum for two consecutive quarters", raisedAt: "Jul 11" },
    ] },
    documents: [{ id: "pd15", name: "Zephyr_MIS_May2026.xlsx", kind: "MIS", format: "XLSX", uploadedAt: "Jun 02", uploadedBy: "J. Moreau" }],
    misVersions: [{ id: "mv9", version: 6, uploadedAt: "Jun 02, 10:00", uploadedBy: "J. Moreau", sourceDoc: "Zephyr_MIS_May2026.xlsx", status: "applied", detectedChanges: [] }],
    auditTrail: [{ id: "au10", at: "Jun 02, 10:05", user: "J. Moreau", action: "MIS applied", detail: "v6 — no material changes; MIS for June now overdue" }],
    healthFlags: [
      { rule: "revenueDown10", label: "Revenue down >10%", severity: "critical", detail: "Revenue down 11.4% YoY, driven by sustained below-average wind resource." },
      { rule: "covenantBreach", label: "Covenant breach", severity: "critical", detail: "DSCR below the 1.15x lock-up covenant for two consecutive quarters." },
      { rule: "misOverdue", label: "MIS overdue", severity: "high", detail: "June MIS report not yet received — 19 days overdue." },
      { rule: "lowAssetHealth", label: "Low asset health score", severity: "high", detail: "Asset health score of 55 — below the 70 threshold." },
      { rule: "ebitdaMarginBelowTarget", label: "EBITDA margin below target", severity: "medium", detail: "EBITDA margin 52.5% vs. 65% target for the wind portfolio." },
    ],
  },

  // ── Wind / India ──
  {
    id: "tamil-nadu-120", companyId: "windforce-india", regionId: "wind-india", industryKey: "wind",
    name: "Tamil Nadu 120 MW Project", country: "India", capacityMW: 120, status: "Operational",
    kpis: { portfolioValueM: 98, capacityUtilizationPct: 89, cashFlowM: 6.8, yoyGrowthPct: 8.9, debtOutstandingM: 52 },
    drivers: { kind: "wind", metrics: [
      { label: "Wind Speed", value: 8.6, unit: "m/s", target: 8.4, trend: trend(8.6, 6, 0.02) },
      { label: "Turbine Efficiency", value: 91.2, unit: "%", target: 90, trend: trend(91, 6, 0.01) },
      { label: "Capacity Factor", value: 38.6, unit: "%", target: 36, trend: trend(38, 6, 0.02) },
      { label: "Turbine Availability", value: 98.4, unit: "%", target: 98, trend: trend(98, 6, 0.005) },
    ] },
    financials: {
      topline: { revenueM: 14.2, revenueGrowthPct: 8.9, byMonth: months(2.35, 0.03), byGeography: [{ region: "India", revenueM: 14.2 }] },
      earnings: { ebitdaM: 11.4, ebitM: 8.6, netIncomeM: 4.9, marginPct: 80.3 },
      costs: { opexM: 2.8, capexM: 0.6, maintenanceM: 1.1, payrollM: 0.5, fuelM: 0, insuranceM: 0.3, adminM: 0.3, debtServiceM: 4.4 },
    },
    assetHealth: { score: 93, equipment: [{ name: "Turbine Cluster A", health: 94, nextMaintenance: "Oct 18" }], openIssues: 0, alerts: [] },
    documents: [{ id: "pd16", name: "TamilNadu_MIS_Jun2026.xlsx", kind: "MIS", format: "XLSX", uploadedAt: "Jul 07", uploadedBy: "M. Ferreira" }],
    misVersions: [{ id: "mv10", version: 3, uploadedAt: "Jul 07, 12:15", uploadedBy: "M. Ferreira", sourceDoc: "TamilNadu_MIS_Jun2026.xlsx", status: "applied", detectedChanges: [] }],
    auditTrail: [{ id: "au11", at: "Jul 07, 12:20", user: "M. Ferreira", action: "MIS applied", detail: "v3 — no material changes detected" }],
    healthFlags: [],
  },

  // ── Infrastructure / Europe ──
  {
    id: "meridian-project", companyId: "meridian-retail-ltd", regionId: "infra-europe", industryKey: "infrastructure",
    name: "Meridian Retail Park", country: "United Kingdom", status: "Under Construction", linkedDealId: "meridian",
    kpis: { portfolioValueM: 142, capacityUtilizationPct: 34, cashFlowM: -0.8, yoyGrowthPct: 0, debtOutstandingM: 0 },
    drivers: { kind: "realEstate", metrics: [
      { label: "Occupancy", value: 34, unit: "%", target: 90, trend: trend(30, 6, 0.08) },
      { label: "Footfall", value: 41000, unit: "visitors/mo", trend: trend(38000, 6, 0.06) },
      { label: "Revenue per Sq Ft", value: 8.20, unit: "£", trend: trend(8, 6, 0.03) },
      { label: "Lease Renewal Rate", value: 0, unit: "%", trend: [0, 0, 0, 0, 0, 0] },
    ] },
    financials: {
      topline: { revenueM: 1.4, revenueGrowthPct: 0, byMonth: months(0.23, 0.1), byGeography: [{ region: "United Kingdom", revenueM: 1.4 }] },
      earnings: { ebitdaM: -1.2, ebitM: -2.0, netIncomeM: -2.4, marginPct: -85.7 },
      costs: { opexM: 1.1, capexM: 8.4, maintenanceM: 0.2, payrollM: 0.3, fuelM: 0, insuranceM: 0.2, adminM: 0.4, debtServiceM: 0 },
    },
    assetHealth: { score: 70, equipment: [{ name: "Construction Site", health: 70, nextMaintenance: "n/a" }], openIssues: 2, alerts: [
      { id: "al8", severity: "medium", text: "Anchor tenant lease negotiation behind schedule", raisedAt: "Jul 09" },
    ] },
    documents: [
      { id: "pd17", name: "Meridian_MIS_Jun2026.xlsx", kind: "MIS", format: "XLSX", uploadedAt: "Jul 01", uploadedBy: "S. Okafor" },
      { id: "pd18", name: "Meridian_EPC_ProgressReport.pdf", kind: "EPC Report", format: "PDF", uploadedAt: "Jul 01", uploadedBy: "S. Okafor" },
    ],
    misVersions: [{ id: "mv11", version: 1, uploadedAt: "Jul 01, 09:00", uploadedBy: "S. Okafor", sourceDoc: "Meridian_MIS_Jun2026.xlsx", status: "pending-review", detectedChanges: [
      { id: "dc9", field: "Construction Progress", category: "KPI", previousValue: "61%", newValue: "68%", confidence: 0.85, decision: "pending" },
    ] }],
    auditTrail: [{ id: "au12", at: "Jul 01, 09:05", user: "S. Okafor", action: "MIS uploaded", detail: "v1 — awaiting review of 1 detected change" }],
    healthFlags: [
      { rule: "missingData", label: "Missing data", severity: "medium", detail: "Lease renewal rate not yet trackable — no leases signed pre-completion." },
    ],
  },
  {
    id: "atlas-project", companyId: "atlas-living-ltd", regionId: "infra-europe", industryKey: "infrastructure",
    name: "Atlas Student Living", country: "Portugal", status: "Operational", linkedDealId: "atlas",
    kpis: { portfolioValueM: 58, capacityUtilizationPct: 94, cashFlowM: 3.9, yoyGrowthPct: 4.2, debtOutstandingM: 22 },
    drivers: { kind: "realEstate", metrics: [
      { label: "Occupancy", value: 94, unit: "%", target: 92, trend: trend(94, 6, 0.005) },
      { label: "Footfall", value: 0, unit: "visitors/mo", trend: [0, 0, 0, 0, 0, 0] },
      { label: "Revenue per Sq Ft", value: 21.4, unit: "€", trend: trend(21, 6, 0.02) },
      { label: "Lease Renewal Rate", value: 78, unit: "%", target: 75, trend: trend(76, 6, 0.02) },
    ] },
    financials: {
      topline: { revenueM: 9.6, revenueGrowthPct: 4.2, byMonth: months(1.6, 0.02), byGeography: [{ region: "Portugal", revenueM: 9.6 }] },
      earnings: { ebitdaM: 6.1, ebitM: 4.8, netIncomeM: 2.6, marginPct: 63.5 },
      costs: { opexM: 3.5, capexM: 0.3, maintenanceM: 0.5, payrollM: 1.4, fuelM: 0, insuranceM: 0.2, adminM: 0.4, debtServiceM: 1.8 },
    },
    assetHealth: { score: 90, equipment: [{ name: "HVAC Systems", health: 88, nextMaintenance: "Sep 01" }], openIssues: 1, alerts: [] },
    documents: [{ id: "pd19", name: "Atlas_MIS_Jun2026.xlsx", kind: "MIS", format: "XLSX", uploadedAt: "Jul 05", uploadedBy: "M. Ferreira" }],
    misVersions: [{ id: "mv12", version: 4, uploadedAt: "Jul 05, 15:30", uploadedBy: "M. Ferreira", sourceDoc: "Atlas_MIS_Jun2026.xlsx", status: "applied", detectedChanges: [] }],
    auditTrail: [{ id: "au13", at: "Jul 05, 15:35", user: "M. Ferreira", action: "MIS applied", detail: "v4 — occupancy at record 94%" }],
    healthFlags: [],
  },

  // ── Infrastructure / MENA ──
  {
    id: "koper-hub", companyId: "koper-logistics-holdings", regionId: "infra-mena", industryKey: "infrastructure",
    name: "Koper Logistics Hub", country: "Slovenia", status: "Watch",
    kpis: { portfolioValueM: 46, capacityUtilizationPct: 88, cashFlowM: 1.6, yoyGrowthPct: -2.4, debtOutstandingM: 19 },
    drivers: { kind: "realEstate", metrics: [
      { label: "Occupancy", value: 88, unit: "%", target: 92, trend: trend(89, 6, 0.02) },
      { label: "Footfall", value: 0, unit: "visitors/mo", trend: [0, 0, 0, 0, 0, 0] },
      { label: "Revenue per Sq Ft", value: 6.10, unit: "€", trend: trend(6.3, 6, 0.02) },
      { label: "Lease Renewal Rate", value: 61, unit: "%", target: 75, trend: trend(65, 6, 0.03) },
    ] },
    financials: {
      topline: { revenueM: 6.8, revenueGrowthPct: -2.4, byMonth: months(1.13, -0.01), byGeography: [{ region: "Slovenia", revenueM: 6.8 }] },
      earnings: { ebitdaM: 3.5, ebitM: 2.1, netIncomeM: 0.4, marginPct: 51.5 },
      costs: { opexM: 3.3, capexM: 0.2, maintenanceM: 0.6, payrollM: 0.9, fuelM: 0.2, insuranceM: 0.2, adminM: 0.3, debtServiceM: 1.4 },
    },
    assetHealth: { score: 74, equipment: [{ name: "Loading Bays", health: 76, nextMaintenance: "Aug 14" }], openIssues: 2, alerts: [
      { id: "al9", severity: "medium", text: "Anchor tenant lease expires in 9 months, renewal not yet confirmed", raisedAt: "Jul 13" },
    ] },
    documents: [{ id: "pd20", name: "Koper_MIS_Jun2026.xlsx", kind: "MIS", format: "XLSX", uploadedAt: "Jun 29", uploadedBy: "A. Lindqvist" }],
    misVersions: [{ id: "mv13", version: 3, uploadedAt: "Jun 29, 10:45", uploadedBy: "A. Lindqvist", sourceDoc: "Koper_MIS_Jun2026.xlsx", status: "applied", detectedChanges: [] }],
    auditTrail: [{ id: "au14", at: "Jun 29, 10:50", user: "A. Lindqvist", action: "MIS applied", detail: "v3 — no material changes detected" }],
    healthFlags: [
      { rule: "missingData", label: "Missing data", severity: "low", detail: "Lease renewal terms for the anchor tenant not yet documented." },
    ],
  },
  {
    id: "dubai-logistics", companyId: "koper-logistics-holdings", regionId: "infra-mena", industryKey: "infrastructure",
    name: "Dubai Logistics Park", country: "UAE", status: "Operational",
    kpis: { portfolioValueM: 88, capacityUtilizationPct: 95, cashFlowM: 5.4, yoyGrowthPct: 11.2, debtOutstandingM: 38 },
    drivers: { kind: "realEstate", metrics: [
      { label: "Occupancy", value: 95, unit: "%", target: 90, trend: trend(94, 6, 0.01) },
      { label: "Footfall", value: 0, unit: "visitors/mo", trend: [0, 0, 0, 0, 0, 0] },
      { label: "Revenue per Sq Ft", value: 9.80, unit: "AED", trend: trend(9.4, 6, 0.02) },
      { label: "Lease Renewal Rate", value: 84, unit: "%", target: 75, trend: trend(80, 6, 0.02) },
    ] },
    financials: {
      topline: { revenueM: 12.1, revenueGrowthPct: 11.2, byMonth: months(2.0, 0.04), byGeography: [{ region: "UAE", revenueM: 12.1 }] },
      earnings: { ebitdaM: 8.4, ebitM: 6.6, netIncomeM: 4.1, marginPct: 69.4 },
      costs: { opexM: 3.7, capexM: 0.4, maintenanceM: 0.5, payrollM: 1.1, fuelM: 0.1, insuranceM: 0.3, adminM: 0.4, debtServiceM: 2.6 },
    },
    assetHealth: { score: 92, equipment: [{ name: "Loading Bays", health: 93, nextMaintenance: "Oct 22" }], openIssues: 0, alerts: [] },
    documents: [{ id: "pd21", name: "Dubai_MIS_Jun2026.xlsx", kind: "MIS", format: "XLSX", uploadedAt: "Jul 02", uploadedBy: "A. Lindqvist" }],
    misVersions: [{ id: "mv14", version: 2, uploadedAt: "Jul 02, 08:20", uploadedBy: "A. Lindqvist", sourceDoc: "Dubai_MIS_Jun2026.xlsx", status: "applied", detectedChanges: [] }],
    auditTrail: [{ id: "au15", at: "Jul 02, 08:25", user: "A. Lindqvist", action: "MIS applied", detail: "v2 — no material changes detected" }],
    healthFlags: [],
  },
];

// ── Regional risks (Level 2 additions) ─────────────────────

export interface RegionalRisk { category: "Weather" | "Regulations" | "Grid Availability" | "Inflation" | "Currency"; severity: Severity; text: string }

export const regionalRisks: Record<string, RegionalRisk[]> = {
  "solar-india": [
    { category: "Regulations", severity: "medium", text: "State-level open-access charges under review — could affect merchant tail pricing." },
    { category: "Currency", severity: "low", text: "INR depreciation of 2.1% YTD against USD debt exposure." },
  ],
  "solar-europe": [
    { category: "Grid Availability", severity: "medium", text: "Curtailment risk elevated in Southern Spain during high-irradiance months." },
    { category: "Inflation", severity: "low", text: "Eurozone inflation moderating; O&M contract escalators tracking CPI." },
  ],
  "solar-mena": [
    { category: "Weather", severity: "low", text: "Dust accumulation on panels above regional average — cleaning cycle under review." },
  ],
  "wind-europe": [
    { category: "Weather", severity: "high", text: "Below-average wind resource across the region for two consecutive quarters." },
    { category: "Regulations", severity: "medium", text: "Permitting reform under negotiation — could accelerate future repowering." },
  ],
  "wind-india": [
    { category: "Grid Availability", severity: "low", text: "Minor curtailment events during monsoon transmission maintenance windows." },
  ],
  "infra-europe": [
    { category: "Inflation", severity: "medium", text: "UK construction cost inflation running above budget assumptions." },
    { category: "Regulations", severity: "low", text: "Planning consent conditions on Meridian under standard review." },
  ],
  "infra-mena": [
    { category: "Currency", severity: "low", text: "AED peg provides stability; minimal FX exposure." },
  ],
};

// ── KPI aggregation ─────────────────────────────────────────

export interface PortfolioSummary {
  totalValueM: number;
  totalRevenueM: number;
  totalEbitdaM: number;
  installedCapacityMW: number;
  capacityUtilizationPct: number;
  activeProjects: number;
  avgAssetHealth: number;
  cashFlowM: number;
  yoyGrowthPct: number;
}

export function aggregateKPIs(projects: PortfolioProject[]): PortfolioSummary {
  if (projects.length === 0) {
    return { totalValueM: 0, totalRevenueM: 0, totalEbitdaM: 0, installedCapacityMW: 0, capacityUtilizationPct: 0, activeProjects: 0, avgAssetHealth: 0, cashFlowM: 0, yoyGrowthPct: 0 };
  }
  const totalValueM = round1(sum(projects, (p) => p.kpis.portfolioValueM));
  const totalRevenueM = round1(sum(projects, (p) => p.financials.topline.revenueM));
  const totalEbitdaM = round1(sum(projects, (p) => p.financials.earnings.ebitdaM));
  const installedCapacityMW = sum(projects, (p) => p.capacityMW ?? 0);
  const capacityUtilizationPct = round1(avg(projects, (p) => p.kpis.capacityUtilizationPct));
  const activeProjects = projects.filter((p) => p.status !== "Under Construction").length;
  const avgAssetHealth = Math.round(avg(projects, (p) => p.assetHealth.score));
  const cashFlowM = round1(sum(projects, (p) => p.kpis.cashFlowM));
  const yoyGrowthPct = round1(avg(projects, (p) => p.kpis.yoyGrowthPct));
  return { totalValueM, totalRevenueM, totalEbitdaM, installedCapacityMW, capacityUtilizationPct, activeProjects, avgAssetHealth, cashFlowM, yoyGrowthPct };
}

function sum<T>(items: T[], fn: (i: T) => number) { return items.reduce((a, i) => a + fn(i), 0); }
function avg<T>(items: T[], fn: (i: T) => number) { return items.length ? sum(items, fn) / items.length : 0; }
function round1(n: number) { return Math.round(n * 10) / 10; }

// ── Aggregation-scoped helpers ──────────────────────────────

export function projectsForIndustry(industryKey: IndustryKey) {
  return portfolioProjects.filter((p) => p.industryKey === industryKey);
}
export function projectsForRegion(regionId: string) {
  return portfolioProjects.filter((p) => p.regionId === regionId);
}
export function projectsForCompany(companyId: string) {
  return portfolioProjects.filter((p) => p.companyId === companyId);
}
export function regionsForIndustry(industryKey: IndustryKey) {
  return regions.filter((r) => r.industryKey === industryKey);
}
export function companiesForRegion(regionId: string) {
  return companies.filter((c) => c.regionId === regionId);
}

export function findIndustry(key: string) { return industries.find((i) => i.key === key); }
export function findRegion(id: string) { return regions.find((r) => r.id === id); }
export function findCompany(id: string) { return companies.find((c) => c.id === id); }
export function findProject(id: string) { return portfolioProjects.find((p) => p.id === id); }

export function portfolioLabelLookup(id: string): string | undefined {
  return findRegion(id)?.name ?? findCompany(id)?.name ?? findProject(id)?.name ?? industries.find((i) => i.key === id)?.name;
}

// ── Cross-industry country rollups ──────────────────────────
// Region.countryCode is NOT a reliable grouping key across industries
// (e.g. "Europe" spans ES/DE/GB depending on industry) — the only
// consistent shared key across the seed data is Region.name.

export interface CountryGroup {
  name: string;
  regionIds: string[];
  industryKeys: IndustryKey[];
}

export function countryGroups(): CountryGroup[] {
  const byName = new Map<string, CountryGroup>();
  for (const r of regions) {
    const g = byName.get(r.name) ?? { name: r.name, regionIds: [], industryKeys: [] };
    g.regionIds.push(r.id);
    if (!g.industryKeys.includes(r.industryKey)) g.industryKeys.push(r.industryKey);
    byName.set(r.name, g);
  }
  return [...byName.values()];
}

export function projectsForCountry(name: string) {
  const ids = regions.filter((r) => r.name === name).map((r) => r.id);
  return portfolioProjects.filter((p) => ids.includes(p.regionId));
}

export function findCountryGroup(name: string) {
  return countryGroups().find((g) => g.name === name);
}

// ── Health Center ────────────────────────────────────────────

export interface FlaggedProject { project: PortfolioProject; flags: HealthFlag[] }

export function projectsRequiringAttention(): FlaggedProject[] {
  return portfolioProjects
    .filter((p) => p.healthFlags.length > 0)
    .map((p) => ({ project: p, flags: p.healthFlags }))
    .sort((a, b) => worstSeverityRank(a.flags) - worstSeverityRank(b.flags));
}

const sevRank: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 };
function worstSeverityRank(flags: HealthFlag[]) {
  return Math.min(...flags.map((f) => sevRank[f.severity]));
}

// ── Dashboards ──────────────────────────────────────────────

let widgetSeq = 0;
function w(type: WidgetType, title: string, metric: MetricKey, x: number, y: number, wSize: number, h: number, timeRange: TimeRange = "YTD", comparison: ComparisonKey = "lastYear"): WidgetConfig {
  widgetSeq += 1;
  return { id: `w${widgetSeq}`, type, title, metric, timeRange, comparison, layout: { x, y, w: wSize, h } };
}

export const savedDashboards: DashboardDef[] = [
  {
    id: "dash-solar-exec", name: "Solar — Executive", scope: "industry", scopeId: "solar", preset: "Executive",
    widgets: [
      w("kpi", "Total Revenue", "revenue", 0, 0, 3, 2),
      w("kpi", "EBITDA", "ebitda", 3, 0, 3, 2),
      w("kpi", "Capacity Utilization", "capacityUtilization", 6, 0, 3, 2),
      w("kpi", "Avg Asset Health", "assetHealth", 9, 0, 3, 2),
      w("bar", "Revenue by Region", "revenue", 0, 2, 6, 4),
      w("line", "Generation Trend", "generation", 6, 2, 6, 4),
      w("table", "Project Performance", "revenue", 0, 6, 12, 4),
    ],
    owner: "Jane Moreau", sharedWith: ["A. Lindqvist", "R. Chen"], updatedAt: "Jul 17, 09:00",
  },
  {
    id: "dash-wind-exec", name: "Wind — Executive", scope: "industry", scopeId: "wind", preset: "Executive",
    widgets: [
      w("kpi", "Total Revenue", "revenue", 0, 0, 3, 2),
      w("kpi", "EBITDA", "ebitda", 3, 0, 3, 2),
      w("kpi", "Capacity Utilization", "capacityUtilization", 6, 0, 3, 2),
      w("kpi", "Avg Asset Health", "assetHealth", 9, 0, 3, 2),
      w("area", "Revenue Trend", "revenue", 0, 2, 6, 4),
      w("gauge", "Turbine Availability", "availability", 6, 2, 3, 4),
      w("heatmap", "Health by Project", "assetHealth", 9, 2, 3, 4),
    ],
    owner: "Jane Moreau", sharedWith: [], updatedAt: "Jul 16, 14:00",
  },
  {
    id: "dash-infra-exec", name: "Infrastructure — Executive", scope: "industry", scopeId: "infrastructure", preset: "Executive",
    widgets: [
      w("kpi", "Total Revenue", "revenue", 0, 0, 4, 2),
      w("kpi", "EBITDA Margin", "ebitdaMargin", 4, 0, 4, 2),
      w("kpi", "Avg Asset Health", "assetHealth", 8, 0, 4, 2),
      w("waterfall", "Revenue Bridge", "revenue", 0, 2, 6, 4),
      w("pie", "Project Distribution", "revenue", 6, 2, 6, 4),
    ],
    owner: "Jane Moreau", sharedWith: ["S. Okafor"], updatedAt: "Jul 15, 11:20",
  },
  {
    id: "dash-health", name: "Portfolio Health Center", scope: "health", scopeId: "",
    widgets: [
      w("kpi", "Projects Flagged", "assetHealth", 0, 0, 3, 2),
      w("kpi", "Critical Flags", "assetHealth", 3, 0, 3, 2),
      w("heatmap", "Flags by Rule", "assetHealth", 0, 2, 6, 4),
      w("table", "Attention List", "assetHealth", 6, 2, 6, 4),
    ],
    owner: "Jane Moreau", sharedWith: ["A. Lindqvist", "R. Chen", "S. Okafor", "M. Ferreira"], updatedAt: "Jul 18, 08:00",
  },
];

// ── Insights ────────────────────────────────────────────────

export const portfolioInsights: Insight[] = [
  { id: "pi1", scope: "", text: "Portfolio revenue increased 8.2% this quarter, primarily due to higher generation across Solar India and improved PPA realization on Solara One.", tone: "positive", metric: "Revenue", generatedAt: "2h ago" },
  { id: "pi2", scope: "wind", text: "Wind assets in Denmark have underperformed because of below-average wind speeds — Nordwind Park II and Zephyr both missed P50 generation for the second consecutive quarter.", tone: "negative", metric: "Generation", generatedAt: "3h ago" },
  { id: "pi3", scope: "gujarat-140", text: "Maintenance costs at Gujarat 140 MW are 22% above portfolio average because of repeated inverter failures.", tone: "negative", metric: "Maintenance Cost", generatedAt: "5h ago" },
  { id: "pi4", scope: "meridian-project", text: "Project EBITDA at Meridian Retail Park is negative despite construction being on-budget, due to pre-completion carrying costs and delayed anchor tenant lease-up.", tone: "neutral", metric: "EBITDA", generatedAt: "1d ago" },
  { id: "pi5", scope: "solar", text: "Solar portfolio capacity utilization improved to 86% on average, led by Abu Dhabi 200 MW's 96% utilization — the strongest asset in the book.", tone: "positive", metric: "Capacity Utilization", generatedAt: "1d ago" },
  { id: "pi6", scope: "zephyr-project", text: "Zephyr's DSCR breach reflects compounding wind underperformance and rising O&M costs — recommend escalating to the credit committee ahead of the Q3 covenant test.", tone: "negative", metric: "DSCR", generatedAt: "6h ago" },
];

export const portfolioChatSample: PortfolioChatMessage[] = [
  { role: "user", text: "Which projects are underperforming?" },
  {
    role: "ai",
    text: "Four projects are flagged for attention. Zephyr 96 MW is the most severe — revenue down 11.4% YoY with an active DSCR covenant breach [1]. Gujarat 140 MW and Nordwind Park II are both showing generation below forecast, driven by inverter faults and weak wind resource respectively [2][3]. Meridian Retail Park has negative EBITDA, but that's expected pre-completion carrying cost, not an operating issue [4].",
    citations: [
      { n: 1, ref: "Zephyr 96 MW Project — Health Center" },
      { n: 2, ref: "Gujarat 140 MW Project — Health Center" },
      { n: 3, ref: "Nordwind Park II — Health Center" },
      { n: 4, ref: "Meridian Retail Park — Financials" },
    ],
  },
];

export const portfolioSuggestedPrompts = [
  "Which projects are underperforming?",
  "Show all solar projects with EBITDA margins below 25%",
  "Compare Spain solar assets against portfolio average",
  "Which projects have seen the largest increase in maintenance costs this year?",
];
