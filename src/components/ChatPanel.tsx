import { ArrowUp, Mic, Paperclip, Plus, Sparkles } from "lucide-react";
import { chatSample, suggestedPrompts } from "../lib/mockData";
import { Badge, SourceChip } from "../lib/ui";
import { cn } from "../lib/cn";

export default function ChatPanel({ context }: { context: "firm" | "project" }) {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-ink-100 px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-50 text-accent-600"><Sparkles size={15} /></div>
        <span className="text-[13.5px] font-semibold">Vitta AI</span>
        <Badge tone={context === "project" ? "blue" : "gray"}>{context === "project" ? "Project Helios" : "Firm-wide"}</Badge>
        <button className="ml-auto rounded-md p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700"><Plus size={15} /></button>
      </div>

      {/* Thread */}
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
        {chatSample.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-br-md bg-ink-900 px-3.5 py-2.5 text-[13px] leading-relaxed text-white">{m.text}</div>
            </div>
          ) : (
            <div key={i}>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-accent-700"><Sparkles size={11} /> Vitta AI</div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-800">
                {m.text.split(/(\[\d\])/).map((part, j) =>
                  /^\[\d\]$/.test(part) ? (
                    <sup key={j} className="mx-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded bg-accent-100 px-0.5 text-[9.5px] font-semibold text-accent-700">
                      {part.replace(/[[\]]/g, "")}
                    </sup>
                  ) : (
                    <span key={j}>{part}</span>
                  )
                )}
              </p>
              {"citations" in m && m.citations && (
                <div className="mt-2.5 space-y-1.5 border-t border-ink-100 pt-2.5">
                  <p className="text-[10.5px] font-semibold uppercase tracking-wide text-ink-400">Sources</p>
                  {m.citations.map((c) => (
                    <div key={c.n} className="flex items-center gap-2">
                      <span className="flex h-4 w-4 items-center justify-center rounded bg-accent-100 text-[9.5px] font-semibold text-accent-700">{c.n}</span>
                      <SourceChip doc={c.doc} page={c.page} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        )}
      </div>

      {/* Suggested + input */}
      <div className="shrink-0 border-t border-ink-100 p-3">
        <p className="mb-1.5 px-1 text-[10.5px] font-semibold uppercase tracking-wide text-ink-400">Suggested</p>
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {suggestedPrompts.slice(0, 3).map((p) => (
            <button key={p} className="rounded-full border border-ink-200 px-2.5 py-1 text-left text-[11px] text-ink-600 hover:border-accent-500 hover:text-accent-700">
              {p}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 rounded-xl border border-ink-200 bg-white p-1.5 focus-within:border-accent-500">
          <button className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100"><Paperclip size={15} /></button>
          <button className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100"><Mic size={15} /></button>
          <input
            placeholder="Ask across every document, field and deal…"
            className="min-w-0 flex-1 bg-transparent px-1 text-[12.5px] outline-none placeholder:text-ink-400"
          />
          <button className={cn("flex h-7 w-7 items-center justify-center rounded-lg bg-accent-600 text-white hover:bg-accent-700")}>
            <ArrowUp size={15} />
          </button>
        </div>
        <p className="mt-2 text-center text-[10.5px] text-ink-400">Answers cite workspace sources.</p>
      </div>
    </div>
  );
}
