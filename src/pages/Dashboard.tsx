import { Link } from "react-router-dom";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowUpRight, FileUp, Plus, Sparkles, Sun, Wind, Building2, AlertTriangle } from "lucide-react";
import { knowledgeGrowth, projects } from "../lib/mockData";
import { Badge, Card, CardHeader, Stat } from "../lib/ui";
import { cn } from "../lib/cn";

const techIcon = { Solar: Sun, Wind: Wind, Infrastructure: Building2 };
const statusTone: Record<string, "blue" | "orange" | "green" | "gray"> = {
  "In Diligence": "blue", "IC Review": "orange", Approved: "green", Passed: "gray", Closed: "green",
};

const activity = [
  { who: "R. Chen", what: "uploaded Environmental_Impact_Study.pdf", meta: "Extraction 64% complete", when: "2h ago", project: "Project Helios" },
  { who: "J. Moreau", what: "overrode PPA Tariff → €52.40/MWh", meta: "Reason logged", when: "Jul 16", project: "Project Helios" },
  { who: "A. Lindqvist", what: "generated IC Memo v2 (Word + PDF)", meta: "16 sections", when: "Jul 17", project: "Project Helios" },
  { who: "Vitta AI", what: "flagged tariff below term-sheet floor", meta: "Critical risk", when: "Jul 16", project: "Project Helios" },
  { who: "S. Okafor", what: "created workspace Meridian Retail Park", meta: "Infrastructure · UK", when: "Jul 15", project: "Meridian" },
  { who: "M. Ferreira", what: "closed Atlas Student Living", meta: "Approved · €58M", when: "Jul 14", project: "Atlas" },
];

