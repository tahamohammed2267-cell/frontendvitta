import { useMemo, useState } from "react";
import { ChevronDown, Database, Download, Plus, Search } from "lucide-react";
import type { CanonicalField } from "../../../lib/mockData";
import { useStore } from "../../../lib/store";
import { downloadCSV } from "../../../lib/download";
import { Badge, Button, Card, ConfidenceBar, EmptyState, SourceChip } from "../../../lib/ui";
import { cn } from "../../../lib/cn";

const statusMeta: Record<CanonicalField["status"], { label: string; tone: "blue" | "green" | "dark" | "red" }> = {
  "ai-extracted": { label: "AI extracted", tone: "blue" },
  "human-confirmed": { label: "Confirmed", tone: "green" },
  overridden: { label: "Overridden", tone: "dark" },
  computed: { label: "Computed in Excel", tone: "blue" },
  missing: { label: "Missing", tone: "red" },
};

const statusFilters = ["all", "ai-extracted", "human-confirmed", "overridden", "computed", "missing"] as const;

// Display-only relabeling — the underlying category string on each
// CanonicalField/Conflict stays "Costs" (other consumers, e.g. Intelligence's
// DNA scoring, filter on that exact string), only the rail's visible label changes.
const categoryLabels: Record<string, string> = { Costs: "Costs and Capex" };

