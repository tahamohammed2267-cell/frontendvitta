import { useEffect, useRef, useState } from "react";
import { ArrowUp, MessageSquareText, Plus } from "lucide-react";
import { useStore } from "../lib/store";
import { Badge, SourceChip } from "../lib/ui";
import { cn } from "../lib/cn";

export default function ChatPanel({ context }: { context: "firm" | "project" }) {
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

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-ink-100 px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-50 text-accent-600"><MessageSquareText size={15} /></div>
        <span className="text-[13.5px] font-semibold">Ask vitta</span>
        <Badge tone={context === "project" ? "blue" : "gray"}>{context === "project" ? "Project Helios" : "Firm-wide"}</Badge>
        <button onClick={clearChat} title="Clear thread" className="ml-auto rounded-md p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700"><Plus size={15} /></button>
      </div>

      {/* Thread */}
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
        {chatSample.length === 0 && (
          <p className="pt-6 text-center text-[12px] text-ink-400">Ask anything across every deal, document and field.</p>
        )}
        {chatSample.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[85%] rounded-lg rounded-br-md bg-ink-900 px-3.5 py-2.5 text-[13px] leading-relaxed text-white">{m.text}</div>
            </div>
          ) : (
            <div key={i}>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-accent-700"><MessageSquareText size={11} /> vitta</div>
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
        {chatThinking && (
          <div className="flex items-center gap-1.5 text-[11.5px] text-ink-400">
            <MessageSquareText size={11} className="text-accent-600" />
            <span className="pulse-soft">reading workspace documents…</span>
          </div>
        )}
        <div ref={threadEndRef} />
      </div>

      {/* Suggested + input */}
      <div className="shrink-0 border-t border-ink-100 p-3">
        <p className="mb-1.5 px-1 text-[10.5px] font-semibold uppercase tracking-wide text-ink-400">Suggested</p>
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {suggestedPrompts.slice(0, 3).map((p) => (
            <button key={p} onClick={() => send(p)} className="rounded-md border border-ink-200 px-2.5 py-1 text-left text-[11px] text-ink-600 hover:border-accent-500 hover:text-accent-700">
              {p}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white p-1.5 focus-within:border-accent-500">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send(input);
            }}
            placeholder="Ask across every document, field and deal…"
            className="min-w-0 flex-1 bg-transparent px-1 text-[12.5px] outline-none placeholder:text-ink-400"
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || chatThinking}
            className={cn("flex h-7 w-7 items-center justify-center rounded-lg bg-accent-600 text-white hover:bg-accent-700 disabled:pointer-events-none disabled:opacity-40")}
          >
            <ArrowUp size={15} />
          </button>
        </div>
        <p className="mt-2 text-center text-[10.5px] text-ink-400">Answers cite workspace sources.</p>
      </div>
    </div>
  );
}
