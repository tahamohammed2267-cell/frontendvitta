// ─────────────────────────────────────────────────────────────
// MIS Intelligence — rule-based derivation over already-seeded
// misVersions[]/healthFlags/kpis data. No string-parsing of display
// values like "₹150 Cr" — magnitude signals come from numeric fields
// (healthFlags, kpis.yoyGrowthPct, assetHealth.score) that already
// exist; detectedChanges[] is used only for categorical "what changed."
// ─────────────────────────────────────────────────────────────

import type { DetectedChange, PortfolioProject } from "../../../lib/portfolioData";

export interface TrendFinding {
  field: string;
  category: string;
  occurrences: number;
  detail: string;
}

// Same field/category recurring as a DetectedChange across 2+ MIS versions —
// a directly computable, honest signal of a repeated issue.
export function detectRepeatedIssues(project: PortfolioProject): TrendFinding[] {
  const counts = new Map<string, { category: string; count: number }>();
  for (const v of project.misVersions) {
    for (const c of v.detectedChanges) {
      const key = c.field;
      const existing = counts.get(key);
      counts.set(key, { category: c.category, count: (existing?.count ?? 0) + 1 });
    }
  }
  return [...counts.entries()]
    .filter(([, v]) => v.count >= 2)
    .map(([field, v]) => ({
      field, category: v.category, occurrences: v.count,
      detail: `"${field}" has changed across ${v.count} reporting periods — a recurring pattern worth investigating.`,
    }));
}

// Significant movements sourced from numeric, already-present fields —
// not from parsing display strings.
export function significantMovements(project: PortfolioProject) {
  const findings: string[] = [];
  if (Math.abs(project.kpis.yoyGrowthPct) >= 10) {
    findings.push(`Revenue is ${project.kpis.yoyGrowthPct >= 0 ? "up" : "down"} ${Math.abs(project.kpis.yoyGrowthPct)}% year-over-year.`);
  }
  if (project.assetHealth.score < 65) {
    findings.push(`Asset health score of ${project.assetHealth.score} is below the portfolio's 70 threshold.`);
  }
  if (project.assetHealth.openIssues >= 3) {
    findings.push(`${project.assetHealth.openIssues} open issues remain unresolved.`);
  }
  return findings;
}

// Categorical "what changed" — from the most recent MIS version's own
// recorded changes, exactly as already displayed in the upload flow.
export function latestChanges(project: PortfolioProject): DetectedChange[] {
  return project.misVersions[0]?.detectedChanges ?? [];
}

export function newAndResolvedRisks(project: PortfolioProject) {
  return {
    newRiskCount: project.healthFlags.length,
    resolvedCount: 0, // honest limitation: no "previously flagged, now resolved" history is seeded
  };
}
