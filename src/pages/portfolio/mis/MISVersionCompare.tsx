import { ArrowRight } from "lucide-react";
import type { MISVersion } from "../../../lib/portfolioData";
import { Badge, Card, CardHeader, ConfidenceBar } from "../../../lib/ui";

export default function MISVersionCompare({ older, newer }: { older: MISVersion; newer: MISVersion }) {
  const olderFields = new Map(older.detectedChanges.map((c) => [c.field, c]));
  const newerFields = new Map(newer.detectedChanges.map((c) => [c.field, c]));

  const added = newer.detectedChanges.filter((c) => !olderFields.has(c.field));
  const removed = older.detectedChanges.filter((c) => !newerFields.has(c.field));
  const changed = newer.detectedChanges.filter((c) => {
    const prior = olderFields.get(c.field);
    return prior && prior.newValue !== c.newValue;
  });

  return (
    <Card>
      <CardHeader title={`v${older.version} → v${newer.version}`} sub={`${older.reportingPeriod ?? older.uploadedAt} vs. ${newer.reportingPeriod ?? newer.uploadedAt}`} />

      {changed.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Changed</p>
          <div className="space-y-2">
            {changed.map((c) => {
              const prior = olderFields.get(c.field);
              return (
                <div key={c.id} className="flex items-center gap-4 rounded-lg border border-ink-200 p-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-medium">{c.field}</p>
                      <Badge tone="gray">{c.category}</Badge>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2 text-[13px]">
                      <span className="num text-ink-400">{prior?.newValue}</span>
                      <ArrowRight size={13} className="text-ink-300" />
                      <span className="num font-semibold text-ink-900">{c.newValue}</span>
                    </div>
                  </div>
                  <ConfidenceBar value={c.confidence} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {added.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Added metrics</p>
          <div className="space-y-2">
            {added.map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-lg border border-pos-100 bg-pos-50/40 p-3">
                <Badge tone="green">New</Badge>
                <p className="text-[13px] font-medium">{c.field}</p>
                <span className="num ml-auto text-[13px] font-semibold">{c.newValue}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {removed.length > 0 && (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Removed metrics</p>
          <div className="space-y-2">
            {removed.map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-lg border border-ink-200 bg-ink-50 p-3 opacity-70">
                <Badge tone="gray">No longer tracked</Badge>
                <p className="text-[13px] font-medium">{c.field}</p>
                <span className="num ml-auto text-[13px] text-ink-400 line-through">{c.newValue}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {added.length === 0 && removed.length === 0 && changed.length === 0 && (
        <p className="py-6 text-center text-[12.5px] text-ink-400">No differences detected between these two versions.</p>
      )}
    </Card>
  );
}
