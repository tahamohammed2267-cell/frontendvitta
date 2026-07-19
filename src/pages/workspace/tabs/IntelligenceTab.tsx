import { CheckCircle2, MessageCircle, MessageSquareText } from "lucide-react";
import { useStore } from "../../../lib/store";
import { Badge, Card, CardHeader, ConfidenceBar, SeverityBadge, SourceChip } from "../../../lib/ui";
import { cn } from "../../../lib/cn";

const sevOrder = { critical: 0, high: 1, medium: 2, low: 3 };

export default function IntelligenceTab() {
  const actionItems = useStore((s) => s.actionItems);
  const risks = useStore((s) => s.risks);
  const sorted = [...risks].sort((a, b) => sevOrder[a.severity] - sevOrder[b.severity]);
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2 space-y-4">
        {/* AI summary */}
        <Card>
          <CardHeader
            title="Deal Summary"
            sub="Generated from 14 documents · updated 2h ago"
            right={<Badge tone="blue"><MessageSquareText size={11} /> vitta</Badge>}
          />
          <div className="space-y-3 text-[13.5px] leading-relaxed text-ink-800">
            <p>
              Project Helios is a <span className="num font-semibold">120 MWp</span> solar PV asset in Andalusia, Spain, with an executed EPC
              lump-sum of <span className="num font-semibold">€96.4M</span> and <span className="num font-semibold">70%</span> senior gearing
              against a <span className="num font-semibold">€67.5M</span> facility. The executed PPA prices energy at{" "}
              <span className="num font-semibold">€52.40/MWh</span> — below the <span className="num font-semibold">€54.00/MWh</span> floor the
              term sheet was sized on, which compresses base-case DSCR toward the 1.30x target in Years 3–5.
            </p>
            <p>
              Two diligence items remain open before IC: the O&M agreement is still in draft (pricing indicative at{" "}
              <span className="num font-semibold">€11.2k/MWp/yr</span>), and grid curtailment exposure is unquantified — the yield report assumes
              zero while regional curtailment ran 2.1% in 2025. Levered equity IRR of <span className="num font-semibold">11.8%</span> sits above
              the firm's solar median, but rests on the merchant tail assumption that is still missing.
            </p>
          </div>
        </Card>

        {/* Risk register */}
        <p className="pt-1 text-[15px] font-semibold tracking-tight">Risk register</p>
        {sorted.map((r) => (
          <Card key={r.id}>
            <div className="mb-2 flex items-center gap-2">
              <SeverityBadge severity={r.severity} />
              <Badge tone="gray">{r.category}</Badge>
              <div className="ml-auto"><ConfidenceBar value={r.confidence} /></div>
            </div>
            <p className="text-[14.5px] font-semibold">{r.title}</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink-700">{r.description}</p>
            <div className="mt-3 space-y-1.5">
              {r.evidence.map((e, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="mt-2 h-px w-3 shrink-0 bg-ink-300" />
                  <p className="border-l-2 border-ink-200 pl-2.5 text-[12px] italic text-ink-600">“{e.snippet}”</p>
                  <SourceChip doc={e.doc} page={e.page} />
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {r.suggestedQuestions.map((q) => (
                <button key={q} className="flex items-center gap-1.5 rounded-md border border-ink-200 px-2.5 py-1 text-[11.5px] text-ink-600 transition-colors hover:border-accent-500 hover:text-accent-700">
                  <MessageCircle size={11} /> {q}
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Right rail */}
      <div className="space-y-4">
        <Card>
          <CardHeader title="Action items" sub="Maintained by vitta + team" />
          <div className="space-y-2.5">
            {actionItems.map((a) => (
              <div key={a.id} className="flex items-start gap-2.5">
                <span className={cn("mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border", a.done ? "border-pos-600 bg-pos-600" : "border-ink-300")}>
                  {a.done && <CheckCircle2 size={12} className="text-white" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-[12.5px] leading-snug", a.done ? "text-ink-400 line-through" : "text-ink-800")}>{a.text}</p>
                  <p className="mt-0.5 text-[11px] text-ink-400">{a.owner} · due {a.due}</p>
                </div>
                <Badge tone="gray">{a.source}</Badge>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="Ask about this deal" />
          <div className="space-y-1.5">
            {["Summarize lender-facing risks", "What changed since v1 of the model?", "Draft the risk section for the IC memo"].map((q) => (
              <p key={q} className="cursor-pointer rounded-lg border border-ink-100 px-3 py-2 text-[12.5px] text-ink-600 hover:border-accent-500 hover:text-accent-700">{q}</p>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
