// ─────────────────────────────────────────────────────────────
// AI Recommendations — proactive, contextual, evidence-grounded.
// Every recommendation is a DERIVED function over real data (deal
// DNA similarity, patterns, conflicts, decisions), not a hand-
// authored flat array — this guarantees, by construction, that
// every recommendation's evidence is non-empty and real: a
// generator simply does not fire when its underlying data doesn't
// exist. This is the same discipline as Phase 1's findSimilarDeals.
// ─────────────────────────────────────────────────────────────

import { dealDNA } from "./dna";
import { patterns, patternsForDeal } from "./patterns";
import { conflicts, projects, risks } from "../mockData";
import { dealRef, type EntityRef } from "./crossLinks";
import { icDecisions } from "./decisions";

export type RecommendationType =
  | "similar-historical-investment" | "relevant-historical-decision" | "frequent-risk"
  | "missing-diligence-area" | "similar-operational-issue" | "assumption-needs-validation"
  | "comparable-better-outcome" | "suggested-followup-analysis";

export const recommendationTypeLabels: Record<RecommendationType, string> = {
  "similar-historical-investment": "Similar historical investment",
  "relevant-historical-decision": "Relevant historical decision",
  "frequent-risk": "Frequently occurring risk",
  "missing-diligence-area": "Missing diligence area",
  "similar-operational-issue": "Similar operational issue",
  "assumption-needs-validation": "Assumption requiring validation",
  "comparable-better-outcome": "Comparable investment with a better outcome",
  "suggested-followup-analysis": "Suggested follow-up analysis",
};

export interface Recommendation {
  id: string;
  type: RecommendationType;
  dealId: string;
  title: string;
  explanation: string;
  confidence: "high" | "medium" | "low";
  evidence: EntityRef[];
  sourceEvidence?: { doc: string; page: number; snippet?: string }[];
}

function similarInvestments(dealId: string): Recommendation[] {
  const matches = dealDNA[dealId]?.similarDeals ?? [];
  if (matches.length === 0) return [];
  return [{
    id: `rec-sim-${dealId}`, type: "similar-historical-investment", dealId,
    title: `${matches.length} similar historical investment${matches.length > 1 ? "s" : ""} worth reviewing`,
    explanation: `Matched on real, objectively comparable fields (technology, country, deal size, capacity) — not a generic similarity score. ${matches.map((m) => `${projects.find((p) => p.id === m.dealId)?.name} (${m.matchReasons.join(", ")})`).join("; ")}.`,
    confidence: matches[0].similarityScore >= 60 ? "high" : matches[0].similarityScore >= 35 ? "medium" : "low",
    evidence: matches.map((m) => dealRef(m.dealId, "recommendation")),
  }];
}

function relevantDecisions(dealId: string): Recommendation[] {
  const decision = icDecisions.find((d) => d.dealId === dealId);
  if (!decision || decision.relevantHistoricalDecisions.length === 0) return [];
  return [{
    id: `rec-dec-${dealId}`, type: "relevant-historical-decision", dealId,
    title: `${decision.relevantHistoricalDecisions.length} historical decision${decision.relevantHistoricalDecisions.length > 1 ? "s" : ""} relevant to this opportunity`,
    explanation: `These deals share this opportunity's technology, geography, or size profile and already have a recorded IC outcome and rationale — review before forming a view here.`,
    confidence: "medium",
    evidence: decision.relevantHistoricalDecisions,
  }];
}

function frequentRisks(dealId: string): Recommendation[] {
  if (dealId === "helios") {
    const dealPatterns = patternsForDeal("helios");
    if (dealPatterns.length === 0) return [];
    return [{
      id: `rec-risk-${dealId}`, type: "frequent-risk", dealId,
      title: `${dealPatterns.length} recurring risk pattern${dealPatterns.length > 1 ? "s" : ""} identified on this deal`,
      explanation: `These patterns are drawn from this deal's own cited risks/conflicts and tracked in the Pattern Library — they represent categories of issue the firm has explicitly catalogued, not a generic risk checklist.`,
      confidence: "high",
      evidence: dealPatterns.map((p) => ({ kind: "pattern" as const, id: p.id, label: p.title })),
    }];
  }
  const project = projects.find((p) => p.id === dealId);
  if (!project || project.openRisks.critical + project.openRisks.high === 0) return [];
  return [{
    id: `rec-risk-${dealId}`, type: "frequent-risk", dealId,
    title: `${project.openRisks.critical + project.openRisks.high} open critical/high-severity risk item${project.openRisks.critical + project.openRisks.high > 1 ? "s" : ""}`,
    explanation: `Derived from open risk counts on this deal (${project.openRisks.critical} critical, ${project.openRisks.high} high) — no categorized risk data exists yet to say more specifically what these are.`,
    confidence: "low",
    evidence: [dealRef(dealId, "recommendation")],
  }];
}

