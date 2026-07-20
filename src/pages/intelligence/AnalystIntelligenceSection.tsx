import { useState } from "react";
import { Bookmark, MessageSquare, Lightbulb, AlertTriangle, HelpCircle, Highlighter, StickyNote } from "lucide-react";
import { projects } from "../../lib/mockData";
import { anchorId } from "../../lib/intelligence/crossLinks";
import { observationKindLabels, observationsByTag, type AnalystObservation, type ObservationKind, analystObservations } from "../../lib/intelligenceData";
import { Badge, Card, CardHeader, SourceChip } from "../../lib/ui";
import { cn } from "../../lib/cn";
import EntityRefChip from "./EntityRefChip";

const kindIcon: Record<ObservationKind, typeof StickyNote> = {
  note: StickyNote, highlight: Highlighter, bookmark: Bookmark, question: HelpCircle,
  comment: MessageSquare, "risk-flag": AlertTriangle, "opportunity-flag": Lightbulb,
};

const kindTone: Record<ObservationKind, "gray" | "orange" | "green"> = {
  note: "gray", highlight: "gray", bookmark: "gray", question: "gray",
  comment: "gray", "risk-flag": "orange", "opportunity-flag": "green",
};

function ObservationCard({ obs }: { obs: AnalystObservation }) {
  const Icon = kindIcon[obs.kind];
  const project = projects.find((p) => p.id === obs.dealId);
  return (
    <div id={anchorId("observation", obs.id)} className="rounded-lg border border-ink-100 p-3.5 transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon size={14} className="text-ink-400" />
          <Badge tone={kindTone[obs.kind]}>{observationKindLabels[obs.kind]}</Badge>
          <Badge tone="gray">{project?.name ?? obs.dealId}</Badge>
        </div>
        <p className="shrink-0 text-[11px] text-ink-400">{obs.author} · {obs.createdAt}</p>
      </div>
      <p className="mt-2 text-[12.5px] leading-relaxed text-ink-700">{obs.text}</p>
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        {obs.tags.map((t) => <Badge key={t} tone="gray">{t}</Badge>)}
        {obs.sourceEvidence && <SourceChip doc={obs.sourceEvidence.doc} page={obs.sourceEvidence.page} snippet={obs.sourceEvidence.snippet} />}
        {obs.relatedDeals.map((r) => <EntityRefChip key={r.id} entityRef={r} />)}
      </div>
    </div>
  );
}

export default function AnalystIntelligenceSection() {
  const [kindFilter, setKindFilter] = useState<ObservationKind | "all">("all");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const tags = observationsByTag().slice(0, 10);

  let rows = analystObservations;
  if (kindFilter !== "all") rows = rows.filter((o) => o.kind === kindFilter);
  if (tagFilter) rows = rows.filter((o) => o.tags.includes(tagFilter));

  const kindsPresent = [...new Set(analystObservations.map((o) => o.kind))] as ObservationKind[];

  return (
    <Card>
      <CardHeader title="Analyst Intelligence" sub="Notes, highlights, questions and flags — reusable institutional knowledge, not filed away per document" />

      <div className="mb-3 flex flex-wrap gap-1.5">
        <button
          onClick={() => setKindFilter("all")}
          className={cn("rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors", kindFilter === "all" ? "border-ink-900 bg-ink-900 text-white" : "border-ink-200 text-ink-600 hover:border-ink-300")}
        >
          All ({analystObservations.length})
        </button>
        {kindsPresent.map((k) => (
          <button
            key={k}
            onClick={() => setKindFilter(k)}
            className={cn("rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors", kindFilter === k ? "border-ink-900 bg-ink-900 text-white" : "border-ink-200 text-ink-600 hover:border-ink-300")}
          >
            {observationKindLabels[k]} ({analystObservations.filter((o) => o.kind === k).length})
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-1.5 border-b border-ink-100 pb-3.5">
        <p className="mr-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-400">Frequently reviewed topics</p>
        {tags.map((t) => (
          <button key={t.tag} onClick={() => setTagFilter(tagFilter === t.tag ? null : t.tag)}>
            <Badge tone={tagFilter === t.tag ? "green" : "gray"}>{t.tag} ({t.count})</Badge>
          </button>
        ))}
      </div>

      <div className="space-y-2.5">
        {rows.map((obs) => <ObservationCard key={obs.id} obs={obs} />)}
      </div>
    </Card>
  );
}
