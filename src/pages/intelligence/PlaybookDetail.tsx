import { anchorId } from "../../lib/intelligence/crossLinks";
import type { Playbook, PlaybookSubsection } from "../../lib/intelligenceData";
import { Badge, Modal } from "../../lib/ui";
import EntityRefChip from "./EntityRefChip";

const subsections: { key: keyof Playbook; label: string }[] = [
  { key: "typicalLifecycle", label: "Typical project lifecycle" },
  { key: "commonRisks", label: "Common risks" },
  { key: "financialBenchmarks", label: "Financial benchmarks" },
  { key: "operationalBenchmarks", label: "Operational benchmarks" },
  { key: "frequentDDFindings", label: "Frequent due diligence findings" },
  { key: "commonLegalIssues", label: "Common legal issues" },
  { key: "commonTechnicalIssues", label: "Common technical issues" },
  { key: "commonFinancingStructures", label: "Common financing structures" },
  { key: "successfulStrategies", label: "Successful investment strategies" },
  { key: "valueCreationInitiatives", label: "Typical value creation initiatives" },
  { key: "frequentMistakes", label: "Frequent mistakes" },
  { key: "bestPractices", label: "Best practices" },
  { key: "lessonsLearned", label: "Lessons learned" },
];

function SubsectionBlock({ label, data }: { label: string; data: PlaybookSubsection }) {
  if (data.basis === "insufficient-data" || data.items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-ink-200 bg-ink-50/50 px-3.5 py-3">
        <p className="text-[12.5px] font-medium text-ink-500">{label}</p>
        <p className="mt-0.5 text-[11.5px] text-ink-400">Not enough deal-level data yet to populate this section.</p>
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-ink-100 px-3.5 py-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[12.5px] font-medium text-ink-800">{label}</p>
        <Badge tone={data.basis === "deal-evidence" ? "green" : "gray"}>{data.basis === "deal-evidence" ? "Deal evidence" : "Summary indicators"}</Badge>
      </div>
      <ul className="mt-2 list-disc space-y-1 pl-4">
        {data.items.map((item, i) => <li key={i} className="text-[12.5px] leading-relaxed text-ink-700">{item}</li>)}
      </ul>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {data.sourceDeals.map((r) => <EntityRefChip key={r.id} entityRef={r} />)}
      </div>
    </div>
  );
}

export default function PlaybookDetail({ playbook, open, onClose }: { playbook: Playbook; open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title={playbook.title} sub={`${playbook.dealsContributing} deal${playbook.dealsContributing === 1 ? "" : "s"} contributing · last reinforced ${playbook.lastReinforcedAt}`} width="720px">
      <div id={anchorId("playbook", playbook.id)} className="space-y-2.5">
        {playbook.relatedPatterns.length > 0 && (
          <div className="mb-3 flex flex-wrap items-center gap-1.5">
            <p className="mr-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-400">Recurring patterns</p>
            {playbook.relatedPatterns.map((r) => <EntityRefChip key={r.id} entityRef={r} />)}
          </div>
        )}
        {subsections.map(({ key, label }) => (
          <SubsectionBlock key={key} label={label} data={playbook[key] as PlaybookSubsection} />
        ))}
      </div>
    </Modal>
  );
}
