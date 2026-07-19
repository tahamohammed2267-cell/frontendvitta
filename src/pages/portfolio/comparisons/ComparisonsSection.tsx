import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GitCompare, Plus } from "lucide-react";
import { Card } from "../../../lib/ui";
import { getComparisonEntityMetricValue, metricLabels, metricUnits } from "../builder/metricSeries";
import { useComparisons } from "./comparisonStore";
import CreateComparisonModal from "./CreateComparisonModal";

export default function ComparisonsSection() {
  const comparisons = useComparisons();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div>
      <p className="mb-3 text-[15px] font-semibold tracking-tight">Comparables</p>
      <div className="grid grid-cols-3 gap-4">
        {comparisons.map((c) => {
          const firstEntity = c.entities[0];
          const previewMetrics = c.metrics.slice(0, 3);
          return (
            <Link key={c.id} to={`/portfolio/comparisons/${c.id}`}>
              <Card className="h-full transition-shadow hover:shadow-[0_4px_16px_rgba(11,14,20,0.07)]">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-ink-100 text-ink-600"><GitCompare size={17} strokeWidth={1.8} /></div>
                <p className="text-[14px] font-semibold">{c.name}</p>
                <p className="mt-0.5 text-[11.5px] text-ink-500">{c.entities.length} entities · {c.metrics.length} metrics</p>
                <div className="mt-3 space-y-1.5 text-[12px]">
                  {previewMetrics.map((m) => (
                    <div key={m} className="flex justify-between">
                      <span className="text-ink-500">{metricLabels[m]}</span>
                      <span className="num font-semibold">
                        {getComparisonEntityMetricValue(m, firstEntity).toLocaleString()}{metricUnits[m]}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </Link>
          );
        })}

        <button onClick={() => setCreateOpen(true)} className="h-full">
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