export default function ExtractionTab() {
  const canonicalFields = useStore((s) => s.canonicalFields);
  const [cat, setCat] = useState<string | null>(null);
  const [status, setStatus] = useState<(typeof statusFilters)[number]>("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const cats = useMemo(() => {
    const m = new Map<string, number>();
    canonicalFields.forEach((f) => m.set(f.category, (m.get(f.category) ?? 0) + 1));
    return [...m.entries()];
  }, [canonicalFields]);

  const rows = canonicalFields.filter(
    (f) =>
      (!cat || f.category === cat) &&
      (status === "all" || f.status === status) &&
      (q === "" || f.field.toLowerCase().includes(q.toLowerCase()) || f.aliases.some((a) => a.toLowerCase().includes(q.toLowerCase())))
  );

  const count = (s: CanonicalField["status"]) => canonicalFields.filter((f) => f.status === s).length;

  if (canonicalFields.length === 0) {
    return (
      <Card>
        <EmptyState icon={<Database size={20} />} title="No canonical fields yet" sub="Upload documents and run extraction from the Documents tab to populate this view." />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats strip */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-ink-200 bg-white px-5 py-3.5 text-[12.5px]">
        <span className="text-ink-500"><span className="num font-semibold text-pos-700">{count("human-confirmed")}</span> confirmed</span>
        <span className="text-ink-500"><span className="num font-semibold text-accent-700">{count("ai-extracted")}</span> awaiting review</span>
        <span className="text-ink-500"><span className="num font-semibold text-ink-900">{count("overridden")}</span> overridden</span>
        <span className="text-ink-500"><span className="num font-semibold text-accent-700">{count("computed")}</span> computed in Excel</span>
        <span className="text-ink-500"><span className="num font-semibold text-crit-700">{count("missing")}</span> missing</span>
        <div className="ml-auto flex gap-2">
          <Button
            variant="secondary"
            onClick={() =>
              downloadCSV(
                canonicalFields.map((f) => ({ field: f.field, category: f.category, value: f.value, confidence: f.confidence, status: f.status, source_doc: f.source.doc, source_page: f.source.page })),
                "helios_canonical_fields.xlsx"
              )
            }
          >
            <Download size={13} /> Download as XLSX
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {statusFilters.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={cn(
                "rounded-md border px-2.5 py-1 text-[11.5px] font-medium transition-colors",
                status === s ? "border-ink-900 bg-ink-900 text-white" : "border-ink-200 bg-white text-ink-500 hover:border-ink-300"
              )}
            >
              {s === "all" ? "All" : statusMeta[s as CanonicalField["status"]].label}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search fields or aliases…" className="w-56 rounded-lg border border-ink-200 bg-white py-1.5 pl-8 pr-3 text-[12.5px] outline-none placeholder:text-ink-400 focus:border-accent-500" />
        </div>
      </div>

      <div className="grid grid-cols-[180px_1fr] gap-4">
        {/* Category rail */}
        <div className="space-y-1">
          <button onClick={() => setCat(null)} className={cn("flex w-full items-center justify-between rounded-lg px-3 py-2 text-[12.5px] font-medium", !cat ? "bg-ink-900 text-white" : "text-ink-600 hover:bg-ink-100")}>
            All categories <span className="num text-[11px] opacity-70">{canonicalFields.length}</span>
          </button>
          {cats.map(([c, n]) => (
            <button key={c} onClick={() => setCat(cat === c ? null : c)} className={cn("flex w-full items-center justify-between rounded-lg px-3 py-2 text-[12.5px] font-medium", cat === c ? "bg-ink-900 text-white" : "text-ink-600 hover:bg-ink-100")}>
              {categoryLabels[c] ?? c} <span className="num text-[11px] opacity-70">{n}</span>
            </button>
          ))}
        </div>

        {/* Table */}
        <Card pad={false} className="overflow-hidden self-start">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-ink-100 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-400">
                <th className="px-5 py-3">Canonical field</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">Confidence</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Source</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {rows.map((f) => (
                <FieldRow key={f.id} f={f} open={open === f.id} onToggle={() => setOpen(open === f.id ? null : f.id)} />
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

function FieldRow({ f, open, onToggle }: { f: CanonicalField; open: boolean; onToggle: () => void }) {
  const meta = statusMeta[f.status];
  const confirmField = useStore((s) => s.confirmField);
  const overrideField = useStore((s) => s.overrideField);
  const addFieldManually = useStore((s) => s.addFieldManually);
  const [overriding, setOverriding] = useState(false);
  const [overrideValue, setOverrideValue] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [adding, setAdding] = useState(false);
  const [manualValue, setManualValue] = useState("");

  return (
    <>
      <tr onClick={onToggle} className="cursor-pointer transition-colors hover:bg-ink-50">
        <td className="px-5 py-3">
          <p className="text-[13px] font-semibold">{f.field}</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {f.aliases.slice(0, 2).map((a) => (
              <span key={a} className="rounded bg-ink-100 px-1.5 py-0.5 text-[10px] text-ink-500">{a}</span>
            ))}
          </div>
        </td>
        <td className={cn("num px-4 py-3 text-[13.5px] font-semibold", f.status === "missing" && "font-normal text-crit-600")}>
          {f.status === "missing" ? "— missing" : f.value}
        </td>
        <td className="px-4 py-3">{f.confidence > 0 ? <ConfidenceBar value={f.confidence} /> : <span className="text-[11px] text-ink-300">—</span>}</td>
        <td className="px-4 py-3"><Badge tone={meta.tone}>{meta.label}</Badge></td>
        <td className="max-w-[220px] px-4 py-3">
          {f.source.doc !== "—" ? (
            <SourceChip doc={f.source.doc} page={f.source.page} field={f.field} value={f.value} confidence={f.confidence} snippet={f.source.snippet} />
          ) : (
            <span className="text-[11px] text-ink-300">—</span>
          )}
        </td>
        <td className="pr-4"><ChevronDown size={14} className={cn("text-ink-400 transition-transform", open && "rotate-180")} /></td>
      </tr>
      {open && (
        <tr className="bg-ink-50/60">
          <td colSpan={6} className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
            {f.source.snippet && (
              <div className="mb-3 border-l-2 border-accent-600 pl-3">
                <p className="text-[12.5px] italic leading-relaxed text-ink-700">“{f.source.snippet}”</p>
                <p className="mt-1 text-[11px] text-ink-400">{f.source.doc} · page {f.source.page}</p>
              </div>
            )}
            {f.override && (
              <div className="mb-3 rounded-lg border border-ink-200 bg-white p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">Override log</p>
                <p className="mt-1.5 text-[12.5px]">
                  <span className="font-medium">{f.override.by}</span> · {f.override.at} · previous value{" "}
                  <span className="num line-through decoration-crit-600/60">{f.override.previousValue}</span>
                </p>
                <p className="mt-1 text-[12px] italic text-ink-600">“{f.override.reason}”</p>
              </div>
            )}
            {f.status === "computed" && (
              <p className="mb-3 rounded-lg border border-accent-100 bg-accent-50 px-3 py-2 text-[12px] text-accent-800">
                Value computed in the uploaded workbook — highest-priority source; overrides anything the AI extracted.
              </p>
            )}
            {f.status === "missing" && !adding && (
              <Button variant="ghost" onClick={() => setAdding(true)}><Plus size={13} /> Add manually</Button>
            )}
            {f.status === "missing" && adding && (
              <div className="max-w-sm space-y-2">
                <input
                  autoFocus
                  value={manualValue}
                  onChange={(e) => setManualValue(e.target.value)}
                  placeholder="Value"
                  className="w-full rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-[12.5px] outline-none focus:border-accent-500"
                />
                <div className="flex gap-2">
                  <Button
                    className={cn(!manualValue.trim() && "pointer-events-none opacity-40")}
                    onClick={() => {
                      addFieldManually(f.id, manualValue.trim());
                      setAdding(false);
                      setManualValue("");
                    }}
                  >
                    Save
                  </Button>
                  <Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
                </div>
              </div>
            )}
            {f.status === "ai-extracted" && !overriding && (
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => confirmField(f.id)}>Confirm value</Button>
                <Button variant="ghost" onClick={() => { setOverriding(true); setOverrideValue(f.value); }}>Override…</Button>
              </div>
            )}
            {f.status === "ai-extracted" && overriding && (
              <div className="max-w-sm space-y-2">
                <input
                  autoFocus
                  value={overrideValue}
                  onChange={(e) => setOverrideValue(e.target.value)}
                  placeholder="Value"
                  className="w-full rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-[12.5px] outline-none focus:border-accent-500"
                />
                <textarea
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="Reason (required)"
                  rows={2}
                  className="w-full rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-[12.5px] outline-none focus:border-accent-500"
                />
                <div className="flex gap-2">
                  <Button
                    className={cn((!overrideValue.trim() || !overrideReason.trim()) && "pointer-events-none opacity-40")}
                    onClick={() => {
                      overrideField(f.id, overrideValue.trim(), overrideReason.trim());
                      setOverriding(false);
                      setOverrideReason("");
                    }}
                  >
                    Save override
                  </Button>
                  <Button variant="ghost" onClick={() => setOverriding(false)}>Cancel</Button>
                </div>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}
