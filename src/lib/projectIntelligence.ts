// ─────────────────────────────────────────────────────────────
// Vitta Project Workspace — project-level intelligence layer.
// ESG, open risk taxonomy, recommendations, milestones, forecasts,
// budget-vs-actual, inspections, and the "Project Story" narrative.
// Sparse Record<projectId, T[]> maps, same idiom as portfolioData.ts's
// regionalRisks — only richly-seeded projects have full depth, which
// is an honest property of the mock, not a bug.
// ─────────────────────────────────────────────────────────────

import {
  portfolioProjects, type MetricKey, type PortfolioProject, type Severity,
} from "./portfolioData";
import { getMetricValue } from "../pages/portfolio/builder/metricSeries";

// ── Risks (open taxonomy, beyond HealthFlag's 8 fixed rules) ─

export type RiskCategory = "Operational" | "Financial" | "Regulatory" | "Weather" | "Construction" | "ESG";

export interface ProjectRisk {
  id: string; category: RiskCategory; severity: Severity; text: string; identifiedAt: string; status: "open" | "monitoring" | "resolved";
}

export const projectRisks: Record<string, ProjectRisk[]> = {
  "rajasthan-250": [
    { id: "pr1", category: "Weather", severity: "low", text: "Dust accumulation during pre-monsoon months modestly reduces panel output; cleaning cycle under review.", identifiedAt: "Jul 08", status: "monitoring" },
  ],
  "gujarat-140": [
    { id: "pr2", category: "Operational", severity: "high", text: "Recurring inverter faults are the primary driver of below-forecast generation — third consecutive reporting period flagged.", identifiedAt: "Jun 28", status: "open" },
    { id: "pr3", category: "Financial", severity: "medium", text: "Maintenance cost overruns are compressing EBITDA margin relative to portfolio average.", identifiedAt: "Jun 28", status: "open" },
  ],
  "zephyr-project": [
    { id: "pr4", category: "Financial", severity: "critical", text: "DSCR below the 1.15x lock-up covenant for two consecutive quarters — active covenant breach.", identifiedAt: "Jun 02", status: "open" },
    { id: "pr5", category: "Weather", severity: "high", text: "Sustained below-average wind resource across the region is the root cause of the revenue shortfall.", identifiedAt: "Jun 02", status: "open" },
    { id: "pr6", category: "Regulatory", severity: "medium", text: "June MIS submission is overdue, risking a lender reporting covenant technical breach if not resolved.", identifiedAt: "Jun 21", status: "open" },
  ],
  "nordwind-park-ii": [
    { id: "pr7", category: "Weather", severity: "high", text: "Q2 production 4.1% below P50 due to below-average wind speeds across the Danish portfolio.", identifiedAt: "Jun 30", status: "monitoring" },
  ],
  "boreas-project": [
    { id: "pr8", category: "Construction", severity: "low", text: "Minor commissioning punch-list item outstanding on Block 3 — does not affect operations.", identifiedAt: "Jul 12", status: "monitoring" },
    { id: "pr9", category: "Operational", severity: "medium", text: "Gearbox vibration trending upward on Turbine Cluster South — scheduled for inspection.", identifiedAt: "Jul 14", status: "monitoring" },
  ],
};

export function risksForProject(id: string) {
  const rank: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  return [...(projectRisks[id] ?? [])].sort((a, b) => rank[a.severity] - rank[b.severity]);
}

// ── ESG ───────────────────────────────────────────────────────

export interface ESGMetric { label: string; value: number; unit: string; target?: number; trend: number[] }

export const esgMetrics: Record<string, ESGMetric[]> = {
  "rajasthan-250": [
    { label: "CO2 Avoided", value: 312000, unit: "tCO2e/yr", trend: [280000, 290000, 298000, 305000, 309000, 312000] },
    { label: "Land Biodiversity Score", value: 7.2, unit: "/10", target: 8, trend: [6.8, 6.9, 7.0, 7.1, 7.1, 7.2] },
    { label: "Local Employment", value: 84, unit: "jobs", trend: [70, 74, 78, 80, 82, 84] },
  ],
  "gujarat-140": [
    { label: "CO2 Avoided", value: 156000, unit: "tCO2e/yr", trend: [150000, 152000, 154000, 155000, 155500, 156000] },
    { label: "Local Employment", value: 46, unit: "jobs", trend: [40, 42, 44, 45, 45, 46] },
  ],
  "zephyr-project": [
    { label: "CO2 Avoided", value: 98000, unit: "tCO2e/yr", trend: [102000, 101000, 100000, 99000, 98500, 98000] },
    { label: "Avian Mitigation Compliance", value: 100, unit: "%", target: 100, trend: [100, 100, 100, 100, 100, 100] },
  ],
};

