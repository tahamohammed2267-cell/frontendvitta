import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface WaterfallStep { label: string; delta: number; isTotal?: boolean }

function formatDelta(delta: number, unit: string) {
  const sign = delta >= 0 ? "+" : "-";
  const abs = Math.abs(delta);
  return unit === "€M" ? `${sign}€${abs}m` : `${sign}${abs} ${unit}`;
}

// standard no-library waterfall technique: an invisible "base" bar offsets
// each visible delta bar to the right height on the stack.
export default function WaterfallChart({ steps, unit = "€M" }: { steps: WaterfallStep[]; unit?: string }) {
  let running = 0;
  const data = steps.map((s) => {
    if (s.isTotal) {
      const row = { label: s.label, base: 0, value: s.delta, delta: s.delta, color: "#12161f" };
      running = s.delta;
      return row;
    }
    const start = running;
    running += s.delta;
    const base = Math.min(start, running);
    const value = Math.abs(s.delta);
    return { label: s.label, base, value, delta: s.delta, color: s.delta >= 0 ? "#059669" : "#dc2626" };
  });

  return (
    <div className="h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
          <XAxis dataKey="label" tick={{ fontSize: 10.5, fill: "#8a93a6" }} axisLine={false} tickLine={false} interval={0} angle={-12} textAnchor="end" height={44} />
          <YAxis tick={{ fontSize: 11, fill: "#8a93a6" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #dde1e9" }}
            formatter={(_v, _n, p) => [formatDelta(p.payload.delta, unit), "Change"]}
          />
          <Bar dataKey="base" stackId="wf" fill="transparent" />
          <Bar dataKey="value" stackId="wf" radius={[4, 4, 4, 4]}>
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
