import { useState } from "react";
import { Sparkles } from "lucide-react";
import { projects } from "../../lib/mockData";
import { recommendationTypeLabels, recommendationsForDeal } from "../../lib/intelligenceData";
import { Badge, Card, CardHeader, SourceChip } from "../../lib/ui";
import { cn } from "../../lib/cn";
import EntityRefChip from "./EntityRefChip";
import { useJumpListener } from "./useIntelligenceJump";

const confidenceTone = { high: "green" as const, medium: "orange" as const, low: "gray" as const };

export default function RecommendationsPanel() {
  const [dealId, setDealId] = useState(projects[0].id);
  useJumpListener(["deal", "dna", "decision"], (id) => {
    if (projects.some((p) => p.id === id)) setDealId(id);
  });

  const recs = recommendationsForDeal(dealId);

  return (
    <Card>
      <CardHeader title="AI Recommendations" sub="Proactive, evidence-grounded — every recommendation cites the institutional knowledge behind it" />

      <div className="mb-4 flex flex-wrap gap-1.5">
        {projects.map((p) => (
          <button
            key={p.id}
            onClick={() => setDealId(p.id)}
            className={cn("rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors", dealId === p.id ? "border-ink-900 bg-ink-900 text-white" : "border-ink-200 text-ink-600 hover:border-ink-300")}
          >
            {p.name}
          </button>
        ))}
      </div>

      {recs.length === 0 ? (
        <p className="py-6 text-center text-[12.5px] text-ink-400">No recommendations generated for this deal yet — insufficient evidence to ground one honestly.</p>
      ) : (
        <div className="space-y-2.5">
          {recs.map((r) => (
            <div key={r.id} className="rounded-lg border border-ink-100 p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={13} className="text-accent-600" />
                  <Badge tone="gray">{recommendationTypeLabels[r.type]}</Badge>
                </div>
                <Badge tone={confidenceTone[r.confidence]}>{r.confidence} confidence</Badge>
              </div>
              <p className="mt-2 text-[13px] font-medium text-ink-900">{r.title}</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-ink-600">{r.explanation}</p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {r.evidence.map((e) => <EntityRefChip key={e.kind + e.id} entityRef={e} />)}
                {r.sourceEvidence?.map((e, i) => <SourceChip key={i} doc={e.doc} page={e.page} snippet={e.snippet} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