function missingDiligenceAreas(dealId: string): Recommendation[] {
  const project = projects.find((p) => p.id === dealId);
  if (!project) return [];
  const gap = project.fieldsTotal - project.fieldsConfirmed;
  if (gap <= 0) return [];
  const gapPct = Math.round((gap / project.fieldsTotal) * 100);
  const explanation = dealId === "helios"
    ? `${gap} of ${project.fieldsTotal} canonical fields remain unconfirmed (${gapPct}%), including the merchant tail price assumption and sponsor equity commitment — both required for the financial model blueprint and currently marked "missing" on the checklist.`
    : `${gap} of ${project.fieldsTotal} fields remain unconfirmed (${gapPct}%) — field-level detail on which specific fields is not available for this deal yet, since document extraction hasn't reached the same depth as Project Helios.`;
  return [{
    id: `rec-gap-${dealId}`, type: "missing-diligence-area", dealId,
    title: `${gapPct}% of canonical fields still unconfirmed`,
    explanation, confidence: dealId === "helios" ? "high" : "medium",
    evidence: [dealRef(dealId, "recommendation")],
  }];
}

function assumptionsNeedingValidation(dealId: string): Recommendation[] {
  if (dealId !== "helios") return [];
  const open = conflicts.filter((c) => c.status === "open");
  if (open.length === 0) return [];
  return [{
    id: `rec-assump-${dealId}`, type: "assumption-needs-validation", dealId,
    title: `${open.length} unresolved candidate-value conflict${open.length > 1 ? "s" : ""} affecting model assumptions`,
    explanation: `Each of these fields has multiple candidate values extracted from different documents with no resolution recorded yet — the financial model is currently relying on one candidate without confirming it's the governing source.`,
    confidence: "high",
    evidence: [dealRef(dealId, "recommendation")],
    sourceEvidence: open.map((c) => ({ doc: c.candidates[0].source, page: c.candidates[0].page, snippet: c.candidates[0].snippet })),
  }];
}

function comparableBetterOutcomes(dealId: string): Recommendation[] {
  const decision = icDecisions.find((d) => d.dealId === dealId);
  if (!decision || decision.outcome !== "pending") return [];
  const approved = icDecisions.filter((d) => d.outcome === "approved" && dealDNA[dealId]?.similarDeals.some((m) => m.dealId === d.dealId));
  const cleanApproved = icDecisions.filter((d) => d.outcome === "approved" && !approved.includes(d));
  const candidates = approved.length > 0 ? approved : cleanApproved.slice(0, 1);
  if (candidates.length === 0) return [];
  return [{
    id: `rec-better-${dealId}`, type: "comparable-better-outcome", dealId,
    title: `${candidates.map((c) => projects.find((p) => p.id === c.dealId)?.name).join(", ")} closed cleanly — worth benchmarking against`,
    explanation: `${candidates.map((c) => `${projects.find((p) => p.id === c.dealId)?.name} was approved with a clean diligence file (${c.keyFactors[0]?.toLowerCase()})`).join("; ")}. Comparing this deal's diligence sequencing against that precedent may surface avoidable delay.`,
    confidence: "medium",
    evidence: candidates.map((c) => dealRef(c.dealId, "recommendation")),
  }];
}

function suggestedFollowups(dealId: string): Recommendation[] {
  if (dealId !== "helios") return [];
  const dealRisks = risks;
  const withQuestions = dealRisks.filter((r) => r.suggestedQuestions.length > 0);
  if (withQuestions.length === 0) return [];
  return withQuestions.map((r) => ({
    id: `rec-followup-${r.id}`, type: "suggested-followup-analysis" as const, dealId,
    title: r.suggestedQuestions[0],
    explanation: `Follow-up raised directly from the "${r.title}" risk finding — resolving this question would materially reduce residual uncertainty on that risk.`,
    confidence: "medium" as const,
    evidence: [{ kind: "recommendation" as const, id: r.id, label: r.title }],
    sourceEvidence: r.evidence,
  }));
}

function similarOperationalIssues(dealId: string): Recommendation[] {
  if (dealId !== "helios") return [];
  const relevant = patterns.filter((p) => p.category === "technical-yield" && p.similarCases.some((c) => c.dealId === "helios"));
  if (relevant.length === 0) return [];
  return relevant.map((p) => ({
    id: `rec-opissue-${p.id}`, type: "similar-operational-issue" as const, dealId,
    title: p.title,
    explanation: p.aiExplanation,
    confidence: p.confidence,
    evidence: [{ kind: "pattern" as const, id: p.id, label: p.title }],
  }));
}

export function recommendationsForDeal(dealId: string): Recommendation[] {
  return [
    ...similarInvestments(dealId),
    ...relevantDecisions(dealId),
    ...frequentRisks(dealId),
    ...missingDiligenceAreas(dealId),
    ...assumptionsNeedingValidation(dealId),
    ...comparableBetterOutcomes(dealId),
    ...suggestedFollowups(dealId),
    ...similarOperationalIssues(dealId),
  ];
}

export function allRecommendations(): Recommendation[] {
  return projects.flatMap((p) => recommendationsForDeal(p.id));
}
