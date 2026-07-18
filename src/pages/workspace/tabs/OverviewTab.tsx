import { Link } from "react-router-dom";
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, ArrowUpRight, CheckCircle2, Loader2 } from "lucide-react";
import { actionItems, canonicalFields, documents, revenueProjection, risks } from "../../../lib/mockData";
import { Badge, Card, CardHeader, ConfidenceBar, SourceChip, Stat } from "../../../lib/ui";
import { cn } from "../../../lib/cn";

const keyMetrics = ["f1", "f3", "f13", "f12", "f9", "f8"];
const sevTone = { critical: "red", high: "orange", medium: "orange", low: "gray" } as const;

export default function OverviewTab() {
  const inFlight = documents.filter((d) => d.status !== "done");
  return (
    <div className="space-y-4">
      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        <Card><Stat label="Deal size" value="€96M" sub="70% debt · 30% equity" /></Card>
        <Card>
          <Stat label="Fields confirmed" value="87 / 124" sub="70% of canonical model" />
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-100"><div className="h-full w-[70%] rounded-full bg-accent-600" /></div>
        </Card>
        <Card>
          <Link to="?tab=reconciliation" className="block">
            <Stat label="Open conflicts" value="4" sub="1 critical resolved" trend="down" />
          </Link>
        </Card>
        <Card>
          <Link to="?tab=documents" className="block">
            <Stat label="Documents" value="14 / 19" sub="3 processing now" />
          </Link>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Left 2 cols */}
        <div className="col-span-2 space-y-4">
          {/* Pipeline */}
          <Card>
            <CardHeader
              title="Extraction pipeline"
              sub="Multi-pass AI extraction running asynchronously"
              right={<Badge tone="blue"><Loader2 size={11} className="animate-spin" /> Live</Badge>}
            />
            <div className="space-y-3">
              {inFlight.map((d) => (
                <div key={d.id} className="flex items-center gap-4 rounded-lg border border-ink-100 bg-ink-50/60 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium">{d.name}</p>
                    <p className="mt-0.5 text-[11.5px] capitalize text-accent-700 pulse-soft">{d.status}…</p>
                  </div>
                  <StageStepper status={d.status} />
                  <div className="w-32">
                    <div className="h-1.5 overflow-hidden rounded-full bg-ink-200">
                      <div className="h-full rounded-full bg-accent-600 transition-all" style={{ width: `${d.progress}%` }} />
                    </div>
                    <p className="num mt-1 text-right text-[11px] text-ink-500">{d.progress}%</p>
                  </div>
                </div>
              ))}
              <p className="flex items-center gap-1.5 text-[12px] text-ink-400">
                <CheckCircle2 size={13} className="text-pos-600" /> 11 documents fully extracted — 253 fields, 12 tables, every value cited to page and snippet.
              </p>
            </div>
          </Card>

          {/* Key financials */}
          <Card>
            <CardHeader title="Key financials" sub="Canonical values with provenance — click through for full review" right={<Link to="?tab=extraction" className="flex items-center gap-1 text-[12.5px] font-medium text-accent-600">Review all <ArrowUpRight size={13} /></Link>} />
            <div className="grid grid-cols-3 gap-3">
              {keyMetrics.map((id) => {
                const f = canonicalFields.find((x) => x.id === id)!;
                return (
                  <div key={id} className="rounded-lg border border-ink-100 p-3.5 transition-colors hover:border-ink-200">
                    <div className="flex items-center justify-between">
                      <p className="text-[11.5px] font-medium text-ink-500">{f.field}</p>
                      {f.status === "overridden" && <Badge tone="dark">Overridden</Badge>}
                      {f.status === "computed" && <Badge tone="blue">Computed</Badge>}
                    </div>
                    <p className="num mt-1 text-[20px] font-semibold tracking-tight">{f.value}</p>
                    <div className="mt-2"><ConfidenceBar value={f.confidence} /></div>
                    <div className="mt-2"><SourceChip doc={f.source.doc} page={f.source.page} /></div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Chart */}
          <Card>
            <CardHeader title="Revenue & CFADS projection" sub="P50 case · €M · from extracted assumptions" />
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={revenueProjection} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eceef3" vertical={false} />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#8a93a6" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#8a93a6" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid #dde1e9" }} />
                  <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={22} name="Revenue" />
                  <Line type="monotone" dataKey="cfads" stroke="#059669" strokeWidth={2} dot={false} name="CFADS" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Right col */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="AI findings" sub="Latest from the intelligence layer" right={<Link to="?tab=intelligence" className="text-[12.5px] font-medium text-accent-600">All</Link>} />
            <div className="space-y-3">
              {risks.slice(0, 4).map((r) => (
                <div key={r.id} className="flex gap-2.5">
                  <AlertTriangle size={14} className={cn("mt-0.5 shrink-0", r.severity === "critical" ? "text-crit-600" : "text-warn-600")} />
                  <div>
                    <p className="text-[12.5px] font-medium leading-snug">{r.title}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <Badge tone={sevTone[r.severity]}>{r.severity}</Badge>
                      <span className="text-[11px] text-ink-400">{r.category}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Action items" sub="6 open across the team" />
            <div className="space-y-2.5">
              {actionItems.map((a) => (
                <div key={a.id} className="flex items-start gap-2.5">
                  <span className={cn("mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border", a.done ? "border-pos-600 bg-pos-600" : "border-ink-300")}>
                    {a.done && <CheckCircle2 size={12} className="text-white" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-[12.5px] leading-snug", a.done ? "text-ink-400 line-through" : "text-ink-800")}>{a.text}</p>
                    <p className="mt-0.5 text-[11px] text-ink-400">{a.owner} · due {a.due} · {a.source}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StageStepper({ status }: { status: string }) {
  const stages = ["parsing", "classifying", "extracting"];
  const current = stages.indexOf(status);
  return (
    <div className="hidden items-center gap-1 md:flex">
      {stages.map((s, i) => (
        <div key={s} className="flex items-center gap-1">
          <span className={cn(
            "rounded-full px-2 py-0.5 text-[10.5px] font-medium",
            i < current || status === "done" ? "bg-pos-100 text-pos-700" : i === current ? "bg-accent-100 text-accent-700 pulse-soft" : "bg-ink-100 text-ink-400"
          )}>
            {s}
          </span>
          {i < stages.length - 1 && <span className="h-px w-3 bg-ink-200" />}
        </div>
      ))}
    </div>
  );
}
