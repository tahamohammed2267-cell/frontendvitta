import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { industryLabel } from "../../lib/intelligence/crossDealPatterns";
import { institutionalSignals, type InstitutionalSignal, type SignalStats } from "../../lib/intelligence/institutionalSignals";
import { AreaTrend, CHART } from "../../lib/charts";
import { Badge } from "../../lib/ui";

const outcomeTone: Record<string, "green" | "orange" | "red" | "blue" | "gray"> = {
  Refinanced: "blue",
  "Covenant Waiver": "orange",
  Restructured: "red",
  Recovered: "green",
  "Active Monitoring": "gray",
  Defaulted: "red",
  "Sponsor Equity Injection": "blue",
};

function VerticalTimeline({ stats }: { stats: SignalStats }) {
  // Oldest-first for a natural top-to-bottom reading order.
  const entries = [...stats.timeline].sort((a, b) => a.year - b.year);
  return (
    <div>
      {entries.map((o) => (
        <div key={o.id}>
          <div className="flex items-center gap-2">
            <span className="num w-10 shrink-0 text-[12.5px] font-semibold text-ink-900">{o.year}</span>
            <span className="text-[12px] text-ink-600">{o.region} · {industryLabel(o.industry)}</span>
            {o.workspaceLink && (
              <Link to={o.workspaceLink} className="ml-auto shrink-0 text-accent-600 hover:text-accent-700"><ArrowUpRight size={12} /></Link>
            )}
          </div>
          <div className="flex items-center gap-2 py-0.5 pl-[3px]">
            <ArrowDown size={11} className="shrink-0 text-ink-300" />
          </div>
          <div className="mb-2 pl-5">
            <Badge tone={outcomeTone[o.outcome] ?? "gray"}>{o.outcome}</Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

function DistributionBars({ entries, max }: { entries: { label: string; count: number; pct: number }[]; max: number }) {
  return (
    <div className="space-y-1.5">
      {entries.map((e) => (
        <div key={e.label} className="flex items-center gap-2">
          <span className="w-24 shrink-0 truncate text-[11.5px] text-ink-600">{e.label}</span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-ink-100">
            <div className="h-full rounded-full bg-accent-600" style={{ width: `${(e.count / max) * 100}%` }} />
          </div>
          <span className="num w-5 shrink-0 text-right text-[11px] text-ink-500">{e.count}</span>
        </div>
      ))}
    </div>
  );
}

function OutcomeStackedBar({ stats }: { stats: SignalStats }) {
  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full">
        {stats.outcomeDistribution.map((d) => (
          <div
            key={d.key}
            className={
              outcomeTone[d.key] === "green" ? "bg-pos-600" :
              outcomeTone[d.key] === "orange" ? "bg-warn-600" :
              outcomeTone[d.key] === "red" ? "bg-crit-600" :
              outcomeTone[d.key] === "blue" ? "bg-accent-600" : "bg-ink-300"
            }
            style={{ width: `${d.pct}%` }}
            title={`${d.key}: ${d.pct}%`}
          />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
        {stats.outcomeDistribution.map((d) => (
          <span key={d.key} className="flex items-center gap-1 text-[11px] text-ink-600">
            <span className={
              "h-2 w-2 rounded-full " + (
                outcomeTone[d.key] === "green" ? "bg-pos-600" :
                outcomeTone[d.key] === "orange" ? "bg-warn-600" :
                outcomeTone[d.key] === "red" ? "bg-crit-600" :
                outcomeTone[d.key] === "blue" ? "bg-accent-600" : "bg-ink-300"
              )
            } />
            {d.key} <span className="num font-medium text-ink-800">{d.pct}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function SignalDetailPanel({
  signal, stats, onSelectRelated,
}: { signal: InstitutionalSignal; stats: SignalStats; onSelectRelated: (id: string) => void }) {
  const related = institutionalSignals.filter((s) => signal.relatedSignalIds.includes(s.id));
  const industryMax = Math.max(...stats.industryDistribution.map((d) => d.count));
  const regionMax = Math.max(...stats.regionDistribution.map((d) => d.count));

  return (
    <div className="grid grid-cols-3 gap-5">
      <div>
        <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-400">Historical timeline</p>
        <VerticalTimeline stats={stats} />
      </div>

      <div className="space-y-4">
        <div>
          <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-400">Geographic distribution</p>
          <DistributionBars entries={stats.regionDistribution} max={regionMax} />
        </div>
        <div>
          <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-400">Industry distribution</p>
          <DistributionBars entries={stats.industryDistribution.map((d) => ({ label: d.label, count: d.count, pct: d.pct }))} max={industryMax} />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-400">Pattern evolution</p>
          <AreaTrend
            data={stats.evolutionSeries}
            xKey="year"
            height={64}
            showY={false}
            series={[{ key: "count", label: "Occurrences", color: CHART.accent }]}
          />
        </div>
        <div>
          <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-400">Historical outcomes</p>
          <OutcomeStackedBar stats={stats} />
        </div>
        {related.length > 0 && (
          <div>
            <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-400">Often appears with</p>
            <div className="flex flex-wrap gap-1.5">
              {related.map((r) => (
                <button key={r.id} onClick={() => onSelectRelated(r.id)}>
                  <Badge tone="blue">{r.title}</Badge>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
