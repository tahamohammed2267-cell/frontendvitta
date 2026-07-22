import { useSyncExternalStore } from "react";
import { portfolioProjects } from "../../../../lib/portfolioData";
import { makeEntityId, type ComparableEntity } from "../../comparisons/comparisonEntities";

// Simple in-memory store (session-only, no backend), same pattern as
// dashboardStore.ts — survives navigation, resets on page reload.

export interface CustomGroup {
  id: string;
  name: string;
  projectIds: string[];
  createdAt: string;
}

// Seed set: only groups honestly derivable from real project fields.
// "Projects above $500M" (no project exceeds ~€284M portfolioValueM) and
// "Brownfield Assets" (no lifecycle field exists) are intentionally NOT
// seeded — nothing backs them. "Construction Phase Assets" is renamed to
// "Under Construction Assets" to match the real ProjectStatus value exactly.
function seedGroups(): CustomGroup[] {
  const renewable = portfolioProjects.filter((p) => p.industryKey !== "infrastructure").map((p) => p.id);
  const european = portfolioProjects.filter((p) => p.regionId.includes("europe")).map((p) => p.id);
  const operational = portfolioProjects.filter((p) => p.status === "Operational").map((p) => p.id);
  const underConstruction = portfolioProjects.filter((p) => p.status === "Under Construction").map((p) => p.id);
  return [
    { id: "cg-renewable", name: "Renewable Energy Portfolio", projectIds: renewable, createdAt: "Jul 1, 2026" },
    { id: "cg-european", name: "European Assets", projectIds: european, createdAt: "Jul 1, 2026" },
    { id: "cg-operational", name: "Operational Assets", projectIds: operational, createdAt: "Jul 1, 2026" },
    { id: "cg-construction", name: "Under Construction Assets", projectIds: underConstruction, createdAt: "Jul 1, 2026" },
  ].filter((g) => g.projectIds.length >= 2); // a group of <2 projects isn't a meaningful comparison target
}

let groups: CustomGroup[] = seedGroups();
const listeners = new Set<() => void>();
function emit() { listeners.forEach((l) => l()); }

export function useCustomGroups() {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => groups
  );
}

export function addCustomGroup(name: string, projectIds: string[]): CustomGroup {
  const group: CustomGroup = { id: `cg-${Date.now()}`, name, projectIds, createdAt: "Just now" };
  groups = [...groups, group];
  emit();
  return group;
}

export function removeCustomGroup(id: string) {
  groups = groups.filter((g) => g.id !== id);
  emit();
}

export function customGroupToEntity(g: CustomGroup): ComparableEntity {
  return { kind: "customGroup", id: makeEntityId("customGroup", g.projectIds.join(",")), refId: g.projectIds.join(","), label: g.name };
}
