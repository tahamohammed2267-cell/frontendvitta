import { Fragment } from "react";
import { cn } from "../../../lib/cn";

export interface HeatmapCell { row: string; col: string; value: number }

function colorFor(value: number, max: number) {
  const pct = max > 0 ? value / max : 0;
  if (pct >= 0.85) return "bg-pos-600 text-white";
  if (pct >= 0.7) return "bg-pos-100 text-pos-700";
  if (pct >= 0.5) return "bg-warn-100 text-warn-700";
  if (pct >= 0.3) return "bg-crit-100 text-crit-700";
  return "bg-crit-600 text-white";
}

export default function HeatmapGrid({ cells, rows, cols, unit = "" }: { cells: HeatmapCell[]; rows: string[]; cols: string[]; unit?: string }) {
  const max = Math.max(...cells.map((c) => c.value), 1);
  const byKey = new Map(cells.map((c) => [`${c.row}::${c.col}`, c.value]));

  return (
    <div className="overflow-x-auto">
      <div className="grid gap-1" style={{ gridTemplateColumns: `120px repeat(${cols.length}, minmax(56px, 1fr))` }}>
        <div />
        {cols.map((c) => (
          <div key={c} className="truncate px-1 text-center text-[10.5px] font-medium text-ink-400">{c}</div>
        ))}
        {rows.map((r) => (
          <Fragment key={r}>
            <div className="truncate pr-2 text-[11.5px] font-medium text-ink-700">{r}</div>
            {cols.map((c) => {
              const v = byKey.get(`${r}::${c}`);
              return (
                <div
                  key={`${r}-${c}`}
                  className={cn("num flex h-9 items-center justify-center rounded-md text-[10.5px] font-semibold", v === undefined ? "bg-ink-50 text-ink-300" : colorFor(v, max))}
                  title={v !== undefined ? `${r} · ${c}: ${v}${unit}` : "No data"}
                >
                  {v !== undefined ? `${v}${unit}` : "—"}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
