import { useState } from "react";
import { GitCompare } from "lucide-react";
import type { MISVersion } from "../../../lib/portfolioData";
import { Badge, Button, Card } from "../../../lib/ui";
import { cn } from "../../../lib/cn";

const statusTone: Record<MISVersion["status"], "green" | "orange" | "blue"> = {
  applied: "green", "partially-applied": "orange", "pending-review": "blue",
};

export default function MISVersionHistory({ versions, onCompare }: { versions: MISVersion[]; onCompare: (a: MISVersion, b: MISVersion) => void }) {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length < 2 ? [...s, id] : [s[1], id]));
  }

  function compare() {
    if (selected.length !== 2) return;
    const a = versions.find((v) => v.id === selected[0]);
    const b = versions.find((v) => v.id === selected[1]);
    if (a && b) {
      const [older, newer] = a.version <= b.version ? [a, b] : [b, a];
      onCompare(older, newer);
    }
  }

  return (
    <Card pad={false}>
      <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
        <div>
          <p className="text-[15px] font-semibold tracking-tight">MIS history</p>
          <p className="mt-0.5 text-[12.5px] text-ink-500">Every uploaded MIS report — select 2 versions to compare.</p>
        </div>
        <Button className={selected.length !== 2 ? "pointer-events-none opacity-40" : ""} onClick={compare}><GitCompare size={14} /> Compare selected</Button>
      </div>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-ink-100 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-400">
            <th className="w-10 px-5 py-3" />
            <th className="px-4 py-3">Version</th>
            <th className="px-4 py-3">Reporting period</th>
            <th className="px-4 py-3">Uploaded</th>
            <th className="px-4 py-3">By</th>
            <th className="px-5 py-3 text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {[...versions].sort((a, b) => b.version - a.version).map((v) => (
            <tr key={v.id} className={cn("transition-colors", selected.includes(v.id) && "bg-accent-50/50")}>
              <td className="px-5 py-3">
                <input type="checkbox" checked={selected.includes(v.id)} onChange={() => toggle(v.id)} className="h-3.5 w-3.5 rounded border-ink-300 accent-accent-600" />
              </td>
              <td className="num px-4 py-3 text-[12.5px] font-semibold">v{v.version}</td>
              <td className="px-4 py-3 text-[12.5px] text-ink-600">{v.reportingPeriod ?? "—"}</td>
              <td className="px-4 py-3 text-[12.5px] text-ink-500">{v.uploadedAt}</td>
              <td className="px-4 py-3 text-[12.5px] text-ink-500">{v.uploadedBy}</td>
              <td className="px-5 py-3 text-right"><Badge tone={statusTone[v.status]}>{v.status.replace("-", " ")}</Badge></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
