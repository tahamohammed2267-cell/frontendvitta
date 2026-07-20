import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import {
  aggregateKPIs, companiesForRegion, findIndustry, findRegion,
  projectsForRegion, regionalRisks, regionsForIndustry,
} from "../../lib/portfolioData";
import { Badge, Card, CardHeader, EmptyState, SeverityBadge, Stat } from "../../lib/ui";
import InsightsPanel from "./insights/InsightsPanel";
import CustomDashboardsSection from "./builder/CustomDashboardsSection";

const statusColor: Record<string, string> = {
  Operational: "#059669", "Ramp-up": "#1d4ed8", "Under Construction": "#8a93a6", Watch: "#d97706", "At Risk": "#dc2626",
};

export default function RegionDashboard() {
  const { industry, region } = useParams();
  const ind = findIndustry(industry ?? "");
  const reg = findRegion(region ?? "");

  if (!ind || !reg || reg.industryKey !== ind.key) {
    return (
      <div className="mx-auto max-w-[1200px] px-6 py-6">
        <EmptyState icon={<ArrowLeft size={20} />} title="Region not found" sub="Choose a region from the industry dashboard." />
      </div>
    );
  }

  const projects = projectsForRegion(reg.id);
  const summary = aggregateKPIs(projects);
  const siblingRegions = regionsForIndustry(ind.key);
  const risks = regionalRisks[reg.id] ?? [];

  const distribution = Object.entries(
    projects.reduce<Record<string, number>>((acc, p) => { acc[p.status] = (acc[p.status] ?? 0) + 1; return acc; }, {})
  ).map(([status, count]) => ({ status, count }));

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-6">
      <Link to={`/portfolio/${ind.key}`} className="mb-3 inline-flex items-center gap-1 text-[12px] font-medium text-ink-400 hover:text-ink-700 fade-up">
        <ArrowLeft size={13} /> {ind.name}
      </Link>
      <div className="mb-6 flex items-center gap-3 fade-up">
        <h1 className="text-[22px] font-semibold tracking-tight">{reg.name}</h1>
        <Badge tone="blue">{ind.name}</Badge>
        <Badge tone="gray">{projects.length} projects</Badge>
      </div>

      <div className="mb-6 grid grid-cols-4 gap-4 fade-up">
        <Card><Stat label="Revenue" value={`€${summary.totalRevenueM}m`} sub={`${summary.yoyGrowthPct >= 0 ? "+" : ""}${summary.yoyGrowthPct}% YoY`} trend={summary.yoyGrowthPct >= 0 ? "up" : "down"} /></Card>
        <Card><Stat label="EBITDA" value={`€${summary.totalEbitdaM}m`} /></Card>
        <Card><Stat label="Capacity utilization" value={`${summary.capacityUtilizationPct}%`} /></Card>
        <Card><Stat label="Avg asset health" value={`${summary.avgAssetHealth}`} /></Card>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-4 fade-up">
          <Card pad={false}>
            <div className="border-b border-ink-100 px-5 py-4"><CardHeader title="Region comparison" sub={`${reg.name} vs. other ${ind.name} regions`} /></div>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-ink-100 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-400">
                  <th className="px-5 py-2.5">Region</th>
                  <th className="px-4 py-2.5">Projects</th>
                  <th className="px-4 py-2.5">Revenue</th>
                  <th className="px-4 py-2.5">EBITDA</th>
                  <th className="px-5 py-2.5 text-right">Asset health</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {siblingRegions.map((r) => {
                  const rp = projectsForRegion(r.id);
                  const s = aggregateKPIs(rp);
                  const active = r.id === reg.id;
                  return (
                    <tr key={r.id} className={active ? "bg-accent-50/50" : ""}>
                      <td className="px-5 py-3 text-[13px] font-medium">
                        {active ? r.name : <Link to={`/portfolio/${ind.key}/${r.id}`} className="hover:text-accent-700 hover:underline">{r.name}</Link>}
                      </td>
                      <td className="num px-4 py-3 text-[12.5px] text-ink-600">{rp.length}</td>
                      <td className="num px-4 py-3 text-[12.5px] font-semibold">€{s.totalRevenueM}m</td>
                      <td className="num px-4 py-3 text-[12.5px] font-semibold">€{s.totalEbitdaM}m</td>
                      <td className="num px-5 py-3 text-right text-[12.5px] font-semibold">{s.avgAssetHealth}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>

          <Card>
            <CardHeader title="Project distribution" sub="By operational status" />
            <div className="flex items-center gap-6">
              <div className="h-[160px] w-[160px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={distribution} dataKey="count" nameKey="status" innerRadius={40} outerRadius={70} paddingAngle={2}>
                      {distribution.map((d) => <Cell key={d.status} fill={statusColor[d.status]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #dde1e9" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {distribution.map((d) => (
                  <div key={d.status} className="flex items-center gap-2 text-[12.5px]">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: statusColor[d.status] }} />
                    <span className="flex-1 text-ink-700">{d.status}</span>
                    <span className="num font-semibold">{d.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card pad={false}>
            <div className="border-b border-ink-100 px-5 py-4"><CardHeader title="Companies" sub={`Operating in ${reg.name}`} /></div>
            <div className="divide-y divide-ink-100">
              {companiesForRegion(reg.id).map((c) => {
                const cp = projectsForRegion(reg.id).filter((p) => p.companyId === c.id);
                return (
                  <div key={c.id} className="flex items-center gap-4 px-5 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium">{c.name}</p>
                      <p className="mt-0.5 text-[11.5px] text-ink-500">{cp.map((p) => p.name).join(" · ")}</p>
                    </div>
                    <Badge tone="gray">{cp.length} project{cp.length !== 1 ? "s" : ""}</Badge>
                  </div>
                );
              })}
            </div>
          </Card>

          <CustomDashboardsSection scope="region" scopeId={reg.id} />
        </div>

        <div className="space-y-4 fade-up">
          <InsightsPanel scope={reg.id} limit={3} />
          <Card>
            <CardHeader title="Regional risks" sub="Weather, regulatory, grid, inflation, currency" />
            <div className="space-y-2.5">
              {risks.map((r, i) => (
                <div key={i} className="rounded-lg border border-ink-100 p-3">
                  <div className="flex items-center justify-between">
                    <Badge tone="gray">{r.category}</Badge>
                    <SeverityBadge severity={r.severity} />
                  </div>
                  <p className="mt-2 text-[12px] leading-relaxed text-ink-700">{r.text}</p>
                </div>
              ))}
              {risks.length === 0 && <p className="py-4 text-center text-[12px] text-ink-400">No regional risks flagged.</p>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
