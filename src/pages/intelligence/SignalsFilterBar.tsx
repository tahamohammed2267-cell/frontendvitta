import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { institutionalSignals } from "../../lib/intelligence/institutionalSignals";
import type { IndustryKey, Severity } from "../../lib/portfolioData";
import type { OutcomeTag, SignalStatus } from "../../lib/intelligence/institutionalSignals";
import { Badge, Button } from "../../lib/ui";
import type { SignalFilters } from "./useInstitutionalSignalsTable";

const industryOptions: { key: IndustryKey; label: string }[] = [
  { key: "solar", label: "Solar" }, { key: "wind", label: "Wind" }, { key: "infrastructure", label: "Infrastructure" },
];
const severityOptions: Severity[] = ["critical", "high", "medium", "low"];
const statusOptions: SignalStatus[] = ["Active", "Dormant"];
const confidenceOptions = [0, 50, 70, 85];
const dealCountOptions = [0, 2, 5, 10];

function allRegions(): string[] {
  return [...new Set(institutionalSignals.flatMap((s) => s.occurrences.map((o) => o.region)))].sort();
}
function allOutcomes(): OutcomeTag[] {
  return [...new Set(institutionalSignals.flatMap((s) => s.occurrences.map((o) => o.outcome)))];
}

export default function SignalsFilterBar({
  filters, onFiltersChange, onClearRelatedFilter,
}: { filters: SignalFilters; onFiltersChange: (f: SignalFilters) => void; onClearRelatedFilter: () => void }) {
  const [open, setOpen] = useState(false);
  const regions = allRegions();
  const outcomes = allOutcomes();

  function toggle<T>(list: T[], value: T): T[] {
    return list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
  }

  const relatedAnchor = filters.relatedFilterId ? institutionalSignals.find((s) => s.id === filters.relatedFilterId) : null;

  const activeCount = filters.industries.length + filters.regions.length + filters.severities.length
    + filters.outcomes.length + filters.status.length + (filters.minConfidence > 0 ? 1 : 0) + (filters.minDealCount > 0 ? 1 : 0);

  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <div className="relative">
        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          placeholder="Search signals…"
          className="w-[220px] rounded-lg border border-ink-200 bg-white py-1.5 pl-8 pr-3 text-[12.5px] outline-none placeholder:text-ink-400 focus:border-accent-500"
        />
      </div>

      <div className="relative">
        <Button variant="secondary" className="px-2.5 py-1.5 text-[12px]" onClick={() => setOpen((o) => !o)}>
          <SlidersHorizontal size={13} /> Filters{activeCount > 0 ? ` (${activeCount})` : ""}
        </Button>
        {open && (
          <div className="absolute left-0 top-[calc(100%+6px)] z-40 w-[420px] rounded-lg border border-ink-200 bg-white p-3.5 shadow-[0_10px_30px_-8px_rgba(11,14,20,0.25)]">
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-400">Asset Type</p>
                <div className="flex flex-wrap gap-1.5">
                  {industryOptions.map((i) => (
                    <button key={i.key} onClick={() => onFiltersChange({ ...filters, industries: toggle(filters.industries, i.key) })}>
                      <Badge tone={filters.industries.includes(i.key) ? "blue" : "gray"}>{i.label}</Badge>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-400">Region</p>
                <div className="flex flex-wrap gap-1.5">
                  {regions.map((r) => (
                    <button key={r} onClick={() => onFiltersChange({ ...filters, regions: toggle(filters.regions, r) })}>
                      <Badge tone={filters.regions.includes(r) ? "blue" : "gray"}>{r}</Badge>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-400">Severity</p>
                <div className="flex flex-wrap gap-1.5">
                  {severityOptions.map((s) => (
                    <button key={s} onClick={() => onFiltersChange({ ...filters, severities: toggle(filters.severities, s) })}>
                      <Badge tone={filters.severities.includes(s) ? "blue" : "gray"}>{s}</Badge>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-400">Status</p>
                <div className="flex flex-wrap gap-1.5">
                  {statusOptions.map((s) => (
                    <button key={s} onClick={() => onFiltersChange({ ...filters, status: toggle(filters.status, s) })}>
                      <Badge tone={filters.status.includes(s) ? "blue" : "gray"}>{s}</Badge>
                    </button>
                  ))}
                </div>
              </div>
              <div className="col-span-2">
                <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-400">Outcome</p>
                <div className="flex flex-wrap gap-1.5">
                  {outcomes.map((o) => (
                    <button key={o} onClick={() => onFiltersChange({ ...filters, outcomes: toggle(filters.outcomes, o) })}>
                      <Badge tone={filters.outcomes.includes(o) ? "blue" : "gray"}>{o}</Badge>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-400">Min. Confidence</p>
                <select
                  value={filters.minConfidence}
                  onChange={(e) => onFiltersChange({ ...filters, minConfidence: Number(e.target.value) })}
                  className="w-full rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-[12px] outline-none focus:border-accent-500"
                >
                  {confidenceOptions.map((c) => <option key={c} value={c}>{c === 0 ? "Any" : `${c}+`}</option>)}
                </select>
              </div>
              <div>
                <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-400">Deal Count</p>
                <select
                  value={filters.minDealCount}
                  onChange={(e) => onFiltersChange({ ...filters, minDealCount: Number(e.target.value) })}
                  className="w-full rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-[12px] outline-none focus:border-accent-500"
                >
                  {dealCountOptions.map((c) => <option key={c} value={c}>{c === 0 ? "Any" : `${c}+`}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-400">Time Period</p>
                <div className="flex items-center gap-2">
                  <select
                    value={filters.yearFrom}
                    onChange={(e) => onFiltersChange({ ...filters, yearFrom: Number(e.target.value) })}
                    className="flex-1 rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-[12px] outline-none focus:border-accent-500"
                  >
                    {Array.from({ length: 9 }, (_, i) => 2018 + i).map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <span className="text-ink-400">–</span>
                  <select
                    value={filters.yearTo}
                    onChange={(e) => onFiltersChange({ ...filters, yearTo: Number(e.target.value) })}
                    className="flex-1 rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-[12px] outline-none focus:border-accent-500"
                  >
                    {Array.from({ length: 9 }, (_, i) => 2018 + i).map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
            </div>
            {activeCount > 0 && (
              <button
                onClick={() => onFiltersChange({ ...filters, industries: [], regions: [], severities: [], outcomes: [], status: [], minConfidence: 0, minDealCount: 0 })}
                className="mt-3 text-[11.5px] font-medium text-accent-700 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {relatedAnchor && (
        <span className="flex items-center gap-1.5 rounded-md border border-accent-200 bg-accent-50 py-1 pl-2.5 pr-1.5 text-[12px] font-medium text-accent-800">
          Related to {relatedAnchor.title}
          <button onClick={onClearRelatedFilter} className="rounded p-0.5 hover:bg-accent-100"><X size={12} /></button>
        </span>
      )}
    </div>
  );
}
