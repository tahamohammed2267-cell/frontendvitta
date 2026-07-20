import { Check, X } from "lucide-react";
import type { DetectedChange } from "../../../lib/portfolioData";
import { Badge, ConfidenceBar } from "../../../lib/ui";
import { cn } from "../../../lib/cn";

export default function DetectedChangesDiff({ changes, onDecide }: { changes: DetectedChange[]; onDecide: (id: string, decision: "accepted" | "rejected") => void }) {
  return (
    <div className="space-y-2">
      {changes.map((c) => (
        <div key={c.id} className={cn("flex items-center gap-4 rounded-lg border p-3", c.decision === "accepted" ? "border-pos-100 bg-pos-50/40" : c.decision === "rejected" ? "border-ink-200 bg-ink-50 opacity-60" : "border-ink-200")}>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-[13px] font-medium">{c.field}</p>
              <Badge tone="gray">{c.category}</Badge>
            </div>
            <div className="mt-1.5 flex items-center gap-2 text-[13px]">
              <span className="num text-ink-400 line-through">{c.previousValue}</span>
              <span className="text-ink-300">→</span>
              <span className="num font-semibold text-ink-900">{c.newValue}</span>
            </div>
          </div>
          <ConfidenceBar value={c.confidence} />
          {c.decision === "pending" ? (
            <div className="flex shrink-0 gap-1.5">
              <button onClick={() => onDecide(c.id, "accepted")} className="flex items-center gap-1 rounded-md border border-pos-100 bg-pos-50 px-2.5 py-1.5 text-[11.5px] font-medium text-pos-700 hover:bg-pos-100"><Check size={13} /> Accept</button>
              <button onClick={() => onDecide(c.id, "rejected")} className="flex items-center gap-1 rounded-md border border-ink-200 px-2.5 py-1.5 text-[11.5px] font-medium text-ink-600 hover:bg-ink-100"><X size={13} /> Reject</button>
            </div>
          ) : (
            <Badge tone={c.decision === "accepted" ? "green" : "gray"}>{c.decision === "accepted" ? "Accepted" : "Rejected"}</Badge>
          )}
        </div>
      ))}
    </div>
  );
}
