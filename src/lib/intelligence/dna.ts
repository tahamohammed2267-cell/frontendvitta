// ─────────────────────────────────────────────────────────────
// Investment DNA — moved out of intelligenceData.ts (Phase 2) so
// it's a leaf module with no dependency on decisions/playbooks/
// analystIntelligence/recommendations, all of which need dealDNA
// for similarity-derived cross-links. Keeping DNA here (rather than
// in intelligenceData.ts, which now re-exports everything) avoids
// a circular import: those modules can import dealDNA directly from
// here without ever importing back through intelligenceData.ts.
//
// Honest-mock discipline unchanged from Phase 1: Helios is scored
// from real per-field/per-risk evidence; the other 4 deals score
// from coarse Project summary indicators only; 4 dimensions are
// explicitly "not yet assessed" for every deal.
// ─────────────────────────────────────────────────────────────

import { canonicalFields, projects, risks, type Project } from "../mockData";

export type DNADimension =
  | "financial" | "technical" | "commercial" | "legal" | "esgRisk"
  | "operational" | "market" | "execution" | "management";

export type DNAAssessmentBasis = "full-evidence" | "summary-indicators" | "not-assessed";

export const dnaDimensionLabels: Record<DNADimension, string> = {
  financial: "Financial", technical: "Technical", commercial: "Commercial", legal: "Legal", esgRisk: "ESG & Risk",
  operational: "Operational", market: "Market", execution: "Execution", management: "Management",
};

export interface DNADimensionScore {
  dimension: DNADimension;
  score: number | null; // 0-100, null when basis is "not-assessed"
  basis: DNAAssessmentBasis;
  summary: string;
  linkedRiskIds?: string[];
  linkedFieldIds?: string[];
}

export interface SimilarDealMatch {
  dealId: string;
  similarityScore: number; // 0-100
  matchReasons: string[];
}

export interface DealDNA {
  dealId: string;
  dimensions: DNADimensionScore[];
  similarDeals: SimilarDealMatch[];
  overallConfidence: "high" | "medium" | "low";
}

const unassessedDimensions: DNADimension[] = ["operational", "market", "execution", "management"];

function fieldsByCategory(dealId: string, category: string) {
  if (dealId !== "helios") return [];
  return canonicalFields.filter((f) => f.category === category);
}
function risksByCategory(dealId: string, category: string) {
  if (dealId !== "helios") return [];
  return risks.filter((r) => r.category === category);
}

// Helios: scored from real per-field/per-risk evidence.
function heliosDimension(dimension: DNADimension, category: string, summary: string): DNADimensionScore {
  const fields = fieldsByCategory("helios", category);
  const dealRisks = risksByCategory("helios", category);
  const avgFieldConfidence = fields.length ? fields.reduce((a, f) => a + f.confidence, 0) / fields.length : 0.7;
  const riskPenalty = dealRisks.reduce((a, r) => a + (r.severity === "critical" ? 25 : r.severity === "high" ? 15 : r.severity === "medium" ? 8 : 3), 0);
  const score = Math.max(10, Math.min(95, Math.round(avgFieldConfidence * 100 - riskPenalty)));
  return {
    dimension, score, basis: "full-evidence", summary,
    linkedRiskIds: dealRisks.map((r) => r.id),
    linkedFieldIds: fields.map((f) => f.id),
  };
}

// Other 4 deals: scored only from coarse summary indicators already on Project — thinner, not fabricated.
function summaryDimension(dimension: DNADimension, project: Project, weight: number): DNADimensionScore {
  const fieldRatio = project.fieldsTotal > 0 ? project.fieldsConfirmed / project.fieldsTotal : 0;
  const riskLoad = project.openRisks.critical * 4 + project.openRisks.high * 2 + project.openRisks.medium;
  const score = Math.max(15, Math.min(90, Math.round(fieldRatio * 80 * weight - riskLoad + 20)));
  return {
    dimension, score, basis: "summary-indicators",
    summary: `Derived from ${project.fieldsConfirmed}/${project.fieldsTotal} fields confirmed and ${project.openConflicts} open conflicts — no deal-level ${dnaDimensionLabels[dimension].toLowerCase()} evidence has been reviewed yet.`,
  };
}

