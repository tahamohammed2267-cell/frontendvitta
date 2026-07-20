import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { findProject, type DashboardScope, type MetricKey } from "../../../lib/portfolioData";
import { findGlobalBenchmark } from "../../../lib/globalBenchmarks";
import { getComparisonEntityMetricValue, getMetricValue } from "../builder/metricSeries";

export default function BenchmarkWidget({ scope, scopeId, metric }: { scope: DashboardScope; scopeId: string; metric: MetricKey }) {
  const project = scope === "project" ? findProject(scopeId) : undefined;
  const projectValue = getMetricValue(metric, scope, scopeId);
  const portfolioAvg = getComparisonEntityMetricValue(metric, { kind: "portfolioAverage", id: "portfolioAverage:", refId: "", label: "Portfolio Average" });
  const benchmark = findGlobalBenchmark(metric, project ? undefined : undefined);

  const data = [
    { label: project?.name ?? "This scope", value: projectValue },
    { label: "Portfolio Avg", value: portfolioAvg },
    ...(benchmark ? [{ label: "Global Benchmark", value: benchmark.typicalValue }] : []),
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, bottom: 0, left: 8 }}>
        <CartesianGrid horizontal={false} stroke="#eceef3" />
        <XAxis type="number" tick={{ fontSize: 10.5, fill: "#8a93a6" }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="label" tick={{ fontSize: 10.5, fill: "#8a93a6" }} axisLine={false} tickLine={false} width={100} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #dde1e9" }} />
        <Bar dataKey="value" fill="#0e5f45" radius={[0, 4, 4, 0]} barSize={18} />
      </BarChart>
    </ResponsiveContainer>
  );
}
