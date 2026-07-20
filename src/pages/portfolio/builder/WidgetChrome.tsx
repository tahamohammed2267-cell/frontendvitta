import type { ReactNode } from "react";
import { GripHorizontal, MoveDiagonal, X } from "lucide-react";
import { cn } from "../../../lib/cn";

export default function WidgetChrome({
  title, editable, dragging, onDragStart, onResizeStart, onRemove, children,
}: {
  title: string; editable: boolean; dragging?: boolean;
  onDragStart?: (e: React.PointerEvent) => void; onResizeStart?: (e: React.PointerEvent) => void; onRemove?: () => void;
  children: ReactNode;
}) {
  return (
    <div className={cn("relative flex h-full flex-col rounded-lg border border-ink-200 bg-white shadow-[0_1px_2px_rgba(11,14,20,0.04)]", dragging && "opacity-50 ring-2 ring-accent-600/30")}>
      <div className={cn("flex shrink-0 items-center gap-1.5 border-b border-ink-100 px-3 py-2", editable && "cursor-grab active:cursor-grabbing")} onPointerDown={editable ? onDragStart : undefined}>
        {editable && <GripHorizontal size={13} className="shrink-0 text-ink-300" />}
        <p className="truncate text-[12px] font-semibold text-ink-800">{title}</p>
        {editable && onRemove && (
          <button onClick={onRemove} className="ml-auto rounded p-0.5 text-ink-300 hover:bg-ink-100 hover:text-crit-600"><X size={13} /></button>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-hidden p-3">{children}</div>
      {editable && (
        <div
          onPointerDown={onResizeStart}
          className="absolute bottom-1 right-1 flex h-4 w-4 cursor-se-resize items-center justify-center text-ink-300 hover:text-accent-600"
        >
          <MoveDiagonal size={12} />
        </div>
      )}
    </div>
  );
}
