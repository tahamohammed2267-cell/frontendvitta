import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Download, Plus, Share2 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MetricKey, TimeRange } from "../../../lib/portfolioData";
import { Badge, Button, Card, CardHeader, EmptyState, Modal, Stat } from "../../../lib/ui";
import ShareModal from "../../../components/ShareModal";
import { cn } from "../../../lib/cn";
import {
  formatMetric, getComparisonEntityMetricValue, getEntityMetricSeries, metricCategories, metricCategoryLabels, metricLabels, metricUnits, type MetricCategory,
} from "../builder/metricSeries";
import EntityPicker, { EntityChip } from "./EntityPicker";
import { getComparison, updateComparison, useComparisons } from "./comparisonStore";

const palette = ["#0e5f45", "#1d4ed8", "#b45309", "#7c3aed", "#475569"];
const timeRanges: TimeRange[] = ["MTD", "QTD", "YTD", "Custom"];
const categoryOrder: MetricCategory[] = ["topline", "earnings", "costBreakdown", "operationalKPIs", "financialKPIs", "custom"];
const timeSeriesMetrics: MetricKey[] = ["revenue", "ebitda", "generation", "cashFlow"];

export default function ComparisonView() {
  const { comparisonId } = useParams();
  useComparisons();
  const [addEntityOpen, setAddEntityOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [exported, setExported] = useState(false);

  const comparison = comparisonId ? getComparison(comparisonId) : undefined;

  const metricsByCategory = useMemo(() => {
    const m = new Map<MetricCategory, MetricKey[]>();
    (Object.keys(metricLabels) as MetricKey[]).forEach((k) => {
      const cat = metricCategories[k];
      m.set(cat, [...(m.get(cat) ?? []), k]);
    });
    return m;
  }, []);

  if (!comparison) {
    return (
      <div className="mx-auto max-w-[1200px] px-6 py-6">
        <EmptyState icon={<ArrowLeft size={20} />} title="Comparison not found" sub="It may have been removed." />
      </div>
    );
  }

  const c = comparison;

  function toggleMetric(m: MetricKey) {
    const next = c.metrics.includes(m) ? c.metrics.filter((x) => x !== m) : [...c.metrics, m];
    updateComparison(c.id, { metrics: next });
  }

  function setTimeRange(t: TimeRange) {
    updateComparison(c.id, { timeRange: t });
  }

  function removeEntity(id: string) {
    updateComparison(c.id, { entities: c.entities.filter((e) => e.id !== id) });
  }

  function addEntity(entity: Parameters<typeof EntityPicker>[0]["selected"][number]) {
    updateComparison(c.id, { entities: [...c.entities, entity] });
  }

  function handleExport() {
    setExported(true);
    setTimeout(() => setExported(false), 1500);
  }

  const headlineMetric = c.metrics[0];

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-6">
      <Link to="/portfolio" className="mb-3 inline-flex items-center gap-1 text-[12px] font-medium text-ink-400 hover:text-ink-700 fade-up">
        <ArrowLeft size={13} /> Portfolio
      </Link>
      <div className="mb-6 flex items-center justify-between fade-up">
        <div className="flex items-center gap-3">
          <h1 className="text-[22px] font-semibold tracking-tight">{c.name}</h1>
          <Badge tone="blue">{c.entities.length} entities</Badge>
          {c.sharedWith.length > 0 && <Badge tone="gray">Shared with {c.sharedWith.length}</Badge>}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShareOpen(true)}><Share2 size={14} /> Share</Button>
          <Button variant="secondary" onClick={handleExport}><Download size={14} /> {exported ? "Exported" : "Export"}</Button>
        </div>
      </div>

      {/* Entity chips */}
      <div className="mb-4 flex flex-wrap items-center gap-1.5 fade-up">
        {c.entities.map((e) => <EntityChip key={e.id} entity={e} onRemove={() => removeEntity(e.id)} />)}
        <button onClick={() => setAddEntityOpen(true)} className="flex items-center gap-1 rounded-md border border-dashed border-ink-300 px-2.5 py-1 text-[12px] font-medium text-ink-500 hover:border-accent-500 hover:text-accent-700">
          <Plus size={12} /> Add entity
        </button>
      </div>

      {/* KPI summary row */}
      {headlineMetric && (
        <div className="mb-6 grid gap-4 fade-up" style={{ gridTemplateColumns: `repeat(${Math.min(c.entities.length, 4)}, minmax(0,1fr))` }}>
          {c.entities.map((e) => (
            <Card key={e.id}>
              <Stat
                label={e.label}
                value={formatMetric(getComparisonEntityMetricValue(headlineMetric, e), metricUnits[headlineMetric])}
                sub={metricLabels[headlineMetric]}
              />
            </Card>
          ))}
        </div>
      )}

      {/* Time range control */}
      <div className="mb-4 flex items-center gap-1.5 fade-up">
        <span className="mr-1 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Time range</span>
        {timeRanges.map((t) => (
          <button key={t} onClick={() => setTimeRange(t)} className={cn("rounded-md border px-3 py-1.5 text-[12px] font-medium", c.timeRange === t ? "border-ink-900 bg-ink-900 text-white" : "border-ink-200 text-ink-600 hover:border-ink-300")}>{t}</button>
        ))}
      </div>

      {/* Metric selector */}
      <Card className="mb-4 fade-up">
        <CardHeader title="Metrics" sub="Toggle metrics to compare — changes apply immediately" />
        <div className="space-y-3">
          {categoryOrder.map((cat) => {
            const keys = metricsByCategory.get(cat) ?? [];
            if (keys.length === 0) return null;
            return (
              <div key={cat}>
                <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-ink-400">{metricCategoryLabels[cat]}</p>
                <div className="flex flex-wrap gap-1.5">
                  {keys.map((m) => (
                    <button
                      key={m}
                      onClick={() => toggleMetric(m)}
                      className={cn(
                        "rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors",
                        c.metrics.includes(m) ? "border-accent-600 bg-accent-50 text-accent-700" : "border-ink-200 text-ink-600 hover:border-ink-300"
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

      {/* Per-metric charts */}
      <div className="grid grid-cols-2 gap-4">
        {c.metrics.map((m) => (
          <Card key={m}>
            <CardHeader title={metricLabels[m]} sub={timeSeriesMetrics.includes(m) ? "Time series by entity" : "Compared across entities"} />
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                {timeSeriesMetrics.includes(m) ? (
                  <LineChart margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
                    <CartesianGrid vertical={false} stroke="#eceef3" />
                    <XAxis dataKey="label" allowDuplicatedCategory={false} tick={{ fontSize: 10.5, fill: "#8a93a6" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10.5, fill: "#8a93a6" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #dde1e9" }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    {c.entities.map((e, i) => (
                      <Line key={e.id} name={e.label} data={getEntityMetricSeries(m, e, c.timeRange)} dataKey="value" type="monotone" stroke={palette[i % palette.length]} strokeWidth={2} dot={false} />
                    ))}
                  </LineChart>
                ) : (
                  <BarChart data={c.entities.map((e) => ({ label: e.label, value: getComparisonEntityMetricValue(m, e) }))} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
                    <CartesianGrid vertical={false} stroke="#eceef3" />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#8a93a6" }} axisLine={false} tickLine={false} interval={0} />
                    <YAxis tick={{ fontSize: 10.5, fill: "#8a93a6" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #dde1e9" }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {c.entities.map((e, i) => <Cell key={e.id} fill={palette[i % palette.length]} />)}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </Card>
        ))}
      </div>

      {/* Comparison table */}
      <Card pad={false} className="mt-4">
        <div className="border-b border-ink-100 px-5 py-4"><CardHeader title="Comparison table" sub="Metrics × entities" /></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-ink-100 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-400">
                <th className="px-5 py-3">Metric</th>
                {c.entities.map((e) => <th key={e.id} className="px-4 py-3">{e.label}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {c.metrics.map((m) => (
                <tr key={m}>
                  <td className="px-5 py-3 text-[12.5px] font-medium">{metricLabels[m]}</td>
                  {c.entities.map((e) => (
                    <td key={e.id} className="num px-4 py-3 text-[12.5px] font-semibold">
                      {formatMetric(getComparisonEntityMetricValue(m, e), metricUnits[m])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={addEntityOpen} onClose={() => setAddEntityOpen(false)} title="Add entity" sub={c.name} width="480px">
        <EntityPicker selected={c.entities} onAdd={(e) => { addEntity(e); setAddEntityOpen(false); }} />
      </Modal>

      <ShareModal
        open={shareOpen} onClose={() => setShareOpen(false)} title="Share comparison" sub={c.name}
        sharedWith={c.sharedWith} onChange={(users) => updateComparison(c.id, { sharedWith: users })}
      />
    </div>
  );
}
