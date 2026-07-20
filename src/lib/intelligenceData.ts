// ─────────────────────────────────────────────────────────────
// Vitta Intelligence — institutional knowledge layer.
// Built on top of mockData.ts's deal-diligence fixtures (not the
// live store — this represents the firm's permanent knowledge
// record, independent of whichever pre-upload/in-progress state an
// individual workspace is in).
//
// This file is a pure re-export barrel plus knowledgeCoverage().
// The actual data/types live in leaf modules under ./intelligence/
// (dna.ts, patterns.ts, decisions.ts, analystIntelligence.ts,
// playbooks.ts, recommendations.ts, knowledgeGrowth.ts) so that
// modules needing dealDNA/patterns (decisions/playbooks/
// recommendations all do, for cross-linking) import them directly
// from the leaf module — never from this barrel — which would
// create a circular import and a TDZ crash (dealDNA/patterns read
// as undefined before their own module finished initializing).
// ─────────────────────────────────────────────────────────────

import { canonicalFields, conflicts, projects, risks } from "./mockData";
import { dealDNA } from "./intelligence/dna";
import { icDecisions, attachDecisionCrossLinks } from "./intelligence/decisions";
import { analystObservations, observationRefsByDeal } from "./intelligence/analystIntelligence";
import { playbooks, playbookRefByTechnology } from "./intelligence/playbooks";

export * from "./intelligence/dna";
export * from "./intelligence/patterns";
export * from "./intelligence/crossLinks";
export * from "./intelligence/decisions";
export * from "./intelligence/analystIntelligence";
export * from "./intelligence/playbooks";
export * from "./intelligence/recommendations";
export * from "./intelligence/knowledgeGrowth";

attachDecisionCrossLinks(playbookRefByTechnology(), observationRefsByDeal());

// ── Knowledge Coverage (derived, no new seed data) ───────────

export function knowledgeCoverage() {
  const byTechnology = new Map<string, number>();
  for (const p of projects) byTechnology.set(p.technology, (byTechnology.get(p.technology) ?? 0) + 1);
  const withFullEvidence = projects.filter((p) => dealDNA[p.id]?.overallConfidence === "high").length;
  return {
    totalDeals: projects.length,
    sectorsCovered: byTechnology.size,
    byTechnology: [...byTechnology.entries()].map(([technology, count]) => ({ technology, count })),
    dealsWithFullEvidence: withFullEvidence,
    totalRiskRecords: risks.length,
    totalCanonicalFields: canonicalFields.length,
    totalConflicts: conflicts.length,
    totalDecisions: icDecisions.length,
    totalObservations: analystObservations.length,
    totalPlaybooks: playbooks.length,
  };
}
