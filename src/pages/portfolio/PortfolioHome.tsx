import { Link } from "react-router-dom";
import { ArrowUpRight, Building2, HeartPulse, MapPin, Sun, Wind } from "lucide-react";
import {
  aggregateKPIs, countryGroups, industries, portfolioProjects, projectsForCountry, projectsForIndustry, projectsRequiringAttention,
} from "../../lib/portfolioData";
import { Badge, Card, CardHeader, Stat } from "../../lib/ui";
import InsightsPanel from "./insights/InsightsPanel";
import ComparisonsSection from "./comparisons/ComparisonsSection";

const industryIcon = { solar: Sun, wind: Wind, infrastructure: Building2 };

export default function PortfolioHome() {
  const summary = aggregateKPIs(portfolioProjects);
  const attention = projectsRequiringAttention();

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-6">
      <div className="mb-6 fade-up">
        <h1 className="text-[22px] font-semibold tracking-tight">Portfolio Monitoring</h1>
        <p className="mt-0.5 text-[13px] text-ink-500">Live performance across {industries.length} industries, {portfolioProjects.length} projects and 4 regions.</p>
      </div>

      <div className="mb-6 grid grid-cols-4 gap-4 fade-up">
        <Card><Stat label="Total portfolio value" value={`€${summary.totalValueM}M`} /></Card>
        <Card><Stat label="Total revenue" value={`€${summary.totalRevenueM}M`} sub={`${summary.yoyGrowthPct >= 0 ? "+" : ""}${summary.yoyGrowthPct}% YoY avg`} trend={summary.yoyGrowthPct >= 0 ? "up" : "down"} /></Card>
        <Card><Stat label="Installed capacity" value={`${summary.installedCapacityMW.toLocaleString()} MW`} sub={`${summary.activeProjects} active projects`} /></Card>
        <Card><Stat label="Avg asset health" value={`${summary.avgAssetHealth}`} sub={`${attention.length} projects flagged`} trend={attention.length > 0 ? "down" : "flat"} /></Card>
      </div>

      <Link to="/portfolio/health" className="mb-6 flex items-center gap-4 rounded-xl border border-warn-100 bg-warn-50/60 px-5 py-4 fade-up transition-colors hover:border-warn-200">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-warn-600"><HeartPulse size={18} /></div>
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-semibold text-ink-900">Portfolio Health Center</p>
          <p className="mt-0.5 text-[12px] text-ink-600">{attention.length} projects require attention — revenue declines, covenant breaches, overdue MIS and more.</p>
        </div>
        <ArrowUpRight size={16} className="shrink-0 text-warn-600" />
      </Link>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-4 fade-up">
          <p className="text-[15px] font-semibold tracking-tight">Industries</p>
          <div className="grid grid-cols-3 gap-4">
            {industries.map((ind) => {
              const Icon = industryIcon[ind.key];
              const projects = projectsForIndustry(ind.key);
              const s = aggregateKPIs(projects);
              return (
                <Link key={ind.key} to={`/portfolio/${ind.key}`}>
                  <Card className="h-full transition-shadow hover:shadow-[0_4px_16px_rgba(11,14,20,0.07)]">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-ink-100 text-ink-600"><Icon size={17} strokeWidth={1.8} /></div>
                    <p className="text-[14px] font-semibold">{ind.name}</p>
                    <p className="mt-0.5 text-[11.5px] text-ink-500">{projects.length} projects · {s.installedCapacityMW.toLocaleString()} MW</p>
                    <div className="mt-3 space-y-1.5 text-[12px]">
                      <div className="flex justify-between"><span className="text-ink-500">Revenue</span><span className="num font-semibold">€{s.totalRevenueM}M</span></div>
                      <div className="flex justify-between"><span className="text-ink-500">EBITDA</span><span className="num font-semibold">€{s.totalEbitdaM}M</span></div>
                      <div className="flex justify-between"><span className="text-ink-500">Asset health</span><span className="num font-semibold">{s.avgAssetHealth}</span></div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>

          <p className="pt-2 text-[15px] font-semibold tracking-tight">Regions</p>
          <div className="grid grid-cols-3 gap-4">
            {countryGroups().map((g) => {
              const projects = projectsForCountry(g.name);
              const s = aggregateKPIs(projects);
              return (
                <Link key={g.name} to={`/portfolio/country/${encodeURIComponent(g.name)}`}>
                  <Card className="h-full transition-shadow hover:shadow-[0_4px_16px_rgba(11,14,20,0.07)]">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-ink-100 text-ink-600"><MapPin size={17} strokeWidth={1.8} /></div>
                    <p className="text-[14px] font-semibold">{g.name}</p>
                    <p className="mt-0.5 text-[11.5px] text-ink-500">{g.industryKeys.length} industries · {projects.length} projects</p>
                    <div className="mt-3 space-y-1.5 text-[12px]">
                      <div className="flex justify-between"><span className="text-ink-500">Revenue</span><span className="num font-semibold">€{s.totalRevenueM}M</span></div>
                      <div className="flex justify-between"><span className="text-ink-500">EBITDA</span><span className="num font-semibold">€{s.totalEbitdaM}M</span></div>
                      <div className="flex justify-between"><span className="text-ink-500">Asset health</span><span className="num font-semibold">{s.avgAssetHealth}</span></div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="space-y-4 fade-up">
          <InsightsPanel limit={4} />

          <Card pad={false}>
            <div className="border-b border-ink-100 px-5 py-4"><CardHeader title="Projects requiring attention" sub="Top of the Health Center triage list" /></div>
            <div className="divide-y divide-ink-100">
              {attention.slice(0, 5).map(({ project, flags }) => (
                <Link
                  key={project.id}
                  to={`/portfolio/${project.industryKey}/${project.regionId}/${project.companyId}/${project.id}`}
                  className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-ink-50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium">{project.name}</p>
                    <p className="mt-0.5 text-[11.5px] text-ink-500">{project.country} · {flags[0].label}</p>
                  </div>
                  <Badge tone={flags[0].severity === "critical" ? "red" : flags[0].severity === "high" ? "orange" : "gray"}>{flags.length} flag{flags.length > 1 ? "s" : ""}</Badge>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-4 fade-up">
        <ComparisonsSection />
      </div>
    </div>
  );
}
