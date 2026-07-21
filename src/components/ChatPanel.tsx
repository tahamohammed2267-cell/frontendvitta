import { useEffect, useRef, useState } from "react";
import { ArrowUp, BarChart3, Check, Eye, FileText, GitCompareArrows, Plus, Sparkles, Table2 } from "lucide-react";
import { useStore } from "../lib/store";
import type { ChatMessage } from "../lib/store";
import type { ChatChart } from "../lib/chatResponses";
import { SourceChip } from "../lib/ui";
import { useTypewriter } from "../lib/motion";
import { cn } from "../lib/cn";

// Contextual "next step" actions surfaced under the latest answer — the
// agentic pattern: an answer that also proposes what to do with it.
const FOLLOW_UPS = [
  { icon: Table2, label: "Show the underlying figures", query: "Show me the underlying figures behind that." },
  { icon: GitCompareArrows, label: "Compare to sector benchmark", query: "How does that compare to the sector benchmark?" },
  { icon: FileText, label: "Draft a summary memo", query: "Draft a short summary memo of that." },
];

export default function ChatPanel({ context, screen }: { context: "firm" | "project"; screen: string }) {
  const chatSample = useStore((s) => s.chatSample);
  const suggestedPrompts = useStore((s) => s.suggestedPrompts);
  const chatThinking = useStore((s) => s.chatThinking);
  const sendChatMessage = useStore((s) => s.sendChatMessage);
  const clearChat = useStore((s) => s.clearChat);
  const [input, setInput] = useState("");
  const threadEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chatSample.length, chatThinking]);

  function send(text: string) {
    if (!text.trim() || chatThinking) return;
    sendChatMessage(text);
    setInput("");
  }

  const lastAiIndex = (() => {
    for (let i = chatSample.length - 1; i >= 0; i--) if (chatSample[i].role === "ai") return i;
    return -1;
  })();

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-ink-100 px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-50 text-accent-600"><Sparkles size={15} /></div>
        <div className="min-w-0">
          <p className="text-[13.5px] font-semibold leading-tight">Ask vitta</p>
          <p className="flex items-center gap-1 text-[10.5px] leading-tight text-ink-400"><Eye size={10} /> Reading {screen}</p>
        </div>
        <button onClick={clearChat} title="New thread" className="ml-auto rounded-md p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700"><Plus size={15} /></button>
      </div>

      {/* Thread */}
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
        {chatSample.length === 0 && !chatThinking && (
          <div className="pt-8 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-accent-50 text-accent-600 floaty"><Sparkles size={18} /></div>
            <p className="text-[12.5px] font-medium text-ink-700">Ask about {screen}</p>
            <p className="mx-auto mt-1 max-w-[220px] text-[11.5px] text-ink-400">vitta reads whatever's on your screen — ask about any figure, chart or field, and it cites the source.</p>
          </div>
        )}
        {chatSample.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end fade-up">
              <div className="max-w-[85%] rounded-lg rounded-br-md bg-ink-900 px-3.5 py-2.5 text-[13px] leading-relaxed text-white">{m.text}</div>
            </div>
          ) : (
            <AiMessage key={i} msg={m} isLatest={i === lastAiIndex} thinking={chatThinking} onAction={send} />
          )
        )}
        {chatThinking && <AgentThinking context={context} />}
        <div ref={threadEndRef} />
      </div>

      {/* Suggested + input */}
      <div className="shrink-0 border-t border-ink-100 p-3">
        <p className="mb-1.5 px-1 text-[10.5px] font-semibold uppercase tracking-wide text-ink-400">Suggested</p>
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {suggestedPrompts.slice(0, 3).map((p) => (
            <button key={p} onClick={() => send(p)} className="rounded-md border border-ink-200 px-2.5 py-1 text-left text-[11px] text-ink-600 transition-colors hover:border-accent-500 hover:text-accent-700">
              {p}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white p-1.5 transition-colors focus-within:border-accent-500">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder="Ask across every document, field and deal…"
            className="min-w-0 flex-1 bg-transparent px-1 text-[12.5px] outline-none placeholder:text-ink-400"
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || chatThinking}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-600 text-white transition-colors hover:bg-accent-700 disabled:pointer-events-none disabled:opacity-40"
          >
            <ArrowUp size={15} />
          </button>
        </div>
        <p className="mt-2 text-center text-[10.5px] text-ink-400">Answers cite workspace sources.</p>
      </div>
    </div>
  );
}

