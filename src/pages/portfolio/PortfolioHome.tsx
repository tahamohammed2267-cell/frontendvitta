import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Building2, HeartPulse, MapPin, Sun, TrendingDown, TrendingUp, Wind } from "lucide-react";
import { AreaTrend, CHART } from "../../lib/charts";
import {
  aggregateKPIs, countryGroups, industries, portfolioProjects, projectsForCountry, projectsForIndustry,
  projectsRequiringAttention, type CountryGroup, type PortfolioProject,
} from "../../lib/portfolioData";
import { Badge, Card, CardHeader, Sparkline, Stat } from "../../lib/ui";
import { cn } from "../../lib/cn";
import InsightsPanel from "./insights/InsightsPanel";
import PortfolioAskPanel from "./insights/PortfolioAskPanel";
import ComparisonsSection from "./comparisons/ComparisonsSection";

const industryIcon = { solar: Sun, wind: Wind, infrastructure: Building2 };
const MONTHS = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"];

const statusTone: Record<string, "green" | "blue" | "gray" | "orange" | "red"> = {
  Operational: "green", "Ramp-up": "blue", "Under Construction": "gray", Watch: "orange", "At Risk": "red",
};

// Curated "recent" ordering — a diverse trio (ramp-up / at-risk / strong operational) leads.
const FEATURED = ["helios-project", "zephyr-project", "rajasthan-250"];
const orderedProjects = [
  ...FEATURED.map((id) => portfolioProjects.find((p) => p.id === id)).filter(Boolean) as PortfolioProject[],
  ...portfolioProjects.filter((p) => !FEATURED.includes(p.id)),
];

