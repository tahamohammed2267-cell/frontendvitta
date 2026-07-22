// ─────────────────────────────────────────────────────────────
// Cross-deal patterns — backs the Intelligence page's Pattern
// Library only. Unlike src/lib/intelligence/patterns.ts (Helios-
// only diligence findings, still used by Playbooks/Recommendations/
// Search), these patterns are computed directly from Portfolio
// Monitoring's real, live portfolio: recurring health-flag rules
// across portfolioProjects (14 real projects, 3 industries, 7
// regions) and recurring regional-risk categories across all 7
// regions. A "pattern" here means a signal that actually recurs
// across 2+ deals/regions — nothing is hand-authored or invented;
// every pattern is a computed aggregation over real seed data, and
// the module caps itself at the 5 highest-signal results.
// ─────────────────────────────────────────────────────────────

import {
  industries, portfolioProjects, regionalRisks, regions,
  type HealthFlagRule, type IndustryKey, type Severity,
} from "../portfolioData";

export interface PatternDealHit {
  projectId: string;
  projectName: string;
  industryKey: IndustryKey;
  regionId: string;
  regionName: string;
  severity: Severity;
  detail: string;
}

export interface CrossDealPattern {
  id: string;
  title: string;
  metricLabel: string; // short axis/column label for charts
  hits: PatternDealHit[];
  industriesAffected: IndustryKey[];
  regionsAffected: string[];
  severityCounts: Record<Severity, number>;
}

const flagTitles: Record<HealthFlagRule, string> = {
  revenueDown10: "Revenue decline >10%",
  ebitdaMarginBelowTarget: "EBITDA margin below target",
  generationBelowForecast: "Generation below forecast",
  highMaintenanceCost: "High maintenance cost",
  misOverdue: "MIS reporting overdue",
  missingData: "Missing KPI data",
  covenantBreach: "Covenant breach",
  lowAssetHealth: "Low asset health score",
};

function regionName(regionId: string) {
  return regions.find((r) => r.id === regionId)?.name ?? regionId;
}

function buildFlagPatterns(): CrossDealPattern[] {
  const byRule = new Map<HealthFlagRule, PatternDealHit[]>();
  for (const p of portfolioProjects) {
    for (const flag of p.healthFlags) {
      const hit: PatternDealHit = {
        projectId: p.id, projectName: p.name, industryKey: p.industryKey,
        regionId: p.regionId, regionName: regionName(p.regionId),
        severity: flag.severity, detail: flag.detail,
      };
      byRule.set(flag.rule, [...(byRule.get(flag.rule) ?? []), hit]);
    }
  }
  return [...byRule.entries()]
    .filter(([, hits]) => hits.length >= 2) // a "pattern" recurs across at least 2 deals
    .map(([rule, hits]) => {
      const severityCounts: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0 };
      for (const h of hits) severityCounts[h.severity]++;
      return {
        id: `flag-${rule}`,
        title: flagTitles[rule],
        metricLabel: flagTitles[rule],
        hits,
        industriesAffected: [...new Set(hits.map((h) => h.industryKey))],
        regionsAffected: [...new Set(hits.map((h) => h.regionName))],
        severityCounts,
      };
    });
}

function buildRegionalRiskPattern(): CrossDealPattern | null {
  const byCategory = new Map<string, { regionId: string; severity: Severity; text: string }[]>();
  for (const [regionId, risks] of Object.entries(regionalRisks)) {
    for (const r of risks) byCategory.set(r.category, [...(byCategory.get(r.category) ?? []), { regionId, severity: r.severity, text: r.text }]);
  }
  const [topCategory, entries] = [...byCategory.entries()].sort((a, b) => b[1].length - a[1].length)[0] ?? [null, []];
  if (!topCategory || entries.length < 2) return null;

  const hits: PatternDealHit[] = entries.map((e) => {
    const region = regions.find((r) => r.id === e.regionId);
    return {
      projectId: e.regionId, projectName: region?.name ?? e.regionId,
      industryKey: (region?.industryKey ?? "solar") as IndustryKey,
      regionId: e.regionId, regionName: region?.name ?? e.regionId,
      severity: e.severity, detail: e.text,
    };
  });
  const severityCounts: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const h of hits) severityCounts[h.severity]++;
  return {
    id: `regional-${topCategory.toLowerCase()}`,
    title: `${topCategory} risk recurring across regions`,
    metricLabel: topCategory,
    hits,
    industriesAffected: [...new Set(hits.map((h) => h.industryKey))],
    regionsAffected: [...new Set(hits.map((h) => h.regionName))],
    severityCounts,
  };
}

const severityWeight: Record<Severity, number> = { critical: 4, high: 3, medium: 2, low: 1 };

function signalScore(p: CrossDealPattern) {
  const severitySum = p.hits.reduce((a, h) => a + severityWeight[h.severity], 0);
  return p.hits.length * 10 + p.industriesAffected.length * 5 + severitySum;
}

export const crossDealPatterns: CrossDealPattern[] = [...buildFlagPatterns(), buildRegionalRiskPattern()]
  .filter((p): p is CrossDealPattern => p !== null)
  .sort((a, b) => signalScore(b) - signalScore(a))
  .slice(0, 5);

export function industryLabel(key: IndustryKey) {
  return industries.find((i) => i.key === key)?.name ?? key;
}
