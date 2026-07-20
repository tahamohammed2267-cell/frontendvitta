import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Command, Search } from "lucide-react";
import { useStore } from "../lib/store";
import { buildSearchIndex, type SearchResultType } from "../lib/intelligence/search";
import { Badge, Card, ConfidenceBar, SourceChip } from "../lib/ui";

const typeTone: Record<SearchResultType, "blue" | "red" | "green" | "gray" | "orange"> = {
  Deal: "blue", Field: "green", Document: "gray", Risk: "red",
  Decision: "orange", Playbook: "orange", Recommendation: "orange", Observation: "gray", Pattern: "red",
};

const typeFilters: SearchResultType[] = ["Decision", "Playbook", "Recommendation", "Observation", "Pattern", "Deal", "Field", "Risk", "Document"];

function renderSnippet(text: string) {
  const parts = text.split(/(⟪[^⟫]*⟫)/g);
  return parts.map((part, i) =>
    part.startsWith("⟪") && part.endsWith("⟫")
      ? <mark key={i} className="rounded bg-warn-100 px-0.5">{part.slice(1, -1)}</mark>
      : <span key={i}>{part}</span>
  );
}

export default function SearchPage() {
  const suggestedPrompts = useStore((s) => s.suggestedPrompts);
  const allResults = useMemo(() => buildSearchIndex(), []);
  const [activeTypes, setActiveTypes] = useState<Set<SearchResultType>>(new Set(typeFilters));

  function toggleType(t: SearchResultType) {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t); else next.add(t);
      return next;
    });
  }

  const results = allResults.filter((r) => activeTypes.has(r.type));

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-8">
      {/* Hero */}
      <div className="mx-auto mb-8 max-w-[720px] fade-up">
        <div className="flex items-center gap-3 rounded-lg border border-ink-200 bg-white px-4 py-3.5 shadow-[0_2px_8px_rgba(11,14,20,0.05)] focus-within:border-accent-500 focus-within:ring-4 focus-within:ring-accent-600/10">
          <Search size={17} className="shrink-0 text-ink-400" />
          <input
            defaultValue="every solar deal with PPA tariff below €55/MWh"
            className="min-w-0 flex-1 bg-transparent text-[14.5px] outline-none"
          />
          <span className="flex items-center gap-0.5 rounded border border-ink-200 bg-ink-50 px-1.5 py-0.5 text-[10.5px] text-ink-400"><Command size={10} />K</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {["Show every contract longer than five years", ...suggestedPrompts.slice(1, 4)].map((q) => (
            <button key={q} className="rounded-md border border-ink-200 bg-white px-3 py-1.5 text-[11.5px] text-ink-600 hover:border-accent-500 hover:text-accent-700">{q}</button>
          ))}
        </div>
      </div>

      <p className="mb-3 text-[12.5px] text-ink-500 fade-up"><span className="num font-semibold text-ink-900">{results.length}</span> result{results.length === 1 ? "" : "s"} across 5 deals · institutional knowledge prioritized</p>

      <div className="grid grid-cols-[200px_1fr] gap-5 fade-up">
        {/* Filters */}
        <Card className="self-start">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Type</p>
          {typeFilters.map((f) => (
            <label key={f} className="flex items-center gap-2 py-1 text-[12.5px] text-ink-700">
              <input
                type="checkbox"
                checked={activeTypes.has(f)}
                onChange={() => toggleType(f)}
                className="h-3.5 w-3.5 rounded border-ink-300 accent-accent-600"
              /> {f}
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
                {r.conf !== undefined && <span className="ml-auto"><ConfidenceBar value={r.conf} /></span>}
              </div>
              <p className="mt-2 text-[12.5px] leading-relaxed text-ink-600">{renderSnippet(r.snippet)}</p>
              {r.page > 0 && <div className="mt-2"><SourceChip doc={r.src} page={r.page} /></div>}
            </Card>
          ))}
          {results.length === 0 && (
            <Card><p className="py-6 text-center text-[12.5px] text-ink-400">No results for the selected types.</p></Card>
          )}
        </div>
      </div>
    </div>
  );
}