export default function PortfolioHome() {
  const summary = aggregateKPIs(portfolioProjects);
  const attention = projectsRequiringAttention();
  const groups = countryGroups();
  const [showAllProjects, setShowAllProjects] = useState(false);

  const revenueTrend = MONTHS.map((month, i) => ({
    month,
    revenue: Math.round(portfolioProjects.reduce((a, p) => a + (p.financials.topline.byMonth[i]?.revenueM ?? 0), 0) * 10) / 10,
    ebitda: Math.round(portfolioProjects.reduce((a, p) => a + (p.financials.topline.byMonth[i]?.revenueM ?? 0) * (p.financials.earnings.marginPct / 100), 0) * 10) / 10,
  }));

  const visibleProjects = showAllProjects ? orderedProjects : orderedProjects.slice(0, 3);

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-6">
      <div className="mb-6 fade-up">
        <h1 className="text-[22px] font-semibold tracking-tight">Portfolio Monitoring</h1>
        <p className="mt-0.5 text-[13px] text-ink-500">Live performance across {industries.length} industries, {portfolioProjects.length} projects and {groups.length} regions.</p>
      </div>

      {/* Hero: KPI band + portfolio revenue trend */}
      <Card className="mb-6 fade-up" pad={false}>
        <div className="grid grid-cols-[1.1fr_1.4fr]">
          <div className="grid grid-cols-2 gap-y-6 border-r border-ink-100 p-6">
            <Stat label="Total portfolio value" value={`€${summary.totalValueM}m`} series={revenueTrend.map((r) => r.revenue + r.ebitda)} trend="up" />
            <Stat label="Total revenue" value={`€${summary.totalRevenueM}m`} series={revenueTrend.map((r) => r.revenue)} delta={`${summary.yoyGrowthPct >= 0 ? "+" : ""}${summary.yoyGrowthPct}%`} sub="YoY avg" trend={summary.yoyGrowthPct >= 0 ? "up" : "down"} />
            <Stat label="Installed capacity" value={`${summary.installedCapacityMW.toLocaleString()} MW`} sub={`${summary.activeProjects} active projects`} />
            <Stat label="Avg asset health" value={`${summary.avgAssetHealth}`} sub={`${attention.length} projects flagged`} trend={attention.length > 0 ? "down" : "flat"} />
          </div>
          <div className="p-6">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[13px] font-semibold tracking-tight text-ink-800">Portfolio revenue &amp; EBITDA</p>
              <div className="flex items-center gap-3 text-[11px] text-ink-500">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-accent-600" /> Revenue</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-ink-300" /> EBITDA</span>
              </div>
            </div>
            <AreaTrend
              data={revenueTrend}
              xKey="month"
              height={168}
              series={[
                { key: "revenue", label: "Revenue", color: CHART.accent, format: (v) => `€${v}m` },
                { key: "ebitda", label: "EBITDA", color: CHART.muted, format: (v) => `€${v}m` },
              ]}
            />
          </div>
        </div>
      </Card>

      <Link to="/portfolio/health" className="lift mb-6 flex items-center gap-4 rounded-lg border border-warn-100 bg-warn-50/60 px-5 py-4 fade-up hover:border-warn-200">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-warn-600"><HeartPulse size={18} /></div>
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-semibold text-ink-900">Portfolio Health Center</p>
          <p className="mt-0.5 text-[12px] text-ink-600">{attention.length} projects require attention — revenue declines, covenant breaches, overdue MIS and more.</p>
        </div>
        <ArrowUpRight size={16} className="shrink-0 text-warn-600" />
      </Link>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-6 fade-up">
          {/* Industries */}
          <section>
            <SectionTitle title="Industries" />
            <div className="grid grid-cols-3 gap-4 stagger">
              {industries.map((ind, i) => {
                const Icon = industryIcon[ind.key];
                const projects = projectsForIndustry(ind.key);
                const s = aggregateKPIs(projects);
                return (
                  <Link key={ind.key} to={`/portfolio/${ind.key}`} style={{ "--i": i } as React.CSSProperties}>
                    <Card className="lift h-full">
                      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-accent-50 text-accent-600"><Icon size={17} strokeWidth={1.8} /></div>
                      <p className="text-[14px] font-semibold">{ind.name}</p>
                      <p className="mt-0.5 text-[11.5px] text-ink-500">{projects.length} projects · {s.installedCapacityMW.toLocaleString()} MW</p>
                      <div className="mt-3 space-y-1.5 text-[12px]">
                        <Row k="Revenue" v={`€${s.totalRevenueM}m`} />
                        <Row k="EBITDA" v={`€${s.totalEbitdaM}m`} />
                        <Row k="Asset health" v={`${s.avgAssetHealth}`} />
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Projects */}
          <section>
            <SectionTitle title="Projects" action={<SeeAll expanded={showAllProjects} onClick={() => setShowAllProjects((v) => !v)} total={orderedProjects.length} />} />
            <div className="grid grid-cols-3 gap-4 stagger">
              {visibleProjects.map((p, i) => <ProjectCard key={p.id} p={p} index={i} />)}
            </div>
          </section>

          {/* Regions — cross-industry country rollups */}
          <section>
            <SectionTitle title="Regions" />
            <div className="grid grid-cols-3 gap-4 stagger">
              {groups.map((g, i) => <CountryCard key={g.name} g={g} index={i} />)}
            </div>
          </section>

          {/* Attention */}
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

        <div className="space-y-4 fade-up">
          <InsightsPanel limit={4} />
          <PortfolioAskPanel />
        </div>
      </div>

      {/* Comparables — full width */}
      <section className="mt-6 fade-up">
        <ComparisonsSection />
      </section>
    </div>
  );
}

function SectionTitle({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <p className="text-[15px] font-semibold tracking-tight">{title}</p>
      {action}
    </div>
  );
}

function SeeAll({ expanded, onClick, total }: { expanded: boolean; onClick: () => void; total: number }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1 text-[12px] font-medium text-accent-600 hover:text-accent-700">
      {expanded ? "Show less" : `See all ${total}`}
      <ArrowUpRight size={13} className={cn("transition-transform", expanded && "rotate-90")} />
    </button>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-ink-500">{k}</span>
      <span className="num font-semibold">{v}</span>
    </div>
  );
}

function ProjectCard({ p, index }: { p: PortfolioProject; index: number }) {
  const spark = p.financials.topline.byMonth.map((m) => m.revenueM);
  const up = p.kpis.yoyGrowthPct >= 0;
  const flagged = p.healthFlags.length > 0;
  const Trend = up ? TrendingUp : TrendingDown;
  return (
    <Link to={`/portfolio/${p.industryKey}/${p.regionId}/${p.companyId}/${p.id}`} style={{ "--i": index } as React.CSSProperties}>
      <Card className="lift h-full" pad={false}>
        <div className="px-4 pb-2 pt-4">
          <div className="flex items-start justify-between gap-2">
            <p className="line-clamp-2 min-h-[2.4em] text-[13px] font-semibold leading-tight">{p.name}</p>
            <Badge tone={statusTone[p.status] ?? "gray"} className="shrink-0 whitespace-nowrap">{p.status}</Badge>
          </div>
          <p className="mt-0.5 flex items-center gap-1 text-[11.5px] text-ink-500"><MapPin size={11} /> {p.country}</p>
        </div>
        <div className="h-[42px] px-1">
          <Sparkline data={spark} trend={up ? "up" : "down"} color={flagged ? "#d97706" : undefined} stretch className="h-full w-full" />
        </div>
        <div className="flex items-end justify-between px-4 pb-4 pt-2">
          <div>
            <p className="text-[10.5px] font-medium uppercase tracking-[0.05em] text-ink-400">Revenue</p>
            <p className="num mt-0.5 text-[16px] font-semibold tracking-tight">€{p.financials.topline.revenueM}m</p>
          </div>
          <div className="text-right">
            <span className={cn("flex items-center justify-end gap-1 text-[12px] font-medium", up ? "text-pos-700" : "text-crit-700")}>
              <Trend size={13} /> {up ? "+" : ""}{p.kpis.yoyGrowthPct}%
            </span>
            <p className="mt-0.5 text-[11px] text-ink-400">health {p.assetHealth.score}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function CountryCard({ g, index }: { g: CountryGroup; index: number }) {
  const projects = projectsForCountry(g.name);
  const s = aggregateKPIs(projects);
  const flagged = projects.filter((p) => p.healthFlags.length > 0).length;
  return (
    <Link to={`/portfolio/country/${encodeURIComponent(g.name)}`} style={{ "--i": index } as React.CSSProperties}>
      <Card className="lift h-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-50 text-accent-600"><MapPin size={17} strokeWidth={1.8} /></div>
            <p className="text-[13.5px] font-semibold">{g.name}</p>
          </div>
          {flagged > 0 && <Badge tone="orange">{flagged} flagged</Badge>}
        </div>
        <p className="mt-2 text-[11.5px] text-ink-500">{g.industryKeys.length} industr{g.industryKeys.length !== 1 ? "ies" : "y"} · {projects.length} projects</p>
        <div className="mt-3 space-y-1.5 text-[12px]">
          <Row k="Revenue" v={`€${s.totalRevenueM}m`} />
          <Row k="EBITDA" v={`€${s.totalEbitdaM}m`} />
        </div>
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-[10.5px] text-ink-400"><span>Asset health</span><span className="num font-semibold text-ink-600">{s.avgAssetHealth}</span></div>
          <div className="h-1.5 overflow-hidden rounded-full bg-ink-100">
            <div className={cn("h-full rounded-full", s.avgAssetHealth >= 80 ? "bg-pos-600" : s.avgAssetHealth >= 65 ? "bg-warn-600" : "bg-crit-600")} style={{ width: `${s.avgAssetHealth}%` }} />
          </div>
        </div>
      </Card>
    </Link>
  );
}
