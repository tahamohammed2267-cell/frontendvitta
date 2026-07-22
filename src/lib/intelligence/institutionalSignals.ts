// ─────────────────────────────────────────────────────────────
// Institutional Signals — the firm's multi-year investment memory.
//
// crossDealPatterns.ts computes real, live recurring signals from
// this year's actual portfolioProjects health flags and regional
// risks (2-3 hits each, all within the current operating year — no
// multi-year archive exists anywhere in the mock data). That's an
// honest but thin slice: a debt fund's institutional memory spans
// years, not months.
//
// This module extends 3 of the live patterns backward in time with
// a seeded historical record (2018-2025), each entry individually
// tagged with a real outcome, so every derived stat here (project/
// industry/region counts, first/last-seen year, outcome/industry/
// region distributions, confidence, impact) is computed from a
// concrete array of occurrences — never a hardcoded headline
// number. The current year's real, live hits from crossDealPatterns
// are folded in as the most recent occurrences.
//
// It also seeds 3 additional signals (Grid Connection Delays, EPC
// Cost Overruns, DSCR Breaches) that have NO live counterpart in
// crossDealPatterns.ts today — these are purely historical
// (2018-2025, zero 2026 occurrences), which is itself honest,
// meaningful institutional information ("this pattern hasn't
// recurred this year") rather than a gap to paper over.
//
// Two fields are explicitly hand-labeled rather than derived, per
// product decision: `frequency` (a judgment call about trend shape)
// and `recurringSinceYear` (stored explicitly as a "signature fact"
// rather than silently reusing firstSeenYear). Everything else is
// computed from the occurrences array.
//
// Geography/industry reuse this app's real regions (India, Europe,
// Middle East × solar/wind/infrastructure) — no invented countries.
// ─────────────────────────────────────────────────────────────

import { crossDealPatterns, hitWorkspaceLink, type CrossDealPattern } from "./crossDealPatterns";
import type { IndustryKey, Severity } from "../portfolioData";

export type OutcomeTag =
  | "Refinanced" | "Covenant Waiver" | "Restructured" | "Recovered"
  | "Active Monitoring" | "Defaulted" | "Sponsor Equity Injection";

export type ImpactLevel = "High" | "Medium" | "Low";
export type FrequencyLabel = "Every Year" | "Increasing" | "Stable" | "Declining" | "Isolated";
export type SignalStatus = "Active" | "Dormant";

export interface SignalOccurrence {
  id: string;
  year: number;
  region: string;
  industry: IndustryKey;
  outcome: OutcomeTag;
  severity: Severity;
  detail: string;
  isLive: boolean;
  workspaceLink: string | null;
}

export interface InstitutionalSignal {
  id: string;
  title: string;
  insight: string;
  patternId: string | null; // null = no live crossDealPatterns counterpart today
  relatedSignalIds: string[];
  occurrences: SignalOccurrence[];
  frequency: FrequencyLabel;  // hand-labeled judgment call, not derived
  recurringSinceYear: number; // hand-set (== min occurrence year for every seeded signal today)
}

export interface DistributionEntry<K extends string = string> {
  key: K;
  label: string;
  count: number;
  pct: number;
}

export interface YearBucket {
  year: number;
  count: number;
}

export interface SignalStats {
  projectCount: number;
  industryCount: number;
  regionCount: number;
  firstSeenYear: number;
  lastSeenYear: number;
  timeline: SignalOccurrence[];
  outcomeStat: { outcome: OutcomeTag; pct: number; count: number; total: number };
  outcomeDistribution: DistributionEntry<OutcomeTag>[];
  industryDistribution: DistributionEntry<IndustryKey>[];
  regionDistribution: DistributionEntry<string>[];
  evolutionSeries: YearBucket[];
  impact: ImpactLevel;
  confidence: { score: number; occurrenceCount: number; yearSpan: number; industryCount: number };
  status: SignalStatus;
}

