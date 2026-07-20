import { Lightbulb } from "lucide-react";
import type { PortfolioProject } from "../../../lib/portfolioData";
import { recommendationsForProject } from "../../../lib/projectIntelligence";
import { Badge, Card, CardHeader, EmptyState } from "../../../lib/ui";
import InsightsPanel from "../insights/InsightsPanel";

const kindLabel: Record<string, string> = {
  attention: "Needs attention", "cost-optimization": "Cost optimization", maintenance: "Maintenance", operational: "Operational", "follow-up": "Follow-up",
};

export default function IntelligenceTab({ project: proj }: { project: PortfolioProject }) {
  const recommendations = recommendationsForProject(proj.id);

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2 space-y-4">
        <p className="text-[15px] font-semibold tracking-tight">AI Recommendations</p>
        {recommendations.length === 0 ? (
          <EmptyState icon={<Lightbulb size={20} />} title="No recommendations yet" sub="Vitta AI hasn't generated recommendations for this project." />
        ) : (
          recommendations.map((r) => (
            <Card key={r.id}>
              <div className="mb-2 flex items-center gap-2">
                <Badge tone={r.severity === "critical" ? "red" : r.severity === "high" ? "orange" : "gray"}>{r.severity}</Badge>
                <Badge tone="gray">{kindLabel[r.kind]}</Badge>
              </div>
              <p className="text-[13px] leading-relaxed text-ink-700">{r.text}</p>
              <p className="mt-2 text-[11px] text-ink-400">{r.generatedAt}</p>
            </Card>
          ))
        )}
      </div>
      <div className="space-y-4">
        <InsightsPanel scope={proj.id} limit={6} />
        <Card>
          <CardHeader title="Ask about this project" />
          <div className="space-y-1.5">
            {["Summarize performance this quarter", "What changed since the last MIS?", "How does this compare to the regional average?"].map((q) => (
              <p key={q} className="cursor-pointer rounded-lg border border-ink-100 px-3 py-2 text-[12.5px] text-ink-600 hover:border-accent-500 hover:text-accent-700">{q}</p>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
