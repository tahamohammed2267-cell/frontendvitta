// ─────────────────────────────────────────────────────────────
// Intelligence-aware search index. Institutional knowledge types
// (Decision/Playbook/Recommendation/Observation/Pattern) are given
// a lower `priority` number than document-retrieval types (Deal/
// Field/Risk/Document), and buildSearchIndex() sorts by priority
// first — this is the concrete mechanism behind "prioritize
// institutional knowledge over document retrieval," since this mock
// has no real query/relevance engine to rank against.
//
// This mock has no live full-text query engine — buildSearchIndex()
// still returns a fixed, illustrative result set (matching the
// existing SearchPage precedent), now sourced from real data across
// all content types instead of hand-typed literals.
// ─────────────────────────────────────────────────────────────

import { canonicalFields, documents, projects, risks } from "../mockData";
import { icDecisions } from "./decisions";
import { analystObservations } from "./analystIntelligence";
import { playbooks } from "./playbooks";
import { recommendationsForDeal } from "./recommendations";
import { patterns } from "./patterns";
import { anchorId } from "./crossLinks";

export type SearchResultType = "Decision" | "Playbook" | "Recommendation" | "Observation" | "Pattern" | "Deal" | "Field" | "Risk" | "Document";

const priority: Record<SearchResultType, number> = {
  Decision: 1, Playbook: 2, Recommendation: 3, Observation: 4, Pattern: 5, Deal: 6, Field: 7, Risk: 7, Document: 8,
};

export interface SearchResult {
  type: SearchResultType;
  title: string;
  to: string;
  // snippet text may contain ⟪…⟫-wrapped spans, rendered as <mark> by SearchPage
  snippet: string;
  src: string;
  page: number;
  conf?: number;
  priority: number;
}

const mark = (text: string) => `⟪${text}⟫`; // marker used by SearchPage to render <mark>

export function buildSearchIndex(): SearchResult[] {
  const results: SearchResult[] = [];

  // — Institutional knowledge (prioritized) —
  const heliosDecision = icDecisions.find((d) => d.dealId === "helios");
  if (heliosDecision) {
    results.push({
      type: "Decision", title: `IC Decision — Project Helios (${heliosDecision.outcome})`,
      to: `/intelligence?jump=decision:helios`,
      snippet: heliosDecision.rationale, src: "Investment Decisions", page: 0, priority: priority.Decision,
    });
  }
  const solarPlaybook = playbooks.find((p) => p.technology === "Solar");
  if (solarPlaybook) {
    results.push({
      type: "Playbook", title: solarPlaybook.title,
      to: `/intelligence?jump=playbook:${solarPlaybook.id}`,
      snippet: `${solarPlaybook.dealsContributing} deal contributing · ${solarPlaybook.lessonsLearned.items[0] ?? ""}`,
      src: "Institutional Playbooks", page: 0, priority: priority.Playbook,
    });
  }
  const heliosRecs = recommendationsForDeal("helios");
  if (heliosRecs.length > 0) {
    results.push({
      type: "Recommendation", title: heliosRecs[0].title,
      to: `/intelligence?jump=deal:helios`,
      snippet: heliosRecs[0].explanation, src: "AI Recommendations", page: 0, priority: priority.Recommendation,
    });
  }
  const tariffObs = analystObservations.find((o) => o.tags.includes("PPA tariff"));
  if (tariffObs) {
    results.push({
      type: "Observation", title: `${tariffObs.author}'s question on PPA tariff sizing`,
      to: `/intelligence?jump=observation:${tariffObs.id}`,
      snippet: tariffObs.text, src: "Analyst Intelligence", page: 0, priority: priority.Observation,
    });
  }
  const tariffPattern = patterns.find((p) => p.id === "pat1");
  if (tariffPattern) {
    results.push({
      type: "Pattern", title: tariffPattern.title,
      to: `/intelligence?jump=pattern:${tariffPattern.id}`,
      snippet: tariffPattern.aiExplanation, src: "Pattern Library", page: 0, priority: priority.Pattern,
    });
  }

  // — Document retrieval (deprioritized, content-equivalent to the original hand-typed set) —
  const field = canonicalFields.find((f) => f.id === "f3");
  if (field) {
    results.push({
      type: "Field", title: "PPA Tariff — Project Helios", to: "/projects/helios?tab=extraction",
      snippet: `…the Energy Price for Delivery Years 1–10 shall be ${mark("EUR 52.40 per MWh")}, escalating at 1.8% p.a.…`,
      src: field.source.doc, page: field.source.page, conf: field.confidence, priority: priority.Field,
    });
  }
  const risk = risks.find((r) => r.id === "r1");
  if (risk) {
    results.push({
      type: "Risk", title: risk.title, to: "/projects/helios?tab=intelligence",
      snippet: `Executed PPA prices energy at ${mark("€52.40/MWh")} while the lender term sheet assumes a €54.00/MWh floor…`,
      src: risk.evidence[1]?.doc ?? risk.evidence[0].doc, page: risk.evidence[1]?.page ?? risk.evidence[0].page, priority: priority.Risk,
    });
  }
  const helios = projects.find((p) => p.id === "helios");
  if (helios) {
    results.push({
      type: "Deal", title: `Project Helios — ${helios.capacityMW} MWp Solar, ${helios.country}`,
      to: "/projects/helios",
      snippet: `€${helios.dealSizeM}.4M CAPEX · 70% gearing · tariff ${mark("€52.40/MWh")} · ${helios.status}`,
      src: "Deal workspace", page: 0, priority: priority.Deal,
    });
  }
  const doc = documents.find((d) => d.id === "d1");
  if (doc) {
    results.push({
      type: "Document", title: doc.name, to: "/projects/helios?tab=documents",
      snippet: `${doc.type} · ${doc.pages} pages · ${doc.fieldsExtracted} fields extracted · tariff defined in ${mark("Section 4.2, page 22")}`,
      src: "Project Helios", page: 0, priority: priority.Document,
    });
  }
  const zephyr = projects.find((p) => p.id === "zephyr");
  if (zephyr) {
    results.push({
      type: "Deal", title: `Project Zephyr — ${zephyr.capacityMW} MW Wind, ${zephyr.country} (Passed)`,
      to: "/projects/zephyr",
      snippet: `Passed ${zephyr.createdAt} — did not clear the return hurdle at the sized tariff; precedent for low-tariff analysis`,
      src: "Deal archive", page: 0, priority: priority.Deal,
    });
  }
  // Boreas has no canonicalFields records (only Helios has field-level extraction) —
  // this entry mirrors the original hand-typed content, kept as an illustrative
  // static result rather than a fabricated data lookup.
  results.push({
    type: "Field", title: "PPA Tariff — Project Boreas", to: "/projects/boreas?tab=extraction",
    snippet: `…Contract for Difference strike at ${mark("€71.20/MWh")}, 15-year tenor…`,
    src: "Boreas_CfD_Award.pdf", page: 8, conf: 0.95, priority: priority.Field,
  });

  return results.sort((a, b) => a.priority - b.priority);
}

export { anchorId };
