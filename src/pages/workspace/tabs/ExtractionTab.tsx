import { useMemo, useState } from "react";
import { ChevronDown, Download, Plus, Search } from "lucide-react";
import { canonicalFields, type CanonicalField } from "../../../lib/mockData";
import { Badge, Button, Card, ConfidenceBar, SourceChip } from "../../../lib/ui";
import { cn } from "../../../lib/cn";

const statusMeta: Record<CanonicalField["status"], { label: string; tone: "blue" | "green" | "dark" | "red" }> = {
  "ai-extracted": { label: "AI extracted", tone: "blue" },
  "human-confirmed": { label: "Confirmed", tone: "green" },
  overridden: { label: "Overridden", tone: "dark" },
  computed: { label: "Computed in Excel", tone: "blue" },
  missing: { label: "Missing", tone: "red" },
};

const passes = [
  { n: "1", name: "Blueprint pass", detail: "38 high-priority template fields" },
  { n: "2", name: "Open extraction", detail: "61 additional values" },
  { n: "3", name: "Table extraction", detail: "12 structured tables" },
  { n: "4", name: "Canonical mapping", detail: "aliases → standard vocabulary" },
  { n: "5", name: "Gap-fill", detail: "2 fields backfilled" },
];

const statusFilters = ["all", "ai-extracted", "human-confirmed", "overridden", "computed", "missing"] as const;

export default function ExtractionTab() {
  const [cat, setCat] = useState<string | null>(null);
  const [status, setStatus] = useState<(typeof statusFilters)[number]>("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const cats = useMemo(() => {
    const m = new Map<string, number>();
    canonicalFields.forEach((f) => m.set(f.category, (m.get(f.category) ?? 0) + 1));
    return [...m.entries()];
  }, []);

  const rows = canonicalFields.filter(
    (f) =>
      (!cat || f.category === cat) &&
      (status === "all" || f.status === status) &&
      (q === "" || f.field.toLowerCase().includes(q.toLowerCase()) || f.aliases.some((a) => a.toLowerCase().includes(q.toLowerCase())))
  );

  const count = (s: CanonicalField["status"]) => canonicalFields.filter((f) => f.status === s).length;

  return (
    <div className="space-y-4">
      {/* Stats strip */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-ink-200 bg-white px-5 py-3.5 text-[12.5px]">
        <span className="text-ink-500"><span className="num font-semibold text-pos-700">{count("human-confirmed")}</span> confirmed</span>
        <span className="text-ink-500"><span className="num font-semibold text-accent-700">{count("ai-extracted")}</span> awaiting review</span>
        <span className="text-ink-500"><span className="num font-semibold text-ink-900">{count("overridden")}</span> overridden</span>
        <span className="text-ink-500"><span className="num font-semibold text-accent-700">{count("computed")}</span> computed in Excel</span>
        <span className="text-ink-500"><span className="num font-semibold text-crit-700">{count("missing")}</span> missing</span>
        <div className="ml-auto flex gap-2">
          <Button variant="secondary"><Download size={13} /> CSV</Button>
          <Button variant="secondary"><Download size={13} /> JSON</Button>
        </div>
      </div>

      {/* Pipeline explainer */}
      <Card>
        <div className="flex items-stretch gap-0 overflow-x-auto">
          {passes.map((p, i) => (
            <div key={p.n} className="flex min-w-0 flex-1 items-center">
              <div className="min-w-0 px-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-50 text-[10.5px] font-bold text-accent-700">{p.n}</span>
                  <p className="whitespace-nowrap text-[12.5px] font-semibold">{p.name}</p>
                </div>
                <p className="mt-1 whitespace-nowrap pl-7 text-[11px] text-ink-500">{p.detail}</p>
              </div>
              {i < passes.length - 1 && <div className="mx-2 h-px w-6 shrink-0 bg-ink-200" />}
            </div>
          ))}
        </div>
      </Card>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {statusFilters.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11.5px] font-medium transition-colors",
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
              {c} <span className="num text-[11px] opacity-70">{n}</span>
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
        <td className="max-w-[220px] px-4 py-3">{f.source.doc !== "—" ? <SourceChip doc={f.source.doc} page={f.source.page} /> : <span className="text-[11px] text-ink-300">—</span>}</td>
        <td className="pr-4"><ChevronDown size={14} className={cn("text-ink-400 transition-transform", open && "rotate-180")} /></td>
      </tr>
      {open && (
        <tr className="bg-ink-50/60">
          <td colSpan={6} className="px-5 py-4">
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
            {f.status === "missing" ? (
              <Button variant="ghost"><Plus size={13} /> Add manually</Button>
            ) : f.status === "ai-extracted" ? (
              <div className="flex gap-2">
                <Button variant="secondary">Confirm value</Button>
                <Button variant="ghost">Override…</Button>
              </div>
            ) : null}
          </td>
        </tr>
      )}
    </>
  );
}
