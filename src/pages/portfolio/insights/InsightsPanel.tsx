import { ArrowDownRight, ArrowUpRight, Lightbulb, Minus } from "lucide-react";
import { portfolioInsights } from "../../../lib/portfolioData";
import { Card, CardHeader } from "../../../lib/ui";
import { cn } from "../../../lib/cn";

const tone = {
  positive: { text: "text-pos-700", bg: "bg-pos-50", ring: "ring-pos-100", Icon: ArrowUpRight, sign: "+" },
  negative: { text: "text-crit-700", bg: "bg-crit-50", ring: "ring-crit-100", Icon: ArrowDownRight, sign: "−" },
  neutral: { text: "text-ink-600", bg: "bg-ink-100", ring: "ring-ink-200", Icon: Minus, sign: "" },
} as const;

// Pull the headline figure out of the sentence ("increased 8.2%…" → "8.2%")
// so it can be surfaced as a prominent, scannable delta instead of being
// buried mid-paragraph. Falls back gracefully when no number is present.
function extractFigure(text: string): string | null {
  const m = text.match(/(\d+(?:\.\d+)?)\s*(%|percentage points|pp|bps|x)/i);
  if (!m) return null;
  const unit = m[2].toLowerCase();
  return `${m[1]}${unit === "%" ? "%" : unit === "x" ? "×" : " " + m[2]}`;
}

// Isolate the causal clause ("because…", "due to…", "driven by…") — the part
// an analyst actually needs — from the descriptive lead-in.
function splitDriver(text: string): { lead: string; driver: string | null } {
  const m = text.match(/\b(because|due to|driven by|as|primarily due to)\b/i);
  if (!m || m.index === undefined) return { lead: text, driver: null };
  return { lead: text.slice(0, m.index).replace(/[,\s]+$/, ""), driver: text.slice(m.index) };
}

export default function InsightsPanel({ scope, limit = 4 }: { scope?: string; limit?: number }) {
  const rows = (scope ? portfolioInsights.filter((i) => i.scope === scope || i.scope === "") : portfolioInsights).slice(0, limit);

  return (
    <Card>
      <CardHeader title="Intelligence insights" right={<Lightbulb size={15} className="text-accent-600" />} />
      <div className="stagger space-y-2">
        {rows.map((i, idx) => {
          const t = tone[i.tone];
          const figure = extractFigure(i.text);
          const { lead, driver } = splitDriver(i.text);
          return (
            <div
              key={i.id}
              style={{ "--i": idx } as React.CSSProperties}
              className="rounded-lg border border-ink-100 bg-white p-3 transition-colors hover:border-ink-200"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-500">{i.metric}</span>
                {figure && (
                  <span className={cn("flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[12px] font-semibold ring-1 ring-inset", t.bg, t.text, t.ring)}>
                    <t.Icon size={12} />
                    <span className="num">{t.sign}{figure}</span>
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-800">
                {lead}
                {driver && <span className="text-ink-500"> {driver}</span>}
              </p>
              <p className="mt-1.5 text-[10.5px] uppercase tracking-[0.05em] text-ink-400">{i.generatedAt}</p>
            </div>
          );
        })}
        {rows.length === 0 && <p className="py-4 text-center text-[12.5px] text-ink-400">No insights for this scope yet.</p>}
      </div>
    </Card>
  );
}
