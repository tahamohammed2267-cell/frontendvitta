import { Fragment } from "react";
import { cn } from "../../../lib/cn";

export interface HeatmapCell { row: string; col: string; value: number }

function colorFor(pct: number, invert: boolean) {
  const p = invert ? 1 - pct : pct;
  if (p >= 0.85) return "bg-pos-600 text-white";
  if (p >= 0.7) return "bg-pos-100 text-pos-700";
  if (p >= 0.5) return "bg-warn-100 text-warn-700";
  if (p >= 0.3) return "bg-crit-100 text-crit-700";
  return "bg-crit-600 text-white";
}

function formatCell(value: number, unit: string) {
  if (unit === "€M") return `${value < 0 ? "-" : ""}€${Math.abs(value)}m`;
  return `${value}${unit}`;
}

// invert: for metrics where a higher value is worse (cost, overdue counts) so
// red/green shading still reads as "good vs bad" rather than "big vs small".
export default function HeatmapGrid({ cells, rows, cols, unit = "", invert = false }: { cells: HeatmapCell[]; rows: string[]; cols: string[]; unit?: string; invert?: boolean }) {
  const values = cells.map((c) => c.value);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const range = max - min;
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
              const pct = v !== undefined && range > 0 ? (v - min) / range : 0.5;
              return (
                <div
                  key={`${r}-${c}`}
                  className={cn("num flex h-9 items-center justify-center rounded-md text-[10.5px] font-semibold", v === undefined ? "bg-ink-50 text-ink-300" : colorFor(pct, invert))}
                  title={v !== undefined ? `${r} · ${c}: ${formatCell(v, unit)}` : "No data"}
                >
                  {v !== undefined ? formatCell(v, unit) : "—"}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
