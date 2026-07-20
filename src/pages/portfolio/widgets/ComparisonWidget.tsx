import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { findProject, type DashboardScope, type MetricKey } from "../../../lib/portfolioData";
import { getComparisonEntityMetricValue } from "../builder/metricSeries";
import { useComparisons } from "../comparisons/comparisonStore";

const palette = ["#0e5f45", "#1d4ed8", "#b45309", "#7c3aed", "#475569"];

export default function ComparisonWidget({ scope, scopeId, metric }: { scope: DashboardScope; scopeId: string; metric: MetricKey }) {
  const comparisons = useComparisons();

  const project = scope === "project" ? findProject(scopeId) : undefined;
  const comparison = comparisons.find((c) => project && c.entities.some((e) => e.kind === "project" && e.refId === project.id)) ?? comparisons[0];

  if (!comparison) {
    return <p className="flex h-full items-center justify-center text-center text-[11.5px] text-ink-400">No saved comparisons yet.</p>;
  }

  const data = comparison.entities.map((e) => ({ label: e.label, value: getComparisonEntityMetricValue(metric, e) }));

  return (
    <div className="flex h-full flex-col">
      <p className="mb-1.5 truncate text-[11px] font-medium text-ink-500">{comparison.name}</p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
            <CartesianGrid vertical={false} stroke="#eceef3" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#8a93a6" }} axisLine={false} tickLine={false} interval={0} />
            <YAxis tick={{ fontSize: 10.5, fill: "#8a93a6" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #dde1e9" }} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} fill={palette[0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
