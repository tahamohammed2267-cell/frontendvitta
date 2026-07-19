// Single source of app state, seeded from the fixtures in mockData.ts.
// Every page reads and writes through this store instead of importing
// mockData's arrays directly, so actions taken in one screen (confirm a
// field, resolve a conflict, generate a file...) are reflected everywhere
// else, and `reset()` can restore the pristine starting state on demand.
//
// Helios starts in a "pre-upload" state: documents/fields/conflicts/flags/
// risks/action items are empty (checklist is present but every item is
// "missing"), and the rich fixture data in mockData.ts is the *result*
// state the upload + extraction pipeline reveals. Other deals (Boreas,
// Meridian, Atlas, Zephyr) are unaffected — they only ever appear as
// pre-populated summaries in the deals list / dashboard.
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
import { getActiveTimeline, runTimeline } from "./timeline";

export type HeliosStage = "pre-upload" | "uploading" | "running" | "done";

export const PIPELINE_STAGES = [
  { label: "Parsing", durationMs: 18000 },
  { label: "Classifying", durationMs: 10000 },
  { label: "Extracting", durationMs: 42000 },
  { label: "Mapping to canonical schema", durationMs: 8000 },
  { label: "Validating", durationMs: 12000 },
  { label: "Detecting conflicts", durationMs: 6000 },
  { label: "Done", durationMs: 4000 },
] as const;

const TOTAL_TABLES = 12;

function heliosResult() {
  return {
    documents: structuredClone(fixtures.documents) as DealDocument[],
    canonicalFields: structuredClone(fixtures.canonicalFields) as CanonicalField[],
    conflicts: structuredClone(fixtures.conflicts) as Conflict[],
    validationFlags: structuredClone(fixtures.validationFlags) as ValidationFlag[],
    risks: structuredClone(fixtures.risks) as RiskItem[],
    actionItems: structuredClone(fixtures.actionItems) as ActionItem[],
    checklist: structuredClone(fixtures.checklist) as ChecklistItem[],
  };
}

function heliosEmpty() {
  return {
    documents: [] as DealDocument[],
    canonicalFields: [] as CanonicalField[],
    conflicts: [] as Conflict[],
    validationFlags: [] as ValidationFlag[],
    risks: [] as RiskItem[],
    actionItems: [] as ActionItem[],
    checklist: structuredClone(fixtures.checklist).map((c) => ({ ...c, status: "missing" as const, note: "" })) as ChecklistItem[],
  };
}

function staticSlices() {
  return {
    projects: structuredClone(fixtures.projects) as Project[],
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

type Data = ReturnType<typeof staticSlices> & ReturnType<typeof heliosEmpty>;

interface Store extends Data {
  heliosStage: HeliosStage;
  pipelineStageIndex: number;
  pipelineCounters: { fields: number; tables: number };
  reset: () => void;
  startHeliosUpload: () => void;
  setDocumentProgress: (id: string, patch: Partial<DealDocument>) => void;
  startHeliosPipeline: () => void;
}

let extractionTicker: ReturnType<typeof setInterval> | null = null;
function clearExtractionTicker() {
  if (extractionTicker) clearInterval(extractionTicker);
  extractionTicker = null;
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...staticSlices(),
      ...heliosEmpty(),
      heliosStage: "pre-upload",
      pipelineStageIndex: 0,
      pipelineCounters: { fields: 0, tables: 0 },

      reset: () => {
        clearExtractionTicker();
        getActiveTimeline()?.cancel();
        set({
          ...staticSlices(),
          ...heliosEmpty(),
          heliosStage: "pre-upload",
          pipelineStageIndex: 0,
          pipelineCounters: { fields: 0, tables: 0 },
        });
      },

      setDocumentProgress: (id, patch) => {
        set((s) => ({ documents: s.documents.map((d) => (d.id === id ? { ...d, ...patch } : d)) }));
      },

      startHeliosUpload: () => {
        if (get().heliosStage !== "pre-upload") return;
        const docs = heliosResult().documents.map((d) => ({ ...d, status: "uploading" as const, progress: 0, fieldsExtracted: 0 }));
        set({ documents: docs, heliosStage: "uploading" });
        docs.forEach((d, i) => {
          const startDelay = i * 220 + Math.random() * 400;
          const duration = 2600 + Math.random() * 2200;
          const startedAt = Date.now() + startDelay;
          const tick = () => {
            if (get().heliosStage !== "uploading") return; // reset or pipeline already started
            const elapsed = Date.now() - startedAt;
            if (elapsed < 0) {
              setTimeout(tick, startDelay);
              return;
            }
            const pct = Math.min(100, Math.round((elapsed / duration) * 100));
            get().setDocumentProgress(d.id, { progress: pct });
            if (pct < 100) setTimeout(tick, 120);
          };
          setTimeout(tick, startDelay);
        });
      },

      startHeliosPipeline: () => {
        if (get().heliosStage !== "uploading") return;
        set({ heliosStage: "running", pipelineStageIndex: 0, pipelineCounters: { fields: 0, tables: 0 } });
        const result = heliosResult();
        const totalFields = result.canonicalFields.length;

        runTimeline(
          PIPELINE_STAGES.map((stage, i) => ({
            durationMs: stage.durationMs,
            onStart: () => {
              clearExtractionTicker();
              set({ pipelineStageIndex: i });
              if (stage.label === "Extracting") {
                const ticks = 40;
                let n = 0;
                extractionTicker = setInterval(() => {
                  n += 1;
                  set({
                    pipelineCounters: {
                      fields: Math.min(totalFields, Math.round((n / ticks) * totalFields)),
                      tables: Math.min(TOTAL_TABLES, Math.round((n / ticks) * TOTAL_TABLES)),
                    },
                  });
                  if (n >= ticks) clearExtractionTicker();
                }, stage.durationMs / ticks);
              }
            },
          })),
          () => {
            clearExtractionTicker();
            const r = heliosResult();
            set({ ...r, heliosStage: "done", pipelineStageIndex: PIPELINE_STAGES.length - 1, pipelineCounters: { fields: r.canonicalFields.length, tables: TOTAL_TABLES } });
          }
        );
      },
    }),
    { name: "vitta-demo-state" }
  )
);