function notAssessed(dimension: DNADimension): DNADimensionScore {
  return { dimension, score: null, basis: "not-assessed", summary: `No ${dnaDimensionLabels[dimension].toLowerCase()} data has been captured for this deal yet.` };
}

function buildDimensions(project: Project): DNADimensionScore[] {
  const scored: DNADimensionScore[] =
    project.id === "helios"
      ? [
          heliosDimension("financial", "Financing", "Gearing, facility sizing and DSCR headroom assessed from the executed term sheet."),
          heliosDimension("technical", "Technical", "Yield, capacity and degradation assessed from the independent resource report and EPC contract."),
          heliosDimension("commercial", "Revenue", "PPA tariff, tenor and escalation assessed from the executed offtake agreement."),
          heliosDimension("legal", "Timeline", "Land lease tenor and contract structure reviewed against debt tenor."),
          heliosDimension("esgRisk", "Costs", "Environmental permit conditions and curtailment exposure under review."),
        ]
      : [
          summaryDimension("financial", project, 1.1),
          summaryDimension("technical", project, 1.0),
          summaryDimension("commercial", project, 0.9),
          summaryDimension("legal", project, 0.85),
          summaryDimension("esgRisk", project, 0.8),
        ];
  return [...scored, ...unassessedDimensions.map(notAssessed)];
}

function overallConfidence(dimensions: DNADimensionScore[]): DealDNA["overallConfidence"] {
  const fullEvidenceCount = dimensions.filter((d) => d.basis === "full-evidence").length;
  const assessedCount = dimensions.filter((d) => d.basis !== "not-assessed").length;
  if (fullEvidenceCount >= 4) return "high";
  if (assessedCount >= 3) return "medium";
  return "low";
}

function findSimilarDeals(project: Project): SimilarDealMatch[] {
  return projects
    .filter((p) => p.id !== project.id)
    .map((p) => {
      const reasons: string[] = [];
      let score = 0;
      if (p.technology === project.technology) { reasons.push(`Same technology (${p.technology})`); score += 40; }
      if (p.infraSubType && p.infraSubType === project.infraSubType) { reasons.push(`Same asset type (${p.infraSubType})`); score += 15; }
      if (p.countryCode === project.countryCode) { reasons.push(`Same country (${p.country})`); score += 15; }
      const sizeDiffPct = Math.abs(p.dealSizeM - project.dealSizeM) / Math.max(project.dealSizeM, 1);
      if (sizeDiffPct < 0.5) { reasons.push(`Comparable deal size (€${p.dealSizeM}M vs €${project.dealSizeM}M)`); score += Math.round(20 * (1 - sizeDiffPct)); }
      if (project.capacityMW && p.capacityMW) {
        const capDiffPct = Math.abs(p.capacityMW - project.capacityMW) / Math.max(project.capacityMW, 1);
        if (capDiffPct < 0.6) { reasons.push(`Comparable capacity (${p.capacityMW} MW vs ${project.capacityMW} MW)`); score += Math.round(10 * (1 - capDiffPct)); }
      }
      return { dealId: p.id, similarityScore: Math.min(95, score), matchReasons: reasons };
    })
    .filter((m) => m.matchReasons.length > 0)
    .sort((a, b) => b.similarityScore - a.similarityScore);
}

export const dealDNA: Record<string, DealDNA> = Object.fromEntries(
  projects.map((project) => {
    const dimensions = buildDimensions(project);
    const dna: DealDNA = { dealId: project.id, dimensions, similarDeals: findSimilarDeals(project), overallConfidence: overallConfidence(dimensions) };
    return [project.id, dna];
  })
);

export function dnaForDeal(dealId: string) {
  return dealDNA[dealId];
}
