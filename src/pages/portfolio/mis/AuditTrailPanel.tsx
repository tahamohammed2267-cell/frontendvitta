import { History } from "lucide-react";
import type { AuditEntry } from "../../../lib/portfolioData";
import { Card, CardHeader } from "../../../lib/ui";

export default function AuditTrailPanel({ entries }: { entries: AuditEntry[] }) {
  return (
    <Card>
      <CardHeader title="Audit trail" right={<History size={15} className="text-ink-400" />} />
      <div className="space-y-3">
        {entries.map((e) => (
          <div key={e.id} className="flex gap-2.5">
            <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-300" />
            <div className="min-w-0">
              <p className="text-[12.5px] leading-snug text-ink-800"><span className="font-medium">{e.user}</span> · {e.action}</p>
              <p className="mt-0.5 text-[11px] text-ink-400">{e.detail} · {e.at}</p>
            </div>
          </div>
        ))}
        {entries.length === 0 && <p className="py-2 text-center text-[12px] text-ink-400">No audit history yet.</p>}
      </div>
    </Card>
  );
}