export default function Dashboard() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-6">
      {/* Header */}
      <div className="mb-6 flex items-end justify-between fade-up">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight">Good morning, Jane</h1>
          <p className="mt-1 text-[13px] text-ink-500">Friday, July 18 · 4 active deals · 3 documents still processing</p>
        </div>
        <div className="flex gap-2">
          <Link to="/projects/new" className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3.5 py-2 text-[13px] font-medium text-ink-800 hover:bg-ink-50">
            <FileUp size={15} /> Upload documents
          </Link>
          <Link to="/projects/new" className="inline-flex items-center gap-1.5 rounded-lg bg-accent-600 px-3.5 py-2 text-[13px] font-medium text-white hover:bg-accent-700">
            <Plus size={15} /> New Deal
          </Link>
        </div>
      </div>

      {/* KPI row */}
      <div className="mb-6 grid grid-cols-4 gap-4 fade-up">
        <Card><Stat label="Active deals" value="4" sub="+2 this quarter" trend="up" /></Card>
        <Card><Stat label="In IC review" value="1" sub="Boreas · memo draft" /></Card>
        <Card><Stat label="Canonical fields" value="9,640" sub="across 19 deals" trend="up" /></Card>
        <Card><Stat label="Open conflicts" value="11" sub="4 on Project Helios" trend="down" /></Card>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Active deals */}
        <div className="col-span-2 space-y-4 fade-up">
          <Card pad={false}>
            <div className="flex items-center justify-between px-5 pt-4 pb-3">
              <h3 className="text-[15px] font-semibold tracking-tight">Active deals</h3>
              <Link to="/projects" className="flex items-center gap-1 text-[12.5px] font-medium text-accent-600 hover:text-accent-700">
                View all <ArrowUpRight size={13} />
              </Link>
            </div>
            <div className="divide-y divide-ink-100">
              {projects.filter((p) => p.status !== "Passed").map((p) => {
                const Icon = techIcon[p.technology];
                const docPct = Math.round((p.docsUploaded / p.docsTotal) * 100);
                const fieldPct = Math.round((p.fieldsConfirmed / p.fieldsTotal) * 100);
                return (
                  <Link key={p.id} to={`/projects/${p.id}`} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-ink-50">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-600">
                      <Icon size={17} strokeWidth={1.8} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-[13.5px] font-semibold">{p.name}</span>
                        <Badge tone={statusTone[p.status]}>{p.status}</Badge>
                      </div>
                      <p className="mt-0.5 text-[12px] text-ink-500">
                        {p.technology}{p.infraSubType ? ` · ${p.infraSubType}` : ""} · {p.country}
                        {p.capacityMW ? ` · ${p.capacityMW} MW` : ""} · {p.lead}
                      </p>
                    </div>
                    <div className="hidden w-40 space-y-1.5 lg:block">
                      <Progress label="Docs" pct={docPct} />
                      <Progress label="Fields" pct={fieldPct} />
                    </div>
                    <div className="w-20 text-right">
                      <p className="num text-[15px] font-semibold">€{p.dealSizeM}M</p>
                      {p.openConflicts > 0 && <p className="text-[11px] text-warn-700">{p.openConflicts} conflicts</p>}
                    </div>
                  </Link>
                );
              })}
            </div>
          </Card>

          {/* Knowledge growth */}
          <Card>
            <CardHeader
              title="Firm knowledge growth"
              sub="Canonical fields extracted across all deals — compounding with every transaction"
              right={<Badge tone="green">+24% this month</Badge>}
            />
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={knowledgeGrowth} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
                  <defs>
                    <linearGradient id="kg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity={0.22} />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#8a93a6" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#8a93a6" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid #dde1e9" }} />
                  <Area type="monotone" dataKey="fields" stroke="#2563eb" strokeWidth={2} fill="url(#kg)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4 fade-up">
          <Card>
            <CardHeader title="Ask Vitta" sub="Across every deal, document and field" />
            <Link to="/search" className="flex items-center gap-2 rounded-lg border border-ink-200 bg-ink-50 px-3 py-2.5 text-[12.5px] text-ink-400 hover:border-ink-300">
              <Sparkles size={14} className="text-accent-600" /> Compare Helios to past solar deals…
            </Link>
            <div className="mt-3 space-y-1.5">
              {["Summarize open critical risks", "Draft sponsor questions for Helios"].map((q) => (
                <p key={q} className="cursor-pointer rounded-md px-2 py-1.5 text-[12px] text-ink-500 hover:bg-ink-50">{q}</p>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Open risks by severity" sub="Across active deals" />
            <div className="space-y-2.5">
              {[
                { label: "Critical", n: 3, color: "bg-crit-600", w: "30%" },
                { label: "High", n: 9, color: "bg-warn-600", w: "62%" },
                { label: "Medium", n: 17, color: "bg-warn-600/50", w: "85%" },
                { label: "Low", n: 14, color: "bg-ink-300", w: "70%" },
              ].map((r) => (
                <div key={r.label} className="flex items-center gap-3">
                  <span className="w-14 text-[12px] text-ink-500">{r.label}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100">
                    <div className={cn("h-full rounded-full", r.color)} style={{ width: r.w }} />
                  </div>
                  <span className="num w-6 text-right text-[12px] font-semibold">{r.n}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Recent activity" />
            <div className="space-y-3.5">
              {activity.map((a, i) => (
                <div key={i} className="flex gap-2.5">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-100 text-[9.5px] font-semibold text-ink-600">
                    {a.who === "Vitta AI" ? <AlertTriangle size={11} /> : a.who.split(" ").map((s) => s[0]).join("")}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12.5px] leading-snug text-ink-800">
                      <span className="font-medium">{a.who}</span> {a.what}
                    </p>
                    <p className="mt-0.5 text-[11px] text-ink-400">{a.project} · {a.when}</p>
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

function Progress({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-9 text-[10.5px] text-ink-400">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-100">
        <div className={cn("h-full rounded-full", pct === 100 ? "bg-pos-600" : "bg-accent-600")} style={{ width: `${pct}%` }} />
      </div>
      <span className="num w-8 text-right text-[10.5px] text-ink-500">{pct}%</span>
    </div>
  );
}
