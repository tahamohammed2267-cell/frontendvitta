import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Stat } from "../../lib/ui";
import { cn } from "../../lib/cn";
import { knowledgeCoverage } from "../../lib/intelligenceData";
import { anchorId, type IntelEntityKind } from "../../lib/intelligence/crossLinks";
import { jumpTo, useJumpTarget } from "./useIntelligenceJump";
import DNASection from "./DNASection";
import BenchmarkSection from "./BenchmarkSection";
import PatternLibrarySection from "./PatternLibrarySection";
import DecisionsSection from "./DecisionsSection";
import PlaybooksSection from "./PlaybooksSection";
import AnalystIntelligenceSection from "./AnalystIntelligenceSection";
import RecommendationsPanel from "./RecommendationsPanel";
import KnowledgeGrowthPanel from "./KnowledgeGrowthPanel";
import IntelligenceReportBuilder from "./IntelligenceReportBuilder";
import CustomDashboardsSection from "../portfolio/builder/CustomDashboardsSection";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "dna", label: "Investment DNA" },
  { id: "benchmarks", label: "Benchmarks" },
  { id: "patterns", label: "Patterns & Decisions" },
  { id: "playbooks", label: "Playbooks" },
  { id: "analyst", label: "Analyst Notes" },
  { id: "reports", label: "Report Builder" },
  { id: "dashboards", label: "Dashboards" },
] as const;

// A cross-link jump names an entity kind; send it to the tab that owns it so
// the jump activates the right tab before scrolling to the anchor.
const kindToTab: Record<IntelEntityKind, string> = {
  dna: "dna", deal: "dna",
  benchmark: "benchmarks",
  pattern: "patterns", decision: "patterns",
  playbook: "playbooks",
  observation: "analyst",
  recommendation: "overview",
};

export default function Intelligence() {
  const coverage = knowledgeCoverage();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") ?? "overview";
  const jumpTarget = useJumpTarget();

  // Deep-link on load: ?jump=kind:id activates the owning tab, then scrolls.
  useEffect(() => {
    const jump = params.get("jump");
    if (!jump) return;
    const [kind, id] = jump.split(":");
    if (!kind || !id) return;
    const owner = kindToTab[kind as IntelEntityKind];
    if (owner && owner !== tab) setParams((p) => { p.set("tab", owner); return p; }, { replace: true });
    requestAnimationFrame(() => jumpTo(kind as IntelEntityKind, id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live cross-link jumps (from EntityRefChip): switch to the owning tab first…
  useEffect(() => {
    if (!jumpTarget) return;
    const owner = kindToTab[jumpTarget.kind];
    if (owner && owner !== tab) setParams((p) => { p.set("tab", owner); return p; }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jumpTarget?.seq]);

  // …then, once the owning tab's content is in the DOM, scroll + highlight it.
  useEffect(() => {
    if (!jumpTarget) return;
    const node = document.getElementById(anchorId(jumpTarget.kind, jumpTarget.id));
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "center" });
    node.classList.add("ring-2", "ring-accent-500");
    const to = setTimeout(() => node.classList.remove("ring-2", "ring-accent-500"), 1600);
    return () => clearTimeout(to);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, jumpTarget?.seq]);

  const stats = [
    { label: "Deals in knowledge base", value: String(coverage.totalDeals), sub: `${coverage.sectorsCovered} technologies` },
    { label: "Investment decisions", value: String(coverage.totalDecisions), sub: "approved, passed & pending" },
    { label: "Analyst observations", value: String(coverage.totalObservations), sub: "notes, flags & questions" },
    { label: "Institutional playbooks", value: String(coverage.totalPlaybooks), sub: "auto-maintained by sector" },
  ];

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-6">
      {/* Compact hero: title + a single KPI strip (one box, not four) */}
      <div className="mb-5 fade-up">
        <h1 className="text-[22px] font-semibold tracking-tight">Intelligence</h1>
        <p className="mt-0.5 max-w-3xl text-[13px] text-ink-500">The firm's accumulated deal experience, made actionable — DNA profiles, benchmarks, patterns, playbooks and decisions, continuously learning from every deal.</p>
      </div>

      <div className="mb-5 grid grid-cols-4 divide-x divide-ink-100 rounded-lg border border-ink-200 bg-white max-md:grid-cols-2 max-md:divide-x-0 fade-up">
        {stats.map((s) => (
          <div key={s.label} className="p-4"><Stat label={s.label} value={s.value} sub={s.sub} /></div>
        ))}
      </div>

      {/* Tab bar — turns nine stacked sections into one scannable workspace */}
      <div className="mb-5 border-b border-ink-200 fade-up">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setParams((p) => { p.set("tab", t.id); return p; })}
              className={cn(
                "relative whitespace-nowrap rounded-t-lg px-3.5 py-2.5 text-[13px] font-medium transition-colors",
                tab === t.id ? "text-ink-900" : "text-ink-500 hover:text-ink-800"
              )}
            >
              {t.label}
              {tab === t.id && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-accent-600" />}
            </button>
          ))}
        </div>
      </div>

      <div key={tab} className="fade-up">
        {tab === "overview" && (
          <div className="space-y-4">
            <KnowledgeGrowthPanel />
            <RecommendationsPanel />
          </div>
        )}
        {tab === "dna" && <DNASection />}
        {tab === "benchmarks" && <BenchmarkSection />}
        {tab === "patterns" && (
          <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
            <PatternLibrarySection />
            <DecisionsSection />
          </div>
        )}
        {tab === "playbooks" && <PlaybooksSection />}
        {tab === "analyst" && <AnalystIntelligenceSection />}
        {tab === "reports" && <IntelligenceReportBuilder />}
        {tab === "dashboards" && <CustomDashboardsSection scope="health" scopeId="intelligence-firm" />}
      </div>
    </div>
  );
}
