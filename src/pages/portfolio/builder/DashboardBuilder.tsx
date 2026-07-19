import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Share2 } from "lucide-react";
import { portfolioLabelLookup, type WidgetConfig, type WidgetLayout } from "../../../lib/portfolioData";
import { Badge, Button, EmptyState } from "../../../lib/ui";
import DashboardCanvas from "./DashboardCanvas";
import AddWidgetModal from "./AddWidgetModal";
import ShareDashboardModal from "./ShareDashboardModal";
import { getDashboard, updateDashboard, useDashboards } from "./dashboardStore";

let idSeq = 1000;

export default function DashboardBuilder() {
  const { dashboardId } = useParams();
  const navigate = useNavigate();
  useDashboards(); // subscribe so edits re-render
  const [addOpen, setAddOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const dash = dashboardId ? getDashboard(dashboardId) : undefined;

  if (!dash) {
    return (
      <div className="mx-auto max-w-[1200px] px-6 py-6">
        <EmptyState icon={<ArrowLeft size={20} />} title="Dashboard not found" sub="This dashboard may have been removed." />
      </div>
    );
  }

  const d = dash;

  function backHref() {
    if (d.scope === "health") return "/portfolio/health";
    if (d.scope === "industry") return `/portfolio/${d.scopeId}`;
    if (d.scope === "region") {
      // scopeId is a region id — region id encodes industry prefix in our seed data (e.g. "solar-india")
      const industry = d.scopeId.split("-")[0];
      return `/portfolio/${industry}/${d.scopeId}`;
    }
    return "/portfolio";
  }

  function handleLayoutChange(id: string, layout: WidgetLayout) {
    const widgets = d.widgets.map((w) => (w.id === id ? { ...w, layout } : w));
    updateDashboard(d.id, { widgets });
  }

  function handleRemove(id: string) {
    updateDashboard(d.id, { widgets: d.widgets.filter((w) => w.id !== id) });
  }

  function handleAdd(input: Omit<WidgetConfig, "id" | "layout">) {
    idSeq += 1;
    const maxY = d.widgets.length ? Math.max(...d.widgets.map((w) => w.layout.y + w.layout.h)) : 0;
    const widget: WidgetConfig = { ...input, id: `w${idSeq}`, layout: { x: 0, y: maxY, w: 4, h: 3 } };
    updateDashboard(d.id, { widgets: [...d.widgets, widget] });
  }

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-6">
      <Link to={backHref()} className="mb-3 inline-flex items-center gap-1 text-[12px] font-medium text-ink-400 hover:text-ink-700">
        <ArrowLeft size={13} /> {dash.scope === "health" ? "Health Center" : portfolioLabelLookup(dash.scopeId) ?? "Portfolio"}
      </Link>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-[22px] font-semibold tracking-tight">{dash.name}</h1>
          <Badge tone="blue">Editing</Badge>
          {dash.sharedWith.length > 0 && <Badge tone="gray">Shared with {dash.sharedWith.length}</Badge>}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShareOpen(true)}><Share2 size={14} /> Share</Button>
          <Button variant="secondary" onClick={() => setAddOpen(true)}><Plus size={14} /> Add Widget</Button>
          <Button onClick={() => navigate(backHref())}>Save dashboard</Button>
        </div>
      </div>

      <DashboardCanvas widgets={dash.widgets} scope={dash.scope} scopeId={dash.scopeId} editable onChange={handleLayoutChange} onRemove={handleRemove} />

      <AddWidgetModal open={addOpen} onClose={() => setAddOpen(false)} onAdd={handleAdd} />
      <ShareDashboardModal
        open={shareOpen} onClose={() => setShareOpen(false)} dashboardName={dash.name}
        sharedWith={dash.sharedWith} onChange={(users) => updateDashboard(dash.id, { sharedWith: users })}
      />
    </div>
  );
}
