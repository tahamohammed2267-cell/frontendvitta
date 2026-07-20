import { Sparkles } from "lucide-react";
import { allRecommendations, recommendationTypeLabels } from "../../../lib/intelligenceData";
import { Badge } from "../../../lib/ui";

const confidenceTone = { high: "green" as const, medium: "orange" as const, low: "gray" as const };

export default function AIRecommendationsWidget() {
  const recs = allRecommendations().slice(0, 5);
  return (
    <div className="h-full space-y-2 overflow-y-auto">
      {recs.map((r) => (
        <div key={r.id} className="flex items-start gap-2">
          <Sparkles size={12} className="mt-0.5 shrink-0 text-accent-600" />
          <div className="min-w-0">
            <p className="truncate text-[11.5px] font-medium text-ink-700">{r.title}</p>
            <Badge tone={confidenceTone[r.confidence]}>{recommendationTypeLabels[r.type]}</Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
