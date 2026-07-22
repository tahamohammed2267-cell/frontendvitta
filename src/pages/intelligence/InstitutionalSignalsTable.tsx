import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { EmptyState } from "../../lib/ui";
import type { SignalRow, SortState } from "./useInstitutionalSignalsTable";
import SignalTableRow from "./SignalTableRow";

const columns: { key: string; label: string }[] = [
  { key: "title", label: "Signal" },
  { key: "impact", label: "Impact" },
  { key: "projectCount", label: "Projects" },
  { key: "industryCount", label: "Industries" },
  { key: "regionCount", label: "Regions" },
  { key: "firstSeenYear", label: "First Seen" },
  { key: "lastSeenYear", label: "Last Seen" },
  { key: "confidence", label: "Confidence" },
  { key: "outcomePct", label: "Historical Outcome" },
  { key: "recurringSince", label: "Recurring Since" },
  { key: "frequency", label: "Frequency" },
  { key: "status", label: "Status" },
];

function SortHeader({ label, sortKey, sort, onSort, sticky }: { label: string; sortKey: string; sort: SortState; onSort: (key: string, multi: boolean) => void; sticky?: boolean }) {
  const spec = sort.find((s) => s.key === sortKey);
  const priority = spec ? sort.findIndex((s) => s.key === sortKey) + 1 : null;
  return (
    <th className={sticky ? "sticky left-0 z-30 bg-white px-4 py-2.5" : "px-3 py-2.5"}>
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
    </th>
  );
}

export default function InstitutionalSignalsTable({
  rows, sort, onSort, expandedId, onToggleExpanded, onSelectRelated,
}: {
  rows: SignalRow[];
  sort: SortState;
  onSort: (key: string, multi: boolean) => void;
  expandedId: string | null;
  onToggleExpanded: (id: string) => void;
  onSelectRelated: (id: string) => void;
}) {
  if (rows.length === 0) {
    return <EmptyState icon={<ChevronsUpDown size={20} />} title="No signals match" sub="Adjust your filters to see institutional signals." />;
  }

  return (
    <div className="relative max-h-[70vh] overflow-auto rounded-lg border border-ink-200">
      <table className="w-full min-w-[1100px] border-collapse text-left">
        <thead className="sticky top-0 z-20 bg-white shadow-[0_1px_0_0_rgba(17,20,28,0.06)]">
          <tr>
            {columns.map((c, i) => (
              <SortHeader key={c.key} label={c.label} sortKey={c.key} sort={sort} onSort={onSort} sticky={i === 0} />
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <SignalTableRow
              key={row.signal.id}
              row={row}
              expanded={expandedId === row.signal.id}
              onToggle={() => onToggleExpanded(row.signal.id)}
              onSelectRelated={onSelectRelated}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
