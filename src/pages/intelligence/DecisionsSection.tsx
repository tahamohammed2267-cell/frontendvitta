import { useState } from "react";
import { CheckCircle2, ChevronDown, Clock, TrendingDown, TrendingUp, XCircle } from "lucide-react";
import { projects } from "../../lib/mockData";
import { anchorId } from "../../lib/intelligence/crossLinks";
import { icDecisions, type AssumptionStatus, type DecisionOutcome, type OutcomeTrackingStatus } from "../../lib/intelligenceData";
import { Badge, Card, CardHeader } from "../../lib/ui";
import { cn } from "../../lib/cn";
import EntityRefChip from "./EntityRefChip";
import { useJumpListener } from "./useIntelligenceJump";

const outcomeMeta: Record<DecisionOutcome, { tone: "green" | "red" | "gray"; label: string; icon: typeof CheckCircle2 }> = {
  approved: { tone: "green", label: "Approved", icon: CheckCircle2 },
  passed: { tone: "red", label: "Passed", icon: XCircle },
  pending: { tone: "gray", label: "Pending", icon: Clock },
};

const assumptionTone: Record<AssumptionStatus, "green" | "red" | "gray"> = {
  held: "green", "did-not-hold": "red", "too-early-to-tell": "gray",
};
const assumptionLabel: Record<AssumptionStatus, string> = {
  held: "Held", "did-not-hold": "Did not hold", "too-early-to-tell": "Too early to tell",
};

const outcomeTrackingMeta: Record<OutcomeTrackingStatus, { tone: "green" | "red" | "orange" | "gray"; label: string; icon: typeof TrendingUp }> = {
  "on-track": { tone: "green", label: "On track", icon: TrendingUp },
  outperforming: { tone: "green", label: "Outperforming", icon: TrendingUp },
  underperforming: { tone: "red", label: "Underperforming", icon: TrendingDown },
  "too-early": { tone: "gray", label: "Too early to tell", icon: Clock },
  "not-tracked": { tone: "gray", label: "Not tracked", icon: Clock },
};

export default function DecisionsSection() {
  const [expanded, setExpanded] = useState<string | null>(null);
  useJumpListener(["decision", "deal"], (dealId) => setExpanded(dealId));

  return (
    <Card>
      <CardHeader title="Investment Decisions" sub="The full institutional decision history — rationale, participants, assumptions and outcomes" />
      <div className="space-y-3">
        {icDecisions.map((d) => {
          const project = projects.find((p) => p.id === d.dealId);
          if (!project) return null;
          const meta = outcomeMeta[d.outcome];
          const Icon = meta.icon;
          const outcomeTrack = outcomeTrackingMeta[d.historicalOutcome.status];
          const TrackIcon = outcomeTrack.icon;
          const isOpen = expanded === d.dealId;
          return (
            <div key={d.dealId} id={anchorId("decision", d.dealId)} className="rounded-lg border border-ink-100 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[13.5px] font-semibold text-ink-900">{project.name}</p>
                    <Badge tone="gray">{project.technology}</Badge>
                  </div>
                  <p className="mt-0.5 text-[12px] text-ink-500">
                    {project.country} · €{project.dealSizeM}M{d.decisionDate ? ` · ${d.decisionDate}` : ""}
                  </p>
                </div>
                <Badge tone={meta.tone}>
                  <Icon size={11} /> {meta.label}
                </Badge>
              </div>
              <p className="mt-3 text-[12.5px] leading-relaxed text-ink-700">{d.rationale}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {d.keyFactors.map((f, i) => (
                  <Badge key={i} tone="gray">{f}</Badge>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : d.dealId)}
                className="mt-3 flex items-center gap-1 text-[11.5px] font-medium text-accent-700 hover:text-accent-800"
              >
                <ChevronDown size={13} className={cn("transition-transform", isOpen && "rotate-180")} />
                {isOpen ? "Hide" : "Show"} participants, assumptions & outcome tracking
              </button>

              {isOpen && (
                <div className="mt-3 space-y-3 border-t border-ink-100 pt-3">
                  {d.participants.length > 0 && (
                    <div>
                      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-400">Participants</p>
                      <div className="flex flex-wrap gap-1.5">
                        {d.participants.map((p, i) => <Badge key={i} tone="gray">{p.name} — {p.role}</Badge>)}
                      </div>
                    </div>
                  )}

                  {d.assumptions.length > 0 && (
                    <div>
                      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-400">Assumptions</p>
                      <div className="space-y-1.5">
                        {d.assumptions.map((a, i) => (
                          <div key={i} className="rounded-md bg-ink-50 px-2.5 py-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-[12px] text-ink-700">{a.text}</p>
                              <Badge tone={assumptionTone[a.status]}>{assumptionLabel[a.status]}</Badge>
                            </div>
                            {a.note && <p className="mt-1 text-[11.5px] text-ink-500">{a.note}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-400">Historical outcome</p>
                    <div className="flex items-start gap-2">
                      <Badge tone={outcomeTrack.tone}><TrackIcon size={11} /> {outcomeTrack.label}{d.historicalOutcome.asOf ? ` · as of ${d.historicalOutcome.asOf}` : ""}</Badge>
                    </div>
                    <p className="mt-1.5 text-[12px] text-ink-500">{d.historicalOutcome.note}</p>
                  </div>

                  {(d.relevantHistoricalDecisions.length > 0 || d.relatedPlaybooks.length > 0 || d.relatedObservations.length > 0) && (
                    <div>
                      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-400">Related institutional knowledge</p>
                      <div className="flex flex-wrap gap-1.5">
                        {d.relevantHistoricalDecisions.map((r) => <EntityRefChip key={r.kind + r.id} entityRef={r} />)}
                        {d.relatedPlaybooks.map((r) => <EntityRefChip key={r.kind + r.id} entityRef={r} />)}
                        {d.relatedObservations.map((r) => <EntityRefChip key={r.kind + r.id} entityRef={r} />)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
