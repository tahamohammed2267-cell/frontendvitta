import { findProject, type DashboardScope } from "../../../lib/portfolioData";
import { risksForProject } from "../../../lib/projectIntelligence";
import { SeverityBadge } from "../../../lib/ui";

export default function RiskWidget({ scope, scopeId }: { scope: DashboardScope; scopeId: string }) {
  const risks = scope === "project" ? risksForProject(scopeId) : [];
  const projectName = findProject(scopeId)?.name;

  return (
    <div className="h-full space-y-2 overflow-y-auto">
      {risks.map((r) => (
        <div key={r.id} className="flex items-start gap-2">
          <SeverityBadge severity={r.severity} />
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-ink-500">{r.category}</p>
            <p className="text-[11.5px] leading-snug text-ink-700">{r.text}</p>
          </div>
        </div>
      ))}
      {risks.length === 0 && (
        <p className="py-4 text-center text-[11.5px] text-ink-400">
          {scope === "project" ? `No open risks flagged for ${projectName ?? "this project"}.` : "Risk widget is scoped to individual projects."}
        </p>
      )}
    </div>
  );
}
