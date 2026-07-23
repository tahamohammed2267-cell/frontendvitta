import { useState } from "react";
import { FileSpreadsheet } from "lucide-react";
import type { MISVersion, PortfolioProject } from "../../../lib/portfolioData";
import { detectRepeatedIssues, significantMovements } from "../mis/misIntelligence";
import { Badge, Card, CardHeader, EmptyState } from "../../../lib/ui";
import MISVersionHistory from "../mis/MISVersionHistory";
import MISVersionCompare from "../mis/MISVersionCompare";
import TimelineWidget from "../widgets/TimelineWidget";

export default function MISTab({ project: proj }: { project: PortfolioProject }) {
  const [compareVersions, setCompareVersions] = useState<{ older: MISVersion; newer: MISVersion } | null>(null);
  const repeatedIssues = detectRepeatedIssues(proj);
  const movements = significantMovements(proj);

  if (proj.misVersions.length === 0) {
    return <EmptyState icon={<FileSpreadsheet size={20} />} title="No MIS reports yet" sub="Upload an MIS report to start building this project's reporting history." />;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-4">
          <MISVersionHistory versions={proj.misVersions} onCompare={(older, newer) => setCompareVersions({ older, newer })} />
          {compareVersions && <MISVersionCompare older={compareVersions.older} newer={compareVersions.newer} />}

          <Card>
            <CardHeader title="MIS Intelligence" />
            {movements.length === 0 && repeatedIssues.length === 0 ? (
              <p className="text-[12.5px] text-ink-400">No significant movements or repeated issues detected.</p>
            ) : (
              <div className="space-y-3">
                {movements.map((m, i) => (
                  <p key={`mv-${i}`} className="text-[13px] leading-relaxed text-ink-700">{m}</p>
                ))}
                {repeatedIssues.map((f) => (
                  <div key={f.field} className="flex items-center gap-2.5 rounded-lg border border-warn-100 bg-warn-50/50 p-3">
                    <Badge tone="orange">Repeated</Badge>
                    <p className="text-[12.5px] text-ink-700">{f.detail}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="MIS Timeline" />
            <div className="h-[280px]">
              <TimelineWidget projectId={proj.id} filterKind="mis-upload" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
