import { BookOpen, Lightbulb } from "lucide-react";
import { useStore } from "../lib/store";
import { Badge, Card, CardHeader, Stat } from "../lib/ui";
import { cn } from "../lib/cn";

const verdictMeta = {
  above: { tone: "green" as const, label: "Above range", dot: "bg-pos-600" },
  below: { tone: "red" as const, label: "Below range", dot: "bg-crit-600" },
  inline: { tone: "gray" as const, label: "In range", dot: "bg-accent-600" },
};

// approximate marker positions (0–100%) per row for the range viz
const markerPos = [52, 8, 96, 12, 66, 45, 72];

const insights = [
  { title: "Iberian PPA tariffs trending down 6% QoQ", body: "Across 14 precedents in the firm knowledge base. Helios pricing may reflect market shift rather than asset weakness." },
  { title: "Draft O&M at IC stage adds ~23 days to close", body: "In 6 of 9 comparable deals, unsigned O&M at IC was the critical-path item. Push for execution before committee." },
  { title: "Curtailment above 2% cuts equity IRR ~90bps", body: "Observed across Southern-Europe solar portfolio. Quantify Helios curtailment before final sizing." },
];

const lessons = [
  "Always reconcile EPC lump sum against model contingency — diverged in 5 of 17 solar deals.",
  "Term-sheet sizing tariffs lag executed PPAs; check which document governs before sign-off.",
  "Land lease tenor shorter than debt tenor has killed 2 deals — check extension mechanics early.",
  "Draft insurance slips routinely miss business-interruption cover for curtailment.",
];

export default function Intelligence() {
  const benchmarks = useStore((s) => s.benchmarks);
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-6">
      <div className="mb-6 fade-up">
        <h1 className="text-[22px] font-semibold tracking-tight">Firm Intelligence</h1>
        <p className="mt-0.5 text-[13px] text-ink-500">Every deal makes the next one smarter — benchmarks, patterns and lessons from 19 transactions.</p>
      </div>

      <div className="mb-6 grid grid-cols-4 gap-4 fade-up">
        <Card><Stat label="Deals analyzed" value="19" sub="6 sectors" /></Card>
        <Card><Stat label="Canonical fields" value="9,640" sub="fully cited" trend="up" /></Card>
        <Card><Stat label="Comparable benchmarks" value="34" sub="refreshed weekly" /></Card>
        <Card><Stat label="Precedent documents" value="312" sub="contracts, models, memos" /></Card>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-4">
          {/* Benchmarks */}
          <Card pad={false} className="fade-up overflow-hidden">
            <div className="border-b border-ink-100 px-5 py-4">
              <CardHeader title="Project Helios vs. firm precedents" sub={benchmarks.sector + ` · ${benchmarks.dealsEvaluated} comparable deals`} />
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-ink-100 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-400">
                  <th className="px-5 py-2.5">Metric</th>
                  <th className="px-4 py-2.5">Helios</th>
                  <th className="px-4 py-2.5">P25 – P75</th>
                  <th className="w-44 px-4 py-2.5">Distribution</th>
                  <th className="px-5 py-2.5 text-right">Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {benchmarks.rows.map((r, i) => {
                  const v = verdictMeta[r.verdict];
                  return (
                    <tr key={r.metric}>
                      <td className="px-5 py-3 text-[12.5px] font-medium">{r.metric}</td>
                      <td className="num px-4 py-3 text-[13px] font-semibold">{r.this}</td>
                      <td className="num px-4 py-3 text-[12px] text-ink-500">{r.p25} · {r.median} · {r.p75}</td>
                      <td className="px-4 py-3">
                        <div className="relative h-1.5 w-40 rounded-full bg-ink-100">
                          <div className="absolute inset-y-0 left-[25%] right-[25%] rounded-full bg-ink-200" />
                          <div className="absolute inset-y-[-3px] left-1/2 w-0.5 bg-ink-400" />
                          <div className={cn("absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white", v.dot)} style={{ left: `${markerPos[i]}%` }} />
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right"><Badge tone={v.tone}>{v.label}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>

          {/* Pattern recognition */}
          <div className="fade-up">
            <p className="mb-2 text-[15px] font-semibold tracking-tight">Pattern recognition</p>
            <div className="space-y-3">
              {insights.map((x) => (
                <Card key={x.title} className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600"><Lightbulb size={15} /></div>
                  <div>
                    <p className="text-[13.5px] font-semibold">{x.title}</p>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-ink-600">{x.body}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4 fade-up">
          <Card>
            <CardHeader title="Sector knowledge" sub="Deals evaluated by the firm" />
            <div className="space-y-3">
              {[
                { s: "Solar PV", n: 17, w: "100%" },
                { s: "Battery storage", n: 9, w: "53%" },
                { s: "Wind", n: 4, w: "24%" },
                { s: "Infrastructure / CRE", n: 5, w: "29%" },
              ].map((x) => (
                <div key={x.s}>
                  <div className="mb-1 flex justify-between text-[12.5px]">
                    <span className="font-medium">{x.s}</span>
                    <span className="num text-ink-500">{x.n} deals</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-ink-100">
                    <div className="h-full rounded-full bg-accent-600" style={{ width: x.w }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Investment lessons" sub="Distilled from closed & passed deals" />
            <div className="space-y-3">
              {lessons.map((l) => (
                <div key={l} className="flex gap-2.5">
                  <BookOpen size={14} className="mt-0.5 shrink-0 text-ink-400" />
                  <p className="text-[12.5px] leading-relaxed text-ink-700">{l}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
