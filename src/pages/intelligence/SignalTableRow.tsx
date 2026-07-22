import { ChevronRight } from "lucide-react";
import { industryLabel } from "../../lib/intelligence/crossDealPatterns";
import type { ImpactLevel } from "../../lib/intelligence/institutionalSignals";
import { Badge } from "../../lib/ui";
import { cn } from "../../lib/cn";
import type { SignalRow } from "./useInstitutionalSignalsTable";
import SignalDetailPanel from "./SignalDetailPanel";

const impactTone: Record<ImpactLevel, "red" | "orange" | "gray"> = { High: "red", Medium: "orange", Low: "gray" };
const statusTone = { Active: "green" as const, Dormant: "gray" as const };

export default function SignalTableRow({
  row, expanded, onToggle, onSelectRelated,
}: { row: SignalRow; expanded: boolean; onToggle: () => void; onSelectRelated: (id: string) => void }) {
  const { signal, stats } = row;
  const industries = [...new Set(signal.occurrences.map((o) => o.industry))].map(industryLabel).join(", ");
  const regions = [...new Set(signal.occurrences.map((o) => o.region))].join(", ");

  return (
    <>
      <tr onClick={onToggle} className="cursor-pointer transition-colors hover:bg-ink-50">
        <td className="sticky left-0 z-10 border-b border-ink-100 bg-white px-4 py-3 group-hover:bg-ink-50">
          <div className="flex items-center gap-1.5">
            <ChevronRight size={13} className={cn("shrink-0 text-ink-400 transition-transform", expanded && "rotate-90")} />
            <span className="text-[12.5px] font-semibold text-ink-900">{signal.title}</span>
          </div>
        </td>
        <td className="border-b border-ink-100 px-3 py-3"><Badge tone={impactTone[stats.impact]}>{stats.impact}</Badge></td>
        <td className="num border-b border-ink-100 px-3 py-3 text-[12.5px] font-medium">{stats.projectCount}</td>
        <td className="max-w-[160px] truncate border-b border-ink-100 px-3 py-3 text-[12px] text-ink-600">{industries}</td>
        <td className="max-w-[160px] truncate border-b border-ink-100 px-3 py-3 text-[12px] text-ink-600">{regions}</td>
        <td className="num border-b border-ink-100 px-3 py-3 text-[12px] text-ink-600">{stats.firstSeenYear}</td>
        <td className="num border-b border-ink-100 px-3 py-3 text-[12px] text-ink-600">{stats.lastSeenYear}</td>
        <td className="num border-b border-ink-100 px-3 py-3 text-[12.5px] font-medium">{stats.confidence.score}%</td>
        <td className="border-b border-ink-100 px-3 py-3 text-[12px] text-ink-600">
          <span className="num font-semibold text-ink-900">{stats.outcomeStat.pct}%</span> {stats.outcomeStat.outcome}
        </td>
        <td className="num border-b border-ink-100 px-3 py-3 text-[12px] text-ink-600">{signal.recurringSinceYear}</td>
        <td className="border-b border-ink-100 px-3 py-3"><Badge tone="gray">{signal.frequency}</Badge></td>
        <td className="border-b border-ink-100 px-3 py-3"><Badge tone={statusTone[stats.status]}>{stats.status}</Badge></td>
      </tr>
      {expanded && (
        <tr className="bg-ink-50/50">
          <td colSpan={12} className="px-5 py-4">
            <p className="mb-3 text-[12.5px] italic text-ink-600">{signal.insight}</p>
            <SignalDetailPanel signal={signal} stats={stats} onSelectRelated={onSelectRelated} />
            <p className="mt-3 text-[11px] text-ink-400">
              Confidence based on {stats.confidence.occurrenceCount} occurrences · {stats.confidence.yearSpan} years · {stats.confidence.industryCount} industries
            </p>
          </td>
        </tr>
      )}
    </>
  );
}
