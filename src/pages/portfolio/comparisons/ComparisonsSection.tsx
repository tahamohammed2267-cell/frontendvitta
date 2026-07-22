import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, GitCompare, Plus } from "lucide-react";
import { Card } from "../../../lib/ui";
import { cn } from "../../../lib/cn";
import { formatMetric, getComparisonEntityMetricValue, metricLabels, metricUnits } from "../builder/metricSeries";
import { useComparisons } from "./comparisonStore";
import CreateComparisonModal from "./CreateComparisonModal";

export default function ComparisonsSection() {
  const comparisons = useComparisons();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  function toggleExpanded(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // No view-tracking exists in this app (SavedComparison only has
  // createdAt/updatedAt) — most-recently-updated first is the honest
  // approximation of "recently viewed" without fabricating a new concept.
  const ordered = [...comparisons].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));

  return (
    <div>
      <p className="mb-3 text-[15px] font-semibold tracking-tight">Comparables</p>
      <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-1 [-webkit-overflow-scrolling:touch] [scroll-snap-type:x_proximity] scroll-smooth stagger">
        {ordered.map((c, i) => {
          const firstEntity = c.entities[0];
          const previewMetrics = c.metrics.slice(0, 3);
          const expanded = expandedIds.has(c.id);
          return (
            <Link key={c.id} to={`/portfolio/comparisons/${c.id}`} style={{ "--i": i } as React.CSSProperties} className="w-[260px] shrink-0 [scroll-snap-align:start]">
              <Card className="lift h-full">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-accent-50 text-accent-600"><GitCompare size={17} strokeWidth={1.8} /></div>
                <p className="text-[14px] font-semibold">{c.name}</p>
                <p className="mt-0.5 text-[11.5px] text-ink-500">{c.entities.length} entities · {c.metrics.length} metrics</p>

                <button
                  onClick={(e) => toggleExpanded(c.id, e)}
                  className="mt-3 flex w-full items-center justify-between text-[11px] font-medium text-ink-500 hover:text-ink-800"
                >
                  Metrics
                  <ChevronDown size={13} className={cn("shrink-0 transition-transform", expanded && "rotate-180")} />
                </button>
                {expanded && (
                  <div className="mt-2 space-y-1.5 text-[12px]">
                    {previewMetrics.map((m) => (
                      <div key={m} className="flex justify-between">
                        <span className="text-ink-500">{metricLabels[m]}</span>
                        <span className="num font-semibold">
                          {formatMetric(getComparisonEntityMetricValue(m, firstEntity), metricUnits[m])}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </Link>
          );
        })}

        <button onClick={() => setCreateOpen(true)} className="w-[260px] shrink-0 [scroll-snap-align:start]">
          <Card className="flex h-full min-h-[168px] flex-col items-center justify-center border-dashed border-ink-300 text-ink-500 transition-colors hover:border-accent-500 hover:text-accent-700">
            <Plus size={20} />
            <p className="mt-2 text-[13px] font-medium">New comparison</p>
          </Card>
        </button>
      </div>

      <CreateComparisonModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(id) => navigate(`/portfolio/comparisons/${id}`)}
      />
    </div>
  );
}
