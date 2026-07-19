import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, FileSpreadsheet, FileText, Gavel, Image as ImageIcon, UploadCloud } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  findCompany, findIndustry, findProject, findRegion, type DetectedChange, type MISFormat, type ProjectDocument,
} from "../../lib/portfolioData";
import { Badge, Button, Card, CardHeader, EmptyState, SeverityBadge, SourceChip, Stat } from "../../lib/ui";
import { cn } from "../../lib/cn";
import InsightsPanel from "./insights/InsightsPanel";
import MISUploadFlow from "./mis/MISUploadFlow";
import AuditTrailPanel from "./mis/AuditTrailPanel";

const docIcon: Record<ProjectDocument["kind"], typeof FileText> = {
  MIS: FileSpreadsheet, "Financial Statement": FileText, Contract: Gavel, "EPC Report": ImageIcon,
};
const statusTone: Record<string, "blue" | "orange" | "green" | "gray" | "red"> = {
  Operational: "green", "Ramp-up": "blue", "Under Construction": "gray", Watch: "orange", "At Risk": "red",
};

export default function ProjectDashboard() {
  const { industry, region, company, project } = useParams();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [auditTrail, setAuditTrail] = useState<{ id: string; at: string; user: string; action: string; detail: string }[] | null>(null);

  const ind = findIndustry(industry ?? "");
  const reg = findRegion(region ?? "");
  const comp = findCompany(company ?? "");
  const proj = findProject(project ?? "");

  if (!ind || !reg || !comp || !proj) {
    return (
      <div className="mx-auto max-w-[1200px] px-6 py-6">
        <EmptyState icon={<ArrowLeft size={20} />} title="Project not found" sub="Choose a project from the region dashboard." />
      </div>
    );
  }

  const trail = auditTrail ?? proj.auditTrail;

  function handleConfirm(changes: DetectedChange[], fileName: string, _format: MISFormat) {
    const accepted = changes.filter((c) => c.decision === "accepted").length;
    const entry = {
      id: `au-new-${Date.now()}`,
      at: "Just now", user: "Jane Moreau", action: "MIS applied",
      detail: `New version — ${accepted} of ${changes.length} detected changes accepted (${fileName})`,
    };
    setAuditTrail([entry, ...trail]);
  }

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-6">
      <Link to={`/portfolio/${ind.key}/${reg.id}`} className="mb-3 inline-flex items-center gap-1 text-[12px] font-medium text-ink-400 hover:text-ink-700 fade-up">
        <ArrowLeft size={13} /> {reg.name}
      </Link>
      <div className="mb-1 flex items-center gap-3 fade-up">
        <h1 className="text-[22px] font-semibold tracking-tight">{proj.name}</h1>
        <Badge tone={statusTone[proj.status]}>{proj.status}</Badge>
      </div>
      <p className="mb-6 text-[12.5px] text-ink-500 fade-up">
        {comp.name} · {proj.country}{proj.capacityMW ? ` · ${proj.capacityMW} MW` : ""} · {ind.name}
        {proj.linkedDealId && <> · <Link to={`/projects/${proj.linkedDealId}`} className="text-accent-600 hover:underline">View diligence workspace</Link></>}
      </p>

      <div className="mb-6 grid grid-cols-4 gap-4 fade-up">
        <Card><Stat label="Portfolio value" value={`€${proj.kpis.portfolioValueM}M`} /></Card>
        <Card><Stat label="Revenue" value={`€${proj.financials.topline.revenueM}M`} sub={`${proj.kpis.yoyGrowthPct >= 0 ? "+" : ""}${proj.kpis.yoyGrowthPct}% YoY`} trend={proj.kpis.yoyGrowthPct >= 0 ? "up" : "down"} /></Card>
        <Card><Stat label="EBITDA" value={`€${proj.financials.earnings.ebitdaM}M`} sub={`${proj.financials.earnings.marginPct}% margin`} /></Card>
        <Card><Stat label="Asset health" value={`${proj.assetHealth.score}`} sub={`${proj.assetHealth.openIssues} open issues`} trend={proj.assetHealth.score >= 80 ? "up" : proj.assetHealth.score < 65 ? "down" : "flat"} /></Card>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-4 fade-up">
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

          <Card>
            <CardHeader title="Operational metrics" sub={`${ind.sector} business drivers`} />
            <div className="grid grid-cols-3 gap-3">
              {proj.drivers.metrics.map((m) => (
                <div key={m.label} className="rounded-lg border border-ink-100 p-3">
                  <p className="text-[11px] font-medium text-ink-500">{m.label}</p>
                  <p className="num mt-1 text-[17px] font-semibold tracking-tight">{m.value.toLocaleString()}{m.unit}</p>
                  {m.target !== undefined && <p className="mt-0.5 text-[10.5px] text-ink-400">Target {m.target}{m.unit}</p>}
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Financial performance" sub="Revenue trend, last 6 months" />
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={proj.financials.topline.byMonth} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
                  <defs>
                    <linearGradient id="pj-rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity={0.22} />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#8a93a6" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#8a93a6" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid #dde1e9" }} />
                  <Area type="monotone" dataKey="revenueM" stroke="#2563eb" strokeWidth={2} fill="url(#pj-rev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-3 text-[12px]">
              <MiniStat label="Cash flow" value={`€${proj.kpis.cashFlowM}M`} />
              <MiniStat label="Debt outstanding" value={`€${proj.kpis.debtOutstandingM}M`} />
              <MiniStat label="Net income" value={`€${proj.financials.earnings.netIncomeM}M`} />
              <MiniStat label="EBIT" value={`€${proj.financials.earnings.ebitM}M`} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Cost breakdown" />
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {([
                ["Maintenance", proj.financials.costs.maintenanceM], ["Payroll", proj.financials.costs.payrollM],
                ["Insurance", proj.financials.costs.insuranceM], ["O&M / Grid charges", proj.financials.costs.opexM],
                ["Contractor costs", proj.financials.costs.capexM], ["Debt service", proj.financials.costs.debtServiceM],
              ] as [string, number][]).map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-lg border border-ink-100 px-3 py-2">
                  <span className="text-[12px] text-ink-600">{label}</span>
                  <span className="num text-[12.5px] font-semibold">€{value}M</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Asset health" sub="Equipment status and maintenance schedule" />
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
            {proj.assetHealth.alerts.length > 0 && (
              <div className="mt-3 space-y-2 border-t border-ink-100 pt-3">
                {proj.assetHealth.alerts.map((a) => (
                  <div key={a.id} className="flex items-start gap-2.5">
                    <SeverityBadge severity={a.severity} />
                    <p className="text-[12px] text-ink-700">{a.text} <span className="text-ink-400">· {a.raisedAt}</span></p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4 fade-up">
          <InsightsPanel scope={proj.id} limit={3} />

          <Card>
            <CardHeader title="Project documents" right={<Button variant="secondary" className="px-2.5 py-1.5 text-[12px]" onClick={() => setUploadOpen(true)}><UploadCloud size={13} /> Upload MIS</Button>} />
            <div className="space-y-2">
              {proj.documents.map((d) => {
                const Icon = docIcon[d.kind];
                return (
                  <div key={d.id} className="flex items-center gap-2.5 rounded-lg border border-ink-100 p-2.5">
                    <Icon size={15} className="shrink-0 text-ink-400" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-medium">{d.name}</p>
                      <p className="mt-0.5 text-[10.5px] text-ink-400">{d.kind} · {d.uploadedBy} · {d.uploadedAt}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {proj.linkedDealId && (
            <Card>
              <CardHeader title="Source deal" sub="This project originated from an approved diligence workspace" />
              <SourceChip doc={`Diligence: ${proj.name}`} page={0} />
              <Link to={`/projects/${proj.linkedDealId}`} className="mt-3 block text-center text-[12.5px] font-medium text-accent-600 hover:underline">Open diligence workspace</Link>
            </Card>
          )}

          <AuditTrailPanel entries={trail} />
        </div>
      </div>

      <MISUploadFlow open={uploadOpen} onClose={() => setUploadOpen(false)} projectName={proj.name} onConfirm={handleConfirm} />
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
