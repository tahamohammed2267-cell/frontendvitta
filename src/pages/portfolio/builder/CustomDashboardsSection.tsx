import { useState } from "react";
import { Link } from "react-router-dom";
import { Pencil } from "lucide-react";
import type { DashboardScope } from "../../../lib/portfolioData";
import { Button, Card, CardHeader } from "../../../lib/ui";
import DashboardTabs from "./DashboardTabs";
import DashboardCanvas from "./DashboardCanvas";
import { addDashboard, dashboardsForScope, duplicateDashboard, removeDashboard, useDashboards } from "./dashboardStore";

export default function CustomDashboardsSection({ scope, scopeId }: { scope: DashboardScope; scopeId: string }) {
  useDashboards();
  const [activeDashId, setActiveDashId] = useState<string | null>(null);
  const dashboards = dashboardsForScope(scope, scopeId);
  const active = dashboards.find((d) => d.id === activeDashId) ?? dashboards[0];

  function handleCreate() {
    const def = addDashboard({
      id: `dash-${scope}-${scopeId}-${Date.now()}`, name: "New Dashboard", scope, scopeId,
      widgets: [], owner: "Jane Moreau", sharedWith: [], updatedAt: "Just now",
    });
    setActiveDashId(def.id);
  }

  if (dashboards.length === 0) {
    return (
      <Card>
        <CardHeader title="Custom dashboards" right={<Button variant="secondary" className="px-2.5 py-1.5 text-[12px]" onClick={handleCreate}>Create dashboard</Button>} />
        <p className="text-[12.5px] text-ink-400">No custom dashboards yet.</p>
      </Card>
    );
  }

  return (
    <Card pad={false}>
      <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
        <DashboardTabs
          dashboards={dashboards}
          activeId={active?.id ?? ""}
          onSelect={setActiveDashId}
          onCreate={handleCreate}
          onDuplicate={(id) => setActiveDashId(duplicateDashboard(id)?.id ?? id)}
          onDelete={(id) => { removeDashboard(id); setActiveDashId(null); }}
        />
        {active && (
          <Link to={`/portfolio/dashboards/${active.id}/edit`}>
            <Button variant="secondary" className="px-2.5 py-1.5 text-[12px]"><Pencil size={12} /> Edit</Button>
          </Link>
        )}
      </div>
      <div className="p-5">
        {active && <DashboardCanvas widgets={active.widgets} scope={active.scope} scopeId={active.scopeId} editable={false} />}
      </div>
    </Card>
  );
}
