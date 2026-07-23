import { Link } from "react-router-dom";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowUpRight, FileSpreadsheet, FileText, Gavel, Image as ImageIcon } from "lucide-react";
import type { AuditEntry, Company, Industry, PortfolioProject, Region } from "../../../lib/portfolioData";
import { milestonesForProject, risksForProject, storiesForProject } from "../../../lib/projectIntelligence";
import { Badge, Button, Card, CardHeader, SeverityBadge, Stat } from "../../../lib/ui";
import { cn } from "../../../lib/cn";
import InsightsPanel from "../insights/InsightsPanel";
import AuditTrailPanel from "../mis/AuditTrailPanel";

const docIcon: Record<string, typeof FileText> = {
  MIS: FileSpreadsheet, "Financial Statement": FileText, Contract: Gavel,
};

export default function OverviewTab({
  project: proj, company: comp, industry: ind, auditTrail: trail, onUploadMIS,
}: { project: PortfolioProject; company: Company; industry: Industry; region: Region; auditTrail: AuditEntry[]; onUploadMIS: () => void }) {
  const risks = risksForProject(proj.id);
  const milestones = milestonesForProject(proj.id).filter((m) => m.status === "upcoming" || m.status === "overdue");
  const stories = storiesForProject(proj.id);
  const latestStory = stories[0];
  const revSeries = proj.financials.topline.byMonth.map((m) => m.revenueM);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <Card><Stat label="Portfolio value" value={`€${proj.kpis.portfolioValueM}m`} /></Card>
        <Card><Stat label="Revenue" value={`€${proj.financials.topline.revenueM}m`} series={revSeries} delta={`${proj.kpis.yoyGrowthPct >= 0 ? "+" : ""}${proj.kpis.yoyGrowthPct}%`} sub="YoY" trend={proj.kpis.yoyGrowthPct >= 0 ? "up" : "down"} /></Card>
        <Card><Stat label="EBITDA" value={`€${proj.financials.earnings.ebitdaM}m`} series={revSeries.map((v) => Math.round(v * (proj.financials.earnings.marginPct / 100) * 10) / 10)} sub={`${proj.financials.earnings.marginPct}% margin`} trend="flat" /></Card>
        <Card><Stat label="Asset health" value={`${proj.assetHealth.score}`} sub={`${proj.assetHealth.openIssues} open issues`} trend={proj.assetHealth.score >= 80 ? "up" : proj.assetHealth.score < 65 ? "down" : "flat"} /></Card>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-4">
          {proj.healthFlags.length > 0 && (
            <Card className="border-crit-100 bg-crit-50/40">
              <CardHeader title="Active health flags" />
              <div className="space-y-2">
                {proj.healthFlags.map((f) => (
                  <div key={f.rule} className="flex items-start gap-2.5">
                    <SeverityBadge severity={f.severity} />
                    <div><p className="text-[12.5px] font-medium">{f.label}</p><p className="mt-0.5 text-[11.5px] text-ink-600">{f.detail}</p></div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {latestStory && (
            <Card className="border-accent-100 bg-accent-50/40">
              <CardHeader title="Project Story" sub={latestStory.period} right={<Link to="?tab=story" className="flex items-center gap-1 text-[12.5px] font-medium text-accent-600">Read full story <ArrowUpRight size={13} /></Link>} />
              <p className="text-[13px] leading-relaxed text-ink-700">{latestStory.narrative.split(". ").slice(0, 2).join(". ")}.</p>
            </Card>
          )}

          <Card>
            <CardHeader title="Operational metrics" right={<Link to="?tab=business-drivers" className="text-[12.5px] font-medium text-accent-600">All <ArrowUpRight size={13} className="inline" /></Link>} />
            <div className="grid grid-cols-3 gap-3">
              {proj.drivers.metrics.map((m) => (
                <div key={m.label} className="rounded-lg border border-ink-100 p-3">
                  <p className="text-[11px] font-medium text-ink-500">{m.label}</p>
                  <p className="num mt-1 break-words text-[17px] font-semibold leading-tight tracking-tight">{m.value.toLocaleString()}{m.unit}</p>
                  {m.target !== undefined && <p className="mt-0.5 text-[10.5px] text-ink-400">Target {m.target}{m.unit}</p>}
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Financial performance" right={<Link to="?tab=financials" className="text-[12.5px] font-medium text-accent-600">Full financials <ArrowUpRight size={13} className="inline" /></Link>} />
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
            <div className="mt-4 grid grid-cols-4 gap-3 text-[12px]">
              <MiniStat label="Cash flow" value={`€${proj.kpis.cashFlowM}m`} />
              <MiniStat label="Debt outstanding" value={`€${proj.kpis.debtOutstandingM}m`} />
              <MiniStat label="Net income" value={`€${proj.financials.earnings.netIncomeM}m`} />
              <MiniStat label="EBIT" value={`€${proj.financials.earnings.ebitM}m`} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Cost breakdown" right={<Link to="?tab=financials" className="text-[12.5px] font-medium text-accent-600">Details <ArrowUpRight size={13} className="inline" /></Link>} />
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {([
                ["Maintenance", proj.financials.costs.maintenanceM], ["Payroll", proj.financials.costs.payrollM],
                ["Insurance", proj.financials.costs.insuranceM], ["O&M / Grid charges", proj.financials.costs.opexM],
                ["Contractor costs", proj.financials.costs.capexM], ["Debt service", proj.financials.costs.debtServiceM],
              ] as [string, number][]).map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-lg border border-ink-100 px-3 py-2">
                  <span className="text-[12px] text-ink-600">{label}</span>
                  <span className="num text-[12.5px] font-semibold">€{value}m</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Asset health" right={<Link to="?tab=asset-health" className="text-[12.5px] font-medium text-accent-600">Full view <ArrowUpRight size={13} className="inline" /></Link>} />
            <div className="space-y-2">
              {proj.assetHealth.equipment.map((eq) => (
                <div key={eq.name} className="flex items-center gap-3 rounded-lg border border-ink-100 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] font-medium">{eq.name}</p>
                    <p className="mt-0.5 text-[11px] text-ink-500">Next maintenance: {eq.nextMaintenance}</p>
                  </div>
                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-ink-100">
                    <div className={cn("h-full rounded-full", eq.health >= 80 ? "bg-pos-600" : eq.health >= 60 ? "bg-warn-600" : "bg-crit-600")} style={{ width: `${eq.health}%` }} />
                  </div>
                  <span className="num w-9 text-right text-[12px] font-semibold">{eq.health}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <InsightsPanel scope={proj.id} limit={3} />

          {risks.length > 0 && (
            <Card>
              <CardHeader title="Risks" right={<Link to="?tab=risks" className="text-[12.5px] font-medium text-accent-600">All <ArrowUpRight size={13} className="inline" /></Link>} />
              <div className="space-y-2">
                {risks.slice(0, 3).map((r) => (
                  <div key={r.id} className="flex items-start gap-2">
                    <SeverityBadge severity={r.severity} />
                    <p className="text-[12px] leading-snug text-ink-700">{r.text}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {milestones.length > 0 && (
            <Card>
              <CardHeader title="Upcoming milestones" />
              <div className="space-y-2.5">
                {milestones.slice(0, 4).map((m) => (
                  <div key={m.id} className="flex items-start gap-2.5">
                    <span className={cn("mt-1 h-1.5 w-1.5 shrink-0 rounded-full", m.status === "overdue" ? "bg-crit-600" : "bg-accent-600")} />
                    <div className="min-w-0">
                      <p className="text-[12.5px] text-ink-800">{m.label}</p>
                      <p className="mt-0.5 text-[11px] text-ink-400">{m.date}{m.status === "overdue" ? " · overdue" : ""}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card>
            <CardHeader
              title="Documents" sub={`${proj.documents.length} on file`}
              right={
                <div className="flex items-center gap-2">
                  <Button variant="secondary" className="px-2 py-1 text-[11px]" onClick={onUploadMIS}>Upload MIS</Button>
                  <Link to="?tab=documents" className="text-[12.5px] font-medium text-accent-600">All <ArrowUpRight size={13} className="inline" /></Link>
                </div>
              }
            />
            <div className="space-y-2">
              {proj.documents.slice(0, 4).map((d) => {
                const Icon = docIcon[d.kind] ?? ImageIcon;
                return (
                  <div key={d.id} className="flex items-center gap-2.5 rounded-lg border border-ink-100 p-2.5">
                    <Icon size={15} className="shrink-0 text-ink-400" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-medium">{d.name}</p>
                      <p className="mt-0.5 text-[10.5px] text-ink-400">{d.kind}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {proj.linkedDealId && (
            <Card>
              <CardHeader title="Source deal" />
              <Badge tone="gray">{proj.name}</Badge>
              <Link to={`/projects/${proj.linkedDealId}`} className="mt-3 block text-center text-[12.5px] font-medium text-accent-600 hover:underline">Open diligence workspace</Link>
            </Card>
          )}

          <AuditTrailPanel entries={trail} />
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-ink-500">{label}</p>
      <p className="num mt-0.5 text-[14px] font-semibold">{value}</p>
    </div>
  );
}
