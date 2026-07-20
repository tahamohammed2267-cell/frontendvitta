// ─────────────────────────────────────────────────────────────
// Pattern Library — moved out of intelligenceData.ts (Phase 2) so
// it's a leaf module, same reasoning as dna.ts: playbooks.ts and
// recommendations.ts both need `patterns` and must not import it
// back through intelligenceData.ts (which re-exports everything
// and would create a circular import / TDZ hazard).
//
// 4 categories only — every category below is directly backed by a
// real risk/conflict on Project Helios. The spec's other 6
// categories (cost overruns, EPC delays, vendor issues, construction
// delays, operational failures, revenue leakage, margin
// deterioration) have zero backing data across the 5-deal universe
// and are intentionally not seeded.
// ─────────────────────────────────────────────────────────────

export type PatternCategory = "financing" | "legal-contract" | "regulatory-permitting" | "technical-yield";

export const patternCategoryLabels: Record<PatternCategory, string> = {
  financing: "Financing issues", "legal-contract": "Legal & contract risk",
  "regulatory-permitting": "Regulatory & permitting risk", "technical-yield": "Technical & yield risk",
};

export interface PatternCase { dealId: string; riskId?: string; conflictId?: string; note: string }

export interface Pattern {
  id: string;
  category: PatternCategory;
  title: string;
  frequency: number;
  confidence: "high" | "medium" | "low";
  similarCases: PatternCase[];
  businessImpact: string;
  aiExplanation: string;
}

export const patterns: Pattern[] = [
  {
    id: "pat1", category: "financing", title: "Executed PPA tariff sizing below term sheet floor",
    frequency: 1, confidence: "high",
    similarCases: [{ dealId: "helios", riskId: "r1", note: "Executed PPA at €52.40/MWh vs €54.00/MWh term sheet floor — DSCR compresses toward target in Years 3–5." }],
    businessImpact: "Base-case DSCR coverage risk in mid-tenor years without a revenue top-up mechanism.",
    aiExplanation: "When a term sheet is sized ahead of PPA execution, the signed tariff can land below the sizing assumption. Confirm which document governs before facility close.",
  },
  {
    id: "pat2", category: "legal-contract", title: "O&M agreement unsigned at IC stage",
    frequency: 1, confidence: "high",
    similarCases: [{ dealId: "helios", riskId: "r2", note: "O&M agreement still in draft; extracted pricing is indicative, scope not fixed." }],
    businessImpact: "Draft O&M pricing at IC stage has historically added time to close while final terms are negotiated.",
    aiExplanation: "Unsigned O&M agreements at investment committee are a recurring critical-path item — push for execution before committee where possible.",
  },
  {
    id: "pat3", category: "legal-contract", title: "Land lease term shorter than debt tenor",
    frequency: 1, confidence: "medium",
    similarCases: [{ dealId: "helios", riskId: "r4", note: "25-year lease + 5-year lessor-discretion extension vs 17-year debt tenor plus tail." }],
    businessImpact: "Refinancing or extension risk if the lessor declines to exercise the extension option.",
    aiExplanation: "Extension options exercisable solely at the lessor's discretion carry structuring risk — a unilateral extension right materially de-risks this pattern.",
  },
  {
    id: "pat4", category: "technical-yield", title: "Curtailment exposure unquantified in yield case",
    frequency: 1, confidence: "medium",
    similarCases: [{ dealId: "helios", riskId: "r3", note: "Yield report assumes zero curtailment; regional curtailment ran 2.1% in 2025." }],
    businessImpact: "Base-case generation may overstate realizable revenue if curtailment is not priced into the P50 case.",
    aiExplanation: "Grid connection agreements silent on curtailment compensation, paired with a zero-curtailment yield assumption, understate downside generation risk.",
  },
  {
    id: "pat5", category: "regulatory-permitting", title: "Conditional environmental approval pending mitigation plan",
    frequency: 1, confidence: "low",
    similarCases: [{ dealId: "helios", riskId: "r5", note: "Environmental approval conditional on habitat mitigation plan; extraction still in progress." }],
    businessImpact: "Construction sequencing risk if mitigation plan approval lags the EPC schedule.",
    aiExplanation: "Conditional environmental approvals tied to a mitigation plan can affect construction sequencing if not resolved ahead of notice-to-proceed.",
  },
  {
    id: "pat6", category: "financing", title: "CAPEX figures diverge between EPC contract and financial model",
    frequency: 1, confidence: "medium",
    similarCases: [{ dealId: "helios", conflictId: "c1", note: "€96.4M (EPC) vs €98.1M (model) vs €94.8M (investor deck) — three candidate CAPEX values." }],
    businessImpact: "Facility sizing depends on which CAPEX figure governs; reconciliation is a precondition to final debt quantum.",
    aiExplanation: "Where a fixed-price EPC contract exists, it should govern over a pre-signing financial model draft or investor materials — reconcile before sizing the facility.",
  },
];

export function patternsForDeal(dealId: string) {
  return patterns.filter((p) => p.similarCases.some((c) => c.dealId === dealId));
}
