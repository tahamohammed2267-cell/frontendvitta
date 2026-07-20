import { cn } from "../../../lib/cn";
import { milestonesForProject, type Milestone } from "../../../lib/projectIntelligence";

export default function TimelineWidget({ projectId, filterKind }: { projectId: string; filterKind?: Milestone["kind"] }) {
  const all = milestonesForProject(projectId);
  const milestones = (filterKind ? all.filter((m) => m.kind === filterKind) : all)
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="h-full space-y-3 overflow-y-auto">
      {milestones.map((m) => (
        <div key={m.id} className="flex gap-2.5">
          <span className={cn(
            "mt-1 h-1.5 w-1.5 shrink-0 rounded-full",
            m.status === "overdue" ? "bg-crit-600" : m.status === "completed" ? "bg-pos-600" : "bg-accent-600"
          )} />
          <div className="min-w-0">
            <p className="text-[11.5px] leading-snug text-ink-800">{m.label}</p>
            <p className="mt-0.5 text-[10.5px] text-ink-400">{m.date}{m.status === "overdue" ? " · overdue" : ""}</p>
          </div>
        </div>
      ))}
      {milestones.length === 0 && <p className="py-4 text-center text-[11.5px] text-ink-400">No timeline entries.</p>}
    </div>
  );
}
