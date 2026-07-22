import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { crossDealPatterns, industryLabel, type CrossDealPattern } from "../../lib/intelligence/crossDealPatterns";
import { CHART, ChartTooltip } from "../../lib/charts";
import { Badge, Card, CardHeader, SeverityBadge } from "../../lib/ui";
import { cn } from "../../lib/cn";

const severityColor = { critical: CHART.neg, high: CHART.warn, medium: CHART.accentSoft, low: CHART.muted } as const;

function OverviewChart({ patterns, active, onSelect }: { patterns: CrossDealPattern[]; active: string; onSelect: (id: string) => void }) {
  const data = patterns.map((p) => ({ id: p.id, name: p.title, count: p.hits.length }));
  return (
    <div className="h-[180px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 4 }} barSize={18}>
          <CartesianGrid horizontal={false} stroke={CHART.grid} />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: CHART.axis }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" width={200} tick={{ fontSize: 11.5, fill: "#1f2430" }} axisLine={false} tickLine={false} />
          <Tooltip cursor={{ fill: "rgba(14,95,69,0.06)" }} content={<ChartTooltip series={[{ key: "count", label: "Deals affected", color: CHART.accent }]} />} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} onClick={(d) => onSelect((d as unknown as { id: string }).id)} className="cursor-pointer">
            {data.map((d) => (
              <Cell key={d.id} fill={d.id === active ? CHART.accent : CHART.muted} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function SeverityMixChart({ pattern }: { pattern: CrossDealPattern }) {
  const data = (["critical", "high", "medium", "low"] as const)
    .map((s) => ({ severity: s, count: pattern.severityCounts[s] }))
    .filter((d) => d.count > 0);
  return (
    <div className="h-[90px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -24 }} barSize={28}>
          <XAxis dataKey="severity" tick={{ fontSize: 10.5, fill: CHART.axis }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 10.5, fill: CHART.axis }} axisLine={false} tickLine={false} width={20} />
          <Tooltip cursor={{ fill: "rgba(14,95,69,0.06)" }} content={<ChartTooltip series={[{ key: "count", label: "Deals" }]} />} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((d) => <Cell key={d.severity} fill={severityColor[d.severity]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function PatternDetail({ pattern }: { pattern: CrossDealPattern }) {
  return (
    <div className="grid grid-cols-[1fr_220px] gap-4 max-lg:grid-cols-1">
      <Card pad={false} className="overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-ink-100 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-400">
              <th className="px-4 py-2.5">Deal</th>
              <th className="px-3 py-2.5">Industry</th>
              <th className="px-3 py-2.5">Region</th>
              <th className="px-4 py-2.5 text-right">Severity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {pattern.hits.map((h) => (
              <tr key={h.projectId}>
                <td className="px-4 py-2.5 text-[12.5px] font-medium text-ink-800">{h.projectName}</td>
                <td className="px-3 py-2.5 text-[12px] text-ink-500">{industryLabel(h.industryKey)}</td>
                <td className="px-3 py-2.5 text-[12px] text-ink-500">{h.regionName}</td>
                <td className="px-4 py-2.5 text-right"><SeverityBadge severity={h.severity} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Card>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-400">Severity mix</p>
        <SeverityMixChart pattern={pattern} />
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Badge tone="gray">{pattern.industriesAffected.map(industryLabel).join(" · ")}</Badge>
        </div>
      </Card>
    </div>
  );
}

export default function PatternLibrarySection() {
  const patterns = crossDealPatterns;
  const [active, setActive] = useState(patterns[0]?.id ?? "");
  const activePattern = patterns.find((p) => p.id === active) ?? patterns[0];

  return (
    <Card>
      <CardHeader
        title="Pattern Library"
        sub={`Top ${patterns.length} recurring signals across the portfolio — ${new Set(patterns.flatMap((p) => p.hits.map((h) => h.projectId))).size} deals, ${new Set(patterns.flatMap((p) => p.industriesAffected)).size} industries`}
      />

      {patterns.length === 0 ? (
        <p className="py-6 text-center text-[12.5px] text-ink-400">No signal recurs across 2+ deals yet.</p>
      ) : (
        <>
          <OverviewChart patterns={patterns} active={active} onSelect={setActive} />

          <div className="mt-4 flex flex-wrap gap-1.5 border-t border-ink-100 pt-3.5">
            {patterns.map((p) => (
              <button
                key={p.id}
                onClick={() => setActive(p.id)}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors",
                  active === p.id ? "border-ink-900 bg-ink-900 text-white" : "border-ink-200 text-ink-600 hover:border-ink-300"
                )}
              >
                {p.title} <span className="num opacity-70">· {p.hits.length}</span>
              </button>
            ))}
          </div>

          {activePattern && (
            <div className="mt-4">
              <PatternDetail pattern={activePattern} />
            </div>
          )}
        </>
      )}
    </Card>
  );
}
