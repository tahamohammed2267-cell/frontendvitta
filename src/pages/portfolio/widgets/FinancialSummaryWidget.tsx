import type { DashboardScope } from "../../../lib/portfolioData";
import { getMetricValue } from "../builder/metricSeries";

function formatMetric(value: number, unit: string) {
  if (unit === "€M") return `${value < 0 ? "-" : ""}€${Math.abs(value).toLocaleString()}m`;
  return `${value.toLocaleString()}${unit}`;
}

export default function FinancialSummaryWidget({ scope, scopeId }: { scope: DashboardScope; scopeId: string }) {
  const revenue = getMetricValue("revenue", scope, scopeId);
  const ebitda = getMetricValue("ebitda", scope, scopeId);
  const margin = getMetricValue("ebitdaMargin", scope, scopeId);
  const cashFlow = getMetricValue("cashFlow", scope, scopeId);

  const rows = [
    { label: "Revenue", value: formatMetric(revenue, "€M") },
    { label: "EBITDA", value: formatMetric(ebitda, "€M") },
    { label: "Margin", value: `${margin}%` },
    { label: "Cash flow", value: formatMetric(cashFlow, "€M") },
  ];

  return (
    <div className="grid h-full grid-cols-2 gap-3">
      {rows.map((r) => (
        <div key={r.label}>
          <p className="text-[10.5px] text-ink-500">{r.label}</p>
          <p className="num mt-0.5 text-[16px] font-semibold tracking-tight">{r.value}</p>
        </div>
      ))}
    </div>
  );
}
