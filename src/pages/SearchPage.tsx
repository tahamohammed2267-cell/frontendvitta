import { useEffect, useRef, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowUp, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { SEARCH_PROMPTS, pickAgentAnswer, type AgentAnswer, type AgentVisual } from "../lib/searchAgent";
import { SourceChip } from "../lib/ui";
import { cn } from "../lib/cn";

const TYPE_FILTERS = ["Decision", "Playbook", "Recommendation", "Observation", "Pattern", "Deal", "Field", "Risk", "Document"];
const SECTORS = ["Solar", "Wind", "Infrastructure"];

type UserMsg = { role: "user"; text: string };
type AiMsg = { role: "ai"; answer: AgentAnswer };
type Msg = UserMsg | AiMsg;

const STEP_MS = 750;

export default function SearchPage() {
  const [thread, setThread] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState<{ answer: AgentAnswer; step: number } | null>(null);
  const [activeTypes, setActiveTypes] = useState<Set<string>>(new Set(TYPE_FILTERS));
  const threadRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    requestAnimationFrame(() => { const el = threadRef.current; if (el) el.scrollTop = el.scrollHeight; });
  }, [thread.length, pending?.step]);

  function toggleType(t: string) {
    setActiveTypes((prev) => { const n = new Set(prev); n.has(t) ? n.delete(t) : n.add(t); return n; });
  }

  function ask(q: string) {
    if (!q.trim() || pending) return;
    const answer = pickAgentAnswer(q);
    setThread((t) => [...t, { role: "user", text: q.trim() }]);
    setInput("");
    setPending({ answer, step: 0 });
    // Walk the workflow steps, then commit the answer.
    answer.steps.forEach((_, i) => {
      timers.current.push(setTimeout(() => setPending((p) => (p ? { ...p, step: i + 1 } : p)), STEP_MS * (i + 1)));
    });
    timers.current.push(setTimeout(() => {
      setThread((t) => [...t, { role: "ai", answer }]);
      setPending(null);
    }, STEP_MS * (answer.steps.length + 1)));
  }

  const empty = thread.length === 0 && !pending;

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* ── Left rail: scope filters ─────────────────── */}
      <aside className="hidden w-[190px] shrink-0 flex-col overflow-y-auto border-r border-ink-200 bg-white p-4 lg:flex">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Type</p>
        <div className="space-y-0.5">
          {TYPE_FILTERS.map((f) => (
            <label key={f} className="flex items-center gap-2 rounded-md px-1 py-1 text-[12.5px] text-ink-700 hover:bg-ink-50">
              <input type="checkbox" checked={activeTypes.has(f)} onChange={() => toggleType(f)} className="h-3.5 w-3.5 rounded border-ink-300 accent-accent-600" /> {f}
            </label>
          ))}
        </div>
        <p className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Sector</p>
        <div className="space-y-0.5">
          {SECTORS.map((f) => (
            <label key={f} className="flex items-center gap-2 rounded-md px-1 py-1 text-[12.5px] text-ink-700 hover:bg-ink-50">
              <input type="checkbox" defaultChecked className="h-3.5 w-3.5 rounded border-ink-300 accent-accent-600" /> {f}
            </label>
          ))}
        </div>
        <p className="mt-auto pt-4 text-[10.5px] leading-relaxed text-ink-400">Scopes the documents vitta retrieves before answering.</p>
      </aside>

      {/* ── Chat column ──────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div ref={threadRef} className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[760px] px-6 py-6">
            {empty ? (
              <div className="pt-10 text-center fade-up">
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-accent-50 text-accent-600 floaty"><Sparkles size={20} /></div>
                <h1 className="text-[19px] font-semibold tracking-tight">Search &amp; ask</h1>
                <p className="mx-auto mt-1 max-w-[440px] text-[13px] text-ink-500">Ask anything across every deal, document, field and decision. vitta runs a full retrieval workflow and answers with figures and sources.</p>
                <div className="mx-auto mt-6 grid max-w-[560px] gap-2">
                  {SEARCH_PROMPTS.map((p) => (
                    <button key={p.q} onClick={() => ask(p.q)} className="lift flex items-center gap-2.5 rounded-lg border border-ink-200 bg-white px-4 py-3 text-left text-[13px] font-medium text-ink-700 hover:border-accent-500 hover:text-accent-700">
                      <Sparkles size={14} className="shrink-0 text-accent-500" /> {p.q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {thread.map((m, i) =>
                  m.role === "user" ? (
                    <div key={i} className="flex justify-end fade-up">
                      <div className="max-w-[85%] rounded-lg rounded-br-md bg-ink-900 px-3.5 py-2.5 text-[13px] leading-relaxed text-white">{m.text}</div>
                    </div>
                  ) : (
                    <AnswerBlock key={i} answer={m.answer} />
                  )
                )}
                {pending && <WorkflowTrace answer={pending.answer} step={pending.step} />}
              </div>
            )}
          </div>
        </div>

        {/* Input pinned to bottom */}
        <div className="shrink-0 border-t border-ink-100 bg-white px-6 py-4">
          <div className="mx-auto max-w-[760px]">
            {!empty && (
              <div className="mb-2.5 flex flex-wrap gap-1.5">
                {SEARCH_PROMPTS.slice(0, 3).map((p) => (
                  <button key={p.q} onClick={() => ask(p.q)} disabled={!!pending} className="rounded-md border border-ink-200 px-2.5 py-1 text-[11px] text-ink-600 transition-colors hover:border-accent-500 hover:text-accent-700 disabled:opacity-40">{p.q}</button>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-2.5 shadow-[0_2px_10px_rgba(11,14,20,0.05)] focus-within:border-accent-500 focus-within:ring-4 focus-within:ring-accent-600/10">
              <Sparkles size={16} className="shrink-0 text-accent-500" />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && ask(input)}
                placeholder="Ask anything, or search across every deal, document and field…"
                className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-ink-400"
              />
              <button onClick={() => ask(input)} disabled={!input.trim() || !!pending} className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-600 text-white transition-colors hover:bg-accent-700 disabled:pointer-events-none disabled:opacity-40">
                <ArrowUp size={16} />
              </button>
            </div>
            <p className="mt-2 text-center text-[10.5px] text-ink-400">Answers run a retrieval workflow and cite workspace sources.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkflowTrace({ answer, step }: { answer: AgentAnswer; step: number }) {
  return (
    <div className="fade-up rounded-lg border border-ink-200 bg-ink-50/50 p-4">
      <div className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold text-accent-700"><Sparkles size={12} /> vitta is working…</div>
      <div className="space-y-2">
        {answer.steps.map((s, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <div key={s} className={cn("flex items-center gap-2.5 text-[12.5px]", done ? "text-ink-500" : active ? "text-ink-900" : "text-ink-300")}>
              {done ? <CheckCircle2 size={14} className="text-pos-600" /> : active ? <Loader2 size={14} className="animate-spin text-accent-600" /> : <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-ink-300" />}
              <span className={active ? "pulse-soft font-medium" : ""}>{s}{active ? "…" : ""}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AnswerBlock({ answer }: { answer: AgentAnswer }) {
  return (
    <div className="fade-up">
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-accent-700"><Sparkles size={12} /> vitta</div>
      <p className="text-[13.5px] leading-relaxed text-ink-800">
        {answer.text.split(/(\[\d\])/).map((part, j) =>
          /^\[\d\]$/.test(part) ? (
            <sup key={j} className="mx-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded bg-accent-100 px-0.5 text-[9.5px] font-semibold text-accent-700">{part.replace(/[[\]]/g, "")}</sup>
          ) : (
            <span key={j}>{part}</span>
          )
        )}
      </p>

      {answer.visual && <div className="mt-4"><VisualBlock visual={answer.visual} /></div>}

      {answer.citations && answer.citations.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-ink-100 pt-3">
          <span className="text-[10.5px] font-semibold uppercase tracking-wide text-ink-400">Sources</span>
          {answer.citations.map((c) => (
            <span key={c.n} className="flex items-center gap-1.5">
              <span className="flex h-4 w-4 items-center justify-center rounded bg-accent-100 text-[9.5px] font-semibold text-accent-700">{c.n}</span>
              {c.page > 0 ? <SourceChip doc={c.doc} page={c.page} /> : <span className="text-[11.5px] text-ink-600">{c.doc.replace(/_/g, " ")}</span>}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

const toneCard: Record<string, string> = {
  critical: "border-l-crit-600 bg-crit-50/50", high: "border-l-warn-600 bg-warn-50/50",
  medium: "border-l-warn-500 bg-warn-50/30", low: "border-l-ink-300 bg-ink-50",
};

function VisualBlock({ visual }: { visual: AgentVisual }) {
  return (
    <div className="rounded-lg border border-ink-200 bg-white p-4">
      <p className="mb-3 text-[12px] font-semibold tracking-tight text-ink-800">{visual.title}</p>

      {visual.kind === "bar" && (
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={visual.data} margin={{ top: 4, right: 8, bottom: 0, left: -14 }}>
              <CartesianGrid vertical={false} stroke="#eceef3" />
              <XAxis dataKey="label" tick={{ fontSize: 10.5, fill: "#8a93a6" }} axisLine={false} tickLine={false} interval={0} />
              <YAxis tick={{ fontSize: 10.5, fill: "#8a93a6" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #dde1e9" }} formatter={(v: number) => [`${v}${visual.unit ? " " + visual.unit : ""}`, ""]} />
              {visual.refValue !== undefined && <ReferenceLine y={visual.refValue} stroke="#dc2626" strokeDasharray="4 3" label={{ value: visual.refLabel, position: "insideTopLeft", fontSize: 10, fill: "#b91c1c" }} />}
              <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={30}>
                {visual.data.map((d) => <Cell key={d.label} fill={visual.refValue !== undefined && d.value < visual.refValue ? "#0e5f45" : "#8a93a6"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {visual.kind === "line" && (
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={visual.data} margin={{ top: 4, right: 8, bottom: 0, left: -14 }}>
              <CartesianGrid vertical={false} stroke="#eceef3" />
              <XAxis dataKey="label" tick={{ fontSize: 10.5, fill: "#8a93a6" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10.5, fill: "#8a93a6" }} axisLine={false} tickLine={false} domain={["dataMin - 2", "dataMax + 2"]} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #dde1e9" }} formatter={(v: number) => [`${v}${visual.unit ? " " + visual.unit : ""}`, ""]} />
              <Area type="monotone" dataKey="value" stroke="#0e5f45" strokeWidth={2} fill="#0e5f45" fillOpacity={0.14} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {visual.kind === "table" && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12.5px]">
            <thead>
              <tr className="border-b border-ink-100 text-[10.5px] font-semibold uppercase tracking-wide text-ink-400">
                {visual.columns.map((c, i) => <th key={c} className={cn("py-2 pr-3", i === 0 ? "" : "text-right")}>{c}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {visual.rows.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, i) => <td key={i} className={cn("py-2 pr-3", i === 0 ? "font-medium text-ink-900" : "num text-right text-ink-700")}>{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {visual.kind === "cards" && (
        <div className="space-y-2">
          {visual.items.map((it) => (
            <div key={it.title} className={cn("rounded-r-lg border-l-2 py-2 pl-3 pr-2", toneCard[it.tone])}>
              <p className="text-[12.5px] font-semibold text-ink-900">{it.title}</p>
              <p className="mt-0.5 text-[11.5px] text-ink-600">{it.sub}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
