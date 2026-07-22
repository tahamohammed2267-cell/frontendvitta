import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MetricKey, PortfolioProject } from "../../../../lib/portfolioData";
import { getEntityMetricSeries } from "../../builder/metricSeries";
import { metricLabels } from "../../builder/metricSeries";
import { Card, CardHeader } from "../../../../lib/ui";
import { CHART, ChartTooltip } from "../../../../lib/charts";
import { describeColumn, type BenchmarkColumn } from "./benchmarkColumns";
import type { BenchmarkRow } from "./useBenchmarkTable";

const lineColors = [CHART.accent, CHART.warn, CHART.pos, CHART.neg, "#7c3aed"];

export default function BenchmarkTrendView({
  rows, project, columns,
}: { rows: BenchmarkRow[]; project: PortfolioProject; columns: BenchmarkColumn[] }) {
  const entityColumns = columns.filter((c): c is Extract<BenchmarkColumn, { kind: "entity" }> => c.kind === "entity");

  return (
    <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
      {rows.map((row) => (
        <TrendCard key={row.metric} metric={row.metric} row={row} project={project} entityColumns={entityColumns} />
      ))}
    </div>
  );
}

function TrendCard({
  metric, row, project, entityColumns,
}: { metric: MetricKey; row: BenchmarkRow; project: PortfolioProject; entityColumns: Extract<BenchmarkColumn, { kind: "entity" }>[] }) {
  const isRealSeries = metric === "revenue" || metric === "ebitda";
  const months = row.trend.map((t) => t.label);

  const data = months.map((month, i) => {
    const point: Record<string, number | string> = { month, current: row.trend[i]?.value ?? 0 };
    entityColumns.forEach((col, ci) => {
      const series = getEntityMetricSeries(metric, col.entity, "YTD");
      point[`col${ci}`] = series[i]?.value ?? 0;
    });
    return point;
  });

  return (
    <Card>
      <CardHeader title={metricLabels[metric]} sub={`6-month view · ${isRealSeries ? "real reported values" : "modeled trend anchored to the current value"}`} />
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
            <XAxis dataKey="month" tick={{ fontSize: 10.5, fill: CHART.axis }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10.5, fill: CHART.axis }} axisLine={false} tickLine={false} width={36} />
            <Tooltip content={<ChartTooltip series={[
              { key: "current", label: project.name, color: CHART.accent },
              ...entityColumns.map((col, ci) => ({ key: `col${ci}`, label: describeColumn(col, project), color: lineColors[(ci + 1) % lineColors.length] })),
            ]} />} />
            <Area type="monotone" dataKey="current" stroke={CHART.accent} strokeWidth={2} fill={CHART.accent} fillOpacity={0.12} />
            {entityColumns.map((col, ci) => (
              <Area key={col.id} type="monotone" dataKey={`col${ci}`} stroke={lineColors[(ci + 1) % lineColors.length]} strokeWidth={1.5} fill="transparent" />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
