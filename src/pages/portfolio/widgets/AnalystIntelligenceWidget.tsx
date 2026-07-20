import { analystObservations, observationKindLabels } from "../../../lib/intelligenceData";
import { Badge } from "../../../lib/ui";

export default function AnalystIntelligenceWidget() {
  const recent = [...analystObservations].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  return (
    <div className="h-full space-y-2 overflow-y-auto">
      {recent.map((o) => (
        <div key={o.id} className="flex items-start gap-2">
          <Badge tone="gray">{observationKindLabels[o.kind]}</Badge>
          <p className="min-w-0 truncate text-[11.5px] text-ink-700">{o.text}</p>
        </div>
      ))}
    </div>
  );
}
