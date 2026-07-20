import { useRef, useState } from "react";
import type { DashboardScope, WidgetConfig, WidgetLayout } from "../../../lib/portfolioData";
import { EmptyState } from "../../../lib/ui";
import { LayoutGrid } from "lucide-react";
import WidgetChrome from "./WidgetChrome";
import WidgetRenderer from "./WidgetRenderer";

const COLS = 12;
const ROW_H = 84; // px, matches grid-auto-rows
const GAP = 12;

function overlaps(a: WidgetLayout, b: WidgetLayout) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export default function DashboardCanvas({
  widgets, scope, scopeId, editable, onChange, onRemove,
}: {
  widgets: WidgetConfig[]; scope: DashboardScope; scopeId: string; editable: boolean;
  onChange?: (id: string, layout: WidgetLayout) => void; onRemove?: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const dragState = useRef<{ id: string; mode: "move" | "resize"; startX: number; startY: number; orig: WidgetLayout } | null>(null);

  function cellSize() {
    const rect = containerRef.current?.getBoundingClientRect();
    const width = rect ? rect.width : 1200;
    return { cw: (width - GAP * (COLS - 1)) / COLS, ch: ROW_H };
  }

  function startDrag(w: WidgetConfig, mode: "move" | "resize", e: React.PointerEvent) {
    if (!editable) return;
    e.preventDefault();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragState.current = { id: w.id, mode, startX: e.clientX, startY: e.clientY, orig: { ...w.layout } };
    setDragId(w.id);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  }

  function onPointerMove(e: PointerEvent) {
    const ds = dragState.current;
    if (!ds) return;
    const { cw, ch } = cellSize();
    const dxCells = Math.round((e.clientX - ds.startX) / (cw + GAP));
    const dyCells = Math.round((e.clientY - ds.startY) / (ch + GAP));

    let next: WidgetLayout = { ...ds.orig };
    if (ds.mode === "move") {
      next.x = Math.max(0, Math.min(COLS - ds.orig.w, ds.orig.x + dxCells));
      next.y = Math.max(0, ds.orig.y + dyCells);
    } else {
      next.w = Math.max(2, Math.min(COLS - ds.orig.x, ds.orig.w + dxCells));
      next.h = Math.max(2, ds.orig.h + dyCells);
    }

    const others = widgets.filter((w) => w.id !== ds.id).map((w) => w.layout);
    const collides = others.some((o) => overlaps(next, o));
    if (!collides) onChange?.(ds.id, next);
  }

  function onPointerUp() {
    dragState.current = null;
    setDragId(null);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  }

  if (widgets.length === 0) {
    return <EmptyState icon={<LayoutGrid size={20} />} title="No widgets yet" sub={editable ? "Use “Add Widget” to build this dashboard." : "This dashboard has no widgets configured."} />;
  }

  const maxY = Math.max(...widgets.map((w) => w.layout.y + w.layout.h), 4);

  return (
    <div
      ref={containerRef}
      className="grid"
      style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridAutoRows: `${ROW_H}px`, gap: `${GAP}px`, minHeight: maxY * (ROW_H + GAP) }}
    >
      {widgets.map((w) => (
        <div
          key={w.id}
          style={{ gridColumn: `${w.layout.x + 1} / span ${w.layout.w}`, gridRow: `${w.layout.y + 1} / span ${w.layout.h}` }}
        >
          <WidgetChrome
            title={w.title}
            editable={editable}
            dragging={dragId === w.id}
            onDragStart={(e) => startDrag(w, "move", e)}
            onResizeStart={(e) => startDrag(w, "resize", e)}
            onRemove={onRemove ? () => onRemove(w.id) : undefined}
          >
            <WidgetRenderer config={w} scope={scope} scopeId={scopeId} />
          </WidgetChrome>
        </div>
      ))}
    </div>
  );
}
