import { useRef, useState } from "react";
import { ArrowUp, MessageSquareText } from "lucide-react";
import { portfolioChatSample, portfolioSuggestedPrompts, type PortfolioChatMessage } from "../../../lib/portfolioData";
import { pickPortfolioReply } from "../../../lib/portfolioChatResponses";
import { Card, CardHeader } from "../../../lib/ui";

export default function PortfolioAskPanel() {
  const [thread, setThread] = useState<PortfolioChatMessage[]>(portfolioChatSample);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);

  function scrollToBottom() {
    requestAnimationFrame(() => {
      const el = threadRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }

  function send(text: string) {
    if (!text.trim() || thinking) return;
    setThread((t) => [...t, { role: "user", text: text.trim() }]);
    setInput("");
    setThinking(true);
    scrollToBottom();
    setTimeout(() => {
      const reply = pickPortfolioReply(text);
      setThread((t) => [...t, { role: "ai", text: reply.text, citations: reply.citations }]);
      setThinking(false);
      scrollToBottom();
    }, 800);
  }

  return (
    <Card pad={false}>
      <div className="border-b border-ink-100 px-5 py-4">
        <CardHeader title="Ask about the portfolio" right={<MessageSquareText size={15} className="text-accent-600" />} />
      </div>
      <div ref={threadRef} className="max-h-[420px] space-y-4 overflow-y-auto px-5 py-4">
        {thread.map((m, i) =>
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
                <div className="mt-2.5 space-y-1 border-t border-ink-100 pt-2.5">
                  {m.citations.map((c) => (
                    <div key={c.n} className="flex items-center gap-2 text-[11px] text-ink-500">
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-accent-100 text-[9.5px] font-semibold text-accent-700">{c.n}</span>
                      {c.ref}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        )}
        {thinking && (
          <div className="flex items-center gap-1.5 text-[11.5px] text-ink-400">
            <MessageSquareText size={11} className="text-accent-600" />
            <span className="pulse-soft">reading portfolio data…</span>
          </div>
        )}
      </div>
      <div className="border-t border-ink-100 p-3">
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {portfolioSuggestedPrompts.map((p) => (
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
            placeholder="Ask across the portfolio…"
            className="min-w-0 flex-1 bg-transparent px-2 text-[12.5px] outline-none placeholder:text-ink-400"
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || thinking}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-600 text-white hover:bg-accent-700 disabled:pointer-events-none disabled:opacity-40"
          >
            <ArrowUp size={15} />
          </button>
        </div>
      </div>
    </Card>
  );
}
