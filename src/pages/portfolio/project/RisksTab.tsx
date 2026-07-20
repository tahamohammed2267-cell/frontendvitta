import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import type { PortfolioProject } from "../../../lib/portfolioData";
import { risksForProject, type RiskCategory } from "../../../lib/projectIntelligence";
import { Badge, Card, EmptyState, SeverityBadge } from "../../../lib/ui";
import { cn } from "../../../lib/cn";

const categories: RiskCategory[] = ["Operational", "Financial", "Regulatory", "Weather", "Construction", "ESG"];

export default function RisksTab({ project: proj }: { project: PortfolioProject }) {
  const [filter, setFilter] = useState<RiskCategory | "All">("All");
  const risks = risksForProject(proj.id);
  const rows = filter === "All" ? risks : risks.filter((r) => r.category === filter);

  if (risks.length === 0) {
    return <EmptyState icon={<ShieldAlert size={20} />} title="No risks flagged" sub="This project has a clean bill of health." />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        <button onClick={() => setFilter("All")} className={cn("rounded-md border px-3 py-1.5 text-[12px] font-medium", filter === "All" ? "border-ink-900 bg-ink-900 text-white" : "border-ink-200 text-ink-600 hover:border-ink-300")}>All ({risks.length})</button>
        {categories.map((c) => {
          const count = risks.filter((r) => r.category === c).length;
          if (count === 0) return null;
          return (
            <button key={c} onClick={() => setFilter(c)} className={cn("rounded-md border px-3 py-1.5 text-[12px] font-medium", filter === c ? "border-accent-600 bg-accent-50 text-accent-700" : "border-ink-200 text-ink-600 hover:border-ink-300")}>{c} ({count})</button>
          );
        })}
      </div>

      <div className="space-y-3">
        {rows.map((r) => (
          <Card key={r.id}>
            <div className="flex items-center gap-2">
              <Badge tone="gray">{r.category}</Badge>
              <SeverityBadge severity={r.severity} />
              <Badge tone={r.status === "open" ? "orange" : r.status === "monitoring" ? "blue" : "green"} className="ml-auto">{r.status}</Badge>
            </div>
            <p className="mt-2.5 text-[13px] leading-relaxed text-ink-700">{r.text}</p>
            <p className="mt-1.5 text-[11px] text-ink-400">Identified {r.identifiedAt}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
