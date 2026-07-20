import { ArrowUpRight } from "lucide-react";
import type { EntityRef } from "../../lib/intelligence/crossLinks";
import { jumpTo } from "./useIntelligenceJump";

const kindLabels: Record<EntityRef["kind"], string> = {
  dna: "DNA", pattern: "Pattern", benchmark: "Benchmark", decision: "Decision",
  playbook: "Playbook", recommendation: "Recommendation", observation: "Observation", deal: "Deal",
};

export default function EntityRefChip({ entityRef }: { entityRef: EntityRef }) {
  return (
    <button
      type="button"
      onClick={() => jumpTo(entityRef.kind, entityRef.id)}
      className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-ink-200 bg-white px-2 py-0.5 text-[11px] text-ink-600 transition-colors hover:border-accent-500 hover:text-accent-700"
    >
      <span className="shrink-0 text-ink-400">{kindLabels[entityRef.kind]}</span>
      <span className="truncate font-medium">{entityRef.label}</span>
      <ArrowUpRight size={11} className="shrink-0 text-ink-400" />
    </button>
  );
}
