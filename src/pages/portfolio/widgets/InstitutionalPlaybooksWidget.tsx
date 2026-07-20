import { playbooks } from "../../../lib/intelligenceData";
import { Badge } from "../../../lib/ui";

const coverageTone = { established: "green" as const, emerging: "orange" as const, "insufficient-data": "gray" as const };

export default function InstitutionalPlaybooksWidget() {
  return (
    <div className="h-full space-y-2 overflow-y-auto">
      {playbooks.map((pb) => (
        <div key={pb.id} className="flex items-center justify-between gap-2">
          <span className="truncate text-[11.5px] font-medium text-ink-700">{pb.title}</span>
          <Badge tone={coverageTone[pb.coverage]}>{pb.dealsContributing} deal{pb.dealsContributing === 1 ? "" : "s"}</Badge>
        </div>
      ))}
    </div>
  );
}
