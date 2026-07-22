import { useState } from "react";
import { ChevronDown, Save } from "lucide-react";
import type { MetricKey } from "../../../../lib/portfolioData";
import { metricCategories, metricCategoryLabels, metricLabels } from "../../builder/metricSeries";
import { Button, Card, CardHeader, SectionLabel } from "../../../../lib/ui";
import { cn } from "../../../../lib/cn";
import { allMetrics } from "./useBenchmarkTable";

const categoryOrder: (keyof typeof metricCategoryLabels)[] = ["topline", "earnings", "operationalKPIs", "financialKPIs", "costBreakdown", "custom"];

export default function MetricSelectionPanel({
  selected, onToggle, onSelectAll, onClearAll, onSaveAsPreset,
}: {
  selected: MetricKey[];
  onToggle: (m: MetricKey) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onSaveAsPreset: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-start text-left">
        <div className="flex-1">
          <CardHeader title="Metrics" sub={`${selected.length} of ${allMetrics.length} selected`} />
        </div>
        <ChevronDown size={16} className={cn("mt-1 shrink-0 text-ink-400 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div>
          <div className="mb-3 flex flex-wrap gap-1.5">
            <Button variant="secondary" className="px-2.5 py-1.5 text-[12px]" onClick={onSelectAll}>Select All</Button>
            <Button variant="secondary" className="px-2.5 py-1.5 text-[12px]" onClick={onClearAll}>Clear All</Button>
            <Button variant="secondary" className="px-2.5 py-1.5 text-[12px]" onClick={onSaveAsPreset}><Save size={12} /> Save as Metric Preset</Button>
          </div>
          <div className="space-y-3">
            {categoryOrder.map((cat) => {
              const keys = allMetrics.filter((k) => metricCategories[k] === cat);
              if (keys.length === 0) return null;
              return (
                <div key={cat}>
                  <SectionLabel>{metricCategoryLabels[cat]}</SectionLabel>
                  <div className="flex flex-wrap gap-1.5">
                    {keys.map((m) => (
                      <button
                        key={m}
                        onClick={() => onToggle(m)}
                        className={cn(
                          "rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors",
                          selected.includes(m) ? "border-accent-600 bg-accent-50 text-accent-700" : "border-ink-200 text-ink-600 hover:border-ink-300"
                        )}
                      >
                        {metricLabels[m]}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
