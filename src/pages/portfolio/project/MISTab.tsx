import { useState } from "react";
import { FileSpreadsheet } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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
            <CardHeader title="MIS Intelligence" sub="Automatically surfaced from reporting history" />
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

          <Card>
            <CardHeader title="MIS Trends" sub="Revenue trend across reporting periods" />
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={proj.financials.topline.byMonth} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#8a93a6" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#8a93a6" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #dde1e9" }} />
                  <Area type="monotone" dataKey="revenueM" stroke="#0e5f45" strokeWidth={2} fill="#0e5f45" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="MIS Timeline" sub="Submission history" />
            <div className="h-[280px]">
              <TimelineWidget projectId={proj.id} filterKind="mis-upload" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
