// ─────────────────────────────────────────────────────────────
// Report assembly — pure function that builds real report content
// from seeded Intelligence data. No file-generation precedent
// exists anywhere in this codebase, so this produces a preview
// document (an array of typed sections), not a downloadable file.
// ─────────────────────────────────────────────────────────────

import { projects } from "../mockData";
import { icDecisions } from "./decisions";
import { observationsForDeal } from "./analystIntelligence";
import { playbookForTechnology } from "./playbooks";
import { recommendationsForDeal } from "./recommendations";
import type { EntityRef } from "./crossLinks";

export type ReportSectionId = "decisions" | "analystIntelligence" | "playbooks" | "recommendations" | "institutionalLessons" | "historicalReasoning";

export const reportSectionLabels: Record<ReportSectionId, string> = {
  decisions: "Investment Decisions",
  analystIntelligence: "Analyst Intelligence",
  playbooks: "Institutional Playbooks",
  recommendations: "AI Recommendations",
  institutionalLessons: "Institutional Lessons",
  historicalReasoning: "Historical Reasoning",
};

export interface ReportBlock {
  heading: string;
  body: string[];
  evidence: EntityRef[];
}

export interface ReportSection {
  id: ReportSectionId;
  title: string;
  blocks: ReportBlock[];
}

export interface ReportDocument {
  dealId: string;
  dealName: string;
  generatedAt: string;
  sections: ReportSection[];
}

function decisionsSection(dealId: string): ReportSection {
  const decision = icDecisions.find((d) => d.dealId === dealId);
  if (!decision) return { id: "decisions", title: reportSectionLabels.decisions, blocks: [] };
  return {
    id: "decisions", title: reportSectionLabels.decisions,
    blocks: [{
      heading: `Outcome: ${decision.outcome}${decision.decisionDate ? ` (${decision.decisionDate})` : ""}`,
      body: [decision.rationale, ...decision.keyFactors],
      evidence: decision.relevantHistoricalDecisions,
    }],
  };
}

function analystIntelligenceSection(dealId: string): ReportSection {
  const obs = observationsForDeal(dealId);
  return {
    id: "analystIntelligence", title: reportSectionLabels.analystIntelligence,
    blocks: obs.map((o) => ({ heading: `${o.author} — ${o.createdAt}`, body: [o.text], evidence: o.relatedDeals })),
  };
}

function playbooksSection(dealId: string): ReportSection {
  const project = projects.find((p) => p.id === dealId);
  const playbook = project ? playbookForTechnology(project.technology) : undefined;
  if (!playbook) return { id: "playbooks", title: reportSectionLabels.playbooks, blocks: [] };
  return {
    id: "playbooks", title: reportSectionLabels.playbooks,
    blocks: [{
      heading: `${playbook.title} (${playbook.coverage}, ${playbook.dealsContributing} deal${playbook.dealsContributing === 1 ? "" : "s"} contributing)`,
      body: [...playbook.bestPractices.items, ...playbook.frequentMistakes.items],
      evidence: playbook.relatedPatterns,
    }],
  };
}

function recommendationsSection(dealId: string): ReportSection {
  const recs = recommendationsForDeal(dealId);
  return {
    id: "recommendations", title: reportSectionLabels.recommendations,
    blocks: recs.map((r) => ({ heading: r.title, body: [r.explanation], evidence: r.evidence })),
  };
}

function institutionalLessonsSection(dealId: string): ReportSection {
  const project = projects.find((p) => p.id === dealId);
  const playbook = project ? playbookForTechnology(project.technology) : undefined;
  if (!playbook) return { id: "institutionalLessons", title: reportSectionLabels.institutionalLessons, blocks: [] };
  return {
    id: "institutionalLessons", title: reportSectionLabels.institutionalLessons,
    blocks: [{ heading: `Lessons learned — ${playbook.title}`, body: playbook.lessonsLearned.items, evidence: playbook.lessonsLearned.sourceDeals }],
  };
}

function historicalReasoningSection(dealId: string): ReportSection {
  const decision = icDecisions.find((d) => d.dealId === dealId);
  if (!decision) return { id: "historicalReasoning", title: reportSectionLabels.historicalReasoning, blocks: [] };
  return {
    id: "historicalReasoning", title: reportSectionLabels.historicalReasoning,
    blocks: decision.assumptions.map((a) => ({ heading: `${a.text} — ${a.status}`, body: a.note ? [a.note] : [], evidence: [] })),
  };
}

const sectionBuilders: Record<ReportSectionId, (dealId: string) => ReportSection> = {
  decisions: decisionsSection,
  analystIntelligence: analystIntelligenceSection,
  playbooks: playbooksSection,
  recommendations: recommendationsSection,
  institutionalLessons: institutionalLessonsSection,
  historicalReasoning: historicalReasoningSection,
};

export function assembleReport(dealId: string, sectionIds: ReportSectionId[]): ReportDocument {
  const project = projects.find((p) => p.id === dealId);
  return {
    dealId,
    dealName: project?.name ?? dealId,
    generatedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
    sections: sectionIds.map((id) => sectionBuilders[id](dealId)),
  };
}
