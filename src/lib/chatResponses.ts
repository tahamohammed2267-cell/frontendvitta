// A small bank of canned Q→A pairs for the "Ask vitta" panel. Free-typed
// questions are matched to the closest pair by keyword overlap; suggested
// prompts match exactly. This is a scripted performance, not a live model —
// the point is that the thread actually appends and streams, not that the
// answers are generated.
export interface ChatCitation {
  n: number;
  doc: string;
  page: number;
}

// A bar the AI can render inline in its answer. `value` may be negative
// (the bar chart draws a zero baseline); color is derived from the sign
// unless overridden.
export interface ChatBar {
  label: string;
  value: number;
  color?: string;
}

export interface ChatChart {
  kind: "bar";
  title: string;
  unit?: string;
  bars: ChatBar[];
}

// A scripted next-step the answer offers. `query` is sent back through the
// chat when clicked, so it must match another reply's keywords.
export interface ChatFollowUp {
  label: string;
  query: string;
}

export interface ChatReply {
  keywords: string[];
  text: string;
  citations?: ChatCitation[];
  chart?: ChatChart;
  followUps?: ChatFollowUp[];
}

export const chatReplies: ChatReply[] = [
  {
    // ── Wind portfolio demo Q&A ──────────────────────────────
    // Ask: "Why is the wind portfolio underperforming this quarter?"
    keywords: ["wind", "underperform", "underperforming"],
    text: "The wind book (4 assets, 558 MW, €49.7M revenue) is being dragged by its two Danish sites — this is concentrated, not portfolio-wide. Nordwind Park II (132 MW) fell 6.8% to €9.8M and Zephyr (96 MW) fell 11.4% to €6.1M, both missing P50 generation for the second consecutive quarter as Q2 wind speeds ran ~9% below the long-term average [1][2]. Zephyr is now At Risk: EBITDA margin has slipped to 52.5% and net income turned negative [3]. The other two assets are healthy — Boreas (Germany, 210 MW) is ramping at +2.1% and Tamil Nadu (India, 120 MW) grew 8.9% on an 80.3% margin [4]. Net: the weakness is weather-driven and specific to Denmark, not a structural problem across the book.",
    citations: [
      { n: 1, doc: "Nordwind_MIS_Jun2026.xlsx", page: 3 },
      { n: 2, doc: "Zephyr_Yield_Report_P50.pdf", page: 12 },
      { n: 3, doc: "Zephyr_MIS_May2026.xlsx", page: 2 },
      { n: 4, doc: "Wind_Portfolio_MIS_Q2.xlsx", page: 1 },
    ],
    followUps: [
      { label: "Generate a bar graph showing the same", query: "Generate a bar graph of revenue growth by asset" },
    ],
  },
  {
    // Follow-up: renders the wind revenue-growth chart inline.
    keywords: ["bar graph", "bar chart"],
    text: "Here's Q2 revenue growth by wind asset. The two Danish sites (red) are dragging the book while Germany and India (green) keep growing:",
    chart: {
      kind: "bar",
      title: "Revenue growth YoY by wind asset",
      unit: "%",
      bars: [
        { label: "Boreas", value: 2.1 },
        { label: "Nordwind II", value: -6.8 },
        { label: "Zephyr", value: -11.4 },
        { label: "Tamil Nadu", value: 8.9 },
      ],
    },
  },
  {
    keywords: ["risk", "biggest", "concern", "worry"],
    text: "Three stand out. First, the executed PPA tariff (€52.40/MWh) sits below the €54.00/MWh floor the term sheet was sized on, compressing DSCR in Years 3–5 [1][2]. Second, the O&M agreement is still a draft, so the €11.2k/MWp/yr cost is indicative [3]. Third, curtailment exposure is unquantified — the yield report assumes zero, but regional curtailment ran 2.1% in 2025 [4]. Want me to draft sponsor questions for each?",
    citations: [
      { n: 1, doc: "Helios_PPA_Executed_vFinal.pdf", page: 22 },
      { n: 2, doc: "Term_Sheet_Northbridge.pdf", page: 5 },
      { n: 3, doc: "Om_Agreement_Draft.docx", page: 1 },
      { n: 4, doc: "Solar_Resource_Assessment_PVSyst.pdf", page: 41 },
    ],
  },
  {
    keywords: ["summarize", "summary", "bullet", "overview"],
    text: "Project Helios: 120 MWp solar PV in Andalusia, Spain. €96.4M CAPEX, executed 10-year PPA at €52.40/MWh, 70% gearing on a €67.5M senior facility. Base-case levered equity IRR 11.8%, min DSCR 1.30x. Open items: O&M agreement unsigned, curtailment unquantified, Total CAPEX has a resolved conflict between EPC contract and financial model figures.",
  },
  {
    keywords: ["capex", "cost", "budget"],
    text: "Total CAPEX is €96.4M per the executed EPC contract with SolarBond — this is the governing figure. An earlier financial-model draft showed €98.1M, and an investor presentation showed €94.8M; both are superseded by the signed contract [1].",
    citations: [{ n: 1, doc: "EPC_Contract_SolarBond.pdf", page: 14 }],
  },
  {
    keywords: ["tariff", "ppa", "price", "pricing"],
    text: "The executed PPA prices energy at €52.40/MWh with 1.8% annual escalation, on a 10-year term with Iberdrola [1]. That's below the €54.00/MWh floor the lender term sheet was sized on [2] — flagged as the top risk on this deal.",
    citations: [
      { n: 1, doc: "Helios_PPA_Executed_vFinal.pdf", page: 22 },
      { n: 2, doc: "Term_Sheet_Northbridge.pdf", page: 5 },
    ],
  },
  {
    keywords: ["compare", "benchmark", "precedent", "similar"],
    text: "Against 17 comparable Iberian solar precedents in the firm's knowledge base, Helios's CAPEX per MWp sits in range (€0.80M vs €0.72–0.86M P25–P75), but the PPA tariff sits below the P25 comparable (€52.40 vs €61–70/MWh). Iberian PPA tariffs are trending down ~6% quarter-on-quarter across the book, which may explain some of the gap.",
  },
];

export const defaultReply: ChatReply = {
  keywords: [],
  text: "I don't have a scripted answer for that exact question in this demo, but across the deal I can confirm: €96.4M CAPEX, €52.40/MWh PPA, 11.8% levered equity IRR, and three open risk items (O&M draft, curtailment, and the now-resolved CAPEX conflict). Try one of the suggested prompts for a fuller answer.",
};

export function pickReply(question: string): ChatReply {
  const q = question.toLowerCase();
  let best: ChatReply | null = null;
  let bestScore = 0;
  for (const reply of chatReplies) {
    const score = reply.keywords.reduce((acc, kw) => acc + (q.includes(kw) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      best = reply;
    }
  }
  return best ?? defaultReply;
}
