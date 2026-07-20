import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GitCompare, Plus } from "lucide-react";
import type { PortfolioProject } from "../../../lib/portfolioData";
import { Card, EmptyState } from "../../../lib/ui";
import { useComparisons } from "../comparisons/comparisonStore";
import CreateComparisonModal from "../comparisons/CreateComparisonModal";

export default function ComparisonsTab({ project: proj }: { project: PortfolioProject }) {
  const comparisons = useComparisons();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);

  const related = comparisons.filter((c) => c.entities.some((e) => e.kind === "project" && e.refId === proj.id));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[13px] text-ink-500">Saved comparisons that include {proj.name}.</p>
        <button onClick={() => setCreateOpen(true)} className="flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-[12.5px] font-medium text-ink-700 hover:bg-ink-50">
          <Plus size={14} /> New comparison
        </button>
      </div>

      {related.length === 0 ? (
        <EmptyState icon={<GitCompare size={20} />} title="No comparisons yet" sub="Create a comparison to benchmark this project against others." />
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {related.map((c) => (
            <Link key={c.id} to={`/portfolio/comparisons/${c.id}`}>
              <Card className="h-full transition-shadow hover:shadow-[0_4px_16px_rgba(11,14,20,0.07)]">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-ink-100 text-ink-600"><GitCompare size={17} strokeWidth={1.8} /></div>
                <p className="text-[14px] font-semibold">{c.name}</p>
                <p className="mt-0.5 text-[11.5px] text-ink-500">{c.entities.length} entities · {c.metrics.length} metrics</p>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <CreateComparisonModal
        open={createOpen} onClose={() => setCreateOpen(false)}
        onCreated={(id) => navigate(`/portfolio/comparisons/${id}`)}
      />
    </div>
  );
}
