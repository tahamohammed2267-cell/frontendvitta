import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, Stat } from "../../lib/ui";
import { knowledgeCoverage } from "../../lib/intelligenceData";
import type { IntelEntityKind } from "../../lib/intelligence/crossLinks";
import { jumpTo } from "./useIntelligenceJump";
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

export default function Intelligence() {
  const coverage = knowledgeCoverage();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const jump = searchParams.get("jump");
    if (!jump) return;
    const [kind, id] = jump.split(":");
    if (kind && id) jumpTo(kind as IntelEntityKind, id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-6">
      <div className="mb-6 fade-up">
        <h1 className="text-[22px] font-semibold tracking-tight">Intelligence</h1>
        <p className="mt-0.5 text-[13px] text-ink-500">The firm's accumulated deal experience, made actionable — DNA profiles, benchmarks, patterns, playbooks and decisions, continuously learning from every deal.</p>
      </div>

      <div className="mb-6 grid grid-cols-4 gap-4 fade-up">
        <Card><Stat label="Deals in knowledge base" value={String(coverage.totalDeals)} sub={`${coverage.sectorsCovered} technologies`} /></Card>
        <Card><Stat label="Investment decisions" value={String(coverage.totalDecisions)} sub="approved, passed & pending" /></Card>
        <Card><Stat label="Analyst observations" value={String(coverage.totalObservations)} sub="notes, flags & questions" /></Card>
        <Card><Stat label="Institutional playbooks" value={String(coverage.totalPlaybooks)} sub="auto-maintained by sector" /></Card>
      </div>

      <div className="mb-6 fade-up">
        <KnowledgeGrowthPanel />
      </div>

      <div className="space-y-4">
        <DNASection />
        <BenchmarkSection />
        <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
          <PatternLibrarySection />
          <DecisionsSection />
        </div>
        <PlaybooksSection />
        <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
          <AnalystIntelligenceSection />
          <RecommendationsPanel />
        </div>
        <IntelligenceReportBuilder />
        <CustomDashboardsSection scope="health" scopeId="intelligence-firm" />
      </div>
    </div>
  );
}
