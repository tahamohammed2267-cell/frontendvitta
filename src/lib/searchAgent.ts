// Prebaked "agent" answers for the Search & ask chat. Each prompt runs a
// scripted multi-step workflow (reading, searching, synthesizing) and then
// renders a rich answer — text with citations plus an optional visual
// (bar / line / table / cards). Demo-only: convincing, not computed.

export interface AgentCitation { n: number; doc: string; page: number }

export type AgentVisual =
  | { kind: "bar"; title: string; unit?: string; refLabel?: string; refValue?: number; data: { label: string; value: number }[] }
  | { kind: "line"; title: string; unit?: string; data: { label: string; value: number }[] }
  | { kind: "table"; title: string; columns: string[]; rows: string[][] }
  | { kind: "cards"; title: string; items: { tone: "critical" | "high" | "medium" | "low"; title: string; sub: string }[] };

export interface AgentAnswer {
  steps: string[];
  text: string;
  citations?: AgentCitation[];
  visual?: AgentVisual;
}

export interface AgentPrompt {
  q: string;
  keywords: string[];
  answer: AgentAnswer;
}

export const SEARCH_PROMPTS: AgentPrompt[] = [
  {
    q: "Which solar deals priced PPAs below €55/MWh?",
    keywords: ["ppa", "below", "55", "tariff", "priced"],
    answer: {
      steps: ["Searching knowledge base", "Reading 14 executed contracts", "Extracting PPA tariffs", "Ranking by price", "Synthesising answer"],
      text: "Three solar deals priced PPAs below €55/MWh — Project Helios (€52.40/MWh, 10-yr, Spain) [1], Project Solara (€53.10/MWh, 12-yr) and a now-superseded Boreas draft (€54.20/MWh). Helios sits below the €54.00/MWh lender floor it was sized on, which is flagged as the top risk on that deal [2]. Newer Iberian deals cluster closer to the floor as tariffs soften.",
      citations: [
        { n: 1, doc: "Helios_PPA_Executed_vFinal.pdf", page: 22 },
        { n: 2, doc: "Term_Sheet_Northbridge.pdf", page: 5 },
      ],
      visual: {
        kind: "bar", title: "Executed PPA tariff by deal", unit: "€/MWh", refLabel: "Lender floor", refValue: 54,
        data: [
          { label: "Helios", value: 52.4 },
          { label: "Solara", value: 53.1 },
          { label: "Boreas (draft)", value: 54.2 },
          { label: "Rajasthan", value: 61.0 },
          { label: "Abu Dhabi", value: 68.5 },
        ],
      },
    },
  },
  {
    q: "Compare Helios with our last 3 solar deals",
    keywords: ["compare", "helios", "last 3", "solar deals", "versus"],
    answer: {
      steps: ["Identifying comparable deals", "Loading financial models", "Aligning metrics to canonical schema", "Building comparison"],
      text: "Against the three most recent Iberian solar precedents, Helios's CAPEX per MWp is mid-range, but its PPA tariff is the lowest of the set and its minimum DSCR the tightest. Levered equity IRR is broadly in line. The tight DSCR traces directly back to the sub-floor PPA tariff.",
      citations: [{ n: 1, doc: "Helios_Financial_Model_v7.xlsx", page: 3 }],
      visual: {
        kind: "table", title: "Helios vs recent solar precedents",
        columns: ["Deal", "CAPEX", "PPA €/MWh", "Levered IRR", "Min DSCR"],
        rows: [
          ["Helios", "€96.4m", "52.40", "11.8%", "1.30x"],
          ["Solara", "€92.1m", "53.10", "12.1%", "1.38x"],
          ["Rajasthan", "€118.0m", "61.00", "12.6%", "1.45x"],
          ["Abu Dhabi", "€142.0m", "68.50", "13.2%", "1.52x"],
        ],
      },
    },
  },
  {
    q: "What are the biggest risks across the portfolio right now?",
    keywords: ["biggest", "risk", "portfolio", "attention", "underperform"],
    answer: {
      steps: ["Scanning 14 projects", "Evaluating health flags", "Prioritising by severity", "Summarising"],
      text: "Five projects carry open health flags. Zephyr 96 MW is the most severe — revenue down 11.4% YoY with an active DSCR covenant breach. Gujarat 140 MW and Nordwind Park II are both generating below forecast, driven by inverter faults and weak wind resource respectively. Meridian's negative EBITDA is expected pre-completion carrying cost, not an operating issue.",
      citations: [{ n: 1, doc: "Portfolio_Health_Center", page: 0 }],
      visual: {
        kind: "cards", title: "Flagged projects by severity",
        items: [
          { tone: "critical", title: "Zephyr 96 MW · Denmark", sub: "Revenue −11.4% YoY · DSCR covenant breach" },
          { tone: "high", title: "Gujarat 140 MW · India", sub: "Generation 14.7% below forecast · inverter faults" },
          { tone: "high", title: "Nordwind Park II · Denmark", sub: "Below-P50 generation two quarters running" },
          { tone: "medium", title: "Meridian Retail Park · UK", sub: "Negative EBITDA — pre-completion carrying cost" },
        ],
      },
    },
  },
  {
    q: "How have Iberian PPA tariffs trended this year?",
    keywords: ["trend", "iberian", "tariff", "this year", "quarter"],
    answer: {
      steps: ["Gathering tariff data points", "Normalising by month", "Fitting trend line"],
      text: "Iberian merchant-linked PPA tariffs have fallen roughly 6% quarter-on-quarter through the year, from ~€58/MWh in February to ~€52/MWh in July. The softening is why Helios — signed most recently — priced below the lender floor while older deals in the book sit comfortably above it.",
      citations: [{ n: 1, doc: "Solar_Resource_Assessment_PVSyst.pdf", page: 41 }],
      visual: {
        kind: "line", title: "Iberian PPA tariff trend", unit: "€/MWh",
        data: [
          { label: "Feb", value: 58.1 }, { label: "Mar", value: 56.9 }, { label: "Apr", value: 55.4 },
          { label: "May", value: 54.2 }, { label: "Jun", value: 53.0 }, { label: "Jul", value: 52.1 },
        ],
      },
    },
  },
  {
    q: "Show every contract longer than five years",
    keywords: ["contract", "longer", "five years", "term", "tenor"],
    answer: {
      steps: ["Searching contracts", "Reading term clauses", "Filtering by tenor"],
      text: "Four executed contracts run longer than five years. The Helios and Solara PPAs are the longest at 10 and 12 years respectively; both carry annual escalation. The O&M agreement on Helios is still a draft, so its indicative 8-year term is not yet binding.",
      citations: [{ n: 1, doc: "Helios_PPA_Executed_vFinal.pdf", page: 22 }],
      visual: {
        kind: "table", title: "Contracts with term > 5 years",
        columns: ["Contract", "Deal", "Type", "Term"],
        rows: [
          ["Solara PPA", "Solara", "PPA (executed)", "12 years"],
          ["Helios PPA", "Helios", "PPA (executed)", "10 years"],
          ["Helios O&M (draft)", "Helios", "O&M", "8 years"],
          ["Abu Dhabi PPA", "Abu Dhabi", "PPA (executed)", "7 years"],
        ],
      },
    },
  },
];

export function pickAgentAnswer(question: string): AgentAnswer {
  const q = question.toLowerCase();
  let best: AgentPrompt | null = null;
  let bestScore = 0;
  for (const p of SEARCH_PROMPTS) {
    if (p.q.toLowerCase() === q) return p.answer;
    const score = p.keywords.reduce((a, kw) => a + (q.includes(kw) ? 1 : 0), 0);
    if (score > bestScore) { bestScore = score; best = p; }
  }
  if (best && bestScore > 0) return best.answer;
  // Generic fallback with a light workflow.
  return {
    steps: ["Searching knowledge base", "Reading matching documents", "Synthesising answer"],
    text: `I searched every deal, document and field for “${question}”. I don't have a scripted answer for that exact query in this demo, but try one of the suggested questions — each runs a full retrieval workflow and returns figures with sources.`,
  };
}
