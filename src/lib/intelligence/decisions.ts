// ─────────────────────────────────────────────────────────────
// Investment Decisions — full institutional decision history.
// Extends Phase 1's ICDecision with participants, assumption
// tracking, historical outcome tracking, and cross-links to other
// decisions/playbooks/observations. "relevantHistoricalDecisions"
// is derived from dealDNA's similarity matching (already computed
// in Phase 1) rather than hand-authored, so it stays honest by
// construction — the same discipline as findSimilarDeals.
// ─────────────────────────────────────────────────────────────

import { dealDNA } from "./dna";
import { projects } from "../mockData";
import { dealRef, type EntityRef } from "./crossLinks";

export type DecisionOutcome = "approved" | "passed" | "pending";

export type DecisionParticipantRole = "Chair" | "Voting Member" | "Presenting Analyst" | "Observer";
export interface DecisionParticipant {
  name: string;
  role: DecisionParticipantRole;
}

export type AssumptionStatus = "held" | "did-not-hold" | "too-early-to-tell";
export interface DecisionAssumption {
  text: string;
  status: AssumptionStatus;
  note?: string;
}

export type OutcomeTrackingStatus = "on-track" | "underperforming" | "outperforming" | "too-early" | "not-tracked";
export interface HistoricalOutcomeTracking {
  status: OutcomeTrackingStatus;
  asOf?: string;
  note: string;
}

export interface ICDecision {
  dealId: string;
  outcome: DecisionOutcome;
  decisionDate?: string;
  rationale: string;
  keyFactors: string[];
  linkedRiskIds?: string[];
  participants: DecisionParticipant[];
  assumptions: DecisionAssumption[];
  historicalOutcome: HistoricalOutcomeTracking;
  relevantHistoricalDecisions: EntityRef[];
  relatedPlaybooks: EntityRef[];
  relatedObservations: EntityRef[];
}

