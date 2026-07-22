import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import type { PortfolioProject } from "../../../../lib/portfolioData";
import { EmptyState } from "../../../../lib/ui";
import { cn } from "../../../../lib/cn";
import { describeColumn, type BenchmarkColumn } from "./benchmarkColumns";
import { baseColumnKeys, baseColumnLabels, type BaseColumnKey, type BenchmarkSortState } from "./benchmarkPresetStore";
import type { BenchmarkRow } from "./useBenchmarkTable";
import BenchmarkTableRow from "./BenchmarkTableRow";

function SortHeader({
  label, sortKey, sort, onSort,
}: { label: string; sortKey: string; sort: BenchmarkSortState; onSort: (key: string, multi: boolean) => void }) {
  const spec = sort.find((s) => s.key === sortKey);
  const priority = spec ? sort.findIndex((s) => s.key === sortKey) + 1 : null;
  return (
    <button
      onClick={(e) => onSort(sortKey, e.shiftKey)}
      className="flex items-center gap-1 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-400 hover:text-ink-700"
      title="Click to sort, shift-click to add a secondary sort"
    >
      {label}
      {spec ? (
        <span className="flex items-center gap-0.5 text-accent-700">
          {spec.direction === "asc" ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
          {sort.length > 1 && <span className="num">{priority}</span>}
        </span>
      ) : (
        <ChevronsUpDown size={11} className="opacity-40" />
      )}
    </button>
  );
}

export default function BenchmarkTable({
  rows, project, columns, visibleColumnKeys, sort, onSort, onRemoveColumn, onOpenDrillDown,
}: {
  rows: BenchmarkRow[];
  project: PortfolioProject;
  columns: BenchmarkColumn[];
  visibleColumnKeys: BaseColumnKey[];
  sort: BenchmarkSortState;
  onSort: (key: string, multi: boolean) => void;
  onRemoveColumn: (id: string) => void;
  onOpenDrillDown: (row: BenchmarkRow) => void;
}) {
  const nonCurrentColumns = columns.filter((c) => c.kind !== "current");

  if (rows.length === 0) {
    return <EmptyState icon={<ChevronsUpDown size={20} />} title="No metrics match" sub="Adjust your metric selection or filters." />;
  }

  return (
    <div className="relative max-h-[70vh] overflow-auto rounded-lg border border-ink-200">
      <table className="w-full min-w-[900px] border-collapse text-left">
        <thead className="sticky top-0 z-20 bg-white shadow-[0_1px_0_0_rgba(17,20,28,0.06)]">
          <tr>
            <th className="sticky left-0 top-0 z-30 bg-white px-4 py-2.5">
              <SortHeader label="Metric" sortKey="metric" sort={sort} onSort={onSort} />
            </th>
            <th className="px-4 py-2.5">
              <SortHeader label="Current" sortKey="current" sort={sort} onSort={onSort} />
            </th>
            {nonCurrentColumns.map((col) => (
              <th key={col.id} className="px-4 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="max-w-[160px] truncate text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-400" title={describeColumn(col, project)}>
                    {describeColumn(col, project)}
                  </span>
                  <button onClick={() => onRemoveColumn(col.id)} className="shrink-0 text-[10px] text-ink-300 hover:text-crit-600">✕</button>
                </div>
                <div className="mt-1 flex gap-3">
                  <SortHeader label="Diff" sortKey={`pctDifference:${col.id}`} sort={sort} onSort={onSort} />
                </div>
              </th>
            ))}
            {visibleColumnKeys.map((key) => (
              key === "difference" || key === "pctDifference" ? null : (
                <th key={key} className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-400">
                  {baseColumnLabels[key as Exclude<BaseColumnKey, "difference" | "pctDifference">]}
                </th>
              )
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <BenchmarkTableRow
              key={row.metric}
              row={row}
              project={project}
              columns={columns}
              visibleColumnKeys={visibleColumnKeys}
              onOpenDrillDown={() => onOpenDrillDown(row)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { baseColumnKeys };
