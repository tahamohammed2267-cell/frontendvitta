import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { knowledgeGrowthTimeline } from "../../lib/intelligenceData";
import { Badge, Card, CardHeader } from "../../lib/ui";

export default function KnowledgeGrowthPanel() {
  const timeline = knowledgeGrowthTimeline();
  const latest = timeline[timeline.length - 1];

  return (
    <Card>
      <CardHeader
        title="Continuous learning"
        sub="Illustrative coverage growth, based on the firm's actual deal intake pace — not a live feed"
        right={<Badge tone="gray">{latest.deals} deals · {latest.observations} observations · {latest.decisions} decisions</Badge>}
      />
      <div className="h-[140px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={timeline} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
            <XAxis dataKey="month" tick={{ fontSize: 10.5, fill: "#8a93a6" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10.5, fill: "#8a93a6" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #dde1e9" }} />
            <Area type="monotone" dataKey="deals" stroke="#0e5f45" strokeWidth={2} fill="#0e5f45" fillOpacity={0.15} name="Deals" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-[11.5px] text-ink-400">
        Every new deal, analyst observation and IC decision automatically becomes part of the firm's institutional knowledge — no manual curation required.
      </p>
    </Card>
  );
}
