import { AlertTriangle, FileText } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { PortfolioProject } from "../../../../lib/portfolioData";
import { formatMetric, metricLabels, metricUnits } from "../../builder/metricSeries";
import { Badge, Drawer, SeverityBadge } from "../../../../lib/ui";
import { CHART, ChartTooltip } from "../../../../lib/charts";
import { describeColumn, type BenchmarkColumn } from "./benchmarkColumns";
import { computePctDifference, classifyVariance, varianceVerdictMeta, type VarianceThresholds } from "./varianceVerdict";
import { deriveExplanation, findRelevantHealthFlags } from "./aiExplanation";
import { getColumnValue } from "./benchmarkColumns";
import type { BenchmarkRow } from "./useBenchmarkTable";

export default function BenchmarkDrillDownDrawer({
  row, project, columns, thresholds, onClose,
}: {
  row: BenchmarkRow;
  project: PortfolioProject;
  columns: BenchmarkColumn[];
  thresholds: VarianceThresholds;
  onClose: () => void;
}) {
  const unit = metricUnits[row.metric];
  const nonCurrentColumns = columns.filter((c) => c.kind !== "current");
  const relevantFlags = findRelevantHealthFlags(row.metric, project.healthFlags);
  const relevantAlerts = project.assetHealth.alerts;

  return (
    <Drawer open onClose={onClose} title={metricLabels[row.metric]} sub={`${project.name} · Current: ${formatMetric(row.currentValue, unit)}`} width="520px">
      <div className="space-y-5">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-400">6-Month Trend</p>
          <div className="h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={row.trend} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
                <XAxis dataKey="label" tick={{ fontSize: 10.5, fill: CHART.axis }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10.5, fill: CHART.axis }} axisLine={false} tickLine={false} width={36} />
                <Tooltip content={<ChartTooltip series={[{ key: "value", label: metricLabels[row.metric] }]} />} />
                <Area type="monotone" dataKey="value" stroke={CHART.accent} strokeWidth={2} fill={CHART.accent} fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-1 text-[11px] text-ink-400">Vitta currently retains 6 months of period-over-period data per project.</p>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-400">Benchmark history — every active comparison</p>
          <div className="space-y-2.5">
            {nonCurrentColumns.map((col) => {
              const value = getColumnValue(col, row.metric, project);
              const pctDifference = value !== null ? computePctDifference(row.currentValue, value) : null;
              const verdict = pctDifference !== null ? classifyVariance(row.metric, pctDifference, thresholds) : null;
              const explanation = deriveExplanation({ project, metric: row.metric, column: col, pctDifference, verdict, trend: row.trend });
              return (
                <div key={col.id} className="rounded-lg border border-ink-100 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[12px] font-medium text-ink-800">{describeColumn(col, project)}</p>
                    {verdict && <Badge tone={varianceVerdictMeta[verdict].tone}>{varianceVerdictMeta[verdict].label}</Badge>}
                  </div>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-ink-600">{explanation}</p>
                </div>
              );
            })}
            {nonCurrentColumns.length === 0 && <p className="text-[12px] text-ink-400">No comparison columns active.</p>}
          </div>
        </div>

        {relevantFlags.length > 0 && (
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-400">Related flags</p>
            <div className="space-y-1.5">
              {relevantFlags.map((f, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg border border-warn-100 bg-warn-50/40 p-2.5">
                  <AlertTriangle size={13} className="mt-0.5 shrink-0 text-warn-600" />
                  <div>
                    <div className="flex items-center gap-1.5"><SeverityBadge severity={f.severity} /><span className="text-[12px] font-medium text-ink-800">{f.label}</span></div>
                    <p className="mt-0.5 text-[11.5px] text-ink-600">{f.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {relevantAlerts.length > 0 && (
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-400">Asset health alerts</p>
            <div className="space-y-1.5">
              {relevantAlerts.map((a) => (
                <div key={a.id} className="flex items-start gap-2 rounded-lg border border-ink-100 p-2.5">
                  <SeverityBadge severity={a.severity} />
                  <p className="text-[11.5px] text-ink-600">{a.text} <span className="text-ink-400">· {a.raisedAt}</span></p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-400">Uploaded MIS / reporting documents</p>
          <div className="space-y-1">
            {project.documents.map((d) => (
              <div key={d.id} className="flex items-center gap-2.5 rounded-lg border border-ink-100 px-3 py-2">
                <FileText size={14} className="shrink-0 text-ink-400" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-medium text-ink-800">{d.name}</p>
                  <p className="text-[11px] text-ink-400">{d.kind} · {d.format} · {d.uploadedAt} · {d.uploadedBy}</p>
                </div>
              </div>
            ))}
            {project.documents.length === 0 && <p className="text-[12px] text-ink-400">No documents uploaded yet.</p>}
          </div>
        </div>
      </div>
    </Drawer>
  );
}
