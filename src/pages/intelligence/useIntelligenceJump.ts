import { useEffect } from "react";
import { useSyncExternalStore } from "react";
import { anchorId, type IntelEntityKind } from "../../lib/intelligence/crossLinks";

// In-page cross-linking for the Intelligence module: EntityRefChip calls
// jumpTo(), which scrolls to + highlights the target's DOM anchor. Stateful
// sections (DNASection's deal selector, PlaybooksSection's technology
// selector) subscribe via useJumpTarget to also update their own selection
// state so the jump lands on the right content, not just the right scroll
// position. Mirrors dashboardStore.ts's lightweight useSyncExternalStore
// pattern — no new state library.

export interface JumpTarget {
  kind: IntelEntityKind;
  id: string;
  seq: number; // increments every call so repeated jumps to the same target still re-trigger
}

let current: JumpTarget | null = null;
const listeners = new Set<() => void>();
let seq = 0;

function emit() {
  listeners.forEach((l) => l());
}

export function jumpTo(kind: IntelEntityKind, id: string) {
  seq += 1;
  current = { kind, id, seq };
  emit();
  requestAnimationFrame(() => {
    const el = document.getElementById(anchorId(kind, id));
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("ring-2", "ring-accent-500");
    setTimeout(() => el.classList.remove("ring-2", "ring-accent-500"), 1600);
  });
}

export function useJumpTarget() {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => current
  );
}

// Convenience hook for stateful sections: fires `onJump` whenever the jump
// target matches one of `kinds`, so the section can update its own selector.
export function useJumpListener(kinds: IntelEntityKind[], onJump: (id: string) => void) {
  const target = useJumpTarget();
  useEffect(() => {
    if (target && kinds.includes(target.kind)) onJump(target.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target?.seq]);
}
