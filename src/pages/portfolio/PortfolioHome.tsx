import { useState } from "react";
import { Link } from "react-router-dom";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowUpRight, Building2, HeartPulse, MapPin, Sun, TrendingDown, TrendingUp, Wind } from "lucide-react";
import {
  aggregateKPIs, industries, portfolioProjects, projectsForIndustry, projectsForRegion,
  projectsRequiringAttention, regions, type PortfolioProject, type Region,
} from "../../lib/portfolioData";
import { Badge, Card, CardHeader, Stat } from "../../lib/ui";
import { cn } from "../../lib/cn";
import InsightsPanel from "./insights/InsightsPanel";
import PortfolioAskPanel from "./insights/PortfolioAskPanel";

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
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [showAllRegions, setShowAllRegions] = useState(false);

  const revenueTrend = MONTHS.map((month, i) => ({
    month,
    revenue: Math.round(portfolioProjects.reduce((a, p) => a + (p.financials.topline.byMonth[i]?.revenueM ?? 0), 0) * 10) / 10,
    ebitda: Math.round(portfolioProjects.reduce((a, p) => a + (p.financials.topline.byMonth[i]?.revenueM ?? 0) * (p.financials.earnings.marginPct / 100), 0) * 10) / 10,
  }));

  const visibleProjects = showAllProjects ? orderedProjects : orderedProjects.slice(0, 3);
  const visibleRegions = showAllRegions ? regions : regions.slice(0, 3);

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-6">
      <div className="mb-6 fade-up">
        <h1 className="text-[22px] font-semibold tracking-tight">Portfolio Monitoring</h1>
        <p className="mt-0.5 text-[13px] text-ink-500">Live performance across {industries.length} industries, {portfolioProjects.length} projects and {regions.length} regions.</p>
      </div>

      {/* Hero: KPI band + portfolio revenue trend */}
      <Card className="mb-6 fade-up" pad={false}>
        <div className="grid grid-cols-[1.1fr_1.4fr]">
          <div className="grid grid-cols-2 gap-y-6 border-r border-ink-100 p-6">
            <Stat label="Total portfolio value" value={`€${summary.totalValueM}m`} />
            <Stat label="Total revenue" value={`€${summary.totalRevenueM}m`} sub={`${summary.yoyGrowthPct >= 0 ? "+" : ""}${summary.yoyGrowthPct}% YoY avg`} trend={summary.yoyGrowthPct >= 0 ? "up" : "down"} />
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
            <div className="h-[168px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrend} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <CartesianGrid vertical={false} stroke="#eceef3" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#8a93a6" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#8a93a6" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #dde1e9" }} formatter={(v: number) => [`€${v}m`, ""]} />
                  <Area type="monotone" dataKey="ebitda" stroke="#b9c0cf" strokeWidth={2} fill="#b9c0cf" fillOpacity={0.12} />
                  <Area type="monotone" dataKey="revenue" stroke="#0e5f45" strokeWidth={2} fill="#0e5f45" fillOpacity={0.14} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
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

          {/* Regions */}
          <section>
            <SectionTitle title="Regions" action={<SeeAll expanded={showAllRegions} onClick={() => setShowAllRegions((v) => !v)} total={regions.length} />} />
            <div className="grid grid-cols-3 gap-4 stagger">
              {visibleRegions.map((r, i) => <RegionCard key={r.id} r={r} index={i} />)}
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
  const spark = p.financials.topline.byMonth.map((m) => ({ x: m.month, v: m.revenueM }));
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
        <div className="h-[42px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spark} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
              <Area type="monotone" dataKey="v" stroke={flagged ? "#d97706" : "#0e5f45"} strokeWidth={1.75} fill={flagged ? "#d97706" : "#0e5f45"} fillOpacity={0.12} />
            </AreaChart>
          </ResponsiveContainer>
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

function RegionCard({ r, index }: { r: Region; index: number }) {
  const projects = projectsForRegion(r.id);
  const s = aggregateKPIs(projects);
  const flagged = projects.filter((p) => p.healthFlags.length > 0).length;
  return (
    <Link to={`/portfolio/${r.industryKey}/${r.id}`} style={{ "--i": index } as React.CSSProperties}>
      <Card className="lift h-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="num flex h-6 items-center rounded bg-ink-100 px-1.5 text-[10.5px] font-semibold text-ink-500">{r.countryCode}</span>
            <p className="text-[13.5px] font-semibold">{r.name}</p>
          </div>
          <Badge tone={r.industryKey === "solar" ? "orange" : r.industryKey === "wind" ? "blue" : "gray"} className="capitalize">{r.industryKey}</Badge>
        </div>
        <p className="mt-1 text-[11.5px] text-ink-500">{projects.length} project{projects.length !== 1 ? "s" : ""}{flagged > 0 ? ` · ${flagged} flagged` : ""}</p>
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
