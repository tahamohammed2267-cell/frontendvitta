import { useState } from "react";
import { BookMarked } from "lucide-react";
import { playbooks, type PlaybookCoverage } from "../../lib/intelligenceData";
import { Badge, Button, Card, CardHeader } from "../../lib/ui";
import { cn } from "../../lib/cn";
import { useJumpListener } from "./useIntelligenceJump";
import PlaybookDetail from "./PlaybookDetail";

const coverageTone: Record<PlaybookCoverage, "green" | "orange" | "gray"> = {
  established: "green", emerging: "orange", "insufficient-data": "gray",
};
const coverageLabel: Record<PlaybookCoverage, string> = {
  established: "Established", emerging: "Emerging", "insufficient-data": "Insufficient data",
};

export default function PlaybooksSection() {
  const [openId, setOpenId] = useState<string | null>(null);

  useJumpListener(["playbook"], (id) => setOpenId(id));

  const openPlaybook = playbooks.find((p) => p.id === openId);

  return (
    <Card>
      <CardHeader title="Institutional Playbooks" sub="Sector knowledge that evolves automatically as more deals are completed" />
      <div className="grid grid-cols-3 gap-3 max-lg:grid-cols-1">
        {playbooks.map((pb) => (
          <div key={pb.id} className="flex flex-col justify-between rounded-lg border border-ink-100 p-4">
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <BookMarked size={15} className="text-ink-400" />
                  <p className="text-[13.5px] font-semibold text-ink-900">{pb.title}</p>
                </div>
                <Badge tone={coverageTone[pb.coverage]}>{coverageLabel[pb.coverage]}</Badge>
              </div>
              <p className="mt-2 text-[12px] text-ink-500">
                {pb.dealsContributing} deal{pb.dealsContributing === 1 ? "" : "s"} contributing · last reinforced {pb.lastReinforcedAt}
              </p>
            </div>
            <Button variant="secondary" className="mt-3.5 justify-center" onClick={() => setOpenId(pb.id)}>View playbook</Button>
          </div>
        ))}
      </div>
      {openPlaybook && <PlaybookDetail playbook={openPlaybook} open={!!openId} onClose={() => setOpenId(null)} />}
    </Card>
  );
}
