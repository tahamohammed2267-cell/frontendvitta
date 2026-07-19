import { useSyncExternalStore } from "react";
import { savedDashboards, type DashboardDef } from "../../../lib/portfolioData";

// simple in-memory store (session-only, no backend) so the builder and the
// static dashboard pages share the same saved-dashboard state.
let dashboards: DashboardDef[] = [...savedDashboards];
const listeners = new Set<() => void>();

function emit() { listeners.forEach((l) => l()); }

export function useDashboards() {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => dashboards
  );
}

export function getDashboard(id: string) {
  return dashboards.find((d) => d.id === id);
}

export function dashboardsForScope(scope: DashboardDef["scope"], scopeId: string) {
  return dashboards.filter((d) => d.scope === scope && d.scopeId === scopeId);
}

export function updateDashboard(id: string, patch: Partial<DashboardDef>) {
  dashboards = dashboards.map((d) => (d.id === id ? { ...d, ...patch, updatedAt: "Just now" } : d));
  emit();
}

export function addDashboard(def: DashboardDef) {
  dashboards = [...dashboards, def];
  emit();
  return def;
}

export function removeDashboard(id: string) {
  dashboards = dashboards.filter((d) => d.id !== id);
  emit();
}

export function duplicateDashboard(id: string) {
  const src = getDashboard(id);
  if (!src) return null;
  const copy: DashboardDef = { ...src, id: `${src.id}-copy-${Date.now()}`, name: `${src.name} (Copy)`, preset: undefined, updatedAt: "Just now" };
  dashboards = [...dashboards, copy];
  emit();
  return copy;
}
