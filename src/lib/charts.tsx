import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useId } from "react";
import { cn } from "./cn";

// ── Shared chart tokens ─────────────────────────────────────
// One source of truth so every chart in the app reads as a system.
export const CHART = {
  grid: "#eceef3",
  axis: "#8a93a6",
  accent: "#0e5f45",
  accentSoft: "#16805d",
  muted: "#b9c0cf",
  pos: "#059669",
  neg: "#dc2626",
  warn: "#d97706",
} as const;

export type SeriesDef = {
  key: string;
  label: string;
  color?: string;
  /** format a raw value for the tooltip, e.g. (v) => `€${v}m` */
  format?: (v: number) => string;
};

// ── Premium tooltip ─────────────────────────────────────────
// Dark, rounded, tabular-num — the single biggest tell that a chart
// was designed rather than dropped in with defaults.
export function ChartTooltip({
  active, payload, label, series,
}: {
  active?: boolean;
  payload?: { dataKey: string; value: number; color?: string }[];
  label?: string | number;
  series: SeriesDef[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 shadow-[0_10px_30px_-8px_rgba(11,14,20,0.5)]">
      {label !== undefined && (
        <p className="mb-1.5 text-[10.5px] font-medium uppercase tracking-[0.06em] text-ink-400">{label}</p>
      )}
      <div className="space-y-1">
        {payload.map((p) => {
          const def = series.find((s) => s.key === p.dataKey);
          const color = def?.color ?? p.color ?? CHART.accent;
          return (
            <div key={p.dataKey} className="flex items-center justify-between gap-4 text-[12px]">
              <span className="flex items-center gap-1.5 text-ink-200">
                <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                {def?.label ?? p.dataKey}
              </span>
              <span className="num font-semibold text-white">
                {def?.format ? def.format(p.value) : p.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Gradient area trend ─────────────────────────────────────
// Multi-series area with soft gradient fills, animated draw-in,
// a dashed crosshair cursor, and minimal axes. The workhorse chart.
export function AreaTrend({
  data, xKey, series, height = 180, yWidth = -20, showY = true, className, curved = true,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  xKey: string;
  series: SeriesDef[];
  height?: number;
  yWidth?: number;
  showY?: boolean;
  className?: string;
  curved?: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  return (
    <div className={cn(className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 6, right: 6, bottom: 0, left: yWidth }}>
          <defs>
            {series.map((s) => {
              const color = s.color ?? CHART.accent;
              return (
                <linearGradient key={s.key} id={`grad-${uid}-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.01} />
                </linearGradient>
              );
            })}
          </defs>
          <CartesianGrid vertical={false} stroke={CHART.grid} />
          <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: CHART.axis }} axisLine={false} tickLine={false} dy={4} />
          {showY && <YAxis tick={{ fontSize: 11, fill: CHART.axis }} axisLine={false} tickLine={false} width={40} />}
          <Tooltip
            cursor={{ stroke: CHART.accent, strokeWidth: 1, strokeDasharray: "3 3", strokeOpacity: 0.5 }}
            content={<ChartTooltip series={series} />}
          />
          {/* Render last series first so the primary line sits on top. */}
          {[...series].reverse().map((s, i) => {
            const color = s.color ?? CHART.accent;
            return (
              <Area
                key={s.key}
                type={curved ? "monotone" : "linear"}
                dataKey={s.key}
                stroke={color}
                strokeWidth={2}
                fill={`url(#grad-${uid}-${s.key})`}
                dot={false}
                activeDot={{ r: 3.5, strokeWidth: 2, stroke: "#fff", fill: color }}
                isAnimationActive
                animationDuration={900}
                animationBegin={i * 120}
                animationEasing="ease-out"
              />
            );
          })}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
