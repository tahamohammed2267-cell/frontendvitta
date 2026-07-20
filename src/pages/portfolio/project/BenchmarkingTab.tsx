import { useState } from "react";
import type { MetricKey, PortfolioProject } from "../../../lib/portfolioData";
import { metricCategories, metricCategoryLabels, metricLabels, type MetricCategory } from "../builder/metricSeries";
import { Card, CardHeader, SectionLabel } from "../../../lib/ui";
import { cn } from "../../../lib/cn";
import BenchmarkWidget from "../widgets/BenchmarkWidget";

const categoryOrder: MetricCategory[] = ["topline", "earnings", "costBreakdown", "operationalKPIs", "financialKPIs", "custom"];
const defaultMetrics: MetricKey[] = ["revenue", "ebitdaMargin", "assetHealth", "capacityUtilization"];

export default function BenchmarkingTab({ project: proj }: { project: PortfolioProject }) {
  const [selected, setSelected] = useState<MetricKey[]>(defaultMetrics);

  function toggle(m: MetricKey) {
    setSelected((s) => (s.includes(m) ? s.filter((x) => x !== m) : [...s, m]));
  }

  return (
    <div className="space-y-4">
      <p className="text-[12.5px] text-ink-500">Benchmark {proj.name} against the portfolio average and global industry benchmarks. Choose which metrics to compare.</p>

      <Card>
        <CardHeader title="Metrics" sub="Toggle metrics across categories" />
        <div className="space-y-3">
          {categoryOrder.map((cat) => {
            const keys = (Object.keys(metricLabels) as MetricKey[]).filter((k) => metricCategories[k] === cat);
            if (keys.length === 0) return null;
            return (
              <div key={cat}>
                <SectionLabel>{metricCategoryLabels[cat]}</SectionLabel>
                <div className="flex flex-wrap gap-1.5">
                  {keys.map((m) => (
                    <button
                      key={m}
                      onClick={() => toggle(m)}
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
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {selected.map((m) => (
          <Card key={m}>
            <CardHeader title={metricLabels[m]} sub={`${proj.name} vs. portfolio average vs. global benchmark`} />
            <div className="h-[160px]">
              <BenchmarkWidget scope="project" scopeId={proj.id} metric={m} />
            </div>
          </Card>
        ))}
        {selected.length === 0 && <p className="col-span-2 py-8 text-center text-[12.5px] text-ink-400">Select at least one metric to benchmark.</p>}
      </div>
    </div>
  );
}
