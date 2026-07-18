import { useState } from "react";
import { Bar, BarChart, Cell, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Check, FileDown, FileSpreadsheet, FileText, FileType, Pencil, Play, Presentation, UploadCloud } from "lucide-react";
import { fundingWaterfall, icDeckSlides, icMemoSections, revenueProjection } from "../../../lib/mockData";
import { Badge, Button, Card, SourceChip } from "../../../lib/ui";
import { cn } from "../../../lib/cn";

type Preview = "excel" | "word" | "pdf" | "deck" | null;

const outputs = [
  { id: "excel" as const, icon: FileSpreadsheet, title: "Excel Business Case", badge: "Solar PV Blueprint v4", stat: "96 of 124 cells populated · 2 blocked (missing fields)" },
  { id: "word" as const, icon: FileText, title: "IC Memo (Word)", badge: "16 sections", stat: "14 of 16 sections drafted · editable" },
  { id: "pdf" as const, icon: FileType, title: "IC Memo (PDF)", badge: "Polished render", stat: "Same content, board-ready layout" },
  { id: "deck" as const, icon: Presentation, title: "IC Deck (PPTX)", badge: "10 slides", stat: "2 charts auto-generated · field-reviewable" },
];

const blueprintRows: { cell: string; field: string; value: string; state: "populated" | "computed" | "missing"; src?: string; page?: number }[] = [
  { cell: "Tech!C4", field: "Installed Capacity", value: "120 MWp", state: "populated", src: "EPC_Contract_SolarBond.pdf", page: 3 },
  { cell: "Tech!C9", field: "P50 Specific Yield", value: "1,812 kWh/kWp", state: "populated", src: "Solar_Resource_Assessment_PVSyst.pdf", page: 41 },
  { cell: "Capex!C6", field: "EPC Lump Sum", value: "€96.4M", state: "populated", src: "EPC_Contract_SolarBond.pdf", page: 14 },
  { cell: "Revenue!C11", field: "PPA Tariff (Year 1)", value: "€52.40 /MWh", state: "populated", src: "Helios_PPA_Executed_vFinal.pdf", page: 22 },
  { cell: "Revenue!C12", field: "Escalation", value: "1.8% p.a.", state: "populated", src: "Helios_PPA_Executed_vFinal.pdf", page: 22 },
  { cell: "Revenue!C38", field: "Merchant Tail Price", value: "", state: "missing" },
  { cell: "Debt!C5", field: "Senior Facility", value: "€67.5M", state: "populated", src: "Term_Sheet_VittaCapital.pdf", page: 2 },
  { cell: "Debt!C9", field: "Margin", value: "Euribor 6M + 265 bps", state: "populated", src: "Term_Sheet_VittaCapital.pdf", page: 3 },
  { cell: "Outputs!C12", field: "Project IRR", value: "8.4%", state: "computed", src: "Financial_Model_v3.2.xlsx" },
  { cell: "Outputs!C14", field: "Equity IRR", value: "11.8%", state: "computed", src: "Financial_Model_v3.2.xlsx" },
  { cell: "Funding!C7", field: "Sponsor Equity", value: "", state: "missing" },
];

