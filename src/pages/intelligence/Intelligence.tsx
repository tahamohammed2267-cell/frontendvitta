import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import type { IntelEntityKind } from "../../lib/intelligence/crossLinks";
import { jumpTo } from "./useIntelligenceJump";
import PatternLibrarySection from "./PatternLibrarySection";
import PlaybooksSection from "./PlaybooksSection";
import CustomDashboardsSection from "../portfolio/builder/CustomDashboardsSection";

export default function Intelligence() {
  const [params] = useSearchParams();

  // Deep-link support: ?jump=kind:id (e.g. from Search) scrolls to + highlights
  // the target if it's still on this page (patterns/playbooks); harmless no-op
  // for kinds whose section no longer lives here.
  useEffect(() => {
    const jump = params.get("jump");
    if (!jump) return;
    const [kind, id] = jump.split(":");
    if (kind && id) requestAnimationFrame(() => jumpTo(kind as IntelEntityKind, id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-6">
      <div className="mb-5 fade-up">
        <h1 className="text-[22px] font-semibold tracking-tight">Intelligence</h1>
        <p className="mt-0.5 max-w-3xl text-[13px] text-ink-500">Recurring patterns, institutional playbooks and custom dashboards built from the firm's accumulated deal experience.</p>
      </div>

      <div className="space-y-4 fade-up">
        <PatternLibrarySection />
        <PlaybooksSection />
        <CustomDashboardsSection scope="health" scopeId="intelligence-firm" />
      </div>
    </div>
  );
}
