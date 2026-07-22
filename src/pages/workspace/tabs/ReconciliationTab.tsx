import { Fragment, useState } from "react";
import { ChevronDown, ChevronRight, CheckCircle2, RotateCcw, ShieldCheck, UserPlus } from "lucide-react";
import type { Conflict } from "../../../lib/mockData";
import { useStore } from "../../../lib/store";
import { Badge, Button, Card, CardHeader, ConfidenceBar, EmptyState, SeverityBadge, SourceChip } from "../../../lib/ui";
import { cn } from "../../../lib/cn";

const ruleTone: Record<string, "blue" | "gray" | "red" | "orange"> = {
  "Benchmark range": "blue", "Cross-field logic": "gray", "Missing required": "red", Plausibility: "orange",
};

// Same 5-person team roster already used across the app as document
// uploaders/leads (J. Moreau, R. Chen, A. Lindqvist, S. Okafor, M. Ferreira)
// — reused here rather than inventing a separate directory.
const analysts = ["J. Moreau", "R. Chen", "A. Lindqvist", "S. Okafor", "M. Ferreira"];

export default function ReconciliationTab() {
  const conflicts = useStore((s) => s.conflicts);
  const validationFlags = useStore((s) => s.validationFlags);
  const reopenConflict = useStore((s) => s.reopenConflict);
  const dismissValidationFlag = useStore((s) => s.dismissValidationFlag);
  const createActionItemFromFlag = useStore((s) => s.createActionItemFromFlag);
  const [expanded, setExpanded] = useState<string | null>(null);
  const open = conflicts.filter((c) => c.status === "open");
  const resolved = conflicts.filter((c) => c.status === "resolved");

  if (conflicts.length === 0 && validationFlags.length === 0) {
    return (
      <Card>
        <EmptyState icon={<ShieldCheck size={20} />} title="Nothing to reconcile yet" sub="Conflicts and validation flags surface here once documents have been uploaded and extraction has run." />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <Card>
        <div className="grid grid-cols-3 divide-x divide-ink-100">
          <div className="flex items-center gap-2.5 pr-4">
            <p className="text-[11.5px] font-medium text-ink-500">Open conflicts</p>
            <p className="num text-[17px] font-semibold text-warn-700">{open.length}</p>
          </div>
          <div className="flex items-center gap-2.5 px-4">
            <p className="text-[11.5px] font-medium text-ink-500">Resolved</p>
            <p className="num text-[17px] font-semibold text-pos-700">{resolved.length}</p>
          </div>
          <div className="flex items-center gap-2.5 pl-4">
            <p className="text-[11.5px] font-medium text-ink-500">Validation flags</p>
            <p className="num text-[17px] font-semibold text-accent-700">{validationFlags.length}</p>
          </div>
        </div>
      </Card>

      <p className="text-[15px] font-semibold tracking-tight">Value conflicts</p>
      {conflicts.length === 0 && (
        <Card className="border-pos-100 bg-pos-50/40">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-pos-600" />
            <p className="text-[13.5px] font-medium text-pos-800">All conflicts resolved</p>
          </div>
        </Card>
      )}

      {conflicts.length > 0 && (
        <Card pad={false} className="overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-ink-100 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-400">
                <th className="w-8 px-5 py-2.5" />
                <th className="px-4 py-2.5">Field</th>
                <th className="px-4 py-2.5">Category</th>
                <th className="px-4 py-2.5">Severity</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-5 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {[...open, ...resolved].map((c) => {
                const isOpen = expanded === c.id;
                return (
                  <Fragment key={c.id}>
                    <tr
                      onClick={() => setExpanded(isOpen ? null : c.id)}
                      className="cursor-pointer transition-colors hover:bg-ink-50"
                    >
                      <td className="px-5 py-3"><ChevronRight size={14} className={cn("text-ink-400 transition-transform", isOpen && "rotate-90")} /></td>
                      <td className="px-4 py-3 text-[13px] font-medium">{c.field}</td>
                      <td className="px-4 py-3"><Badge tone="gray">{c.category}</Badge></td>
                      <td className="px-4 py-3"><SeverityBadge severity={c.severity} /></td>
                      <td className="px-4 py-3">
                        {c.status === "resolved" ? <Badge tone="green">Resolved</Badge> : <Badge tone="orange">Needs review</Badge>}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {c.status === "resolved" && (
                          <span className="text-[11.5px] text-ink-500">{c.resolution?.by} · {c.resolution?.at}</span>
                        )}
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="bg-ink-50/50">
                        <td colSpan={6} className="px-5 py-4">
                          {c.status === "resolved" ? <ResolvedDetail c={c} onReopen={() => reopenConflict(c.id)} /> : <ConflictDetail c={c} />}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {/* Validation layer */}
      <div className="pt-2">
        <Card pad={false} className="overflow-hidden">
          <div className="border-b border-ink-100 px-5 py-4">
            <CardHeader title="Validation layer" sub="Sanity, benchmark and cross-field logic checks — flagged by severity" />
          </div>
          <div className="divide-y divide-ink-100">
            {validationFlags.length === 0 && (
              <p className="px-5 py-6 text-center text-[12.5px] text-ink-400">No open validation flags.</p>
            )}
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
                  <button onClick={() => dismissValidationFlag(v.id)} className="rounded-md px-2 py-1 text-[11.5px] font-medium text-ink-500 hover:bg-ink-100">Dismiss</button>
                  <button onClick={() => createActionItemFromFlag(v.id)} className="rounded-md px-2 py-1 text-[11.5px] font-medium text-accent-700 hover:bg-accent-50">Create action item</button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function ResolvedDetail({ c, onReopen }: { c: Conflict; onReopen: () => void }) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[13px]">
          Chosen value: <span className="num font-semibold">{c.resolution?.chosen}</span>
        </p>
        <p className="mt-1 text-[12px] text-ink-500">Resolved by {c.resolution?.by} · {c.resolution?.at}</p>
        <p className="mt-1.5 text-[12.5px] italic text-ink-600">“{c.resolution?.note}”</p>
      </div>
      <Button variant="ghost" onClick={onReopen}><RotateCcw size={13} /> Reopen</Button>
    </div>
  );
}

function ConflictDetail({ c }: { c: Conflict }) {
  const resolveConflict = useStore((s) => s.resolveConflict);
  const escalateConflict = useStore((s) => s.escalateConflict);
  const [selected, setSelected] = useState<number | "override" | null>(null);
  const [overrideValue, setOverrideValue] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [escalateOpen, setEscalateOpen] = useState(false);

  const canResolve = selected !== null && (selected !== "override" || (overrideValue.trim() && overrideReason.trim()));

  function resolve() {
    if (selected === "override") {
      resolveConflict(c.id, { value: overrideValue.trim(), source: "Manual override" }, overrideReason.trim());
    } else if (typeof selected === "number") {
      const cand = c.candidates[selected];
      resolveConflict(c.id, { value: cand.value, source: cand.source, page: cand.page, snippet: cand.snippet, confidence: cand.confidence }, `Selected ${cand.source} — highest-confidence, governing source.`);
    }
  }

  function escalateTo(name: string) {
    escalateConflict(c.id, name);
    setEscalateOpen(false);
  }

  return (
    <div>
      <div className="grid grid-cols-4 gap-3">
        {c.candidates.map((cand, i) => (
          <div
            key={i}
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); setSelected(i); }}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelected(i)}
            className={cn(
              "cursor-pointer rounded-lg border bg-white p-3.5 text-left transition-all",
              selected === i ? "border-accent-600 bg-accent-50 shadow-[0_0_0_3px_rgba(37,99,235,0.1)]" : "border-ink-200 hover:border-ink-300"
            )}
          >
            <p className="num text-[19px] font-semibold tracking-tight">{cand.value}</p>
            <div className="mt-2"><SourceChip doc={cand.source} page={cand.page} field={c.field} value={cand.value} confidence={cand.confidence} snippet={cand.snippet} /></div>
            <div className="mt-2"><ConfidenceBar value={cand.confidence} /></div>
            <p className="mt-2 border-l-2 border-ink-200 pl-2 text-[11px] italic leading-snug text-ink-500">“{cand.snippet}”</p>
          </div>
        ))}
        <div
          role="button"
          tabIndex={0}
          onClick={(e) => { e.stopPropagation(); setSelected("override"); }}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelected("override")}
          className={cn(
            "cursor-pointer rounded-lg border border-dashed bg-white p-3.5 text-left transition-all",
            selected === "override" ? "border-accent-600 bg-accent-50" : "border-ink-300 hover:border-ink-400"
          )}
        >
          <p className="text-[13px] font-semibold text-ink-700">Manual override</p>
          <p className="mt-1 text-[11.5px] text-ink-500">Type the correct value — always wins over AI-extracted values, logged with your name and reason.</p>
          {selected === "override" && (
            <div className="mt-3 space-y-2" onClick={(e) => e.stopPropagation()}>
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
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-[11.5px] text-ink-400">Resolution is written to the canonical table and logged in the audit trail.</p>
        <div className="flex gap-2">
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" onClick={() => setEscalateOpen((o) => !o)}>
              <UserPlus size={13} /> Escalate to <ChevronDown size={12} className={cn("transition-transform", escalateOpen && "rotate-180")} />
            </Button>
            {escalateOpen && (
              <div className="absolute right-0 top-[calc(100%+4px)] z-20 w-48 rounded-lg border border-ink-200 bg-white py-1 shadow-[0_10px_30px_-8px_rgba(11,14,20,0.25)]">
                {analysts.map((name) => (
                  <button
                    key={name}
                    onClick={() => escalateTo(name)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12.5px] font-medium text-ink-700 hover:bg-ink-50"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-100 text-[10px] font-semibold text-ink-600">
                      {name.split(" ").map((s) => s[0]).join("")}
                    </span>
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button className={cn(!canResolve && "pointer-events-none opacity-40")} onClick={resolve}>Resolve conflict</Button>
        </div>
      </div>
    </div>
  );
}
