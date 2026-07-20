// ─────────────────────────────────────────────────────────────
// Analyst Intelligence — a reusable institutional knowledge base
// of analyst notes/highlights/bookmarks/questions/comments/flags.
// Observations are attached to an origin deal but are written to
// be reusable across future deals (relatedDeals), not filed away
// as document-level annotations.
//
// Honest-mock discipline: Helios is the only deal with field/risk-
// level granularity, so only Helios observations use "highlight"
// kind and link to real canonicalFields/risks/documents records.
// The other 4 deals get 1-2 coarser observations each, restricted
// to note/bookmark/question kinds and referencing only what's real
// on their Project summary record — never a fabricated field or
// document.
// ─────────────────────────────────────────────────────────────

import { dealDNA } from "./dna";
import { projects } from "../mockData";
import { dealRef, type EntityRef } from "./crossLinks";

export type ObservationKind = "note" | "highlight" | "bookmark" | "question" | "comment" | "risk-flag" | "opportunity-flag";

export const observationKindLabels: Record<ObservationKind, string> = {
  note: "Note", highlight: "Highlight", bookmark: "Bookmark", question: "Question",
  comment: "Comment", "risk-flag": "Risk identified", "opportunity-flag": "Opportunity identified",
};

export interface AnalystObservation {
  id: string;
  kind: ObservationKind;
  dealId: string;
  author: string;
  createdAt: string;
  text: string;
  tags: string[];
  linkedFieldId?: string;
  linkedRiskId?: string;
  linkedDocId?: string;
  sourceEvidence?: { doc: string; page: number; snippet?: string };
  relatedDeals: EntityRef[];
}