export function esgForProject(id: string) {
  return esgMetrics[id] ?? [];
}

// ── Recommendations ──────────────────────────────────────────

export type RecommendationKind = "attention" | "cost-optimization" | "maintenance" | "operational" | "follow-up";

export interface Recommendation {
  id: string; projectId: string; kind: RecommendationKind; text: string; severity: Severity; generatedAt: string; sourceMisVersionId?: string;
}

const handAuthoredRecommendations: Recommendation[] = [
  { id: "rec1", projectId: "gujarat-140", kind: "operational", text: "Commission an inverter reliability review — repeated faults across 3 reporting periods suggest a mechanical rather than environmental cause.", severity: "high", generatedAt: "Jun 28" },
  { id: "rec2", projectId: "zephyr-project", kind: "attention", text: "Escalate the DSCR covenant breach to the credit committee ahead of the Q3 test rather than waiting for a formal lender notice.", severity: "critical", generatedAt: "Jun 02" },
  { id: "rec3", projectId: "boreas-project", kind: "maintenance", text: "Schedule a preventive gearbox inspection on Turbine Cluster South — vibration trend is a leading indicator, cheaper to address now than reactively.", severity: "medium", generatedAt: "Jul 14" },
];

// derived: any project with specific health flags auto-generates a matching recommendation
function derivedRecommendations(): Recommendation[] {
  const out: Recommendation[] = [];
  for (const p of portfolioProjects) {
    for (const flag of p.healthFlags) {
      if (flag.rule === "highMaintenanceCost") {
        out.push({ id: `rec-derived-${p.id}-cost`, projectId: p.id, kind: "cost-optimization", text: flag.detail, severity: flag.severity, generatedAt: "Derived from health flag" });
      } else if (flag.rule === "lowAssetHealth") {
        out.push({ id: `rec-derived-${p.id}-health`, projectId: p.id, kind: "maintenance", text: flag.detail, severity: flag.severity, generatedAt: "Derived from health flag" });
      } else if (flag.rule === "misOverdue") {
        out.push({ id: `rec-derived-${p.id}-mis`, projectId: p.id, kind: "follow-up", text: flag.detail, severity: flag.severity, generatedAt: "Derived from health flag" });
      }
    }
  }
  return out;
}

const allRecommendations: Recommendation[] = [...handAuthoredRecommendations, ...derivedRecommendations()];

export function recommendationsForProject(id: string) {
  return allRecommendations.filter((r) => r.projectId === id);
}

// ── Milestones / Timeline ────────────────────────────────────

export type MilestoneKind = "mis-upload" | "maintenance" | "contract" | "construction" | "regulatory" | "other";

export interface Milestone {
  id: string; projectId: string; date: string; label: string; kind: MilestoneKind; status: "upcoming" | "completed" | "overdue"; misVersionId?: string;
}

export const projectMilestones: Record<string, Milestone[]> = {
  "rajasthan-250": [
    { id: "ms1", projectId: "rajasthan-250", date: "Jun 04, 10:03", label: "MIS submitted — May 2026", kind: "mis-upload", status: "completed", misVersionId: "mv0" },
    { id: "ms2", projectId: "rajasthan-250", date: "Jul 05, 09:12", label: "MIS submitted — Jun 2026", kind: "mis-upload", status: "completed", misVersionId: "mv1" },
    { id: "ms3", projectId: "rajasthan-250", date: "Aug 12", label: "Scheduled maintenance — Inverter Block A", kind: "maintenance", status: "upcoming" },
    { id: "ms4", projectId: "rajasthan-250", date: "Sep 04", label: "Scheduled maintenance — Tracking System", kind: "maintenance", status: "upcoming" },
  ],
  "gujarat-140": [
    { id: "ms5", projectId: "gujarat-140", date: "Jun 28, 14:44", label: "MIS submitted — Jun 2026", kind: "mis-upload", status: "completed", misVersionId: "mv2" },
    { id: "ms6", projectId: "gujarat-140", date: "Jul 22", label: "Scheduled maintenance — Inverter Block A", kind: "maintenance", status: "upcoming" },
  ],
  "zephyr-project": [
    { id: "ms7", projectId: "zephyr-project", date: "Jun 02, 10:00", label: "MIS submitted — May 2026", kind: "mis-upload", status: "completed", misVersionId: "mv9" },
    { id: "ms8", projectId: "zephyr-project", date: "Jun 21", label: "MIS due — June 2026", kind: "mis-upload", status: "overdue" },
    { id: "ms9", projectId: "zephyr-project", date: "Sep 30", label: "Q3 DSCR covenant test", kind: "regulatory", status: "upcoming" },
  ],
  "boreas-project": [
    { id: "ms10", projectId: "boreas-project", date: "Jul 09, 13:20", label: "MIS submitted — first post-COD period", kind: "mis-upload", status: "completed", misVersionId: "mv7" },
    { id: "ms11", projectId: "boreas-project", date: "Aug 05", label: "Turbine Cluster South gearbox inspection", kind: "maintenance", status: "upcoming" },
  ],
};

