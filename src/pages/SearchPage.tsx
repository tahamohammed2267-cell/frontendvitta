import { Link } from "react-router-dom";
import { Command, Search } from "lucide-react";
import { suggestedPrompts } from "../lib/mockData";
import { Badge, Card, ConfidenceBar, SourceChip } from "../lib/ui";

const results = [
  {
    type: "Field", title: "PPA Tariff — Project Helios", to: "/projects/helios?tab=extraction",
    snippet: <>…the Energy Price for Delivery Years 1–10 shall be <mark className="rounded bg-warn-100 px-0.5">EUR 52.40 per MWh</mark>, escalating at 1.8% p.a.…</>,
    src: "Helios_PPA_Executed_vFinal.pdf", page: 22, conf: 0.88,
  },
  {
    type: "Risk", title: "PPA tariff below term sheet floor", to: "/projects/helios?tab=intelligence",
    snippet: <>Executed PPA prices energy at <mark className="rounded bg-warn-100 px-0.5">€52.40/MWh</mark> while the lender term sheet assumes a €54.00/MWh floor…</>,
    src: "Term_Sheet_VittaCapital.pdf", page: 5,
  },
  {
    type: "Deal", title: "Project Helios — 120 MWp Solar, Spain", to: "/projects/helios",
    snippet: <>€96.4M CAPEX · 70% gearing · tariff <mark className="rounded bg-warn-100 px-0.5">€52.40/MWh</mark> · In Diligence</>,
    src: "Deal workspace", page: 0,
  },
  {
    type: "Document", title: "Helios_PPA_Executed_vFinal.pdf", to: "/projects/helios?tab=documents",
    snippet: <>Power Purchase Agreement · 84 pages · 31 fields extracted · tariff defined in <mark className="rounded bg-warn-100 px-0.5">Section 4.2, page 22</mark></>,
    src: "Project Helios", page: 0,
  },
  {
    type: "Deal", title: "Project Zephyr — 96 MW Wind, Denmark (Passed)", to: "/projects/zephyr",
    snippet: <>Passed Feb 2026 — tariff <mark className="rounded bg-warn-100 px-0.5">€48.90/MWh</mark> deemed below hurdle; precedent for low-tariff analysis</>,
    src: "Deal archive", page: 0,
  },
  {
    type: "Field", title: "PPA Tariff — Project Boreas", to: "/projects/boreas?tab=extraction",
    snippet: <>…Contract for Difference strike at <mark className="rounded bg-warn-100 px-0.5">€71.20/MWh</mark>, 15-year tenor…</>,
    src: "Boreas_CfD_Award.pdf", page: 8, conf: 0.95,
  },
];

const typeTone: Record<string, "blue" | "red" | "green" | "gray" | "orange"> = {
  Deal: "blue", Field: "green", Document: "gray", Risk: "red",
};

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-6 py-8">
      {/* Hero */}
      <div className="mx-auto mb-8 max-w-[720px] fade-up">
        <div className="flex items-center gap-3 rounded-2xl border border-ink-200 bg-white px-4 py-3.5 shadow-[0_2px_8px_rgba(11,14,20,0.05)] focus-within:border-accent-500 focus-within:ring-4 focus-within:ring-accent-600/10">
          <Search size={17} className="shrink-0 text-ink-400" />
          <input
            defaultValue="every solar deal with PPA tariff below €55/MWh"
            className="min-w-0 flex-1 bg-transparent text-[14.5px] outline-none"
          />
          <span className="flex items-center gap-0.5 rounded border border-ink-200 bg-ink-50 px-1.5 py-0.5 text-[10.5px] text-ink-400"><Command size={10} />K</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {["Show every contract longer than five years", ...suggestedPrompts.slice(1, 4)].map((q) => (
            <button key={q} className="rounded-full border border-ink-200 bg-white px-3 py-1.5 text-[11.5px] text-ink-600 hover:border-accent-500 hover:text-accent-700">{q}</button>
          ))}
        </div>
      </div>

      <p className="mb-3 text-[12.5px] text-ink-500 fade-up"><span className="num font-semibold text-ink-900">6</span> results across 19 deals · 0.4s</p>

      <div className="grid grid-cols-[200px_1fr] gap-5 fade-up">
        {/* Filters */}
        <Card className="self-start">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Type</p>
          {["Deals", "Documents", "Fields", "Risks"].map((f) => (
            <label key={f} className="flex items-center gap-2 py-1 text-[12.5px] text-ink-700">
              <input type="checkbox" defaultChecked className="h-3.5 w-3.5 rounded border-ink-300 accent-accent-600" /> {f}
            </label>
          ))}
          <p className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Sector</p>
          {["Solar", "Wind", "Infrastructure"].map((f) => (
            <label key={f} className="flex items-center gap-2 py-1 text-[12.5px] text-ink-700">
              <input type="checkbox" defaultChecked={f === "Solar"} className="h-3.5 w-3.5 rounded border-ink-300 accent-accent-600" /> {f}
            </label>
          ))}
          <p className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Country</p>
          {["Spain", "Germany", "Denmark"].map((f) => (
            <label key={f} className="flex items-center gap-2 py-1 text-[12.5px] text-ink-700">
              <input type="checkbox" defaultChecked className="h-3.5 w-3.5 rounded border-ink-300 accent-accent-600" /> {f}
            </label>
          ))}
        </Card>

        {/* Results */}
        <div className="space-y-3">
          {results.map((r) => (
            <Card key={r.title} className="transition-shadow hover:shadow-[0_4px_16px_rgba(11,14,20,0.07)]">
              <div className="flex items-center gap-2">
                <Badge tone={typeTone[r.type]}>{r.type}</Badge>
                <Link to={r.to} className="text-[14px] font-semibold text-ink-900 hover:text-accent-700 hover:underline">{r.title}</Link>
                {"conf" in r && r.conf && <span className="ml-auto"><ConfidenceBar value={r.conf} /></span>}
              </div>
              <p className="mt-2 text-[12.5px] leading-relaxed text-ink-600">{r.snippet}</p>
              <div className="mt-2"><SourceChip doc={r.src} page={r.page} /></div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
