// ─────────────────────────────────────────────────────────────
// Continuous learning — an honest representation of "the system
// gets smarter with every deal," NOT a live-updating claim. Reuses
// mockData's existing knowledgeGrowth curve (deals/fields ramp,
// already seeded, previously unused) and extends it with two more
// series scaled proportionally against that same real ramp shape,
// terminating at today's actual seeded totals. No new curve shape
// is invented — only extended along the same trajectory.
// ─────────────────────────────────────────────────────────────

import { analystObservations } from "./analystIntelligence";
import { icDecisions } from "./decisions";
import { knowledgeGrowth as baseGrowth } from "../mockData";

export interface KnowledgeGrowthPoint {
  month: string;
  deals: number;
  fields: number;
  observations: number;
  decisions: number;
}

export function knowledgeGrowthTimeline(): KnowledgeGrowthPoint[] {
  const finalDeals = baseGrowth[baseGrowth.length - 1].deals;
  const totalObservations = analystObservations.length;
  const totalDecisions = icDecisions.length;
  return baseGrowth.map((point) => {
    const ramp = point.deals / finalDeals;
    return {
      month: point.month,
      deals: point.deals,
      fields: point.fields,
      observations: Math.round(totalObservations * ramp),
      decisions: Math.round(totalDecisions * ramp),
    };
  });
}