function patternById(id: string | null): CrossDealPattern | undefined {
  if (!id) return undefined;
  return crossDealPatterns.find((p) => p.id === id);
}

// Folds a live CrossDealPattern's real current-year hits into occurrences —
// these are the only entries with isLive: true / a real workspaceLink.
function liveOccurrences(patternId: string | null, outcome: OutcomeTag): SignalOccurrence[] {
  const pattern = patternById(patternId);
  if (!pattern) return [];
  return pattern.hits.map((h) => ({
    id: `live-${h.projectId}`,
    year: 2026,
    region: h.regionName,
    industry: h.industryKey,
    outcome,
    severity: h.severity,
    detail: h.detail,
    isLive: true,
    workspaceLink: hitWorkspaceLink(h),
  }));
}

function historical(
  id: string, year: number, region: string, industry: IndustryKey, outcome: OutcomeTag, severity: Severity, detail: string,
): SignalOccurrence {
  return { id, year, region, industry, outcome, severity, detail, isLive: false, workspaceLink: null };
}

// ── Signal 1: Revenue Decline >10% ───────────────────────────
// Wraps crossDealPatterns' "flag-revenueDown10" (3 real hits today,
// 2 industries, includes a critical-severity case).

const revenueDeclineHistory: SignalOccurrence[] = [
  historical("rd-2018-1", 2018, "Europe", "solar", "Refinanced", "high", "Solar asset revenue fell 14% on a merchant-price correction; refinanced onto a fixed-price PPA within 9 months."),
  historical("rd-2019-1", 2019, "India", "wind", "Covenant Waiver", "high", "Wind asset revenue declined 11% following a weak monsoon wind season; lenders granted a covenant waiver pending resource recovery."),
  historical("rd-2020-1", 2020, "Middle East", "solar", "Recovered", "medium", "Revenue dipped 12% during regional curtailment events; recovered within two quarters as grid capacity was added."),
  historical("rd-2021-1", 2021, "Europe", "wind", "Covenant Waiver", "critical", "Revenue down 18% on sustained below-average wind resource; DSCR breach triggered a covenant waiver and revised sizing case."),
  historical("rd-2022-1", 2022, "Europe", "infrastructure", "Restructured", "high", "Anchor tenant revenue shortfall of 13% led to a restructuring of the senior facility repayment profile."),
  historical("rd-2023-1", 2023, "India", "solar", "Recovered", "medium", "Revenue decline of 10.5% tied to open-access regulatory changes; recovered after tariff renegotiation."),
  historical("rd-2024-1", 2024, "Middle East", "infrastructure", "Covenant Waiver", "high", "Logistics asset revenue fell 15% on volume softness; covenant waiver granted with a cash sweep mechanism attached."),
  historical("rd-2025-1", 2025, "Europe", "solar", "Refinanced", "medium", "PPA repricing at renewal drove an 11% revenue decline; refinanced at a lower gearing before the covenant tested."),
];

// ── Signal 2: Low Asset Health Score ─────────────────────────
// Wraps "flag-lowAssetHealth" (3 real hits today, 2 industries).

const lowAssetHealthHistory: SignalOccurrence[] = [
  historical("ah-2019-1", 2019, "India", "solar", "Recovered", "medium", "Asset health score fell to 58 on repeated inverter faults; recovered to 84 after a full inverter replacement program."),
  historical("ah-2020-1", 2020, "Europe", "wind", "Active Monitoring", "medium", "Gearbox wear across two turbines pushed the asset health score below 65; placed under enhanced monitoring."),
  historical("ah-2021-1", 2021, "Middle East", "solar", "Recovered", "low", "Elevated soiling losses lowered the health score temporarily; resolved with an updated cleaning cycle."),
  historical("ah-2022-1", 2022, "Europe", "wind", "Restructured", "high", "Persistent blade damage drove the health score to 52; O&M contract was restructured with new performance guarantees."),
  historical("ah-2023-1", 2023, "India", "wind", "Recovered", "medium", "Transformer degradation lowered the score below threshold; resolved after a mid-life refurbishment."),
  historical("ah-2024-1", 2024, "Europe", "solar", "Active Monitoring", "medium", "Tracker motor failures across one block kept the health score below 70 for two consecutive quarters."),
];