// ── One AI turn: streams its text, then reveals sources + actions ──
function AiMessage({
  msg, isLatest, thinking, onAction,
}: { msg: ChatMessage; isLatest: boolean; thinking: boolean; onAction: (q: string) => void }) {
  // Only the most recent answer streams; earlier turns render instantly.
  const { shown, done } = useTypewriter(msg.text, { enabled: isLatest });
  const parts = shown.split(/(\[\d\])/);

  return (
    <div className="fade-up">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-accent-700"><Sparkles size={11} /> vitta</div>
      <p className="mt-1.5 text-[13px] leading-relaxed text-ink-800">
        {parts.map((part, j) =>
          /^\[\d\]$/.test(part) ? (
            <sup key={j} className="mx-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded bg-accent-100 px-0.5 text-[9.5px] font-semibold text-accent-700">
              {part.replace(/[[\]]/g, "")}
            </sup>
          ) : (
            <span key={j}>{part}</span>
          )
        )}
        {!done && <span className="ml-0.5 inline-block h-3.5 w-[2px] -translate-y-[1px] animate-pulse bg-accent-600 align-middle" />}
      </p>

      {done && msg.chart && <ChatBarChart chart={msg.chart} />}

      {done && msg.citations && msg.citations.length > 0 && (
        <div className="mt-2.5 space-y-1.5 border-t border-ink-100 pt-2.5 fade-up">
          <p className="text-[10.5px] font-semibold uppercase tracking-wide text-ink-400">Sources</p>
          {msg.citations.map((c) => (
            <div key={c.n} className="flex items-center gap-2">
              <span className="flex h-4 w-4 items-center justify-center rounded bg-accent-100 text-[9.5px] font-semibold text-accent-700">{c.n}</span>
              <SourceChip doc={c.doc} page={c.page} />
            </div>
          ))}
        </div>
      )}

      {done && isLatest && !thinking && (() => {
        // A scripted answer can carry its own next steps (e.g. the wind
        // answer offering the bar graph); otherwise fall back to generics.
        const items = (msg.followUps ?? FOLLOW_UPS).map((a) => ({
          label: a.label,
          query: a.query,
          icon: (a as { icon?: typeof BarChart3 }).icon ?? BarChart3,
        }));
        if (items.length === 0) return null;
        return (
          <div className="mt-3 space-y-1.5 fade-up">
            <p className="text-[10.5px] font-semibold uppercase tracking-wide text-ink-400">Suggested next steps</p>
            {items.map((a) => (
              <button
                key={a.label}
                onClick={() => onAction(a.query)}
                className="group flex w-full items-center gap-2 rounded-lg border border-ink-200 bg-white px-2.5 py-2 text-left text-[12px] text-ink-700 transition-colors hover:border-accent-500 hover:bg-accent-50"
              >
                <a.icon size={13} className="shrink-0 text-ink-400 group-hover:text-accent-600" />
                <span className="flex-1">{a.label}</span>
                <ArrowUp size={12} className="shrink-0 rotate-45 text-ink-300 group-hover:text-accent-600" />
              </button>
            ))}
          </div>
        );
      })()}
    </div>
  );
}

// ── Inline bar chart the AI can render in an answer ─────────────
// Diverging vertical bars with a zero baseline; green above, red below,
// so a "which assets are dragging" question answers itself visually.
function ChatBarChart({ chart }: { chart: ChatChart }) {
  const W = 300, H = 176, topPad = 24, botPad = 34;
  const plotH = H - topPad - botPad;
  const vals = chart.bars.map((b) => b.value);
  const maxV = Math.max(0, ...vals);
  const minV = Math.min(0, ...vals);
  const range = maxV - minV || 1;
  const zeroY = topPad + plotH * (maxV / range);
  const slot = W / chart.bars.length;
  const barW = Math.min(44, slot * 0.5);

  return (
    <div className="mt-3 rounded-lg border border-ink-200 bg-white p-3 fade-up">
      <p className="mb-1.5 text-[11.5px] font-semibold text-ink-800">{chart.title}</p>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={chart.title}>
        <line x1={0} x2={W} y1={zeroY} y2={zeroY} stroke="#dde1e9" strokeWidth={1} />
        {chart.bars.map((b) => {
          const cx = slot * chart.bars.indexOf(b) + slot / 2;
          const h = (Math.abs(b.value) / range) * plotH;
          const up = b.value >= 0;
          const y = up ? zeroY - h : zeroY;
          const color = b.color ?? (up ? "#16805d" : "#dc2626");
          return (
            <g key={b.label}>
              <rect x={cx - barW / 2} y={y} width={barW} height={Math.max(1, h)} rx={2.5} fill={color} />
              <text x={cx} y={up ? y - 6 : y + h + 13} textAnchor="middle" fontSize={10.5} fontWeight={600} fill={color} style={{ fontFamily: "var(--font-mono)" }}>
                {b.value > 0 ? "+" : ""}{b.value}{chart.unit}
              </text>
              <text x={cx} y={H - 8} textAnchor="middle" fontSize={10} fill="#8a93a6">{b.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Agent working: a visible chain of steps, not a single spinner ──
function AgentThinking({ context }: { context: "firm" | "project" }) {
  const steps =
    context === "project"
      ? ["Reading workspace documents", "Extracting figures from the MIS", "Cross-referencing covenants", "Drafting the answer"]
      : ["Searching 47 deal documents", "Cross-referencing IC decisions", "Checking sector benchmarks", "Drafting the answer"];
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((a) => Math.min(a + 1, steps.length - 1)), 700);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fade-up space-y-1.5">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-accent-700"><Sparkles size={11} /> vitta</div>
      {steps.map((s, i) => (
        <div key={s} className={cn("flex items-center gap-2 text-[11.5px] transition-opacity", i > active ? "opacity-35" : "opacity-100")}>
          {i < active ? (
            <Check size={12} className="shrink-0 text-pos-600" />
          ) : i === active ? (
            <span className="h-3 w-3 shrink-0 rounded-full border-[1.5px] border-accent-600 border-t-transparent animate-spin" />
          ) : (
            <span className="h-3 w-3 shrink-0 rounded-full border-[1.5px] border-ink-200" />
          )}
          <span className={cn(i === active ? "text-ink-700" : i < active ? "text-ink-500" : "text-ink-400", i === active && "pulse-soft")}>{s}</span>
        </div>
      ))}
    </div>
  );
}