const baseObservations: Omit<AnalystObservation, "relatedDeals">[] = [
  // — Helios (fine-grained, real field/risk/document links) —
  {
    id: "obs1", kind: "question", dealId: "helios", author: "J. Moreau", createdAt: "2026-07-14",
    text: "Which document governs facility sizing — the term sheet's €54.00/MWh floor, or the executed PPA at €52.40/MWh? This needs resolving before the model is finalized.",
    tags: ["PPA tariff", "facility sizing"], linkedRiskId: "r1", linkedFieldId: "f3",
    sourceEvidence: { doc: "Helios_PPA_Executed_vFinal.pdf", page: 22, snippet: "…EUR 52.40 per MWh…" },
  },
  {
    id: "obs2", kind: "highlight", dealId: "helios", author: "R. Chen", createdAt: "2026-07-12",
    text: "P50 yield of 1,812 kWh/kWp is above the Iberian peer median — but the yield report doesn't adjust for curtailment. Worth flagging alongside r3.",
    tags: ["yield", "curtailment"], linkedFieldId: "f5", linkedRiskId: "r3",
    sourceEvidence: { doc: "Solar_Resource_Assessment_PVSyst.pdf", page: 41, snippet: "…P50 specific yield estimated at 1,812 kWh/kWp…" },
  },
  {
    id: "obs3", kind: "risk-flag", dealId: "helios", author: "A. Lindqvist", createdAt: "2026-07-15",
    text: "O&M agreement unsigned at this stage of diligence — historically a critical-path item at IC. Push the sponsor for an execution date.",
    tags: ["O&M", "critical path"], linkedRiskId: "r2", linkedDocId: "d8",
    sourceEvidence: { doc: "Om_Agreement_Draft.docx", page: 1, snippet: "DRAFT — FOR DISCUSSION PURPOSES ONLY" },
  },
  {
    id: "obs4", kind: "opportunity-flag", dealId: "helios", author: "J. Moreau", createdAt: "2026-07-16",
    text: "Land lease has a lessor-discretion extension option — if we can negotiate this to a unilateral tenant right pre-close, it materially de-risks the tenor mismatch against r4.",
    tags: ["land lease", "structuring"], linkedRiskId: "r4",
    sourceEvidence: { doc: "Land_Lease_Andalusia.pdf", page: 11, snippet: "…extension subject to Lessor consent…" },
  },
  {
    id: "obs5", kind: "comment", dealId: "helios", author: "R. Chen", createdAt: "2026-07-17",
    text: "Reconciled the three CAPEX candidates — EPC contract (€96.4M) should govern over the pre-signing model draft and investor deck. Flagged to J. Moreau for override.",
    tags: ["CAPEX", "reconciliation"], linkedFieldId: "f1",
    sourceEvidence: { doc: "EPC_Contract_SolarBond.pdf", page: 14, snippet: "…fixed lump sum of EUR 96,400,000…" },
  },
  {
    id: "obs6", kind: "bookmark", dealId: "helios", author: "A. Lindqvist", createdAt: "2026-07-13",
    text: "Bookmarked the grid connection agreement's evacuation capacity clause — relevant every time we need to check DC/AC clipping ratio on a solar deal.",
    tags: ["grid connection", "technical"], linkedFieldId: "f16", linkedDocId: "d7",
    sourceEvidence: { doc: "Grid_Connection_Agreement.pdf", page: 5, snippet: "…evacuation capacity of 105 MWac…" },
  },
  {
    id: "obs7", kind: "note", dealId: "helios", author: "J. Moreau", createdAt: "2026-07-18",
    text: "Environmental approval is conditional on a habitat mitigation plan still in progress — keep an eye on construction sequencing risk if this lags the EPC notice-to-proceed date.",
    tags: ["environmental", "permitting"], linkedRiskId: "r5",
    sourceEvidence: { doc: "Environmental_Impact_Study.pdf", page: 3, snippet: "…conditional upon implementation of the little bustard habitat plan…" },
  },
  {
    id: "obs8", kind: "question", dealId: "helios", author: "R. Chen", createdAt: "2026-07-11",
    text: "Merchant tail price assumption is still missing from the model — needed for the blueprint's Revenue tab. Who owns sourcing this from the sponsor?",
    tags: ["merchant tail", "missing field"], linkedFieldId: "f19",
  },
  // — Boreas / Meridian / Atlas / Zephyr (coarse, summary-level only) —
  {
    id: "obs9", kind: "note", dealId: "boreas", author: "A. Lindqvist", createdAt: "2026-07-05",
    text: "Boreas is the largest deal in the current pipeline by size (€284M) with a near-complete document set. Worth a closer look once Helios's O&M pattern (pat2) is resolved, in case it recurs here.",
    tags: ["deal size", "document collection"],
  },
  {
    id: "obs10", kind: "bookmark", dealId: "boreas", author: "A. Lindqvist", createdAt: "2026-07-08",
    text: "Bookmarked — one open conflict remains unresolved ahead of the IC memo. Revisit before the committee date.",
    tags: ["open conflict", "IC memo"],
  },
  {
    id: "obs11", kind: "question", dealId: "meridian", author: "S. Okafor", createdAt: "2026-06-30",
    text: "Meridian's 6 open conflicts include lease-term items — worth comparing against Helios's land lease pattern (pat3) once field-level documents land, rather than assuming it's unrelated.",
    tags: ["lease terms", "cross-deal pattern"],
  },
  {
    id: "obs12", kind: "note", dealId: "atlas", author: "M. Ferreira", createdAt: "2026-04-01",
    text: "Atlas closed with 0 open conflicts and 118/118 fields confirmed — the clean document-collection sequencing here is a good reference point for how a hostel/infrastructure deal should look at IC stage.",
    tags: ["document collection", "clean file"],
  },
  {
    id: "obs13", kind: "bookmark", dealId: "zephyr", author: "J. Moreau", createdAt: "2026-02-18",
    text: "Bookmarked as a reference case: complete document set and no open conflicts weren't enough to clear the return hurdle. Useful precedent to cite when a clean file alone is used as an approval argument.",
    tags: ["return hurdle", "precedent"],
  },
];

function relatedDealsFor(dealId: string): EntityRef[] {
  const similar = dealDNA[dealId]?.similarDeals ?? [];
  return similar.slice(0, 2).map((m) => dealRef(m.dealId));
}

export const analystObservations: AnalystObservation[] = baseObservations.map((o) => ({
  ...o,
  relatedDeals: relatedDealsFor(o.dealId),
}));

export function observationsForDeal(dealId: string) {
  return analystObservations.filter((o) => o.dealId === dealId);
}

export function observationRefsByDeal(): Map<string, EntityRef[]> {
  const map = new Map<string, EntityRef[]>();
  for (const p of projects) {
    map.set(p.id, observationsForDeal(p.id).map((o) => ({ kind: "observation", id: o.id, label: o.text.slice(0, 48) + (o.text.length > 48 ? "…" : "") })));
  }
  return map;
}

export function observationsByTag(): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const o of analystObservations) for (const t of o.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()].map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count);
}

export function observationsForTag(tag: string) {
  return analystObservations.filter((o) => o.tags.includes(tag));
}
