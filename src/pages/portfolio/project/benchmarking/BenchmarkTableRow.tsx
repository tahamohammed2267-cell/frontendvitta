import { Line, LineChart, ResponsiveContainer } from "recharts";
import { ArrowDown, ArrowUp, ChevronRight, Minus } from "lucide-react";
import type { PortfolioProject } from "../../../../lib/portfolioData";
import { formatMetric, metricLabels, metricUnits } from "../../builder/metricSeries";
import { Badge } from "../../../../lib/ui";
import { cn } from "../../../../lib/cn";
import { CHART } from "../../../../lib/charts";
import { varianceVerdictMeta } from "./varianceVerdict";
import type { BenchmarkColumn } from "./benchmarkColumns";
import type { BaseColumnKey } from "./benchmarkPresetStore";
import type { BenchmarkRow } from "./useBenchmarkTable";

function Sparkline({ trend }: { trend: BenchmarkRow["trend"] }) {
  const data = trend.map((t) => ({ v: t.value }));
  return (
    <div className="h-6 w-16">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="v" stroke={CHART.accent} strokeWidth={1.75} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function BenchmarkTableRow({
  row, project, columns, visibleColumnKeys, onOpenDrillDown,
}: {
  row: BenchmarkRow;
  project: PortfolioProject;
  columns: BenchmarkColumn[]; // includes "current"
  visibleColumnKeys: BaseColumnKey[];
  onOpenDrillDown: () => void;
}) {
  const unit = metricUnits[row.metric];
  const nonCurrentColumns = columns.filter((c) => c.kind !== "current");

  return (
    <tr className="group hover:bg-ink-50/60">
      <td className="sticky left-0 z-10 border-b border-ink-100 bg-white px-4 py-2.5 group-hover:bg-ink-50">
        <button onClick={onOpenDrillDown} className="flex items-center gap-1 text-left text-[12.5px] font-medium text-ink-800 hover:text-accent-700">
          <ChevronRight size={13} className="shrink-0 text-ink-400" />
          {metricLabels[row.metric]}
        </button>
      </td>

      <td className="num border-b border-ink-100 px-4 py-2.5 text-[12.5px] font-semibold text-ink-900">
        {formatMetric(row.currentValue, unit)}
      </td>

      {nonCurrentColumns.map((col) => {
        const cell = row.cells.find((c) => c.columnId === col.id);
        if (!cell) return <td key={col.id} className="border-b border-ink-100 px-4 py-2.5" />;
        const hasValue = cell.value !== null && cell.pctDifference !== null && cell.verdict !== null;
        return (
          <td key={col.id} className="border-b border-ink-100 px-4 py-2.5">
            {!hasValue ? (
              <span className="text-[12px] text-ink-300">—</span>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                {visibleColumnKeys.includes("difference") && (
                  <span className="num text-[12px] text-ink-600">{formatMetric(cell.value!, unit)}</span>
                )}
                {visibleColumnKeys.includes("pctDifference") && (
                  <span className={cn("num flex items-center gap-0.5 text-[12px] font-medium", cell.pctDifference! > 0 ? "text-pos-700" : cell.pctDifference! < 0 ? "text-crit-700" : "text-ink-500")}>
                    {cell.pctDifference! > 0 ? <ArrowUp size={11} /> : cell.pctDifference! < 0 ? <ArrowDown size={11} /> : <Minus size={11} />}
                    {Math.abs(cell.pctDifference!).toFixed(1)}%
                  </span>
                )}
                <Badge tone={varianceVerdictMeta[cell.verdict!].tone}>{varianceVerdictMeta[cell.verdict!].label}</Badge>
              </div>
            )}
          </td>
        );
      })}

      {visibleColumnKeys.includes("trend") && (
        <td className="border-b border-ink-100 px-4 py-2.5"><Sparkline trend={row.trend} /></td>
      )}
      {visibleColumnKeys.includes("aiExplanation") && (
        <td className="max-w-[360px] border-b border-ink-100 px-4 py-2.5 text-[12px] leading-relaxed text-ink-600">{row.aiExplanation}</td>
      )}
      {visibleColumnKeys.includes("evidence") && (
        <td className="border-b border-ink-100 px-4 py-2.5">
          <button onClick={onOpenDrillDown} className="text-[11.5px] font-medium text-accent-700 hover:underline">View evidence</button>
        </td>
      )}
    </tr>
  );
}
