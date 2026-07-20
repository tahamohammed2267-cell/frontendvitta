import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, Loader2, X } from "lucide-react";
import { PIPELINE_STAGES, useStore } from "../lib/store";
import { cn } from "../lib/cn";

// A background-job dock: once extraction starts it lives here, bottom-right,
// surviving navigation so the run is visible from any screen. Flips to a
// success state on completion and can be dismissed.
export default function GlobalPipelineDock() {
  const dock = useStore((s) => s.pipelineDock);
  const stageIndex = useStore((s) => s.pipelineStageIndex);
  const counters = useStore((s) => s.pipelineCounters);
  const dealName = useStore((s) => s.pipelineDealName);
  const dismiss = useStore((s) => s.dismissPipelineDock);
  const navigate = useNavigate();

  if (dock === "hidden") return null;

  const total = PIPELINE_STAGES.length - 1; // exclude the trailing "Done"
  const pct = dock === "done" ? 100 : Math.round((stageIndex / total) * 100);
  const stage = PIPELINE_STAGES[Math.min(stageIndex, PIPELINE_STAGES.length - 1)];
  const done = dock === "done";

  return (
    <div className="fixed bottom-6 right-6 z-[55] w-[340px] slide-up">
      <div className="overflow-hidden rounded-xl border border-ink-200 bg-white shadow-[0_16px_48px_-12px_rgba(11,14,20,0.28)]">
        {/* header */}
        <div className="flex items-center gap-2.5 px-4 pt-3.5">
          <span className={cn("relative flex h-6 w-6 items-center justify-center rounded-full", done ? "bg-pos-50 text-pos-600" : "bg-accent-50 text-accent-600")}>
            {done ? (
              <CheckCircle2 size={15} />
            ) : (
              <>
                <span className="ripple absolute inset-0 text-accent-500/40" />
                <Loader2 size={13} className="relative animate-spin" />
              </>
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12.5px] font-semibold text-ink-900">{done ? "Extraction complete" : "Extracting deal data"}</p>
            <p className="truncate text-[11px] text-ink-500">{dealName}</p>
          </div>
          {done && (
            <button onClick={dismiss} className="rounded-md p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-700"><X size={14} /></button>
          )}
        </div>

        {/* stage + progress */}
        <div className="px-4 pb-2 pt-3">
          {!done && (
            <p className="mb-2 text-[11.5px] text-ink-600">
              <span className="font-medium text-accent-700">{stage.label}</span>
              <span className="text-ink-400"> · {stage.detail}</span>
            </p>
          )}
          <div className="relative h-1.5 overflow-hidden rounded-full bg-ink-100">
            <div
              className={cn("relative h-full rounded-full transition-[width] duration-500 ease-out", done ? "bg-pos-600" : "progress-sheen bg-accent-600")}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* live counters */}
        <div className="grid grid-cols-2 gap-px bg-ink-100">
          <Counter label="Fields" value={counters.fields} />
          <Counter label="Tables" value={counters.tables} />
        </div>

        {/* action */}
        <div className="px-4 py-3">
          <button
            onClick={() => navigate("/projects/helios?tab=documents")}
            className={cn(
              "flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[12.5px] font-medium transition-colors",
              done ? "bg-accent-600 text-white hover:bg-accent-700" : "border border-ink-200 text-ink-700 hover:bg-ink-50"
            )}
          >
            {done ? "Review extracted deal" : "View pipeline"} <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Counter({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white px-4 py-2.5">
      <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-ink-400">{label}</p>
      <p key={value} className="num tick-flash mt-0.5 text-[19px] font-semibold leading-none tracking-tight text-ink-900">{value}</p>
    </div>
  );
}
