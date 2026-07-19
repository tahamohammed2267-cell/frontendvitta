import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, Plus, Search, Sun, Wind } from "lucide-react";
import { projects, type Project } from "../lib/mockData";
import { Badge, Button, Card } from "../lib/ui";
import { cn } from "../lib/cn";

const statusTone: Record<string, "blue" | "orange" | "green" | "gray"> = {
  "In Diligence": "blue", "IC Review": "orange", Approved: "green", Passed: "gray", Closed: "green",
};
const filters = ["All", "In Diligence", "IC Review", "Approved", "Passed"] as const;
const techIcon = { Solar: Sun, Wind: Wind, Infrastructure: Building2 };

export default function Projects() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const rows = projects.filter(
    (p) => (filter === "All" || p.status === filter) && p.name.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-6">
      <div className="mb-5 flex items-center justify-between fade-up">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Deals</h1>
          <p className="mt-0.5 text-[13px] text-ink-500">{projects.length} transactions · {projects.filter((p) => p.status === "In Diligence").length} in diligence</p>
        </div>
        <Link to="/projects/new"><Button><Plus size={15} /> New Deal</Button></Link>
      </div>

      <div className="mb-4 flex items-center justify-between gap-3 fade-up">
        <div className="flex gap-1 rounded-lg border border-ink-200 bg-white p-1">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-md px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                filter === f ? "bg-ink-900 text-white" : "text-ink-500 hover:text-ink-900"
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search deals…"
            className="w-56 rounded-lg border border-ink-200 bg-white py-2 pl-8 pr-3 text-[13px] outline-none placeholder:text-ink-400 focus:border-accent-500"
          />
        </div>
      </div>

      <Card pad={false} className="fade-up overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-ink-100 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-400">
              <th className="px-5 py-3">Deal</th>
              <th className="px-4 py-3">Country</th>
              <th className="px-4 py-3">Capacity</th>
              <th className="px-4 py-3">Documents</th>
              <th className="px-4 py-3">Fields</th>
              <th className="px-4 py-3">Conflicts</th>
              <th className="px-4 py-3">Risks</th>
              <th className="px-4 py-3 text-right">Deal size</th>
              <th className="px-5 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {rows.map((p) => <Row key={p.id} p={p} onClick={() => navigate(`/projects/${p.id}`)} />)}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function Row({ p, onClick }: { p: Project; onClick: () => void }) {
  const Icon = techIcon[p.technology];
  const risk = p.openRisks;
  return (
    <tr onClick={onClick} className="cursor-pointer transition-colors hover:bg-ink-50">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-100 text-ink-600"><Icon size={15} strokeWidth={1.8} /></div>
          <div>
            <p className="text-[13.5px] font-semibold">{p.name}</p>
            <p className="text-[11.5px] text-ink-400">{p.technology}{p.infraSubType ? ` · ${p.infraSubType}` : ""} · {p.lead}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5 text-[13px] text-ink-600">{p.country}</td>
      <td className="num px-4 py-3.5 text-[13px] text-ink-600">{p.capacityMW ? `${p.capacityMW} MW` : "—"}</td>
      <td className="px-4 py-3.5"><MiniBar done={p.docsUploaded} total={p.docsTotal} /></td>
      <td className="px-4 py-3.5"><MiniBar done={p.fieldsConfirmed} total={p.fieldsTotal} /></td>
      <td className="px-4 py-3.5">
        {p.openConflicts > 0 ? <Badge tone="orange">{p.openConflicts} open</Badge> : <span className="text-[12px] text-ink-300">—</span>}
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1">
          {risk.critical > 0 && <Dot c="bg-crit-600" n={risk.critical} />}
          {risk.high > 0 && <Dot c="bg-warn-600" n={risk.high} />}
          {risk.critical + risk.high === 0 && <span className="text-[12px] text-pos-700">Clean</span>}
        </div>
      </td>
      <td className="num px-4 py-3.5 text-right text-[13.5px] font-semibold">€{p.dealSizeM}m</td>
      <td className="px-5 py-3.5 text-right"><Badge tone={statusTone[p.status]}>{p.status}</Badge></td>
    </tr>
  );
}

function MiniBar({ done, total }: { done: number; total: number }) {
  const pct = Math.round((done / total) * 100);
  return (
    <div className="flex w-24 items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-100">
        <div className={cn("h-full rounded-full", pct === 100 ? "bg-pos-600" : "bg-accent-600")} style={{ width: `${pct}%` }} />
      </div>
      <span className="num text-[11px] text-ink-500">{done}/{total}</span>
    </div>
  );
}

function Dot({ c, n }: { c: string; n: number }) {
  return (
    <span className="flex items-center gap-1 rounded-md bg-ink-50 px-1.5 py-0.5">
      <span className={cn("h-1.5 w-1.5 rounded-full", c)} />
      <span className="num text-[11px] font-medium text-ink-600">{n}</span>
    </span>
  );
}
