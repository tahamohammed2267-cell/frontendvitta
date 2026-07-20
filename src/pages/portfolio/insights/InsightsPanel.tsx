import { Lightbulb, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { portfolioInsights } from "../../../lib/portfolioData";
import { Card, CardHeader } from "../../../lib/ui";
import { cn } from "../../../lib/cn";

const toneStyle = {
  positive: { border: "border-l-pos-600", icon: TrendingUp, iconColor: "text-pos-600" },
  negative: { border: "border-l-crit-600", icon: TrendingDown, iconColor: "text-crit-600" },
  neutral: { border: "border-l-ink-300", icon: Minus, iconColor: "text-ink-500" },
};

export default function InsightsPanel({ scope, limit = 4 }: { scope?: string; limit?: number }) {
  const rows = (scope ? portfolioInsights.filter((i) => i.scope === scope || i.scope === "") : portfolioInsights).slice(0, limit);

  return (
    <Card>
      <CardHeader title="Intelligence insights" sub="Generated from portfolio performance data" right={<Lightbulb size={15} className="text-accent-600" />} />
      <div className="space-y-2.5">
        {rows.map((i) => {
          const t = toneStyle[i.tone];
          const Icon = t.icon;
          return (
            <div key={i.id} className={cn("flex gap-2.5 rounded-r-lg border-l-2 bg-ink-50/60 py-2 pl-3 pr-2", t.border)}>
              <Icon size={14} className={cn("mt-0.5 shrink-0", t.iconColor)} />
              <div className="min-w-0">
                <p className="text-[12.5px] leading-relaxed text-ink-800">{i.text}</p>
                <p className="mt-1 text-[11px] text-ink-400">{i.metric} · {i.generatedAt}</p>
              </div>
            </div>
          );
        })}
        {rows.length === 0 && <p className="py-4 text-center text-[12.5px] text-ink-400">No insights for this scope yet.</p>}
      </div>
    </Card>
  );
}
