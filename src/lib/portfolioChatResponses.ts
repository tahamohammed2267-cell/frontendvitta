// Keyword-matched Q&A bank for the portfolio "Ask vitta" panel, mirroring the
// pattern in chatResponses.ts — a scripted performance grounded in live
// fixture data, not a real model.
import { aggregateKPIs, portfolioProjects, projectsRequiringAttention } from "./portfolioData";

export interface PortfolioChatCitation {
  n: number;
  ref: string;
}

export interface PortfolioChatReply {
  keywords: string[];
  text: () => string;
  citations?: () => PortfolioChatCitation[];
}

const portfolioChatReplies: PortfolioChatReply[] = [
  {
    keywords: ["underperform", "attention", "flag", "risk", "worst"],
    text: () => {
      const flagged = projectsRequiringAttention();
      if (flagged.length === 0) return "No projects currently carry an open health flag across the portfolio.";
      const top = flagged.slice(0, 3);
      const parts = top.map((f) => `${f.project.name} (${f.flags[0].label.toLowerCase()})`);
      return `${flagged.length} project${flagged.length === 1 ? "" : "s"} ${flagged.length === 1 ? "is" : "are"} flagged for attention. The most severe: ${parts.join(", ")}. Open Health Center for the full breakdown by severity and rule type.`;
    },
    citations: () => projectsRequiringAttention().slice(0, 3).map((f, i) => ({ n: i + 1, ref: `${f.project.name} — Health Center` })),
  },
  {
    keywords: ["margin", "ebitda"],
    text: () => {
      const solar = portfolioProjects.filter((p) => p.industryKey === "solar");
      const below = solar.filter((p) => p.financials.earnings.marginPct < 25);
      if (below.length === 0) return "All solar projects are currently at or above a 25% EBITDA margin.";
      return `${below.length} solar project${below.length === 1 ? "" : "s"} sit below a 25% EBITDA margin: ${below.map((p) => `${p.name} (${p.financials.earnings.marginPct}%)`).join(", ")}.`;
    },
  },
  {
    keywords: ["compare", "benchmark", "spain", "average"],
    text: () => {
      const spainSolar = portfolioProjects.filter((p) => p.industryKey === "solar" && p.country === "Spain");
      const allSolar = portfolioProjects.filter((p) => p.industryKey === "solar");
      const spainKpi = aggregateKPIs(spainSolar);
      const allKpi = aggregateKPIs(allSolar);
      const delta = Math.round((spainKpi.avgAssetHealth - allKpi.avgAssetHealth) * 10) / 10;
      return `Spain solar assets (${spainSolar.length} projects) average ${spainKpi.avgAssetHealth} asset health and ${spainKpi.yoyGrowthPct}% YoY growth, vs the solar book average of ${allKpi.avgAssetHealth} and ${allKpi.yoyGrowthPct}% — asset health is ${delta >= 0 ? "+" : ""}${delta} points against the average.`;
    },
  },
  {
    keywords: ["maintenance", "cost", "increase"],
    text: () => {
      const flagged = portfolioProjects.filter((p) => p.healthFlags.some((f) => f.rule === "highMaintenanceCost"));
      if (flagged.length === 0) return "No projects show a material year-over-year increase in maintenance cost right now.";
      return `${flagged.map((p) => p.name).join(", ")} ${flagged.length === 1 ? "shows" : "show"} maintenance costs running meaningfully above the portfolio average this year — see each project's health flags for the driver.`;
    },
  },
];

const defaultReply: PortfolioChatReply = {
  keywords: [],
  text: () => {
    const all = aggregateKPIs(portfolioProjects);
    return `Across the portfolio: €${all.totalRevenueM}m revenue, €${all.totalEbitdaM}m EBITDA, ${all.installedCapacityMW.toLocaleString()} MW installed, ${all.activeProjects} active projects. I don't have a scripted answer for that exact question in this demo — try one of the suggested prompts for a fuller answer.`;
  },
};

export function pickPortfolioReply(question: string): { text: string; citations?: PortfolioChatCitation[] } {
  const q = question.toLowerCase();
  let best: PortfolioChatReply | null = null;
  let bestScore = 0;
  for (const reply of portfolioChatReplies) {
    const score = reply.keywords.reduce((acc, kw) => acc + (q.includes(kw) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      best = reply;
    }
  }
  const chosen = best ?? defaultReply;
  return { text: chosen.text(), citations: chosen.citations?.() };
}
