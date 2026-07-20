// ─────────────────────────────────────────────────────────────
// Institutional Playbooks — sector-specific accumulated knowledge.
// Only technologies with at least one completed/in-flight deal get
// a playbook: Solar (Helios), Wind (Boreas + Zephyr), Infrastructure
// (Meridian + Atlas). Battery Storage / Logistics / Data Centre are
// NOT seeded — zero deals of those types exist anywhere in this
// mock, so a playbook there would have no sourceDeals and would be
// pure fabrication.
//
// Coverage labeling: "established" describes evidence DEPTH, not
// deal count — Solar earns it because Helios has real per-field/
// per-risk backing. Wind and Infrastructure are "emerging" because
// their only backing is coarse Project summary fields (no
// canonicalFields/risks records exist for those 4 deals). Every
// subsection that has nothing real to say is basis:"insufficient-
// data" with an empty items array, rendered as an honest gap in
// the UI rather than invented content.
// ─────────────────────────────────────────────────────────────

import { patterns } from "./patterns";
import { benchmarks, projects, type Technology } from "../mockData";
import { dealRef, type EntityRef } from "./crossLinks";

export type PlaybookCoverage = "established" | "emerging" | "insufficient-data";
export type SubsectionBasis = "deal-evidence" | "summary-indicators" | "insufficient-data";

export interface PlaybookSubsection {
  items: string[];
  basis: SubsectionBasis;
  sourceDeals: EntityRef[];
}

export interface Playbook {
  id: string;
  technology: Technology;
  title: string;
  coverage: PlaybookCoverage;
  dealsContributing: number;
  lastReinforcedAt: string;
  lastReinforcedBy: EntityRef[];

  typicalLifecycle: PlaybookSubsection;
  commonRisks: PlaybookSubsection;
  financialBenchmarks: PlaybookSubsection;
  operationalBenchmarks: PlaybookSubsection;
  frequentDDFindings: PlaybookSubsection;
  commonLegalIssues: PlaybookSubsection;
  commonTechnicalIssues: PlaybookSubsection;
  commonFinancingStructures: PlaybookSubsection;
  successfulStrategies: PlaybookSubsection;
  valueCreationInitiatives: PlaybookSubsection;
  frequentMistakes: PlaybookSubsection;
  bestPractices: PlaybookSubsection;
  lessonsLearned: PlaybookSubsection;

  relatedPatterns: EntityRef[];
  relatedBenchmarkMetrics: string[];
}

const empty = (): PlaybookSubsection => ({ items: [], basis: "insufficient-data", sourceDeals: [] });

const solarPatternRefs: EntityRef[] = patterns.filter((p) => p.similarCases.some((c) => c.dealId === "helios")).map((p) => ({ kind: "pattern", id: p.id, label: p.title }));

const heliosRef = dealRef("helios", "playbook");

export const playbooks: Playbook[] = [
  {
    id: "pb-solar", technology: "Solar", title: "Solar Playbook",
    coverage: "established", dealsContributing: 1, lastReinforcedAt: "2026-07-18", lastReinforcedBy: [heliosRef],
    typicalLifecycle: {
      items: [
        "Document collection: PPA, EPC contract, financial model, resource/yield report, land lease collected first (blocking items)",
        "Grid connection agreement and O&M agreement typically follow, often still in draft at this stage",
        "Environmental/permitting documents can lag and carry conditional approvals into IC review",
        "Field reconciliation (CAPEX, tariff, yield conflicts) happens in parallel with document collection, not after it",
      ], basis: "summary-indicators", sourceDeals: [heliosRef],
    },
    commonRisks: {
      items: [
        "PPA tariff sized below the lender term sheet's sizing floor (pat1)",
        "O&M agreement still in draft at IC stage (pat2)",
        "Curtailment exposure not quantified in the yield case (pat4)",
        "Conditional environmental approval pending a mitigation plan (pat5)",
      ], basis: "deal-evidence", sourceDeals: [heliosRef],
    },
    financialBenchmarks: {
      items: benchmarks.rows.map((r) => `${r.metric}: ${r.currentValueDisplay} vs peer ${r.benchmarkDisplay} (${r.verdict === "inline" ? "in range" : r.verdict === "above" ? "above range" : "below range"})`),
      basis: "deal-evidence", sourceDeals: [heliosRef],
    },
    operationalBenchmarks: {
      items: ["P50 yield of 1,812 kWh/kWp — above the P75 of the peer set, though not curtailment-adjusted", "Module degradation assumed at 0.45%/yr"],
      basis: "deal-evidence", sourceDeals: [heliosRef],
    },
    frequentDDFindings: {
      items: ["CAPEX figures diverge between EPC contract, financial model and investor materials (pat6) — EPC contract should govern when fixed-price"],
      basis: "deal-evidence", sourceDeals: [heliosRef],
    },
    commonLegalIssues: {
      items: ["Land lease tenor shorter than debt tenor, with lessor-discretion (not unilateral) extension rights (pat3)"],
      basis: "deal-evidence", sourceDeals: [heliosRef],
    },
    commonTechnicalIssues: {
      items: ["Grid connection agreements silent on curtailment compensation, paired with zero-curtailment yield assumptions (pat4)"],
      basis: "deal-evidence", sourceDeals: [heliosRef],
    },
    commonFinancingStructures: {
      items: ["~70% gearing, senior secured facility sized off fixed-price EPC contract value", "Debt tenor commonly shorter than land lease term — verify the reverse doesn't hold"],
      basis: "deal-evidence", sourceDeals: [heliosRef],
    },
    successfulStrategies: {
      items: ["Reconciling CAPEX/tariff conflicts against the governing executed contract before facility sizing, rather than after"],
      basis: "deal-evidence", sourceDeals: [heliosRef],
    },
    valueCreationInitiatives: empty(),
    frequentMistakes: {
      items: ["Sizing the term sheet ahead of PPA execution, then treating the pre-signing tariff as the effective floor"],
      basis: "deal-evidence", sourceDeals: [heliosRef],
    },
    bestPractices: {
      items: ["Push for O&M agreement execution before IC rather than proceeding on indicative draft pricing", "Request a curtailment study from the TSO before finalizing the yield case"],
      basis: "deal-evidence", sourceDeals: [heliosRef],
    },
    lessonsLearned: {
      items: [
        "Always reconcile EPC lump sum against model contingency before sizing the facility",
        "Confirm which document governs when term-sheet sizing tariffs lag executed PPAs",
        "Check land lease extension mechanics early — lessor-discretion extensions are a structuring risk, not a formality",
        "Draft insurance placement slips routinely miss business-interruption cover for curtailment — verify before relying on them",
      ], basis: "deal-evidence", sourceDeals: [heliosRef],
    },
    relatedPatterns: solarPatternRefs,
    relatedBenchmarkMetrics: benchmarks.rows.map((r) => r.metric),
  },
  buildSummaryPlaybook("Wind", "Wind Playbook", "pb-wind", ["boreas", "zephyr"]),
  buildSummaryPlaybook("Infrastructure", "Infrastructure Playbook", "pb-infra", ["meridian", "atlas"]),
];

