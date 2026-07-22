import { useState } from "react";
import { Columns3, Search, SlidersHorizontal } from "lucide-react";
import { Badge, Button } from "../../../../lib/ui";
import { cn } from "../../../../lib/cn";
import { varianceVerdictMeta, varianceVerdictOrder, type VarianceVerdict } from "./varianceVerdict";
import { baseColumnKeys, baseColumnLabels, type BaseColumnKey, type BenchmarkFilters } from "./benchmarkPresetStore";

export default function BenchmarkFilterBar({
  filters, onFiltersChange, visibleColumnKeys, onVisibleColumnKeysChange, onOpenThresholds,
}: {
  filters: BenchmarkFilters;
  onFiltersChange: (f: BenchmarkFilters) => void;
  visibleColumnKeys: BaseColumnKey[];
  onVisibleColumnKeysChange: (keys: BaseColumnKey[]) => void;
  onOpenThresholds: () => void;
}) {
  const [columnsOpen, setColumnsOpen] = useState(false);

  function toggleVerdict(v: VarianceVerdict) {
    const verdicts = filters.verdicts.includes(v) ? filters.verdicts.filter((x) => x !== v) : [...filters.verdicts, v];
    onFiltersChange({ ...filters, verdicts });
  }

  function toggleColumnKey(key: BaseColumnKey) {
    const keys = visibleColumnKeys.includes(key) ? visibleColumnKeys.filter((x) => x !== key) : [...visibleColumnKeys, key];
    onVisibleColumnKeysChange(keys);
  }

  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <div className="relative">
        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          placeholder="Search metrics…"
          className="w-[200px] rounded-lg border border-ink-200 bg-white py-1.5 pl-8 pr-3 text-[12.5px] outline-none placeholder:text-ink-400 focus:border-accent-500"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {varianceVerdictOrder.map((v) => (
          <button key={v} onClick={() => toggleVerdict(v)}>
            <Badge tone={filters.verdicts.includes(v) ? varianceVerdictMeta[v].tone : "gray"}>{varianceVerdictMeta[v].label}</Badge>
          </button>
        ))}
      </div>

      <div className="relative ml-auto">
        <Button variant="secondary" className="px-2.5 py-1.5 text-[12px]" onClick={() => setColumnsOpen((o) => !o)}>
          <Columns3 size={13} /> Columns
        </Button>
        {columnsOpen && (
          <div className="absolute right-0 top-[calc(100%+6px)] z-40 w-[200px] rounded-lg border border-ink-200 bg-white p-2 shadow-[0_10px_30px_-8px_rgba(11,14,20,0.25)]">
            {baseColumnKeys.map((key) => (
              <label key={key} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[12.5px] hover:bg-ink-50">
                <input
                  type="checkbox" checked={visibleColumnKeys.includes(key)} onChange={() => toggleColumnKey(key)}
                  className="h-3.5 w-3.5 rounded border-ink-300 accent-accent-600"
                />
                {baseColumnLabels[key]}
              </label>
            ))}
          </div>
        )}
      </div>

      <Button variant="secondary" className={cn("px-2.5 py-1.5 text-[12px]")} onClick={onOpenThresholds}>
        <SlidersHorizontal size={13} /> Thresholds
      </Button>
    </div>
  );
}
