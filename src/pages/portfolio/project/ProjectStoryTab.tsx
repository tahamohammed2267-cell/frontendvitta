import { BookOpen } from "lucide-react";
import type { PortfolioProject } from "../../../lib/portfolioData";
import { storiesForProject } from "../../../lib/projectIntelligence";
import { Badge, Card, CardHeader, EmptyState } from "../../../lib/ui";
import { metricLabels } from "../builder/metricSeries";

export default function ProjectStoryTab({ project: proj }: { project: PortfolioProject }) {
  const stories = storiesForProject(proj.id);

  if (stories.length === 0) {
    return <EmptyState icon={<BookOpen size={20} />} title="No story yet" sub="Vitta AI hasn't generated a narrative for this project yet." />;
  }

  return (
    <div className="space-y-4">
      <p className="text-[12.5px] text-ink-500">An automatically generated narrative of this project's performance — every figure below is drawn directly from the underlying data.</p>
      {stories.map((s) => (
        <Card key={s.id}>
          <CardHeader title={s.period} />
          <p className="text-[13.5px] leading-relaxed text-ink-800">{s.narrative}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {s.citedMetrics.map((m) => (
              <Badge key={m} tone="gray">{metricLabels[m as keyof typeof metricLabels] ?? m}</Badge>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
