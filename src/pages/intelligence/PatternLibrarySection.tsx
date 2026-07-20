import { useState } from "react";
import { projects } from "../../lib/mockData";
import { anchorId } from "../../lib/intelligence/crossLinks";
import { analystObservations, patternCategoryLabels, patterns, type Pattern, type PatternCategory } from "../../lib/intelligenceData";
import { Badge, Card, CardHeader } from "../../lib/ui";
import { cn } from "../../lib/cn";
import EntityRefChip from "./EntityRefChip";

// A pattern and an analyst observation are "related" when they cite the
// same risk record on the same deal — an exact evidence overlap, not a
// fuzzy text match.
function relatedObservationsForPattern(pattern: Pattern) {
  const riskIds = pattern.similarCases.map((c) => c.riskId).filter((id): id is string => !!id);
  if (riskIds.length === 0) return [];
  return analystObservations.filter((o) => o.linkedRiskId && riskIds.includes(o.linkedRiskId));
}

const categories: (PatternCategory | "all")[] = ["all", "financing", "legal-contract", "regulatory-permitting", "technical-yield"];

const confidenceTone = { high: "green" as const, medium: "orange" as const, low: "gray" as const };

export default function PatternLibrarySection() {
  const [filter, setFilter] = useState<PatternCategory | "all">("all");
  const rows = filter === "all" ? patterns : patterns.filter((p) => p.category === filter);

  return (
    <Card>
      <CardHeader title="Pattern Library" sub="Recurring observations across the deal universe, linked to real evidence" />
      <div className="mb-4 flex flex-wrap gap-1.5">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors",
              filter === c ? "border-ink-900 bg-ink-900 text-white" : "border-ink-200 text-ink-600 hover:border-ink-300"
            )}
          >
            {c === "all" ? "All patterns" : patternCategoryLabels[c]} ({c === "all" ? patterns.length : patterns.filter((p) => p.category === c).length})
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {rows.map((p) => {
          const relatedObs = relatedObservationsForPattern(p);
          return (
            <div key={p.id} id={anchorId("pattern", p.id)} className="rounded-lg border border-ink-100 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Badge tone="gray">{patternCategoryLabels[p.category]}</Badge>
                  <p className="mt-1.5 text-[13.5px] font-semibold text-ink-900">{p.title}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Badge tone={confidenceTone[p.confidence]}>{p.confidence} confidence</Badge>
                  <Badge tone="gray">seen in {p.frequency} deal{p.frequency === 1 ? "" : "s"}</Badge>
                </div>
              </div>
              <p className="mt-2.5 text-[12.5px] leading-relaxed text-ink-700"><span className="font-medium text-ink-800">Business impact — </span>{p.businessImpact}</p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-500">{p.aiExplanation}</p>
              <div className="mt-3 space-y-1.5">
                {p.similarCases.map((c, i) => {
                  const project = projects.find((pr) => pr.id === c.dealId);
                  return (
                    <div key={i} className="flex items-start gap-2 rounded-md bg-ink-50 px-2.5 py-1.5 text-[12px] text-ink-600">
                      <span className="shrink-0 font-medium text-ink-800">{project?.name ?? c.dealId}</span>
                      <span>{c.note}</span>
                    </div>
                  );
                })}
              </div>
              {relatedObs.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <p className="mr-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-400">Related observations</p>
                  {relatedObs.map((o) => <EntityRefChip key={o.id} entityRef={{ kind: "observation", id: o.id, label: o.text.slice(0, 40) + "…" }} />)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