// ── Signal 3: Regulatory Risk Recurrence (regional) ──────────
// Wraps the live "regional-regulations" pattern (3 real hits today,
// spanning solar/wind/infrastructure).

const regulatoryRiskHistory: SignalOccurrence[] = [
  historical("rr-2018-1", 2018, "India", "solar", "Recovered", "medium", "State-level open-access charge changes created short-term merchant tail uncertainty; resolved via tariff clarification."),
  historical("rr-2019-1", 2019, "Europe", "wind", "Active Monitoring", "medium", "Permitting reform under negotiation created near-term uncertainty for repowering plans; monitored without asset impact."),
  historical("rr-2020-1", 2020, "Europe", "infrastructure", "Recovered", "low", "Planning consent conditions under standard review delayed a minor works package; resolved within one quarter."),
  historical("rr-2021-1", 2021, "Middle East", "infrastructure", "Active Monitoring", "low", "Regulatory review of logistics zoning flagged as a watch item; no realized impact to date."),
  historical("rr-2022-1", 2022, "India", "wind", "Refinanced", "medium", "Regulatory change to grid code compliance required capex; refinanced alongside the required upgrade."),
  historical("rr-2023-1", 2023, "Europe", "solar", "Recovered", "low", "Curtailment-related regulatory review resolved with no change to the project's grid connection terms."),
];

// ── Signal 4: Grid Connection Delays (fully historical) ──────
// No live crossDealPatterns counterpart today — a real, meaningful
// state: this pattern has not recurred in the current operating year.

const gridConnectionDelaysHistory: SignalOccurrence[] = [
  historical("gcd-2018-1", 2018, "India", "solar", "Active Monitoring", "medium", "Interconnection queue congestion delayed grid energization by 4 months; monitored through commissioning."),
  historical("gcd-2019-1", 2019, "Europe", "wind", "Covenant Waiver", "high", "Transmission operator delays pushed COD back 6 months; lenders granted a waiver on the longstop date."),
  historical("gcd-2020-1", 2020, "Middle East", "infrastructure", "Restructured", "high", "Substation construction delays required a restructuring of the construction facility drawdown schedule."),
  historical("gcd-2021-1", 2021, "Europe", "solar", "Sponsor Equity Injection", "high", "Grid operator capacity study delays extended the connection timeline; sponsor injected equity to bridge the gap."),
  historical("gcd-2022-1", 2022, "India", "wind", "Recovered", "medium", "Evacuation infrastructure delays resolved after a joint sponsor-utility escalation; COD achieved 2 months late."),
  historical("gcd-2023-1", 2023, "Europe", "infrastructure", "Refinanced", "medium", "Grid reinforcement works ran long; the facility was refinanced with an extended availability period."),
];

// ── Signal 5: EPC Cost Overruns (fully historical) ───────────

const epcCostOverrunsHistory: SignalOccurrence[] = [
  historical("epc-2018-1", 2018, "Middle East", "solar", "Covenant Waiver", "high", "EPC contractor change orders drove a 9% cost overrun; covenant waiver granted pending contingency drawdown."),
  historical("epc-2019-1", 2019, "Europe", "wind", "Restructured", "high", "Foundation remediation costs exceeded contingency; facility restructured with a supplemental sponsor facility."),
  historical("epc-2020-1", 2020, "India", "infrastructure", "Recovered", "medium", "Steel price escalation pushed costs above budget; absorbed within the sponsor's contingency reserve."),
  historical("epc-2021-1", 2021, "Europe", "solar", "Covenant Waiver", "medium", "Module supply delays and price escalation drove an 8% overrun; waiver granted with revised cost reporting."),
  historical("epc-2022-1", 2022, "Middle East", "wind", "Recovered", "low", "Minor logistics cost overrun on turbine delivery; absorbed without lender involvement."),
  historical("epc-2023-1", 2023, "India", "solar", "Refinanced", "medium", "Balance-of-plant cost overrun refinanced alongside a broader facility upsize at financial close for a follow-on phase."),
  historical("epc-2024-1", 2024, "Europe", "infrastructure", "Active Monitoring", "medium", "Fit-out cost inflation is being tracked against contingency; no covenant impact to date."),
];