const baseDecisions: Omit<ICDecision, "relevantHistoricalDecisions" | "relatedPlaybooks" | "relatedObservations">[] = [
  {
    dealId: "helios", outcome: "pending",
    rationale: "Still in diligence. The O&M agreement is unsigned and curtailment exposure is unquantified — both are conditions precedent flagged for resolution before financial close, per the current term sheet draft.",
    keyFactors: ["Executed 10-year PPA at €52.40/MWh", "Fixed-price EPC at €96.4M", "Strong P50 yield (1,812 kWh/kWp)", "O&M agreement still in draft"],
    linkedRiskIds: ["r1", "r2", "r3"],
    participants: [
      { name: "J. Moreau", role: "Presenting Analyst" },
      { name: "R. Chen", role: "Presenting Analyst" },
    ],
    assumptions: [
      { text: "PPA tariff of €52.40/MWh clears the term sheet's €54.00/MWh sizing floor before final DSCR is locked.", status: "too-early-to-tell", note: "Diligence still in progress — facility not yet sized against the executed tariff." },
      { text: "O&M agreement executes on materially the same terms as the current draft (€11.2k/MWp/yr).", status: "too-early-to-tell", note: "Agreement remains unsigned; scope and pricing could still move." },
    ],
    historicalOutcome: { status: "too-early", note: "Deal has not reached a financial close or IC vote; no post-decision outcome exists yet." },
  },
  {
    dealId: "boreas", outcome: "pending",
    rationale: "IC memo drafted; deal is proceeding to committee with 22/22 documents uploaded and 141/148 fields confirmed. One open conflict remains to be resolved ahead of the committee date.",
    keyFactors: ["210 MW onshore wind, Germany", "€284M deal size — largest in the current pipeline", "22/22 documents collected"],
    participants: [{ name: "A. Lindqvist", role: "Presenting Analyst" }],
    assumptions: [
      { text: "The single open conflict resolves without materially changing facility sizing.", status: "too-early-to-tell", note: "Conflict remains open as of the IC memo draft." },
    ],
    historicalOutcome: { status: "too-early", note: "Deal has not reached an IC vote yet; no outcome exists to track." },
  },
  {
    dealId: "meridian", outcome: "pending",
    rationale: "Early-stage diligence — document collection is 8/16 complete with 6 open conflicts. Too early for a committee view; the deal team is still building the canonical data set.",
    keyFactors: ["Shopping complex, United Kingdom", "€142M deal size", "6 open conflicts, 34/96 fields confirmed"],
    participants: [{ name: "S. Okafor", role: "Presenting Analyst" }],
    assumptions: [],
    historicalOutcome: { status: "not-tracked", note: "Deal is in early diligence; no decision has been made and no outcome exists to track." },
  },
  {
    dealId: "atlas", outcome: "approved", decisionDate: "2026-04-02",
    rationale: "Approved on a clean diligence file — 118/118 fields confirmed, zero open conflicts, and only low/medium residual risk. The hostel asset's income profile and location supported a straightforward committee decision.",
    keyFactors: ["118/118 fields confirmed, zero open conflicts", "Clean risk profile (0 critical, 0 high)", "€58M deal size, Portugal"],
    participants: [
      { name: "M. Ferreira", role: "Presenting Analyst" },
      { name: "J. Moreau", role: "Chair" },
      { name: "A. Lindqvist", role: "Voting Member" },
    ],
    assumptions: [
      { text: "Full document collection ahead of IC would translate into a faster committee decision.", status: "held", note: "Committee reached a decision at first presentation, with no follow-up conditions attached." },
      { text: "Clean risk profile (0 critical/high) would hold through to close.", status: "held", note: "No new critical or high-severity risks have been raised since approval." },
    ],
    historicalOutcome: { status: "on-track", asOf: "2026-07-01", note: "Deal closed on schedule. This is a summary-level check against the original diligence file, not an operational performance review — full post-close monitoring lives in Portfolio Monitoring, not here." },
  },
  {
    dealId: "zephyr", outcome: "passed", decisionDate: "2026-02-20",
    rationale: "Passed at committee. Despite a complete document set (11/11) and no open conflicts, the deal did not clear the firm's return hurdle at the sized tariff — archived rather than progressed to financial close.",
    keyFactors: ["96 MW onshore wind, Denmark", "Complete document set, no open conflicts", "Did not clear return hurdle at committee"],
    participants: [
      { name: "J. Moreau", role: "Presenting Analyst" },
      { name: "J. Moreau", role: "Chair" },
    ],
    assumptions: [
      { text: "A complete, conflict-free document set is not on its own sufficient to clear the return hurdle.", status: "held", note: "Confirmed at committee — full documentation did not offset the tariff-driven return shortfall." },
    ],
    historicalOutcome: { status: "not-tracked", note: "Deal was not progressed past committee; no post-decision performance exists to track." },
  },
];

function relevantHistoricalDecisions(dealId: string): EntityRef[] {
  const similar = dealDNA[dealId]?.similarDeals ?? [];
  return similar
    .filter((m) => baseDecisions.some((d) => d.dealId === m.dealId))
    .slice(0, 3)
    .map((m) => dealRef(m.dealId, "decision"));
}

// relatedPlaybooks/relatedObservations are filled in by attachDecisionCrossLinks()
// (called once from intelligenceData.ts, after playbooks.ts/analystIntelligence.ts
// exist) rather than imported here directly, to avoid a circular import between
// decisions.ts <-> playbooks.ts/analystIntelligence.ts (both of those modules
// themselves reference decisions/patterns).
export const icDecisions: ICDecision[] = baseDecisions.map((d) => ({
  ...d,
  relevantHistoricalDecisions: relevantHistoricalDecisions(d.dealId),
  relatedPlaybooks: [],
  relatedObservations: [],
}));

export function decisionForDeal(dealId: string) {
  return icDecisions.find((d) => d.dealId === dealId);
}

export function attachDecisionCrossLinks(playbookRefByTechnology: Map<string, EntityRef>, observationRefsByDeal: Map<string, EntityRef[]>) {
  for (const d of icDecisions) {
    const project = projects.find((p) => p.id === d.dealId);
    const playbookRef = project ? playbookRefByTechnology.get(project.technology) : undefined;
    d.relatedPlaybooks = playbookRef ? [playbookRef] : [];
    d.relatedObservations = observationRefsByDeal.get(d.dealId) ?? [];
  }
}