function buildSummaryPlaybook(technology: Technology, title: string, id: string, dealIds: string[]): Playbook {
  const deals = projects.filter((p) => dealIds.includes(p.id));
  const refs = deals.map((d) => dealRef(d.id, "playbook"));
  const mostRecent = [...deals].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  const totalHighCriticalRisks = deals.reduce((a, d) => a + d.openRisks.critical + d.openRisks.high, 0);
  const totalConflicts = deals.reduce((a, d) => a + d.openConflicts, 0);
  const avgFieldCompletion = Math.round((deals.reduce((a, d) => a + (d.fieldsTotal > 0 ? d.fieldsConfirmed / d.fieldsTotal : 0), 0) / deals.length) * 100);

  return {
    id, technology, title,
    coverage: "emerging", dealsContributing: deals.length, lastReinforcedAt: mostRecent.createdAt, lastReinforcedBy: [dealRef(mostRecent.id, "playbook")],
    typicalLifecycle: {
      items: [`${deals.length} deal${deals.length === 1 ? "" : "s"} in the pipeline reached an average of ${avgFieldCompletion}% field confirmation at their current stage — insufficient volume to characterize a typical lifecycle beyond that.`],
      basis: "summary-indicators", sourceDeals: refs,
    },
    commonRisks: {
      items: [`Across ${deals.length} deals: ${totalHighCriticalRisks} combined critical/high-severity open risk items (${deals.map((d) => `${d.name}: ${d.openRisks.critical} critical, ${d.openRisks.high} high`).join("; ")}) — no document-level risk categorization exists yet to characterize these further.`],
      basis: "summary-indicators", sourceDeals: refs,
    },
    financialBenchmarks: {
      items: deals.map((d) => `${d.name}: €${d.dealSizeM}M deal size${d.capacityMW ? `, ${d.capacityMW} MW` : ""}`),
      basis: "summary-indicators", sourceDeals: refs,
    },
    operationalBenchmarks: empty(),
    frequentDDFindings: {
      items: [`${totalConflicts} combined open conflicts across ${deals.length} deals — field-level conflict detail is not available for technologies without canonical field extraction on file.`],
      basis: "summary-indicators", sourceDeals: refs,
    },
    commonLegalIssues: empty(),
    commonTechnicalIssues: empty(),
    commonFinancingStructures: empty(),
    successfulStrategies: technology === "Infrastructure"
      ? { items: ["Atlas closed with 0 open conflicts and 118/118 fields confirmed — full document collection ahead of IC review correlated with a single-pass committee decision."], basis: "deal-evidence", sourceDeals: [dealRef("atlas", "playbook")] }
      : empty(),
    valueCreationInitiatives: empty(),
    frequentMistakes: empty(),
    bestPractices: technology === "Infrastructure"
      ? { items: ["Sequence document collection to be complete before scheduling IC, per Atlas's clean file precedent."], basis: "deal-evidence", sourceDeals: [dealRef("atlas", "playbook")] }
      : empty(),
    lessonsLearned: technology === "Wind"
      ? { items: ["A complete, conflict-free document set is not on its own sufficient to clear the return hurdle — Zephyr passed at committee despite a clean file."], basis: "deal-evidence", sourceDeals: [dealRef("zephyr", "playbook")] }
      : empty(),
    relatedPatterns: [],
    relatedBenchmarkMetrics: [],
  };
}

export function playbookForTechnology(technology: string) {
  return playbooks.find((p) => p.technology === technology);
}

export function playbookRefByTechnology(): Map<string, EntityRef> {
  const map = new Map<string, EntityRef>();
  for (const pb of playbooks) map.set(pb.technology, { kind: "playbook", id: pb.id, label: pb.title });
  return map;
}
