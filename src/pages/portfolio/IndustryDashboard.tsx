import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Pencil } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  aggregateKPIs, driverSchemaLabels, findIndustry,
  projectsForIndustry, projectsForRegion, regionsForIndustry,
} from "../../lib/portfolioData";
import { Badge, Button, Card, CardHeader, EmptyState, SectionLabel, Stat } from "../../lib/ui";
import InsightsPanel from "./insights/InsightsPanel";
import DashboardTabs from "./builder/DashboardTabs";
import DashboardCanvas from "./builder/DashboardCanvas";
import { addDashboard, dashboardsForScope, duplicateDashboard, removeDashboard, useDashboards } from "./builder/dashboardStore";

export default function IndustryDashboard() {
  const { industry } = useParams();
  const ind = findIndustry(industry ?? "");
  useDashboards();
  const [activeDashId, setActiveDashId] = useState<string | null>(null);

  if (!ind) {
    return (
      <div className="mx-auto max-w-[1200px] px-6 py-6">
        <EmptyState icon={<ArrowLeft size={20} />} title="Industry not found" sub="Choose an industry from the portfolio home." />
      </div>
    );
  }

  const projects = projectsForIndustry(ind.key);
  const summary = aggregateKPIs(projects);
  const driverLabels = driverSchemaLabels[ind.driverKind];

  // averaged driver values across projects (metrics are matched by label position)
  const driverAverages = driverLabels.map((label, i) => {
    const vals = projects.map((p) => p.drivers.metrics[i]).filter(Boolean);
    if (vals.length === 0) return { label, value: 0, unit: "", target: undefined as number | undefined };
    const value = Math.round((vals.reduce((a, v) => a + v.value, 0) / vals.length) * 100) / 100;
    const target = vals[0].target;
    return { label, value, unit: vals[0].unit, target };
  });

  const regionRows = regionsForIndustry(ind.key).map((r) => {
    const rp = projectsForRegion(r.id);
    return { region: r, summary: aggregateKPIs(rp), count: rp.length };
  });

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-6">
      <Link to="/portfolio" className="mb-3 inline-flex items-center gap-1 text-[12px] font-medium text-ink-400 hover:text-ink-700 fade-up">
        <ArrowLeft size={13} /> Portfolio
      </Link>
      <div className="mb-6 flex items-center gap-3 fade-up">
        <h1 className="text-[22px] font-semibold tracking-tight">{ind.name}</h1>
        <Badge tone="blue">{projects.length} projects</Badge>
      </div>

      <div className="mb-6 grid grid-cols-4 gap-4 fade-up">
        <Card><Stat label="Portfolio value" value={`€${summary.totalValueM}M`} /></Card>
        <Card><Stat label="Revenue" value={`€${summary.totalRevenueM}M`} sub={`${summary.yoyGrowthPct >= 0 ? "+" : ""}${summary.yoyGrowthPct}% YoY`} trend={summary.yoyGrowthPct >= 0 ? "up" : "down"} /></Card>
        <Card><Stat label="EBITDA" value={`€${summary.totalEbitdaM}M`} /></Card>
        <Card><Stat label="Installed capacity" value={ind.key === "infrastructure" ? "—" : `${summary.installedCapacityMW.toLocaleString()} MW`} sub={`${summary.capacityUtilizationPct}% utilization`} /></Card>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-4 fade-up">
          <Card>
            <CardHeader title="Business drivers" sub={`${ind.sector} operating metrics`} />
            <div className="grid grid-cols-4 gap-3">
              {driverAverages.map((d) => (
                <div key={d.label} className="rounded-lg border border-ink-100 p-3">
                  <p className="text-[11px] font-medium text-ink-500">{d.label}</p>
                  <p className="num mt-1 text-[17px] font-semibold tracking-tight">{d.value.toLocaleString()}{d.unit}</p>
                  {d.target !== undefined && <p className="mt-0.5 text-[10.5px] text-ink-400">Target {d.target}{d.unit}</p>}
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Financial KPIs" sub="Topline, earnings and cost breakdown" />
            <SectionLabel>Topline</SectionLabel>
            <div className="mb-4 grid grid-cols-3 gap-3">
              <MiniStat label="Revenue" value={`€${summary.totalRevenueM}M`} />
              <MiniStat label="Revenue growth" value={`${summary.yoyGrowthPct}%`} />
              <MiniStat label="Cash flow" value={`€${summary.cashFlowM}M`} />
            </div>
            <SectionLabel>Earnings</SectionLabel>
            <div className="mb-4 grid grid-cols-3 gap-3">
              <MiniStat label="EBITDA" value={`€${summary.totalEbitdaM}M`} />
              <MiniStat label="Margin" value={`${summary.totalRevenueM > 0 ? Math.round((summary.totalEbitdaM / summary.totalRevenueM) * 1000) / 10 : 0}%`} />
              <MiniStat label="Active projects" value={`${summary.activeProjects}`} />
            </div>
            <SectionLabel>Cost breakdown</SectionLabel>
            <CostBreakdown projects={projects} />
          </Card>

          <Card>
            <CardHeader title="Region comparison" sub="Revenue by region" right={<Link to="/portfolio" className="flex items-center gap-1 text-[12.5px] font-medium text-accent-600">All regions <ArrowUpRight size={13} /></Link>} />
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionRows.map((r) => ({ name: r.region.name, revenue: r.summary.totalRevenueM }))} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#8a93a6" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#8a93a6" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid #dde1e9" }} />
                  <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {regionRows.map(({ region, summary: s, count }) => (
                <Link key={region.id} to={`/portfolio/${ind.key}/${region.id}`} className="rounded-lg border border-ink-100 p-3 transition-colors hover:border-ink-300">
                  <p className="text-[12.5px] font-semibold">{region.name}</p>
                  <p className="mt-0.5 text-[11px] text-ink-500">{count} projects</p>
                  <p className="num mt-2 text-[15px] font-semibold">€{s.totalRevenueM}M</p>
                </Link>
              ))}
            </div>
          </Card>

          <CustomDashboards scope="industry" scopeId={ind.key} activeDashId={activeDashId} setActiveDashId={setActiveDashId} />
        </div>

        <div className="space-y-4 fade-up">
          <InsightsPanel scope={ind.key} limit={4} />
          <Card>
            <CardHeader title="Projects" sub={`${projects.length} in ${ind.name}`} />
            <div className="space-y-2">
              {projects.map((p) => (
                <Link key={p.id} to={`/portfolio/${p.industryKey}/${p.regionId}/${p.companyId}/${p.id}`} className="flex items-center justify-between rounded-lg px-2 py-1.5 text-[12.5px] hover:bg-ink-50">
                  <span className="truncate font-medium text-ink-800">{p.name}</span>
                  <Badge tone={p.healthFlags.length > 0 ? "orange" : "gray"}>{p.status}</Badge>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function CustomDashboards({
  scope, scopeId, activeDashId, setActiveDashId,
}: { scope: "industry" | "region" | "project" | "health"; scopeId: string; activeDashId: string | null; setActiveDashId: (id: string | null) => void }) {
  const dashboards = dashboardsForScope(scope, scopeId);
  const active = dashboards.find((d) => d.id === activeDashId) ?? dashboards[0];

  function handleCreate() {
    const def = addDashboard({
      id: `dash-${scope}-${scopeId}-${Date.now()}`, name: "New Dashboard", scope, scopeId,
      widgets: [], owner: "Jane Moreau", sharedWith: [], updatedAt: "Just now",
    });
    setActiveDashId(def.id);
  }

  if (dashboards.length === 0) {
    return (
      <Card>
        <CardHeader title="Custom dashboards" sub="Build your own view of this scope" right={<Button variant="secondary" className="px-2.5 py-1.5 text-[12px]" onClick={handleCreate}>Create dashboard</Button>} />
        <p className="text-[12.5px] text-ink-400">No custom dashboards yet.</p>
      </Card>
    );
  }

  return (
    <Card pad={false}>
      <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
        <DashboardTabs
          dashboards={dashboards}
          activeId={active?.id ?? ""}
          onSelect={setActiveDashId}
          onCreate={handleCreate}
          onDuplicate={(id) => setActiveDashId(duplicateDashboard(id)?.id ?? id)}
          onDelete={(id) => { removeDashboard(id); setActiveDashId(null); }}
        />
        {active && (
          <Link to={`/portfolio/dashboards/${active.id}/edit`}>
            <Button variant="secondary" className="px-2.5 py-1.5 text-[12px]"><Pencil size={12} /> Edit</Button>
          </Link>
        )}
      </div>
      <div className="p-5">
        {active && <DashboardCanvas widgets={active.widgets} scope={active.scope} scopeId={active.scopeId} editable={false} />}
      </div>
    </Card>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-ink-500">{label}</p>
      <p className="num mt-0.5 text-[15px] font-semibold">{value}</p>
    </div>
  );
}

function CostBreakdown({ projects }: { projects: ReturnType<typeof projectsForIndustry> }) {
  const totals = projects.reduce(
    (acc, p) => {
      acc.opexM += p.financials.costs.opexM;
      acc.capexM += p.financials.costs.capexM;
      acc.maintenanceM += p.financials.costs.maintenanceM;
      acc.payrollM += p.financials.costs.payrollM;
      acc.fuelM += p.financials.costs.fuelM;
      acc.insuranceM += p.financials.costs.insuranceM;
      acc.adminM += p.financials.costs.adminM;
      acc.debtServiceM += p.financials.costs.debtServiceM;
      return acc;
    },
    { opexM: 0, capexM: 0, maintenanceM: 0, payrollM: 0, fuelM: 0, insuranceM: 0, adminM: 0, debtServiceM: 0 }
  );
  const rows: { label: string; value: number }[] = [
    { label: "OPEX", value: totals.opexM }, { label: "CAPEX", value: totals.capexM },
    { label: "Maintenance", value: totals.maintenanceM }, { label: "Payroll", value: totals.payrollM },
    { label: "Fuel", value: totals.fuelM }, { label: "Insurance", value: totals.insuranceM },
    { label: "Administrative", value: totals.adminM }, { label: "Debt service", value: totals.debtServiceM },
  ];
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-2">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-2">
          <span className="w-24 shrink-0 text-[11.5px] text-ink-500">{r.label}</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-100">
            <div className="h-full rounded-full bg-accent-600" style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
          <span className="num w-14 shrink-0 text-right text-[11px] text-ink-600">€{Math.round(r.value * 10) / 10}M</span>
        </div>
      ))}
    </div>
  );
}
