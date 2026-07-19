import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard, FolderKanban, Sparkles, Briefcase, Search, Network,
  Settings, Plus, PanelRightClose, PanelRightOpen, Command,
} from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/cn";
import { currentUser } from "../lib/mockData";
import { portfolioLabelLookup } from "../lib/portfolioData";
import { getComparison } from "../pages/portfolio/comparisons/comparisonStore";
import ChatPanel from "../components/ChatPanel";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/projects", label: "Deals", icon: FolderKanban },
  { to: "/intelligence", label: "Intelligence", icon: Sparkles },
  { to: "/portfolio", label: "Portfolio", icon: Briefcase },
  { to: "/graph", label: "Knowledge Graph", icon: Network },
];

export default function Layout() {
  const [aiOpen, setAiOpen] = useState(true);
  const location = useLocation();
  const inProject = location.pathname.startsWith("/projects/") && location.pathname !== "/projects/new";

  return (
    <div className="flex h-screen overflow-hidden bg-ink-50">
      {/* ── Left sidebar ─────────────────────────────── */}
      <aside className="flex w-[216px] shrink-0 flex-col border-r border-ink-200 bg-white">
        <div className="flex h-14 items-center gap-2.5 border-b border-ink-100 px-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink-900 text-[13px] font-bold text-white">V</div>
          <span className="text-[15px] font-semibold tracking-tight">Vitta</span>
          <span className="ml-auto rounded border border-ink-200 px-1.5 py-0.5 text-[10px] font-medium text-ink-400">BETA</span>
        </div>

        {/* Search */}
        <div className="px-3 pt-3">
          <NavLink
            to="/search"
            className="flex items-center gap-2 rounded-lg border border-ink-200 bg-ink-50 px-2.5 py-2 text-[12.5px] text-ink-400 transition-colors hover:border-ink-300 hover:text-ink-600"
          >
            <Search size={14} />
            <span className="flex-1">Search everything…</span>
            <span className="flex items-center gap-0.5 rounded border border-ink-200 bg-white px-1 text-[10px]"><Command size={9} />K</span>
          </NavLink>
        </div>

        <nav className="mt-3 flex-1 space-y-0.5 px-3">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end as boolean | undefined}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors",
                  isActive ? "bg-ink-100 text-ink-900" : "text-ink-500 hover:bg-ink-50 hover:text-ink-800"
                )
              }
            >
              <item.icon size={16} strokeWidth={1.8} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-0.5 border-t border-ink-100 p-3">
          <NavLink to="/projects/new" className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-accent-600 hover:bg-accent-50">
            <Plus size={16} strokeWidth={2} /> New Deal
          </NavLink>
          <button className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-ink-500 hover:bg-ink-50">
            <Settings size={16} strokeWidth={1.8} /> Settings
          </button>
          <div className="mt-1 flex items-center gap-2.5 rounded-lg px-2.5 py-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-600 text-[11px] font-semibold text-white">{currentUser.initials}</div>
            <div className="min-w-0">
              <p className="truncate text-[12.5px] font-medium text-ink-900">{currentUser.name}</p>
              <p className="truncate text-[11px] text-ink-400">{currentUser.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Center workspace ─────────────────────────── */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-ink-200 bg-white px-6">
          <Breadcrumbs pathname={location.pathname} />
          <div className="flex items-center gap-2">
            <span className="mr-1 hidden items-center gap-1.5 text-[12px] text-ink-400 md:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-pos-600" /> All systems synced
            </span>
            <button
              onClick={() => setAiOpen((v) => !v)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[12.5px] font-medium transition-colors",
                aiOpen ? "border-accent-100 bg-accent-50 text-accent-700" : "border-ink-200 text-ink-600 hover:bg-ink-50"
              )}
            >
              {aiOpen ? <PanelRightClose size={14} /> : <PanelRightOpen size={14} />}
              Vitta AI
            </button>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>

      {/* ── Right AI panel ───────────────────────────── */}
      <div className={cn("shrink-0 overflow-hidden border-l border-ink-200 bg-white transition-[width] duration-300 ease-out", aiOpen ? "w-[340px]" : "w-0 border-l-0")}>
        <div className="h-full w-[340px]">
          <ChatPanel context={inProject ? "project" : "firm"} />
        </div>
      </div>
    </div>
  );
}

function Breadcrumbs({ pathname }: { pathname: string }) {
  const parts = pathname.split("/").filter(Boolean);
  const labels: Record<string, string> = {
    projects: "Deals", intelligence: "Intelligence", portfolio: "Portfolio", search: "Search", graph: "Knowledge Graph",
    helios: "Project Helios", boreas: "Project Boreas", meridian: "Meridian Retail Park", atlas: "Atlas Student Living", zephyr: "Project Zephyr", new: "New Deal",
    solar: "Solar", wind: "Wind", infrastructure: "Infrastructure", health: "Health Center", dashboards: "Dashboards", edit: "Edit",
    country: "Region", comparisons: "Comparisons",
  };
  if (parts.length === 0) return <span className="text-[14px] font-semibold tracking-tight">Dashboard</span>;
  return (
    <div className="flex items-center gap-1.5 text-[13px]">
      {parts.map((p, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-ink-300">/</span>}
          <span className={i === parts.length - 1 ? "font-semibold text-ink-900" : "text-ink-400"}>
            {labels[p] ?? portfolioLabelLookup(p) ?? getComparison(p)?.name ?? decodeURIComponent(p)}
          </span>
        </span>
      ))}
    </div>
  );
}