export function milestonesForProject(id: string) {
  return projectMilestones[id] ?? [];
}

// ── Predictions / Forecasts (honest mock: canned multiplier curve) ──

const forecastCurve: Partial<Record<MetricKey, number[]>> = {
  revenue: [1.02, 1.04, 1.05, 1.07, 1.08, 1.10],
  ebitda: [1.01, 1.03, 1.04, 1.05, 1.06, 1.07],
  generation: [1.01, 1.02, 1.03, 1.03, 1.04, 1.05],
  cashFlow: [1.02, 1.03, 1.05, 1.06, 1.07, 1.08],
  maintenanceCost: [1.03, 1.05, 1.06, 1.07, 1.08, 1.09],
  capacityUtilization: [1.0, 1.01, 1.01, 1.02, 1.02, 1.02],
  assetHealth: [1.0, 0.99, 0.99, 0.98, 0.98, 0.97],
};

export interface ForecastPoint { period: string; predicted: number; confidence: number }
export interface MetricForecast { metric: MetricKey; points: ForecastPoint[]; methodology: string }

export function forecastMetric(project: PortfolioProject, metric: MetricKey, periods = 6): ForecastPoint[] {
  const base = getMetricValue(metric, "project", project.id);
  const curve = forecastCurve[metric] ?? Array(periods).fill(1);
  return curve.slice(0, periods).map((mult, i) => ({
    period: `P+${i + 1}`,
    predicted: Math.round(base * mult * 10) / 10,
    confidence: Math.max(0.5, Math.round((0.92 - i * 0.06) * 100) / 100),
  }));
}

export const forecastableMetrics: MetricKey[] = ["revenue", "ebitda", "generation", "cashFlow", "maintenanceCost", "capacityUtilization", "assetHealth"];

// ── Budget vs Actual / Forecast vs Actual ───────────────────

export interface BudgetActualLine { label: string; budgetM: number; actualM: number; forecastM: number }

export const projectBudgetActuals: Record<string, BudgetActualLine[]> = {
  "rajasthan-250": [
    { label: "Revenue", budgetM: 155, actualM: 162, forecastM: 168 },
    { label: "EBITDA", budgetM: 118, actualM: 124, forecastM: 129 },
    { label: "O&M Cost", budgetM: 18, actualM: 19.8, forecastM: 20.5 },
  ],
  "gujarat-140": [
    { label: "Revenue", budgetM: 105, actualM: 94, forecastM: 91 },
    { label: "EBITDA", budgetM: 68, actualM: 58, forecastM: 55 },
    { label: "Maintenance Cost", budgetM: 20, actualM: 26.8, forecastM: 28 },
  ],
  "zephyr-project": [
    { label: "Revenue", budgetM: 68, actualM: 61, forecastM: 58 },
    { label: "EBITDA", budgetM: 40, actualM: 32, forecastM: 29 },
  ],
};

export function budgetActualsForProject(id: string) {
  return projectBudgetActuals[id] ?? [];
}

// ── Asset inspections ────────────────────────────────────────

export type InspectionStatus = "up-to-date" | "due" | "overdue" | "scheduled";

export interface EquipmentInspection { equipmentName: string; status: InspectionStatus; lastInspected: string; nextDue: string }