// ── Signal 6: DSCR Breaches (fully historical) ───────────────
// Conceptually adjacent to the live revenue-decline world, without
// claiming a fake live hit — this signal has no 2026 occurrence.
// Contains this dataset's one seeded "Defaulted" outcome.

const dscrBreachesHistory: SignalOccurrence[] = [
  historical("dscr-2018-1", 2018, "Europe", "wind", "Covenant Waiver", "high", "DSCR fell to 1.18x on below-average wind resource; lenders granted a covenant waiver for two test dates."),
  historical("dscr-2019-1", 2019, "India", "solar", "Recovered", "medium", "DSCR dipped to 1.22x on delayed receivables; recovered above 1.30x once payment cycles normalized."),
  historical("dscr-2020-1", 2020, "Europe", "infrastructure", "Restructured", "high", "DSCR breach tied to occupancy shortfall led to a restructuring of the amortization profile."),
  historical("dscr-2021-1", 2021, "Middle East", "solar", "Covenant Waiver", "critical", "DSCR fell to 1.05x after a merchant tail repricing; waiver granted with a cash sweep and revised sizing case."),
  historical("dscr-2022-1", 2022, "Europe", "wind", "Defaulted", "critical", "DSCR remained below 1.0x for four consecutive quarters after a prolonged resource shortfall; the facility defaulted and was placed into workout."),
  historical("dscr-2023-1", 2023, "India", "wind", "Recovered", "medium", "DSCR breach resolved within one quarter following a tariff true-up mechanism."),
  historical("dscr-2024-1", 2024, "Europe", "solar", "Active Monitoring", "medium", "DSCR trending toward the 1.25x floor; under active monitoring, no breach recorded to date."),
];

const severityWeight: Record<Severity, number> = { critical: 4, high: 3, medium: 2, low: 1 };

function buildDistribution<K extends string>(items: K[], labelFor: (k: K) => string): DistributionEntry<K>[] {
  const counts = new Map<K, number>();
  for (const k of items) counts.set(k, (counts.get(k) ?? 0) + 1);
  const total = items.length;
  return [...counts.entries()]
    .map(([key, count]) => ({ key, label: labelFor(key), count, pct: Math.round((count / total) * 100) }))
    .sort((a, b) => b.count - a.count);
}

// 0-100, capped below 100 — a mock should never claim certainty. Occurrence
// depth is weighted highest (more recorded instances = stronger evidence
// this recurs), industry spread second (cross-sector recurrence is the
// clearest signal this isn't a one-off), year span and region spread
// reinforce from there. Scaled against this dataset's realistic ranges
// (occurrences ~6-12, years ~6-9, industries/regions capped at 3) so the
// score actually differentiates rather than every signal saturating.
function confidenceScore(occ: SignalOccurrence[]): number {
  const n = occ.length;
  const years = new Set(occ.map((o) => o.year)).size;
  const industries = new Set(occ.map((o) => o.industry)).size;
  const regionsN = new Set(occ.map((o) => o.region)).size;
  const occurrenceComponent = Math.min(45, n * 3.5);
  const yearComponent = Math.min(25, years * 3);
  const industryComponent = Math.min(15, industries * 5);
  const regionComponent = Math.min(12, regionsN * 4);
  const raw = occurrenceComponent + yearComponent + industryComponent + regionComponent;
  return Math.min(96, Math.round(raw));
}

