import { cn } from "../../../lib/cn";
import { getTableRows } from "../builder/metricSeries";
import type { DashboardScope, MetricKey } from "../../../lib/portfolioData";

export default function AssetHealthWidget({ scope, scopeId, metric }: { scope: DashboardScope; scopeId: string; metric: MetricKey }) {
  const rows = getTableRows(scope, scopeId, metric).sort((a, b) => a.health - b.health);

  return (
    <div className="h-full space-y-2 overflow-y-auto">
      {rows.map((r) => (
        <div key={r.name} className="flex items-center gap-2.5">
          <span className="w-24 shrink-0 truncate text-[11px] text-ink-600">{r.name}</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-100">
            <div className={cn("h-full rounded-full", r.health >= 80 ? "bg-pos-600" : r.health >= 60 ? "bg-warn-600" : "bg-crit-600")} style={{ width: `${r.health}%` }} />
          </div>
          <span className="num w-7 shrink-0 text-right text-[11px] font-semibold">{r.health}</span>
        </div>
      ))}
      {rows.length === 0 && <p className="py-4 text-center text-[11.5px] text-ink-400">No assets in scope.</p>}
    </div>
  );
}
