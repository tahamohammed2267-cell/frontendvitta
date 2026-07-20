import { useState } from "react";
import { Check, FileUp, Loader2 } from "lucide-react";
import type { DetectedChange, MISFormat } from "../../../lib/portfolioData";
import { Button, Modal } from "../../../lib/ui";
import DetectedChangesDiff from "./DetectedChangesDiff";

type Step = "upload" | "processing" | "review" | "done";

const sampleChanges: DetectedChange[] = [
  { id: "u1", field: "Revenue", category: "Revenue", previousValue: "€8.2m", newValue: "€8.9m", confidence: 0.93, decision: "pending" },
  { id: "u2", field: "Generation", category: "Generation", previousValue: "58 GWh", newValue: "61 GWh", confidence: 0.96, decision: "pending" },
  { id: "u3", field: "O&M Cost", category: "Expenses", previousValue: "€0.9m", newValue: "€1.1m", confidence: 0.78, decision: "pending" },
  { id: "u4", field: "Capacity Utilization", category: "Utilization", previousValue: "68%", newValue: "71%", confidence: 0.88, decision: "pending" },
];

export default function MISUploadFlow({
  open, onClose, projectName, onConfirm,
}: { open: boolean; onClose: () => void; projectName: string; onConfirm: (changes: DetectedChange[], fileName: string, format: MISFormat) => void }) {
  const [step, setStep] = useState<Step>("upload");
  const [changes, setChanges] = useState<DetectedChange[]>(sampleChanges);
  const [fileName, setFileName] = useState("");

  function reset() { setStep("upload"); setChanges(sampleChanges.map((c) => ({ ...c, decision: "pending" }))); setFileName(""); }
  function close() { reset(); onClose(); }

  function simulateUpload(name: string) {
    setFileName(name);
    setStep("processing");
    setTimeout(() => setStep("review"), 900);
  }

  function decide(id: string, decision: "accepted" | "rejected") {
    setChanges((cs) => cs.map((c) => (c.id === id ? { ...c, decision } : c)));
  }

  function confirm() {
    onConfirm(changes, fileName || "MIS_Upload.xlsx", "XLSX");
    setStep("done");
  }

  const allDecided = changes.every((c) => c.decision !== "pending");

  return (
    <Modal open={open} onClose={close} title="Upload MIS report" sub={projectName} width="640px">
      {step === "upload" && (
        <div>
          <button
            onClick={() => simulateUpload("Project_MIS_Jul2026.xlsx")}
            className="flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-ink-200 bg-white py-10 text-center transition-colors hover:border-accent-500/50 hover:bg-accent-50/30"
          >
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-50 text-accent-600"><FileUp size={18} /></div>
            <p className="text-[13.5px] font-medium">Drop MIS report here or click to upload</p>
            <p className="mt-1 text-[12px] text-ink-500">Excel, CSV or PDF — fields are auto-extracted and mapped to the canonical model</p>
          </button>
        </div>
      )}

      {step === "processing" && (
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <Loader2 size={24} className="mb-3 animate-spin text-accent-600" />
          <p className="text-[13.5px] font-medium">Extracting {fileName}…</p>
          <p className="mt-1 text-[12px] text-ink-500">Mapping revenue, expenses, generation and utilization to the canonical data model</p>
        </div>
      )}

      {step === "review" && (
        <div>
          <p className="mb-3 text-[12.5px] text-ink-500">{changes.length} detected changes — review and confirm before anything updates the project record.</p>
          <DetectedChangesDiff changes={changes} onDecide={decide} />
          <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-4">
            <p className="text-[11.5px] text-ink-400">Nothing updates automatically. This upload creates a new version with a full audit trail.</p>
            <Button className={!allDecided ? "pointer-events-none opacity-40" : ""} onClick={confirm}>Confirm upload</Button>
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-pos-50 text-pos-600"><Check size={20} /></div>
          <p className="text-[13.5px] font-medium">New version created</p>
          <p className="mt-1 text-[12px] text-ink-500">{changes.filter((c) => c.decision === "accepted").length} changes applied · logged to the audit trail</p>
          <Button variant="secondary" className="mt-4" onClick={close}>Close</Button>
        </div>
      )}
    </Modal>
  );
}
