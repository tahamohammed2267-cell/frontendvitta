// ─────────────────────────────────────────────────────────────
// Cross-linking primitive shared across all Intelligence Phase 2
// entities (decisions, observations, playbooks, recommendations).
// Every EntityRef is pre-labeled at seed time so components never
// need a lookup switch to render a link — same "no runtime
// guessing" discipline as the rest of this codebase.
// ─────────────────────────────────────────────────────────────

import { projects } from "../mockData";

export type IntelEntityKind = "dna" | "pattern" | "benchmark" | "decision" | "playbook" | "recommendation" | "observation" | "deal";

export interface EntityRef {
  kind: IntelEntityKind;
  id: string;
  label: string;
}

export function anchorId(kind: IntelEntityKind, id: string) {
  return `intel-${kind}-${id}`;
}

export function dealRef(dealId: string, kind: IntelEntityKind = "deal"): EntityRef {
  const project = projects.find((p) => p.id === dealId);
  return { kind, id: dealId, label: project?.name ?? dealId };
}
