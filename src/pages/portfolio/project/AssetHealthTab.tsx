import type { PortfolioProject } from "../../../lib/portfolioData";
import { inspectionsForProject } from "../../../lib/projectIntelligence";
import { Badge, Card, CardHeader, SeverityBadge, Stat } from "../../../lib/ui";
import { cn } from "../../../lib/cn";

const inspectionTone: Record<string, "green" | "orange" | "red" | "blue"> = {
  "up-to-date": "green", due: "orange", overdue: "red", scheduled: "blue",
};
const inspectionLabel: Record<string, string> = {
  "up-to-date": "Up to date", due: "Due", overdue: "Overdue", scheduled: "Scheduled",
};

export default function AssetHealthTab({ project: proj }: { project: PortfolioProject }) {
  const inspections = inspectionsForProject(proj.id);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <Card><Stat label="Asset score" value={`${proj.assetHealth.score}`} /></Card>
        <Card><Stat label="Open issues" value={`${proj.assetHealth.openIssues}`} /></Card>
        <Card><Stat label="Equipment tracked" value={`${proj.assetHealth.equipment.length}`} /></Card>
        <Card><Stat label="Active alerts" value={`${proj.assetHealth.alerts.length}`} /></Card>
      </div>

      <Card>
        <CardHeader title="Equipment health" sub="Maintenance status and downtime risk" />
        <div className="space-y-2">
          {proj.assetHealth.equipment.map((eq) => (
            <div key={eq.name} className="flex items-center gap-3 rounded-lg border border-ink-100 p-3">
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-medium">{eq.name}</p>
                <p className="mt-0.5 text-[11px] text-ink-500">Next maintenance: {eq.nextMaintenance}</p>
              </div>
              <div className="h-1.5 w-28 overflow-hidden rounded-full bg-ink-100">
                <div className={cn("h-full rounded-full", eq.health >= 80 ? "bg-pos-600" : eq.health >= 60 ? "bg-warn-600" : "bg-crit-600")} style={{ width: `${eq.health}%` }} />
              </div>
              <span className="num w-9 text-right text-[12px] font-semibold">{eq.health}</span>
            </div>
          ))}
        </div>
      </Card>

      {inspections.length > 0 && (
        <Card>
          <CardHeader title="Inspection status" />
          <div className="space-y-2">
            {inspections.map((i) => (
              <div key={i.equipmentName} className="flex items-center justify-between rounded-lg border border-ink-100 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-[12.5px] font-medium">{i.equipmentName}</p>
                  <p className="text-[11px] text-ink-500">Last inspected {i.lastInspected} · Next due {i.nextDue}</p>
                </div>
                <Badge tone={inspectionTone[i.status]}>{inspectionLabel[i.status]}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {proj.assetHealth.alerts.length > 0 && (
        <Card>
          <CardHeader title="Active alerts" />
          <div className="space-y-2">
            {proj.assetHealth.alerts.map((a) => (
              <div key={a.id} className="flex items-start gap-2.5">
                <SeverityBadge severity={a.severity} />
                <p className="text-[12px] text-ink-700">{a.text} <span className="text-ink-400">· {a.raisedAt}</span></p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
