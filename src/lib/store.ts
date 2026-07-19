// Single source of app state, seeded from the fixtures in mockData.ts.
// Every page reads and writes through this store instead of importing
// mockData's arrays directly, so actions taken in one screen (confirm a
// field, resolve a conflict, generate a file...) are reflected everywhere
// else, and `reset()` can restore the pristine fixture state on demand.
import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as fixtures from "./mockData";
import type {
  ActionItem,
  CanonicalField,
  ChecklistItem,
  Conflict,
  DealDocument,
  GeneratedFile,
  Project,
  RiskItem,
  ValidationFlag,
} from "./mockData";

function pristine() {
  return {
    projects: structuredClone(fixtures.projects) as Project[],
    documents: structuredClone(fixtures.documents) as DealDocument[],
    canonicalFields: structuredClone(fixtures.canonicalFields) as CanonicalField[],
    conflicts: structuredClone(fixtures.conflicts) as Conflict[],
    validationFlags: structuredClone(fixtures.validationFlags) as ValidationFlag[],
    risks: structuredClone(fixtures.risks) as RiskItem[],
    actionItems: structuredClone(fixtures.actionItems) as ActionItem[],
    checklist: structuredClone(fixtures.checklist) as ChecklistItem[],
    generatedFiles: structuredClone(fixtures.generatedFiles) as GeneratedFile[],
    benchmarks: structuredClone(fixtures.benchmarks),
    portfolio: structuredClone(fixtures.portfolio),
    revenueProjection: structuredClone(fixtures.revenueProjection),
    fundingWaterfall: structuredClone(fixtures.fundingWaterfall),
    knowledgeGrowth: structuredClone(fixtures.knowledgeGrowth),
    icMemoSections: structuredClone(fixtures.icMemoSections),
    icDeckSlides: structuredClone(fixtures.icDeckSlides),
    chatSample: structuredClone(fixtures.chatSample),
    suggestedPrompts: structuredClone(fixtures.suggestedPrompts),
    currentUser: structuredClone(fixtures.currentUser),
  };
}

type Data = ReturnType<typeof pristine>;

interface Store extends Data {
  reset: () => void;
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      ...pristine(),
      reset: () => set(pristine()),
    }),
    { name: "vitta-demo-state" }
  )
);