function deriveImpact(occ: SignalOccurrence[]): ImpactLevel {
  const avgSeverity = occ.reduce((a, o) => a + severityWeight[o.severity], 0) / occ.length;
  const hasSevereOutcome = occ.some((o) => o.outcome === "Defaulted" || o.outcome === "Restructured");
  if (avgSeverity >= 3 || hasSevereOutcome) return "High";
  if (avgSeverity >= 2) return "Medium";
  return "Low";
}

function deriveSignalStats(signal: InstitutionalSignal): SignalStats {
  const occ = signal.occurrences;
  const projectIds = new Set(occ.map((o) => o.workspaceLink ?? o.id));
  const industries = new Set(occ.map((o) => o.industry));
  const regionsSet = new Set(occ.map((o) => o.region));
  const years = occ.map((o) => o.year);

  // Timeline: most recent + most severe first, deduped by year+region+industry,
  // top 3 — surfaces what's most actionable at a glance. Live/current-year
  // entries are capped at 2 of the 3 slots so at least one genuine historical
  // entry always survives when history exists — "institutional memory" means
  // showing depth over years, not letting today's live hits crowd out the past.
  const seen = new Set<string>();
  const byRecencyAndSeverity = [...occ].sort((a, b) => (b.year - a.year) || (severityWeight[b.severity] - severityWeight[a.severity]));
  const timeline: SignalOccurrence[] = [];
  let liveSlotsUsed = 0;
  const MAX_LIVE_SLOTS = 2;

  for (const o of byRecencyAndSeverity) {
    if (timeline.length === 3) break;
    const key = `${o.year}-${o.region}-${o.industry}`;
    if (seen.has(key)) continue;
    if (o.isLive && liveSlotsUsed >= MAX_LIVE_SLOTS) continue; // reserve a slot for history
    seen.add(key);
    timeline.push(o);
    if (o.isLive) liveSlotsUsed++;
  }
  if (timeline.length < 3) {
    for (const o of byRecencyAndSeverity) {
      if (timeline.length === 3) break;
      const key = `${o.year}-${o.region}-${o.industry}`;
      if (seen.has(key)) continue;
      seen.add(key);
      timeline.push(o);
    }
  }

  // Dominant outcome (plurality, non-"Active Monitoring" preferred) — kept
  // for the table's single-value "Historical Outcome" column.
  const outcomeCounts = new Map<OutcomeTag, number>();
  for (const o of occ) outcomeCounts.set(o.outcome, (outcomeCounts.get(o.outcome) ?? 0) + 1);
  const resolvedCounts = [...outcomeCounts.entries()].filter(([tag]) => tag !== "Active Monitoring");
  const rankedOutcomes = (resolvedCounts.length > 0 ? resolvedCounts : [...outcomeCounts.entries()]).sort((a, b) => b[1] - a[1]);
  const [outcome, count] = rankedOutcomes[0];

  // Full distributions — for the expanded row's outcome stacked bar /
  // industry bars / region bars.
  const outcomeDistribution = buildDistribution(occ.map((o) => o.outcome), (k) => k);
  const industryDistribution = buildDistribution(occ.map((o) => o.industry), (k) => k[0].toUpperCase() + k.slice(1));
  const regionDistribution = buildDistribution(occ.map((o) => o.region), (k) => k);

  // Evolution series: occurrence count per year, 2018-2026 inclusive,
  // 0-filled — feeds the "is this becoming more frequent" sparkline.
  const countByYear = new Map<number, number>();
  for (const o of occ) countByYear.set(o.year, (countByYear.get(o.year) ?? 0) + 1);
  const evolutionSeries: YearBucket[] = [];
  for (let y = 2018; y <= 2026; y++) evolutionSeries.push({ year: y, count: countByYear.get(y) ?? 0 });

  return {
    projectCount: projectIds.size,
    industryCount: industries.size,
    regionCount: regionsSet.size,
    firstSeenYear: Math.min(...years),
    lastSeenYear: Math.max(...years),
    timeline,
    outcomeStat: { outcome, count, total: occ.length, pct: Math.round((count / occ.length) * 100) },
    outcomeDistribution,
    industryDistribution,
    regionDistribution,
    evolutionSeries,
    impact: deriveImpact(occ),
    confidence: {
      score: confidenceScore(occ),
      occurrenceCount: occ.length,
      yearSpan: Math.max(...years) - Math.min(...years) + 1,
      industryCount: industries.size,
    },
    status: occ.some((o) => o.isLive) ? "Active" : "Dormant",
  };
}

