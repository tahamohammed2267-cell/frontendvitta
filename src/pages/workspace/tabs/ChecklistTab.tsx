import { CheckCircle2, Circle, MinusCircle, Plus } from "lucide-react";
import type { ChecklistItem } from "../../../lib/mockData";
import { useStore } from "../../../lib/store";
import { Badge, Button, Card, SectionLabel, SeverityBadge } from "../../../lib/ui";
import { cn } from "../../../lib/cn";

const sevRank = { blocking: 0, important: 1, "nice-to-have": 2 };

export default function ChecklistTab() {
  const checklist = useStore((s) => s.checklist);
  const present = checklist.filter((c) => c.status === "present").length;
  const partial = checklist.filter((c) => c.status === "partial").length;
  const missing = checklist.filter((c) => c.status === "missing").length;
  const pct = Math.round(((present + partial * 0.5) / checklist.length) * 100);

  const docs = sort(checklist.filter((c) => c.kind === "document"));
  const fields = sort(checklist.filter((c) => c.kind === "field"));

  return (
    <div className="space-y-4">
      {/* Readiness */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[15px] font-semibold tracking-tight">Diligence readiness</p>
            <p className="mt-0.5 text-[12.5px] text-ink-500">Generated from the Solar PV Blueprint v4 template — custom items are project-specific.</p>
          </div>
          <div className="flex items-center gap-4">
            <p className="num text-[28px] font-semibold">{pct}%</p>
            <Button variant="secondary"><Plus size={14} /> Add custom requirement</Button>
          </div>
        </div>
        <div className="mt-4 flex h-2.5 gap-0.5 overflow-hidden rounded-full">
          <div className="rounded-l-full bg-pos-600" style={{ width: `${(present / checklist.length) * 100}%` }} />
          <div className="bg-warn-600" style={{ width: `${(partial / checklist.length) * 100}%` }} />
          <div className="rounded-r-full bg-crit-600" style={{ width: `${(missing / checklist.length) * 100}%` }} />
        </div>
        <div className="mt-2 flex gap-5 text-[12px] text-ink-500">
          <span><span className="num font-semibold text-pos-700">{present}</span> present</span>
          <span><span className="num font-semibold text-warn-700">{partial}</span> partial</span>
          <span><span className="num font-semibold text-crit-700">{missing}</span> missing</span>
        </div>
      </Card>

      <div>
        <SectionLabel>Required documents</SectionLabel>
        <Card pad={false} className="overflow-hidden"><Group items={docs} /></Card>
      </div>
      <div>
        <SectionLabel>Required fields</SectionLabel>
        <Card pad={false} className="overflow-hidden"><Group items={fields} /></Card>
      </div>
    </div>
  );
}

function sort(items: ChecklistItem[]) {
  return [...items].sort((a, b) => sevRank[a.severity] - sevRank[b.severity] || a.status.localeCompare(b.status));
}

function Group({ items }: { items: ChecklistItem[] }) {
  return (
    <div className="divide-y divide-ink-100">
      {items.map((c) => (
        <div
          key={c.id}
          className={cn(
            "flex items-center gap-3 px-5 py-3",
            c.status === "missing" && "bg-crit-50/50",
            c.status === "partial" && "bg-warn-50/50"
          )}
        >
          {c.status === "present" && <CheckCircle2 size={17} className="shrink-0 text-pos-600" />}
          {c.status === "partial" && <MinusCircle size={17} className="shrink-0 text-warn-600" />}
          {c.status === "missing" && <Circle size={17} className="shrink-0 text-crit-600" strokeDasharray="3 2" />}
          <span className="text-[13px] font-semibold">{c.label}</span>
          <SeverityBadge severity={c.severity} />
          {c.custom && <Badge tone="blue">Custom</Badge>}
          <span className="ml-auto text-right text-[12px] text-ink-500">{c.note}</span>
        </div>
      ))}
    </div>
  );
}