export const projectInspections: Record<string, EquipmentInspection[]> = {
  "rajasthan-250": [
    { equipmentName: "Inverter Block A", status: "up-to-date", lastInspected: "May 20", nextDue: "Aug 12" },
    { equipmentName: "Inverter Block B", status: "due", lastInspected: "Apr 28", nextDue: "Jul 28" },
    { equipmentName: "Tracking System", status: "scheduled", lastInspected: "Jun 04", nextDue: "Sep 04" },
  ],
  "gujarat-140": [
    { equipmentName: "Inverter Block A", status: "overdue", lastInspected: "Mar 15", nextDue: "Jul 22" },
    { equipmentName: "Tracking System", status: "due", lastInspected: "May 30", nextDue: "Jul 30" },
  ],
  "zephyr-project": [
    { equipmentName: "Turbine Cluster A", status: "overdue", lastInspected: "Feb 10", nextDue: "Jun 10" },
  ],
  "boreas-project": [
    { equipmentName: "Substation", status: "up-to-date", lastInspected: "Jun 20", nextDue: "Aug 20" },
  ],
};

export function inspectionsForProject(id: string) {
  return projectInspections[id] ?? [];
}

// ── Project Story ────────────────────────────────────────────
// Hand-authored narrative citing real seeded numbers — an honest mock,
// not generative AI. Every figure below matches portfolioData.ts exactly.

export interface StoryEntry { id: string; projectId: string; period: string; narrative: string; citedMetrics: string[] }

export const projectStories: Record<string, StoryEntry[]> = {
  "rajasthan-250": [
    {
      id: "story-raj-1", projectId: "rajasthan-250", period: "Jun 2026",
      narrative: "June 2026: Revenue rose to ₹162 Cr, up from ₹150 Cr in May, as Power Generated increased to 412 GWh — closing in on the 430 GWh target. O&M cost also rose, to ₹19.8 Cr, but with EBITDA margin holding at 76.8% the increase has not yet eroded profitability. Availability remains strong at 98.2%, keeping Rajasthan among the portfolio's better-performing solar assets this period.",
      citedMetrics: ["revenue", "generation", "maintenanceCost", "ebitdaMargin", "availability"],
    },
  ],
  "gujarat-140": [
    {
      id: "story-guj-1", projectId: "gujarat-140", period: "Jun 2026",
      narrative: "June 2026: Recurring inverter faults kept Power Generated at 198 GWh against a 232 GWh forecast — down 14.7% — and maintenance cost climbed to ₹26.8 Cr, the third consecutive period flagged for high maintenance costs. Revenue has now declined 3.2% year-over-year, and the asset health score of 61 sits below the portfolio's 70 threshold. Unlike Rajasthan, Gujarat's underperformance looks mechanical rather than resource-driven, and warrants an inverter reliability review ahead of Q3.",
      citedMetrics: ["generation", "maintenanceCost", "revenueGrowth", "assetHealth"],
    },
  ],
  "zephyr-project": [
    {
      id: "story-zep-1", projectId: "zephyr-project", period: "May 2026",
      narrative: "May 2026: Zephyr's DSCR has now trended below the 1.15x covenant minimum for two consecutive quarters, compounding sustained wind underperformance — Capacity Factor of 24.1% remains well below the 32% target. Revenue is down 11.4% year-over-year, and June's MIS report is now overdue by 19 days. Of the flagged projects in the Wind Europe region this period, Zephyr is the only one carrying an active covenant breach and warrants immediate escalation.",
      citedMetrics: ["revenueGrowth", "capacityUtilization", "assetHealth"],
    },
  ],
  "nordwind-park-ii": [
    {
      id: "story-nwp-1", projectId: "nordwind-park-ii", period: "Jun 2026",
      narrative: "June 2026: Nordwind Park II's Q2 production came in 4.1% below P50 as regional wind speeds ran persistently below the long-term average. Revenue fell to €9.8M from €10.7M, and Capacity Factor slipped to 27.4% from 31.2% the prior period. Asset health remains moderate at 64 — below the 70 threshold, but the underlying cause is resource variability rather than equipment condition, distinguishing this from Gujarat's mechanical issue this same period.",
      citedMetrics: ["revenueGrowth", "capacityUtilization", "assetHealth"],
    },
  ],
  "boreas-project": [
    {
      id: "story-bor-1", projectId: "boreas-project", period: "Jul 2026",
      narrative: "July 2026: Boreas completed its first full reporting period post-COD with no material MIS changes, though a rising gearbox-vibration trend on Turbine Cluster South has been flagged for preventive inspection. Asset health sits at 82, and a minor commissioning item on Block 3 remains outstanding but does not affect current operations. Ramp-up is proceeding broadly in line with plan.",
      citedMetrics: ["assetHealth"],
    },
  ],
};

export function storiesForProject(id: string) {
  return projectStories[id] ?? [];
}