export const institutionalSignals: InstitutionalSignal[] = [
  {
    id: "sig-revenue-decline",
    title: "Revenue Decline >10%",
    insight: "Revenue declines above 10% have historically led to covenant waivers or refinancing within 6–12 months.",
    patternId: "flag-revenueDown10",
    relatedSignalIds: ["sig-low-asset-health", "sig-regulatory-risk", "sig-dscr-breaches"],
    occurrences: [...revenueDeclineHistory, ...liveOccurrences("flag-revenueDown10", "Active Monitoring")],
    frequency: "Increasing",
    recurringSinceYear: 2018,
  },
  {
    id: "sig-low-asset-health",
    title: "Low Asset Health Score",
    insight: "Sustained low asset health scores are usually resolved operationally, rarely triggering financial restructuring.",
    patternId: "flag-lowAssetHealth",
    relatedSignalIds: ["sig-revenue-decline"],
    occurrences: [...lowAssetHealthHistory, ...liveOccurrences("flag-lowAssetHealth", "Active Monitoring")],
    frequency: "Stable",
    recurringSinceYear: 2019,
  },
  {
    id: "sig-regulatory-risk",
    title: "Regulatory Risk Recurrence",
    insight: "Recurring regulatory and permitting risks are typically absorbed operationally rather than becoming credit events.",
    patternId: "regional-regulations",
    relatedSignalIds: ["sig-revenue-decline", "sig-grid-connection-delays"],
    occurrences: [...regulatoryRiskHistory, ...liveOccurrences("regional-regulations", "Active Monitoring")],
    frequency: "Stable",
    recurringSinceYear: 2018,
  },
  {
    id: "sig-grid-connection-delays",
    title: "Grid Connection Delays",
    insight: "Grid connection delays have historically required sponsor support or covenant relief, but have not recurred in the current year.",
    patternId: null,
    relatedSignalIds: ["sig-epc-cost-overruns", "sig-regulatory-risk"],
    occurrences: [...gridConnectionDelaysHistory],
    frequency: "Declining",
    recurringSinceYear: 2018,
  },
  {
    id: "sig-epc-cost-overruns",
    title: "EPC Cost Overruns",
    insight: "EPC cost overruns recur roughly once a year across the portfolio and are usually absorbed within contingency.",
    patternId: null,
    relatedSignalIds: ["sig-grid-connection-delays", "sig-dscr-breaches"],
    occurrences: [...epcCostOverrunsHistory],
    frequency: "Stable",
    recurringSinceYear: 2018,
  },
  {
    id: "sig-dscr-breaches",
    title: "DSCR Breaches",
    insight: "DSCR breaches recur every year across the portfolio and carry the highest tail risk of any signal, including this dataset's only default.",
    patternId: null,
    relatedSignalIds: ["sig-revenue-decline", "sig-epc-cost-overruns"],
    occurrences: [...dscrBreachesHistory],
    frequency: "Every Year",
    recurringSinceYear: 2018,
  },
];

export const institutionalSignalStats: Record<string, SignalStats> = Object.fromEntries(
  institutionalSignals.map((s) => [s.id, deriveSignalStats(s)]),
);
