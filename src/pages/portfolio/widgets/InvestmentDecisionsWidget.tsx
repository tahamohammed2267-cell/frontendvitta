import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { icDecisions } from "../../../lib/intelligenceData";
import { projects } from "../../../lib/mockData";
import { Badge } from "../../../lib/ui";

const outcomeMeta = {
  approved: { tone: "green" as const, label: "Approved", icon: CheckCircle2 },
  passed: { tone: "red" as const, label: "Passed", icon: XCircle },
  pending: { tone: "gray" as const, label: "Pending", icon: Clock },
};

export default function InvestmentDecisionsWidget() {
  return (
    <div className="h-full space-y-1.5 overflow-y-auto">
      {icDecisions.map((d) => {
        const project = projects.find((p) => p.id === d.dealId);
        const meta = outcomeMeta[d.outcome];
        const Icon = meta.icon;
        return (
          <div key={d.dealId} className="flex items-center justify-between gap-2">
            <span className="truncate text-[11.5px] font-medium text-ink-700">{project?.name ?? d.dealId}</span>
            <Badge tone={meta.tone}><Icon size={10} /> {meta.label}</Badge>
          </div>
        );
      })}
    </div>
  );
}
