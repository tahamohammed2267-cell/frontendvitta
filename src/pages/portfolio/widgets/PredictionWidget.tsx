import { Area, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { findProject, type DashboardScope, type MetricKey } from "../../../lib/portfolioData";
import { forecastMetric } from "../../../lib/projectIntelligence";
import { getMetricSeries } from "../builder/metricSeries";

export default function PredictionWidget({ scope, scopeId, metric }: { scope: DashboardScope; scopeId: string; metric: MetricKey }) {
  const project = scope === "project" ? findProject(scopeId) : undefined;
  if (!project) {
    return <p className="flex h-full items-center justify-center text-center text-[11.5px] text-ink-400">Predictions are scoped to individual projects.</p>;
  }

  const history = getMetricSeries(metric, "project", project.id, "YTD");
  const forecast = forecastMetric(project, metric);
  const data = [
    ...history.map((h) => ({ label: h.label, actual: h.value, predicted: undefined as number | undefined })),
    ...forecast.map((f) => ({ label: f.period, actual: undefined as number | undefined, predicted: f.predicted })),
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#8a93a6" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10.5, fill: "#8a93a6" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #dde1e9" }} />
        <Area type="monotone" dataKey="actual" stroke="#0e5f45" strokeWidth={2} fill="#0e5f45" fillOpacity={0.12} />
        <Line type="monotone" dataKey="predicted" stroke="#1d4ed8" strokeWidth={2} strokeDasharray="4 3" dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
