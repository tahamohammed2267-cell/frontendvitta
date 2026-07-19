import { useState } from "react";
import { CheckCircle2, RotateCcw } from "lucide-react";
import type { Conflict } from "../../../lib/mockData";
import { useStore } from "../../../lib/store";
import { Badge, Button, Card, CardHeader, ConfidenceBar, SeverityBadge, SourceChip } from "../../../lib/ui";
import { cn } from "../../../lib/cn";

const ruleTone: Record<string, "blue" | "gray" | "red" | "orange"> = {
  "Benchmark range": "blue", "Cross-field logic": "gray", "Missing required": "red", Plausibility: "orange",
};

export default function ReconciliationTab() {
  const conflicts = useStore((s) => s.conflicts);
  const validationFlags = useStore((s) => s.validationFlags);
  const open = conflicts.filter((c) => c.status === "open");
  const resolved = conflicts.filter((c) => c.status === "resolved");

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card><p className="text-[12px] font-medium text-ink-500">Open conflicts</p><p className="num mt-1 text-[26px] font-semibold text-warn-700">{open.length}</p></Card>
        <Card><p className="text-[12px] font-medium text-ink-500">Resolved</p><p className="num mt-1 text-[26px] font-semibold text-pos-700">{resolved.length}</p></Card>
        <Card><p className="text-[12px] font-medium text-ink-500">Validation flags</p><p className="num mt-1 text-[26px] font-semibold text-accent-700">{validationFlags.length}</p></Card>
      </div>

      <p className="text-[15px] font-semibold tracking-tight">Value conflicts</p>
      {open.map((c) => <ConflictCard key={c.id} c={c} />)}

      {resolved.map((c) => (
        <Card key={c.id} className="border-pos-100 bg-pos-50/40">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-pos-600" />
                <p className="text-[14px] font-semibold">{c.field}</p>
                <Badge tone="green">Resolved</Badge>
                <SeverityBadge severity={c.severity} />
              </div>
              <p className="mt-2 text-[13px]">
                Chosen value: <span className="num font-semibold">{c.resolution?.chosen}</span>
              </p>
              <p className="mt-1 text-[12px] text-ink-500">
                Resolved by {c.resolution?.by} · {c.resolution?.at}
              </p>
              <p className="mt-1.5 text-[12.5px] italic text-ink-600">“{c.resolution?.note}”</p>
            </div>
            <Button variant="ghost"><RotateCcw size={13} /> Reopen</Button>
          </div>
        </Card>
      ))}

      {/* Validation layer */}
      <div className="pt-2">
        <Card pad={false} className="overflow-hidden">
          <div className="border-b border-ink-100 px-5 py-4">
            <CardHeader title="Validation layer" sub="Sanity, benchmark and cross-field logic checks — flagged by severity" />
          </div>
          <div className="divide-y divide-ink-100">
            {validationFlags.map((v) => (
              <div key={v.id} className="flex items-start gap-4 px-5 py-4">
                <Badge tone={ruleTone[v.rule] ?? "gray"}>{v.rule}</Badge>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium leading-snug">{v.message}</p>
                  <p className="mt-1 text-[12px] text-ink-500">{v.detail}</p>
                  <p className="mt-1 text-[11px] font-medium text-ink-400">Field: {v.field}</p>
                </div>
                <SeverityBadge severity={v.severity} />
                <div className="flex shrink-0 gap-1">
                  <button className="rounded-md px-2 py-1 text-[11.5px] font-medium text-ink-500 hover:bg-ink-100">Dismiss</button>
                  <button className="rounded-md px-2 py-1 text-[11.5px] font-medium text-accent-700 hover:bg-accent-50">Create action item</button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function ConflictCard({ c }: { c: Conflict }) {
  const [selected, setSelected] = useState<number | "override" | null>(null);
  return (
    <Card>
      <div className="mb-4 flex items-center gap-2">
        <p className="text-[14.5px] font-semibold">{c.field}</p>
        <Badge tone="gray">{c.category}</Badge>
        <SeverityBadge severity={c.severity} />
        <Badge tone="orange" className="ml-auto">Needs review</Badge>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {c.candidates.map((cand, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={cn(
              "rounded-lg border p-3.5 text-left transition-all",
              selected === i ? "border-accent-600 bg-accent-50 shadow-[0_0_0_3px_rgba(37,99,235,0.1)]" : "border-ink-200 hover:border-ink-300"
            )}
          >
            <p className="num text-[19px] font-semibold tracking-tight">{cand.value}</p>
            <div className="mt-2"><SourceChip doc={cand.source} page={cand.page} /></div>
            <div className="mt-2"><ConfidenceBar value={cand.confidence} /></div>
            <p className="mt-2 border-l-2 border-ink-200 pl-2 text-[11px] italic leading-snug text-ink-500">“{cand.snippet}”</p>
          </button>
        ))}
        <button
          onClick={() => setSelected("override")}
          className={cn(
            "rounded-lg border border-dashed p-3.5 text-left transition-all",
            selected === "override" ? "border-accent-600 bg-accent-50" : "border-ink-300 hover:border-ink-400"
          )}
        >
          <p className="text-[13px] font-semibold text-ink-700">Manual override</p>
          <p className="mt-1 text-[11.5px] text-ink-500">Type the correct value — always wins over AI-extracted values, logged with your name and reason.</p>
          {selected === "override" && (
            <div className="mt-3 space-y-2" onClick={(e) => e.stopPropagation()}>
              <input placeholder="Value" className="w-full rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-[12.5px] outline-none focus:border-accent-500" />
              <textarea placeholder="Reason (required)" rows={2} className="w-full rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-[12.5px] outline-none focus:border-accent-500" />
            </div>
          )}
        </button>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-[11.5px] text-ink-400">Resolution is written to the canonical table and logged in the audit trail.</p>
        <div className="flex gap-2">
          <Button variant="ghost">Escalate to Principal</Button>
          <Button className={cn(selected === null && "pointer-events-none opacity-40")}>Resolve conflict</Button>
        </div>
      </div>
    </Card>
  );
}
