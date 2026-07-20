import type { PortfolioProject } from "../../../lib/portfolioData";
import { forecastableMetrics, forecastMetric } from "../../../lib/projectIntelligence";
import { metricLabels, metricUnits } from "../builder/metricSeries";
import { Card, CardHeader } from "../../../lib/ui";
import PredictionWidget from "../widgets/PredictionWidget";

export default function PredictionsTab({ project: proj }: { project: PortfolioProject }) {
  return (
    <div className="space-y-4">
      <p className="text-[12.5px] text-ink-500">Forward-looking estimates based on historical trends — an illustrative projection, not a guarantee of future performance.</p>
      <div className="grid grid-cols-2 gap-4">
        {forecastableMetrics.map((m) => {
          const forecast = forecastMetric(proj, m, 1)[0];
          return (
            <Card key={m}>
              <CardHeader title={`${metricLabels[m]} Forecast`} sub={`Next period estimate: ${forecast.predicted.toLocaleString()}${metricUnits[m]} · ${Math.round(forecast.confidence * 100)}% confidence`} />
              <div className="h-[180px]">
                <PredictionWidget scope="project" scopeId={proj.id} metric={m} />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
