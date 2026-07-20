import { useState } from "react";
import { Dna } from "lucide-react";
import { projects } from "../../lib/mockData";
import { anchorId } from "../../lib/intelligence/crossLinks";
import { dnaDimensionLabels, dnaForDeal, decisionForDeal } from "../../lib/intelligenceData";
import { Badge, Card, CardHeader, Gauge } from "../../lib/ui";
import { cn } from "../../lib/cn";
import EntityRefChip from "./EntityRefChip";
import { useJumpListener } from "./useIntelligenceJump";

const confidenceTone = { high: "green" as const, medium: "orange" as const, low: "gray" as const };

export default function DNASection() {
  const [dealId, setDealId] = useState(projects[0].id);
  useJumpListener(["dna", "deal", "decision"], (id) => {
    if (projects.some((p) => p.id === id)) setDealId(id);
  });
  const project = projects.find((p) => p.id === dealId)!;
  const dna = dnaForDeal(dealId);
  const decision = decisionForDeal(dealId);

  return (
    <Card>
      <div id={anchorId("dna", dealId)} />
      <CardHeader
        title="Investment DNA"
        sub="A profile of what the firm actually knows about each deal, scored across dimensions with real backing evidence"
        right={<Badge tone={confidenceTone[dna.overallConfidence]}>{dna.overallConfidence} overall confidence</Badge>}
      />

      <div className="mb-4 flex flex-wrap gap-1.5">
        {projects.map((p) => (
          <button
            key={p.id}
            onClick={() => setDealId(p.id)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors",
              dealId === p.id ? "border-ink-900 bg-ink-900 text-white" : "border-ink-200 text-ink-600 hover:border-ink-300"
            )}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {dna.dimensions.map((d) => (
          <div key={d.dimension} className={cn("rounded-lg border p-3", d.basis === "not-assessed" ? "border-dashed border-ink-200 bg-ink-50/50" : "border-ink-100")}>
            {d.basis === "not-assessed" ? (
              <div className="flex flex-col items-center justify-center py-2 text-center">
                <Dna size={18} className="mb-1.5 text-ink-300" />
                <p className="text-[12px] font-medium text-ink-500">{dnaDimensionLabels[d.dimension]}</p>
                <p className="mt-0.5 text-[10.5px] text-ink-400">Not yet assessed</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Gauge value={d.score ?? 0} label={dnaDimensionLabels[d.dimension]} />
                <Badge tone={d.basis === "full-evidence" ? "green" : "gray"} className="mt-1">
                  {d.basis === "full-evidence" ? "Full evidence" : "Summary indicators"}
                </Badge>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2.5">
        {dna.dimensions.filter((d) => d.basis !== "not-assessed").map((d) => (
          <p key={d.dimension} className="text-[12.5px] leading-relaxed text-ink-600">
            <span className="font-medium text-ink-800">{dnaDimensionLabels[d.dimension]} — </span>{d.summary}
          </p>
        ))}
      </div>

      {dna.similarDeals.length > 0 && (
        <div className="mt-5 border-t border-ink-100 pt-4">
          <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-400">Similar deals</p>
          <div className="space-y-2">
            {dna.similarDeals.map((m) => {
              const matchProject = projects.find((p) => p.id === m.dealId);
              return (
                <div key={m.dealId} className="flex items-center justify-between gap-3 rounded-lg border border-ink-100 px-3 py-2">
                  <div>
                    <p className="text-[12.5px] font-medium text-ink-800">{matchProject?.name ?? m.dealId}</p>
                    <p className="mt-0.5 text-[11.5px] text-ink-500">{m.matchReasons.join(" · ")}</p>
                  </div>
                  <Badge tone="gray">{m.similarityScore}% match</Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {decision && (
        <div className="mt-4 flex items-center gap-2 border-t border-ink-100 pt-3.5">
          <p className="text-[11.5px] text-ink-500">This deal's IC decision:</p>
          <EntityRefChip entityRef={{ kind: "decision", id: decision.dealId, label: `${project.name} — ${decision.outcome}` }} />
        </div>
      )}
    </Card>
  );
}
