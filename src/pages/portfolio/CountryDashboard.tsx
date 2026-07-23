import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Building2, Sun, Wind } from "lucide-react";
import {
  aggregateKPIs, findCountryGroup, findIndustry, monthlyAggregates, projectsForCountry, regions,
} from "../../lib/portfolioData";
import { Badge, Card, CardHeader, EmptyState, SectionLabel, Stat } from "../../lib/ui";
import InsightsPanel from "./insights/InsightsPanel";

const industryIcon = { solar: Sun, wind: Wind, infrastructure: Building2 };

export default function CountryDashboard() {
  const { name } = useParams();
  const decoded = name ? decodeURIComponent(name) : "";
  const group = findCountryGroup(decoded);

  if (!group) {
    return (
      <div className="mx-auto max-w-[1200px] px-6 py-6">
        <EmptyState icon={<ArrowLeft size={20} />} title="Region not found" sub="Choose a region from the portfolio home." />
      </div>
    );
  }

  const projects = projectsForCountry(group.name);
  const summary = aggregateKPIs(projects);
  const monthly = monthlyAggregates(projects);

  const industryRows = group.industryKeys.map((key) => {
    const ind = findIndustry(key)!;
    const industryRegions = regions.filter((r) => r.name === group.name && r.industryKey === key);
    const industryProjects = projects.filter((p) => p.industryKey === key);
    return { ind, regions: industryRegions, projects: industryProjects, summary: aggregateKPIs(industryProjects) };
  });

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-6">
      <Link to="/portfolio" className="mb-3 inline-flex items-center gap-1 text-[12px] font-medium text-ink-400 hover:text-ink-700 fade-up">
        <ArrowLeft size={13} /> Portfolio
      </Link>
      <div className="mb-6 flex items-center gap-3 fade-up">
        <h1 className="text-[22px] font-semibold tracking-tight">{group.name}</h1>
        <Badge tone="blue">{group.industryKeys.length} industries</Badge>
        <Badge tone="gray">{projects.length} projects</Badge>
      </div>

      <div className="mb-6 grid grid-cols-4 gap-4 fade-up">
        <Card><Stat label="Portfolio value" value={`€${summary.totalValueM}m`} /></Card>
        <Card><Stat label="Revenue" value={`€${summary.totalRevenueM}m`} series={monthly.revenue} delta={`${summary.yoyGrowthPct >= 0 ? "+" : ""}${summary.yoyGrowthPct}%`} sub="YoY" trend={summary.yoyGrowthPct >= 0 ? "up" : "down"} /></Card>
        <Card><Stat label="EBITDA" value={`€${summary.totalEbitdaM}m`} series={monthly.ebitda} trend="flat" /></Card>
        <Card><Stat label="Avg asset health" value={`${summary.avgAssetHealth}`} /></Card>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-4 fade-up">
          <Card>
            <CardHeader title="Financial KPIs" />
            <SectionLabel>Topline</SectionLabel>
            <div className="mb-4 grid grid-cols-3 gap-3">
              <MiniStat label="Revenue" value={`€${summary.totalRevenueM}m`} />
              <MiniStat label="Revenue growth" value={`${summary.yoyGrowthPct}%`} />
              <MiniStat label="Cash flow" value={`€${summary.cashFlowM}m`} />
            </div>
            <SectionLabel>Earnings</SectionLabel>
            <div className="grid grid-cols-3 gap-3">
              <MiniStat label="EBITDA" value={`€${summary.totalEbitdaM}m`} />
              <MiniStat label="Margin" value={`${summary.totalRevenueM > 0 ? Math.round((summary.totalEbitdaM / summary.totalRevenueM) * 1000) / 10 : 0}%`} />
              <MiniStat label="Active projects" value={`${summary.activeProjects}`} />
            </div>
          </Card>

          <Card pad={false}>
            <div className="border-b border-ink-100 px-5 py-4"><CardHeader title="Industries in this region" /></div>
            <div className="divide-y divide-ink-100">
              {industryRows.map(({ ind, regions: industryRegions, projects: industryProjects, summary: s }) => {
                const Icon = industryIcon[ind.key];
                return (
                  <div key={ind.key} className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600"><Icon size={16} strokeWidth={1.8} /></div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13.5px] font-semibold">{ind.name}</p>
                        <p className="text-[11.5px] text-ink-500">{industryProjects.length} projects · €{s.totalRevenueM}m revenue</p>
                      </div>
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {industryRegions.map((r) => (
                        <Link key={r.id} to={`/portfolio/${ind.key}/${r.id}`} className="rounded-md border border-ink-200 px-2.5 py-1 text-[11.5px] font-medium text-ink-600 hover:border-accent-500 hover:text-accent-700">
                          View {ind.name} · {r.name} →
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="space-y-4 fade-up">
          <InsightsPanel scope={group.name} limit={4} />
        </div>
      </div>
    </div>
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
