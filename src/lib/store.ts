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
  PromptTemplate,
  RiskItem,
  ValidationFlag,
} from "./mockData";
import { getActiveTimeline, runTimeline } from "./timeline";
import { pickReply, type ChatCitation } from "./chatResponses";

export interface ChatMessage {
  role: "user" | "ai";
  text: string;
  citations?: ChatCitation[];
}

export type HeliosStage = "pre-upload" | "uploading" | "running" | "done";

export const PIPELINE_STAGES = [
  { label: "Parsing", detail: "Reading document structure, splitting pages, running layout analysis", durationMs: 9000 },
  { label: "Classifying", detail: "Matching each document to the blueprint taxonomy", durationMs: 6000 },
  { label: "Extracting", detail: "Pulling fields, tables and figures with OCR fallback on scans", durationMs: 22000 },
  { label: "Mapping to canonical schema", detail: "Normalising units and aligning to the canonical data model", durationMs: 5000 },
  { label: "Validating", detail: "Cross-checking values, ranges and internal consistency", durationMs: 7000 },
  { label: "Detecting conflicts", detail: "Flagging disagreements between source documents", durationMs: 5000 },
  { label: "Done", detail: "Extraction complete", durationMs: 2000 },
] as const;

export type PipelineDock = "hidden" | "running" | "done";

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
    icMemoContent: structuredClone(fixtures.icMemoContent),
    icDeckSlides: structuredClone(fixtures.icDeckSlides),
    chatSample: structuredClone(fixtures.chatSample) as ChatMessage[],
    suggestedPrompts: structuredClone(fixtures.suggestedPrompts),
    currentUser: structuredClone(fixtures.currentUser),
    promptTemplates: structuredClone(fixtures.promptTemplates) as PromptTemplate[],
  };
}

type Data = ReturnType<typeof staticSlices> & ReturnType<typeof heliosEmpty>;

export interface SourceDrawerPayload {
  doc: string;
  page: number;
  field?: string;
  value?: string;
  confidence?: number;
  snippet?: string;
}

export interface MemoGeneration {
  active: boolean;
  templateId: string | null;
  sectionIndex: number;
  done: boolean;
}

interface Store extends Data {
  heliosStage: HeliosStage;
  pipelineStageIndex: number;
  pipelineCounters: { fields: number; tables: number };
  pipelineDock: PipelineDock;
  pipelineDealName: string;
  dismissPipelineDock: () => void;
  startNewDeal: (dealName: string) => void;
  sourceDrawer: SourceDrawerPayload | null;
  toast: string | null;
  blueprintPopulated: boolean;
  computedWorkbook: { uploaded: boolean; ingesting: boolean };
  memoGeneration: MemoGeneration;
  reset: () => void;
  startHeliosUpload: () => void;
  setDocumentProgress: (id: string, patch: Partial<DealDocument>) => void;
  startHeliosPipeline: () => void;
  confirmField: (id: string) => void;
  overrideField: (id: string, value: string, reason: string) => void;
  addFieldManually: (id: string, value: string) => void;
  resolveConflict: (id: string, chosen: { value: string; source: string; page?: number; snippet?: string; confidence?: number }, note: string) => void;
  reopenConflict: (id: string) => void;
  escalateConflict: (id: string) => void;
  dismissValidationFlag: (id: string) => void;
  createActionItemFromFlag: (id: string) => void;
  openSourceDrawer: (payload: SourceDrawerPayload) => void;
  closeSourceDrawer: () => void;
  showToast: (message: string) => void;
  updatePromptTemplate: (id: string, systemPrompt: string) => void;
  populateBlueprint: () => void;
  ingestComputedWorkbook: () => void;
  startMemoGeneration: (templateId: string) => void;
  closeMemoGeneration: () => void;
  addGeneratedFile: (file: { baseName: string; ext: string; kind: GeneratedFile["kind"]; sizeMB: number }) => void;
  chatThinking: boolean;
  sendChatMessage: (text: string) => void;
  clearChat: () => void;
}

let extractionTicker: ReturnType<typeof setInterval> | null = null;
function clearExtractionTicker() {
  if (extractionTicker) clearInterval(extractionTicker);
  extractionTicker = null;
}

let toastTimer: ReturnType<typeof setTimeout> | null = null;