export default function OutputsTab() {
  const [preview, setPreview] = useState<Preview>(null);
  return (
    <div className="space-y-4">
      {/* Computed workbook banner */}
      <Card className="border-accent-100 bg-accent-50/60">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-accent-600"><FileSpreadsheet size={18} /></div>
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-semibold">Computed workbook on file</p>
            <p className="mt-0.5 text-[12px] text-ink-600">
              Download the blueprint, fill formula cells (IRR, DSCR) in real Excel, re-upload — it becomes the highest-priority data source for every output.
            </p>
            <div className="mt-2 inline-flex items-center gap-2 rounded-lg border border-accent-100 bg-white px-2.5 py-1.5 text-[12px]">
              <FileSpreadsheet size={13} className="text-pos-600" />
              <span className="font-medium">Financial_Model_v3.2.xlsx</span>
              <span className="text-ink-400">uploaded Jul 12 · highest-priority source</span>
              <button className="ml-1 font-medium text-accent-700 hover:underline">Replace</button>
            </div>
          </div>
          <button className="flex shrink-0 items-center gap-2 rounded-lg border-2 border-dashed border-accent-200 bg-white/60 px-4 py-3 text-[12px] font-medium text-accent-700 hover:border-accent-500">
            <UploadCloud size={15} /> Drop computed workbook
          </button>
        </div>
      </Card>

      {/* Output cards */}
      <div className="grid grid-cols-4 gap-4">
        {outputs.map((o) => (
          <Card key={o.id} className={cn("transition-shadow", preview === o.id && "ring-2 ring-accent-600/30")}>
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-ink-100 text-ink-600"><o.icon size={17} /></div>
            <p className="text-[14px] font-semibold">{o.title}</p>
            <div className="mt-1.5"><Badge tone="blue">{o.badge}</Badge></div>
            <p className="mt-2 text-[11.5px] leading-snug text-ink-500">{o.stat}</p>
            <div className="mt-4 flex gap-1.5">
              <Button variant="secondary" className="px-2.5 py-1.5 text-[12px]" onClick={() => setPreview(preview === o.id ? null : o.id)}>
                {preview === o.id ? "Close" : "Preview"}
              </Button>
              <Button className="px-2.5 py-1.5 text-[12px]"><Play size={12} /> Generate</Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Preview panel */}
      {preview && (
        <Card className="fade-up">
          <div className="mb-4 flex items-center justify-between border-b border-ink-100 pb-3">
            <div className="flex items-center gap-2.5">
              <p className="text-[15px] font-semibold">{outputs.find((o) => o.id === preview)?.title} — preview</p>
              {preview === "pdf" && <Badge tone="gray">PDF render</Badge>}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost"><Pencil size={13} /> Edit values</Button>
              <Button><FileDown size={13} /> Export</Button>
            </div>
          </div>
          {preview === "excel" && <ExcelPreview />}
          {(preview === "word" || preview === "pdf") && <MemoPreview />}
          {preview === "deck" && <DeckPreview />}
        </Card>
      )}
    </div>
  );
}

function ExcelPreview() {
  return (
    <div className="overflow-hidden rounded-lg border border-ink-200">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-ink-200 bg-ink-50 font-mono text-[10.5px] text-ink-400">
            <th className="w-10 border-r border-ink-200 px-2 py-1.5 text-center" />
            <th className="px-3 py-1.5 font-medium">A · Cell</th>
            <th className="px-3 py-1.5 font-medium">B · Canonical field</th>
            <th className="px-3 py-1.5 font-medium">C · Value</th>
            <th className="px-3 py-1.5 font-medium">D · State</th>
            <th className="px-3 py-1.5 font-medium">E · Provenance</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {blueprintRows.map((r, i) => (
            <tr key={r.cell} className={cn(r.state === "missing" && "bg-crit-50/60")}>
              <td className="border-r border-ink-100 px-2 py-2 text-center font-mono text-[10.5px] text-ink-300">{i + 1}</td>
              <td className="num px-3 py-2 text-[11.5px] text-ink-500">{r.cell}</td>
              <td className="px-3 py-2 text-[12.5px] font-medium">{r.field}</td>
              <td className="num px-3 py-2 text-[12.5px] font-semibold">{r.value || <span className="font-normal text-crit-600">—</span>}</td>
              <td className="px-3 py-2">
                {r.state === "populated" && <Badge tone="green">populated</Badge>}
                {r.state === "computed" && <Badge tone="blue">computed in Excel</Badge>}
                {r.state === "missing" && <Badge tone="red">missing — blocked</Badge>}
              </td>
              <td className="px-3 py-2">{r.src ? <SourceChip doc={r.src} page={r.page ?? 0} /> : <span className="text-[11px] text-ink-300">—</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MemoPreview() {
  const drafted = ["Executive Summary", "Transaction Overview", "Risk Factors"];
  return (
    <div className="grid grid-cols-[1fr_240px] gap-6">
      <div className="max-w-prose space-y-5">
        <section>
          <h4 className="text-[17px] font-semibold tracking-tight">1. Executive Summary</h4>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-700">
            Vitta Capital is asked to provide a €67.5M senior secured facility (70% gearing, 17-year door-to-door) to Project Helios, a 120 MWp
            solar PV asset in Andalusia, Spain. The project benefits from an executed 10-year PPA at €52.40/MWh with 1.8% annual escalation, a
            fixed-price EPC contract at €96.4M, and a strong resource profile (P50 1,812 kWh/kWp). Base-case levered equity IRR is 11.8% with a
            minimum DSCR of 1.30x.
          </p>
        </section>
        <section>
          <h4 className="text-[17px] font-semibold tracking-tight">3. Transaction Overview</h4>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-700">
            Funding comprises €67.5M senior debt, €24.1M sponsor equity and €4.8M mezzanine. Security includes a first-ranking pledge over
            project shares, the land lease, and all project contracts. The facility prices at Euribor 6M + 265 bps with cash sweep above a
            1.30x DSCR target; lock-up at 1.15x.
          </p>
        </section>
        <section>
          <h4 className="text-[17px] font-semibold tracking-tight">11. Risk Factors</h4>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-700">
            The executed PPA tariff sits €1.60/MWh below the term-sheet sizing floor, compressing Year 3–5 coverage; mitigation via a sponsor
            revenue top-up is under discussion. The O&M agreement remains in draft, and grid curtailment (2.1% regionally in 2025) is
            unquantified in the yield case. Both are conditions precedent in the current term sheet draft.
          </p>
        </section>
      </div>
      <div className="space-y-1 border-l border-ink-100 pl-5">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Sections</p>
        {icMemoSections.map((s, i) => (
          <p key={s} className="flex items-center gap-2 text-[12px] text-ink-600">
            {drafted.includes(s) || i < 14 ? <Check size={12} className="text-pos-600" /> : <span className="h-3 w-3 rounded-full border border-warn-600" />}
            <span className={cn(!drafted.includes(s) && i >= 14 && "text-ink-400")}>{s}</span>
          </p>
        ))}
      </div>
    </div>
  );
}

function DeckPreview() {
  return (
    <div className="grid grid-cols-5 gap-3">
      {icDeckSlides.map((s, i) => (
        <div key={s} className="aspect-video rounded-lg border border-ink-200 bg-white p-2.5 shadow-[0_1px_2px_rgba(11,14,20,0.04)]">
          <div className="flex items-center justify-between">
            <span className="num text-[9px] font-semibold text-ink-300">{String(i + 1).padStart(2, "0")}</span>
            {i === 0 && <span className="text-[8px] font-bold tracking-wide text-ink-900">VITTA</span>}
          </div>
          <p className="mt-1 text-[10.5px] font-semibold leading-tight">{s}</p>
          {s === "Funding Breakdown" ? (
            <div className="mt-1 h-[calc(100%-30px)]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fundingWaterfall} layout="vertical" margin={{ top: 0, right: 2, bottom: 0, left: 2 }}>
                  <XAxis type="number" hide /><YAxis type="category" dataKey="name" hide />
                  <Bar dataKey="value" radius={[0, 3, 3, 0]} barSize={7}>
                    {fundingWaterfall.map((f) => <Cell key={f.name} fill={f.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : s === "Business Plan" ? (
            <div className="mt-1 h-[calc(100%-30px)]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueProjection} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                  <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="cfads" stroke="#059669" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="mt-2 space-y-1.5">
              <div className="h-1.5 w-4/5 rounded bg-ink-100" />
              <div className="h-1.5 w-3/5 rounded bg-ink-100" />
              <div className="h-1.5 w-2/3 rounded bg-ink-100" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
