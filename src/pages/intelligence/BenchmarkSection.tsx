import { useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { benchmarks, type BenchmarkRow } from "../../lib/mockData";
import { playbookForTechnology } from "../../lib/intelligenceData";
import { Badge, Card, CardHeader, SourceChip } from "../../lib/ui";
import { cn } from "../../lib/cn";
import EntityRefChip from "./EntityRefChip";

const verdictMeta = {
  above: { tone: "green" as const, label: "Above range" },
  below: { tone: "red" as const, label: "Below range" },
  inline: { tone: "gray" as const, label: "In range" },
};

function Sparkline({ trend }: { trend: BenchmarkRow["trend"] }) {
  const values = trend.map((t) => t.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = trend.map((t, i) => {
    const x = (i / (trend.length - 1)) * 100;
    const y = 24 - ((t.value - min) / span) * 24;
    return `${x},${y}`;
  });
  const rising = values[values.length - 1] > values[0];
  return (
    <div className="flex items-center gap-1.5">
      <svg viewBox="0 0 100 24" className="h-6 w-16">
        <polyline points={points.join(" ")} fill="none" stroke={rising ? "#0e5f45" : "#9aa2b1"} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {rising ? <TrendingUp size={12} className="text-pos-600" /> : <TrendingDown size={12} className="text-ink-400" />}
    </div>
  );
}

export default function BenchmarkSection() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const solarPlaybook = playbookForTechnology("Solar");

  return (
    <Card pad={false}>
      <div className="flex items-start justify-between gap-3 p-5 pb-0">
        <CardHeader title="Benchmark Intelligence" sub={`Project Helios vs. ${benchmarks.sector} · ${benchmarks.dealsEvaluated} comparable deals`} />
        {solarPlaybook && (
          <div className="pt-0.5">
            <EntityRefChip entityRef={{ kind: "playbook", id: solarPlaybook.id, label: solarPlaybook.title }} />
          </div>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-ink-100 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-400">
              <th className="px-5 py-3">Metric</th>
              <th className="px-4 py-3">Current value</th>
              <th className="px-4 py-3">Benchmark (P25–P75)</th>
              <th className="px-4 py-3">Difference</th>
              <th className="px-4 py-3">Trend</th>
              <th className="px-5 py-3">Verdict</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {benchmarks.rows.map((r) => {
              const isOpen = expanded === r.metric;
              const meta = verdictMeta[r.verdict];
              return (
                <>
                  <tr key={r.metric} className="cursor-pointer hover:bg-ink-50" onClick={() => setExpanded(isOpen ? null : r.metric)}>
                    <td className="px-5 py-3 text-[13px] font-medium text-ink-800">{r.metric}</td>
                    <td className="num px-4 py-3 text-[13px] font-medium text-ink-900">{r.currentValueDisplay}</td>
                    <td className="num px-4 py-3 text-[12.5px] text-ink-500">{r.benchmarkDisplay}</td>
                    <td className={cn("num px-4 py-3 text-[12.5px] font-medium", r.differencePct > 0 ? "text-pos-700" : r.differencePct < 0 ? "text-crit-700" : "text-ink-500")}>
                      {r.differencePct > 0 ? "+" : ""}{r.differencePct.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3"><Sparkline trend={r.trend} /></td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1.5">
                        <span className={cn("h-1.5 w-1.5 rounded-full", r.verdict === "above" ? "bg-pos-600" : r.verdict === "below" ? "bg-crit-600" : "bg-accent-600")} />
                        <Badge tone={meta.tone}>{meta.label}</Badge>
                      </span>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr key={`${r.metric}-detail`} className="bg-ink-50/60">
                      <td colSpan={6} className="px-5 py-4">
                        <p className="text-[12.5px] leading-relaxed text-ink-700">{r.aiExplanation}</p>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {r.supportingEvidence.map((e, i) => (
                            <SourceChip key={i} doc={e.doc} page={e.page ?? 0} snippet={e.snippet} />
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
