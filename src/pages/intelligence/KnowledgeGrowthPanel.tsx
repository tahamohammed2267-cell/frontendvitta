import { knowledgeGrowthTimeline } from "../../lib/intelligenceData";
import { Badge, Card, CardHeader } from "../../lib/ui";
import { AreaTrend, CHART } from "../../lib/charts";

export default function KnowledgeGrowthPanel() {
  const timeline = knowledgeGrowthTimeline();
  const latest = timeline[timeline.length - 1];

  return (
    <Card>
      <CardHeader
        title="Continuous learning"
        right={<Badge tone="gray">{latest.deals} deals · {latest.observations} observations · {latest.decisions} decisions</Badge>}
      />
      <AreaTrend
        data={timeline}
        xKey="month"
        height={140}
        series={[{ key: "deals", label: "Deals", color: CHART.accent }]}
      />
      <p className="mt-2 text-[11.5px] text-ink-400">
        Every new deal, analyst observation and IC decision automatically becomes part of the firm's institutional knowledge — no manual curation required.
      </p>
    </Card>
  );
}
