import { Copy, Plus, Trash2 } from "lucide-react";
import type { DashboardDef } from "../../../lib/portfolioData";
import { cn } from "../../../lib/cn";

export default function DashboardTabs({
  dashboards, activeId, onSelect, onCreate, onDuplicate, onDelete,
}: {
  dashboards: DashboardDef[]; activeId: string; onSelect: (id: string) => void;
  onCreate?: () => void; onDuplicate?: (id: string) => void; onDelete?: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {dashboards.map((d) => (
        <div key={d.id} className={cn("group flex items-center gap-1 rounded-lg border px-1", activeId === d.id ? "border-ink-900 bg-ink-900" : "border-ink-200 bg-white hover:border-ink-300")}>
          <button onClick={() => onSelect(d.id)} className={cn("px-2.5 py-1.5 text-[12.5px] font-medium", activeId === d.id ? "text-white" : "text-ink-600")}>
            {d.preset ?? d.name}
          </button>
          {activeId === d.id && (onDuplicate || onDelete) && (
            <div className="flex items-center gap-0.5 pr-1">
              {onDuplicate && <button onClick={() => onDuplicate(d.id)} className="rounded p-1 text-white/70 hover:bg-white/10 hover:text-white"><Copy size={11} /></button>}
              {onDelete && dashboards.length > 1 && <button onClick={() => onDelete(d.id)} className="rounded p-1 text-white/70 hover:bg-white/10 hover:text-white"><Trash2 size={11} /></button>}
            </div>
          )}
        </div>
      ))}
      {onCreate && (
        <button onClick={onCreate} className="flex items-center gap-1 rounded-lg border border-dashed border-ink-300 px-2.5 py-1.5 text-[12px] font-medium text-ink-500 hover:border-ink-400 hover:text-ink-700">
          <Plus size={13} /> New
        </button>
      )}
    </div>
  );
}
