import { useState } from "react";
import {
  AreaChart as AreaIcon, BarChart3, BookMarked, Brain, Clock, Gauge as GaugeIcon, GitCompare, Grid3x3, HeartPulse, LineChart as LineIcon, Map,
  NotebookPen, PieChart as PieIcon, Ruler, ScatterChart as ScatterIcon, ShieldAlert, Sparkles, Table as TableIcon, Target, TrendingUp, Wallet, Waves,
} from "lucide-react";
import type { ComparisonKey, MetricKey, TimeRange, WidgetType } from "../../../lib/portfolioData";
import { Button, Modal } from "../../../lib/ui";
import { cn } from "../../../lib/cn";
import { metricLabels } from "./metricSeries";

const widgetTypes: { type: WidgetType; label: string; icon: typeof BarChart3 }[] = [
  { type: "kpi", label: "KPI Card", icon: TrendingUp },
  { type: "bar", label: "Bar Chart", icon: BarChart3 },
  { type: "pie", label: "Pie Chart", icon: PieIcon },
  { type: "line", label: "Line Chart", icon: LineIcon },
  { type: "area", label: "Area Chart", icon: AreaIcon },
  { type: "table", label: "Table", icon: TableIcon },
  { type: "heatmap", label: "Heatmap", icon: Grid3x3 },
  { type: "geo", label: "Geo Map", icon: Map },
  { type: "waterfall", label: "Waterfall", icon: Waves },
  { type: "gauge", label: "Gauge", icon: GaugeIcon },
  { type: "scatter", label: "Scatter Plot", icon: ScatterIcon },
  { type: "assetHealth", label: "Asset Health", icon: HeartPulse },
  { type: "financialSummary", label: "Financial Summary", icon: Wallet },
  { type: "risk", label: "Risk", icon: ShieldAlert },
  { type: "prediction", label: "Prediction", icon: Target },
  { type: "benchmark", label: "Benchmark", icon: Ruler },
  { type: "comparison", label: "Comparison", icon: GitCompare },
  { type: "timeline", label: "Timeline", icon: Clock },
  { type: "investmentDecisions", label: "Investment Decisions", icon: Brain },
  { type: "analystIntelligence", label: "Analyst Intelligence", icon: NotebookPen },
  { type: "institutionalPlaybooks", label: "Institutional Playbooks", icon: BookMarked },
  { type: "aiRecommendations", label: "AI Recommendations", icon: Sparkles },
];

// Composite widgets render their own content and don't use config.metric —
// step 2 (metric picker) is skipped for these, same as the pre-existing
// composite types (assetHealth/financialSummary/risk/prediction/benchmark/
// comparison/timeline), which already ignored the picked metric.
const nonMetricTypes = new Set<WidgetType>([
  "assetHealth", "financialSummary", "risk", "timeline",
  "investmentDecisions", "analystIntelligence", "institutionalPlaybooks", "aiRecommendations",
]);

const timeRanges: TimeRange[] = ["MTD", "QTD", "YTD", "Custom"];
const comparisons: { key: ComparisonKey; label: string }[] = [
  { key: "none", label: "None" }, { key: "prevMonth", label: "Previous Month" }, { key: "prevQuarter", label: "Previous Quarter" },
  { key: "budget", label: "Budget" }, { key: "forecast", label: "Forecast" }, { key: "target", label: "Target" }, { key: "lastYear", label: "Last Year" },
];

export default function AddWidgetModal({
  open, onClose, onAdd,
}: { open: boolean; onClose: () => void; onAdd: (widget: { type: WidgetType; title: string; metric: MetricKey; timeRange: TimeRange; comparison: ComparisonKey }) => void }) {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<WidgetType | null>(null);
  const [metric, setMetric] = useState<MetricKey | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>("YTD");
  const [comparison, setComparison] = useState<ComparisonKey>("lastYear");

  function reset() { setStep(1); setType(null); setMetric(null); setTimeRange("YTD"); setComparison("lastYear"); }
  function close() { reset(); onClose(); }

  function goToStep2Or3() {
    if (type && nonMetricTypes.has(type)) setStep(3);
    else setStep(2);
  }

  function submit() {
    if (!type) return;
    if (nonMetricTypes.has(type)) {
      onAdd({ type, title: widgetTypes.find((w) => w.type === type)!.label, metric: "assetHealth", timeRange, comparison });
      close();
      return;
    }
    if (!metric) return;
    onAdd({ type, title: metricLabels[metric], metric, timeRange, comparison });
    close();
  }

  return (
    <Modal open={open} onClose={close} title="Add widget" sub={`Step ${step} of 3`} width="560px">
      {step === 1 && (
        <div>
          <p className="mb-3 text-[12.5px] text-ink-500">Choose a widget type</p>
          <div className="grid grid-cols-4 gap-2.5">
            {widgetTypes.map((w) => (
              <button
                key={w.type}
                onClick={() => setType(w.type)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-lg border p-3 text-center transition-all",
                  type === w.type ? "border-accent-600 bg-accent-50 text-accent-700" : "border-ink-200 hover:border-ink-300"
                )}
              >
                <w.icon size={18} strokeWidth={1.8} />
                <span className="text-[11px] font-medium">{w.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-5 flex justify-end"><Button className={!type ? "pointer-events-none opacity-40" : ""} onClick={goToStep2Or3}>Continue</Button></div>
        </div>
      )}

      {step === 2 && (
        <div>
          <p className="mb-3 text-[12.5px] text-ink-500">Choose a metric</p>
          <div className="max-h-[280px] space-y-1 overflow-y-auto">
            {(Object.keys(metricLabels) as MetricKey[]).map((m) => (
              <button
                key={m}
                onClick={() => setMetric(m)}
                className={cn("flex w-full items-center justify-between rounded-lg px-3 py-2 text-[12.5px] font-medium", metric === m ? "bg-ink-900 text-white" : "text-ink-600 hover:bg-ink-100")}
              >
                {metricLabels[m]}
              </button>
            ))}
          </div>
          <div className="mt-5 flex justify-between">
            <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
            <Button className={!metric ? "pointer-events-none opacity-40" : ""} onClick={() => setStep(3)}>Continue</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Time range</p>
          <div className="mb-4 flex gap-1.5">
            {timeRanges.map((t) => (
              <button key={t} onClick={() => setTimeRange(t)} className={cn("rounded-md border px-3 py-1.5 text-[12px] font-medium", timeRange === t ? "border-ink-900 bg-ink-900 text-white" : "border-ink-200 text-ink-600 hover:border-ink-300")}>{t}</button>
            ))}
          </div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Comparison</p>
          <div className="mb-5 flex flex-wrap gap-1.5">
            {comparisons.map((c) => (
              <button key={c.key} onClick={() => setComparison(c.key)} className={cn("rounded-md border px-3 py-1.5 text-[12px] font-medium", comparison === c.key ? "border-accent-600 bg-accent-50 text-accent-700" : "border-ink-200 text-ink-600 hover:border-ink-300")}>{c.label}</button>
            ))}
          </div>
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(type && nonMetricTypes.has(type) ? 1 : 2)}>Back</Button>
            <Button onClick={submit}>Add widget</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