function now() {
  return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }) + ", " + new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...staticSlices(),
      ...heliosEmpty(),
      heliosStage: "pre-upload",
      pipelineStageIndex: 0,
      pipelineCounters: { fields: 0, tables: 0 },
      pipelineDock: "hidden",
      pipelineDealName: "Project Helios",
      sourceDrawer: null,
      toast: null,
      blueprintPopulated: false,
      computedWorkbook: { uploaded: true, ingesting: false },
      memoGeneration: { active: false, templateId: null, sectionIndex: -1, done: false },
      chatThinking: false,

      reset: () => {
        clearExtractionTicker();
        getActiveTimeline()?.cancel();
        if (toastTimer) clearTimeout(toastTimer);
        set({
          ...staticSlices(),
          ...heliosEmpty(),
          heliosStage: "pre-upload",
          pipelineStageIndex: 0,
          pipelineCounters: { fields: 0, tables: 0 },
          pipelineDock: "hidden",
          pipelineDealName: "Project Helios",
          sourceDrawer: null,
          toast: null,
          blueprintPopulated: false,
          computedWorkbook: { uploaded: true, ingesting: false },
          memoGeneration: { active: false, templateId: null, sectionIndex: -1, done: false },
          chatThinking: false,
        });
      },

      showToast: (message) => {
        if (toastTimer) clearTimeout(toastTimer);
        set({ toast: message });
        toastTimer = setTimeout(() => set({ toast: null }), 2600);
      },

      openSourceDrawer: (payload) => set({ sourceDrawer: payload }),
      closeSourceDrawer: () => set({ sourceDrawer: null }),

      confirmField: (id) => {
        set((s) => ({ canonicalFields: s.canonicalFields.map((f) => (f.id === id ? { ...f, status: "human-confirmed" as const } : f)) }));
        get().showToast("Field confirmed");
      },

      overrideField: (id, value, reason) => {
        set((s) => ({
          canonicalFields: s.canonicalFields.map((f) =>
            f.id === id
              ? { ...f, status: "overridden" as const, value, override: { by: get().currentUser.name, at: now(), reason, previousValue: f.value } }
              : f
          ),
        }));
        get().showToast("Override logged");
      },

      addFieldManually: (id, value) => {
        set((s) => ({
          canonicalFields: s.canonicalFields.map((f) =>
            f.id === id
              ? { ...f, status: "human-confirmed" as const, value, confidence: 1, source: { doc: "—", page: 0, snippet: "" } }
              : f
          ),
        }));
        get().showToast("Field added");
      },

      resolveConflict: (id, chosen, note) => {
        const conflict = get().conflicts.find((c) => c.id === id);
        set((s) => ({
          conflicts: s.conflicts.map((c) =>
            c.id === id ? { ...c, status: "resolved" as const, resolution: { chosen: chosen.value, by: get().currentUser.name, at: now(), note } } : c
          ),
          canonicalFields: conflict
            ? s.canonicalFields.map((f) =>
                f.field === conflict.field
                  ? {
                      ...f,
                      value: chosen.value,
                      status: "human-confirmed" as const,
                      confidence: chosen.confidence ?? 1,
                      source: { doc: chosen.source, page: chosen.page ?? 0, snippet: chosen.snippet ?? f.source.snippet },
                    }
                  : f
              )
            : s.canonicalFields,
        }));
        get().showToast("Written to canonical record");
      },

      reopenConflict: (id) => {
        set((s) => ({ conflicts: s.conflicts.map((c) => (c.id === id ? { ...c, status: "open" as const, resolution: undefined } : c)) }));
        get().showToast("Conflict reopened");
      },

      escalateConflict: (id) => {
        const conflict = get().conflicts.find((c) => c.id === id);
        if (conflict) {
          set((s) => ({
            actionItems: [
              { id: `esc-${id}`, text: `Escalated: ${conflict.field} conflict needs Principal sign-off`, owner: "S. Okafor", due: "TBD", done: false, source: "Reconciliation" },
              ...s.actionItems,
            ],
          }));
        }
        get().showToast("Escalated to Principal");
      },

      dismissValidationFlag: (id) => {
        set((s) => ({ validationFlags: s.validationFlags.filter((v) => v.id !== id) }));
      },

      createActionItemFromFlag: (id) => {
        const flag = get().validationFlags.find((v) => v.id === id);
        if (flag) {
          set((s) => ({
            actionItems: [
              { id: `flag-${id}`, text: flag.message, owner: get().currentUser.name, due: "TBD", done: false, source: flag.rule },
              ...s.actionItems,
            ],
          }));
          get().showToast("Action item created");
        }
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

      dismissPipelineDock: () => set({ pipelineDock: "hidden" }),

      startNewDeal: (dealName) => {
        clearExtractionTicker();
        getActiveTimeline()?.cancel();
        set({
          ...heliosEmpty(),
          heliosStage: "pre-upload",
          pipelineStageIndex: 0,
          pipelineCounters: { fields: 0, tables: 0 },
          pipelineDock: "hidden",
          pipelineDealName: dealName.trim() || "New Deal",
          blueprintPopulated: false,
        });
      },

      startHeliosPipeline: () => {
        if (get().heliosStage !== "uploading") return;
        set({ heliosStage: "running", pipelineStageIndex: 0, pipelineCounters: { fields: 0, tables: 0 }, pipelineDock: "running" });
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
            set({ ...r, heliosStage: "done", pipelineStageIndex: PIPELINE_STAGES.length - 1, pipelineCounters: { fields: r.canonicalFields.length, tables: TOTAL_TABLES }, pipelineDock: "done" });
            get().showToast(`${get().pipelineDealName} — extraction complete · ${r.canonicalFields.length} fields, ${TOTAL_TABLES} tables`);
          }
        );
      },

      updatePromptTemplate: (id, systemPrompt) => {
        set((s) => ({
          promptTemplates: s.promptTemplates.map((t) =>
            t.id === id ? { ...t, systemPrompt, lastEditedBy: get().currentUser.name, lastEditedAt: now() } : t
          ),
        }));
        get().showToast("Prompt saved");
      },

      populateBlueprint: () => {
        if (get().blueprintPopulated) return;
        set({ blueprintPopulated: true });
      },

      ingestComputedWorkbook: () => {
        if (get().computedWorkbook.ingesting) return;
        set({ computedWorkbook: { uploaded: false, ingesting: true } });
        setTimeout(() => {
          set({ computedWorkbook: { uploaded: true, ingesting: false } });
          get().showToast("Computed workbook ingested");
        }, 6000);
      },

      startMemoGeneration: (templateId) => {
        getActiveTimeline()?.cancel();
        set({ memoGeneration: { active: true, templateId, sectionIndex: -1, done: false } });
        const sections = get().icMemoSections;
        runTimeline(
          sections.map((_, i) => ({
            durationMs: 1500,
            onStart: () => set((s) => ({ memoGeneration: { ...s.memoGeneration, sectionIndex: i } })),
          })),
          () => {
            set((s) => ({ memoGeneration: { ...s.memoGeneration, done: true } }));
            get().showToast("Memo generated");
          }
        );
      },

      closeMemoGeneration: () => {
        getActiveTimeline()?.cancel();
        set({ memoGeneration: { active: false, templateId: null, sectionIndex: -1, done: false } });
      },

      addGeneratedFile: (file) => {
        set((s) => {
          const existingVersions = s.generatedFiles.filter((f) => f.name.replace(/_v\d+/, "") === `${file.baseName}.${file.ext}`).map((f) => f.version);
          const version = existingVersions.length > 0 ? Math.max(...existingVersions) + 1 : 1;
          const entry: GeneratedFile = {
            id: `${file.baseName}-v${version}-${Date.now()}`,
            name: `${file.baseName}_v${version}.${file.ext}`,
            kind: file.kind,
            sizeMB: file.sizeMB,
            generatedAt: now(),
            generatedBy: get().currentUser.name,
            version,
          };
          return { generatedFiles: [entry, ...s.generatedFiles] };
        });
      },

      sendChatMessage: (text) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        set((s) => ({ chatSample: [...s.chatSample, { role: "user", text: trimmed }], chatThinking: true }));
        setTimeout(() => {
          const reply = pickReply(trimmed);
          set((s) => ({
            chatSample: [...s.chatSample, { role: "ai", text: reply.text, citations: reply.citations }],
            chatThinking: false,
          }));
        }, 800);
      },

      clearChat: () => set({ chatSample: [], chatThinking: false }),
    }),
    { name: "vitta-demo-state" }
  )
);
