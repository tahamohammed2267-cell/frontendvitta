import {
  Area, AreaChart, Bar, BarChart, Cell, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis,
} from "recharts";
import type { WidgetConfig, DashboardScope, MetricKey } from "../../../lib/portfolioData";
import { Stat } from "../../../lib/ui";
import HeatmapGrid from "../widgets/HeatmapGrid";
import WaterfallChart from "../widgets/WaterfallChart";
import GeoMapMock from "../widgets/GeoMapMock";
import GaugeWidget from "../widgets/GaugeWidget";
import { getComparisonValue, getHeatmapData, getMetricSeries, getMetricValue, getTableRows, metricLabels, metricUnits } from "./metricSeries";

const palette = ["#0e5f45", "#1d4ed8", "#b45309", "#7c3aed", "#475569"];
const inverseMetrics = new Set<MetricKey>(["maintenanceCost", "opex", "capex", "debtService"]);

function formatMetric(value: number, unit: string) {
  if (unit === "€M") return `${value < 0 ? "-" : ""}€${Math.abs(value).toLocaleString()}m`;
  return `${value.toLocaleString()}${unit}`;
}

export default function WidgetRenderer({ config, scope, scopeId }: { config: WidgetConfig; scope: DashboardScope; scopeId: string }) {
  const unit = metricUnits[config.metric];
  const label = metricLabels[config.metric];

  switch (config.type) {
    case "kpi": {
      const value = getMetricValue(config.metric, scope, scopeId);
      const compare = getComparisonValue(config.metric, scope, scopeId, config.comparison);
      const delta = compare !== null ? Math.round((value - compare) * 10) / 10 : null;
      return (
        <Stat
          label={label}
          value={formatMetric(value, unit)}
          sub={delta !== null ? `${delta >= 0 ? "+" : ""}${formatMetric(delta, unit)} vs ${comparisonLabel(config.comparison)}` : undefined}
          trend={delta === null ? undefined : delta >= 0 ? "up" : "down"}
        />
      );
    }
    case "bar": {
      const data = getMetricSeries(config.metric, scope, scopeId, config.timeRange);
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
            <XAxis dataKey="label" tick={{ fontSize: 10.5, fill: "#8a93a6" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10.5, fill: "#8a93a6" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #dde1e9" }} />
            <Bar dataKey="value" fill="#0e5f45" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    }
    case "line": {
      const data = getMetricSeries(config.metric, scope, scopeId, config.timeRange);
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
            <XAxis dataKey="label" tick={{ fontSize: 10.5, fill: "#8a93a6" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10.5, fill: "#8a93a6" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #dde1e9" }} />
            <Line type="monotone" dataKey="value" stroke="#0e5f45" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      );
    }
    case "area": {
      const data = getMetricSeries(config.metric, scope, scopeId, config.timeRange);
      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
            <XAxis dataKey="label" tick={{ fontSize: 10.5, fill: "#8a93a6" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10.5, fill: "#8a93a6" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #dde1e9" }} />
            <Area type="monotone" dataKey="value" stroke="#0e5f45" strokeWidth={2} fill="#0e5f45" fillOpacity={0.15} />
          </AreaChart>
        </ResponsiveContainer>
      );
    }
    case "pie": {
      const data = getMetricSeries(config.metric, scope, scopeId, config.timeRange);
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" innerRadius={32} outerRadius={58} paddingAngle={2}>
              {data.map((d, i) => <Cell key={d.label} fill={palette[i % palette.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #dde1e9" }} />
          </PieChart>
        </ResponsiveContainer>
      );
    }
    case "scatter": {
      const data = getMetricSeries(config.metric, scope, scopeId, config.timeRange).map((d, i) => ({ x: i, y: d.value, label: d.label }));
      return (
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
            <XAxis dataKey="x" tick={{ fontSize: 10.5, fill: "#8a93a6" }} axisLine={false} tickLine={false} />
            <YAxis dataKey="y" tick={{ fontSize: 10.5, fill: "#8a93a6" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #dde1e9" }} />
            <Scatter data={data} fill="#0e5f45" />
          </ScatterChart>
        </ResponsiveContainer>
      );
    }
    case "table": {
      const rows = getTableRows(scope, scopeId, config.metric);
      return (
        <div className="h-full overflow-y-auto">
          <table className="w-full text-left text-[11.5px]">
            <thead>
              <tr className="border-b border-ink-100 text-[10px] font-semibold uppercase tracking-wide text-ink-400">
                <th className="py-1.5 pr-2">Project</th><th className="py-1.5 pr-2">{label}</th><th className="py-1.5">Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {rows.map((r) => (
                <tr key={r.name}>
                  <td className="truncate py-1.5 pr-2 font-medium">{r.name}</td>
                  <td className="num py-1.5 pr-2">{formatMetric(r.metricValue, unit)}</td>
                  <td className="num py-1.5">{r.health}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case "heatmap": {
      const cells = getHeatmapData(scope, scopeId, config.metric);
      const rows = [...new Set(cells.map((c) => c.row))];
      return <HeatmapGrid cells={cells} rows={rows} cols={[label]} unit={unit} invert={inverseMetrics.has(config.metric)} />;
    }
    case "waterfall": {
      const series = getMetricSeries(config.metric, scope, scopeId, config.timeRange);
      const steps = series.map((s, i) => ({ label: s.label, delta: i === 0 ? s.value : Math.round((s.value - series[i - 1].value) * 10) / 10 }));
      return <WaterfallChart steps={steps} unit={unit || "€M"} />;
    }
    case "geo": {
      const series = getMetricSeries(config.metric, scope, scopeId, config.timeRange);
      const positions = [[20, 30], [50, 20], [80, 35], [35, 70], [65, 65]];
      const points = series.map((s, i) => ({ region: s.label, countryCode: "", value: s.value, x: positions[i % positions.length][0], y: positions[i % positions.length][1] }));
      return <GeoMapMock points={points} unit={unit || "€M"} />;
    }
    case "gauge": {
      const value = getMetricValue(config.metric, scope, scopeId);
      return <GaugeWidget label={label} value={value} max={unit === "%" ? 100 : Math.max(value * 1.4, 1)} unit={unit} />;
    }
    default:
      return null;
  }
}

function comparisonLabel(c: WidgetConfig["comparison"]) {
  const map: Record<WidgetConfig["comparison"], string> = {
    none: "", prevMonth: "prev. month", prevQuarter: "prev. quarter", budget: "budget", forecast: "forecast", target: "target", lastYear: "last year",
  };
  return map[c];
}
