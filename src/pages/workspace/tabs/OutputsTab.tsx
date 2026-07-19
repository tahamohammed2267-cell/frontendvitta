import { useEffect, useState } from "react";
import { Bar, BarChart, Cell, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import {
  Check, ChevronDown, FileDown, FileSpreadsheet, FileText, FileType, Loader2, Pencil, Play, Presentation, UploadCloud,
} from "lucide-react";
import type { CanonicalField } from "../../../lib/mockData";
import { useStore } from "../../../lib/store";
import { generateDeckPptx, generateExcelBlueprint, generateMemoDocx, generateMemoPdf } from "../../../lib/artifacts";
import { Badge, Button, Card, EmptyState, SourceChip } from "../../../lib/ui";
import { cn } from "../../../lib/cn";

type Preview = "excel" | "word" | "pdf" | "deck" | null;

const outputs = [
  { id: "excel" as const, icon: FileSpreadsheet, title: "Excel Business Case", badge: "Solar PV Blueprint v4" },
  { id: "word" as const, icon: FileText, title: "IC Memo (Word)", badge: "16 sections" },
  { id: "pdf" as const, icon: FileType, title: "IC Memo (PDF)", badge: "Polished render" },
  { id: "deck" as const, icon: Presentation, title: "IC Deck (PPTX)", badge: "10 slides" },
];

const BLUEPRINT_CELLS: { field: string; cell: string }[] = [
  { field: "Installed Capacity", cell: "Tech!C4" },
  { field: "P50 Annual Yield", cell: "Tech!C9" },
  { field: "Total CAPEX", cell: "Capex!C6" },
  { field: "PPA Tariff", cell: "Revenue!C11" },
  { field: "Debt Facility Size", cell: "Debt!C5" },
  { field: "Interest Rate", cell: "Debt!C9" },
  { field: "Project IRR", cell: "Outputs!C12" },
  { field: "Equity IRR (levered)", cell: "Outputs!C14" },
  { field: "Merchant Tail Assumption", cell: "Revenue!C38" },
  { field: "Sponsor Equity Commitment", cell: "Funding!C7" },
];

interface BlueprintRow {
  cell: string;
  field: string;
  value: string;
  state: "populated" | "computed" | "missing";
  src?: string;
  page?: number;
}

function buildBlueprintRows(canonicalFields: CanonicalField[]): BlueprintRow[] {
  const rows: BlueprintRow[] = [];
  for (const { field, cell } of BLUEPRINT_CELLS) {
    const f = canonicalFields.find((x) => x.field === field);
    if (!f) continue;
    const state: BlueprintRow["state"] = f.status === "missing" ? "missing" : f.status === "computed" ? "computed" : "populated";
    rows.push({ cell, field, value: f.value, state, src: f.source.doc !== "—" ? f.source.doc : undefined, page: f.source.page });
  }
  const escalation: BlueprintRow = { cell: "Revenue!C12", field: "Escalation", value: "1.8% p.a.", state: "populated", src: "Helios_PPA_Executed_vFinal.pdf", page: 22 };
  return [...rows.slice(0, 4), escalation, ...rows.slice(4)];
}

export default function OutputsTab() {
  const heliosStage = useStore((s) => s.heliosStage);
  const canonicalFields = useStore((s) => s.canonicalFields);
  const fundingWaterfall = useStore((s) => s.fundingWaterfall);
  const icDeckSlides = useStore((s) => s.icDeckSlides);
  const icMemoSections = useStore((s) => s.icMemoSections);
  const icMemoContent = useStore((s) => s.icMemoContent);
  const revenueProjection = useStore((s) => s.revenueProjection);
  const promptTemplates = useStore((s) => s.promptTemplates);
  const memoGeneration = useStore((s) => s.memoGeneration);
  const computedWorkbook = useStore((s) => s.computedWorkbook);
  const blueprintPopulated = useStore((s) => s.blueprintPopulated);
  const populateBlueprint = useStore((s) => s.populateBlueprint);
  const ingestComputedWorkbook = useStore((s) => s.ingestComputedWorkbook);
  const startMemoGeneration = useStore((s) => s.startMemoGeneration);
  const closeMemoGeneration = useStore((s) => s.closeMemoGeneration);
  const addGeneratedFile = useStore((s) => s.addGeneratedFile);
  const showToast = useStore((s) => s.showToast);

  const [preview, setPreview] = useState<Preview>(null);
  const [busy, setBusy] = useState<Preview>(null);

  useEffect(() => {
    if (preview === "excel") populateBlueprint();
  }, [preview, populateBlueprint]);

  if (heliosStage !== "done") {
    return (
      <Card>
        <EmptyState icon={<FileSpreadsheet size={20} />} title="Nothing to generate yet" sub="Outputs are built from canonical values — run extraction from the Documents tab first." />
      </Card>
    );
  }

  const blueprintRows = buildBlueprintRows(canonicalFields);
  const equityIRR = canonicalFields.find((f) => f.field === "Equity IRR (levered)");
  const projectIRR = canonicalFields.find((f) => f.field === "Project IRR");
  const minDSCR = canonicalFields.find((f) => f.field === "Target DSCR (min)");

  async function handleGenerate(kind: Exclude<Preview, null>) {
    if (kind === "word" || kind === "pdf") {
      startMemoGeneration("ic-memo");
      return;
    }
    setBusy(kind);
    await new Promise((r) => setTimeout(r, 1400));
    if (kind === "excel") {
      await generateExcelBlueprint(blueprintRows, "Helios");
      addGeneratedFile({ baseName: "Helios_BusinessCase", ext: "xlsx", kind: "Excel Model", sizeMB: 2.3 });
    } else if (kind === "deck") {
      await generateDeckPptx(icDeckSlides, "Helios");
      addGeneratedFile({ baseName: "Helios_IC_Deck", ext: "pptx", kind: "IC Deck (PPTX)", sizeMB: 5.9 });
    }
    setBusy(null);
    showToast(`${outputs.find((o) => o.id === kind)?.title} generated`);
  }

  async function exportMemo(format: "word" | "pdf") {
    const sections = icMemoSections.map((title) => ({ title, body: icMemoContent[title] ?? "" }));
    if (format === "word") {
      await generateMemoDocx(sections, "Helios");
      addGeneratedFile({ baseName: "Helios_IC_Memo", ext: "docx", kind: "IC Memo (Word)", sizeMB: 1.2 });
    } else {
      await generateMemoPdf(sections, "Helios");
      addGeneratedFile({ baseName: "Helios_IC_Memo", ext: "pdf", kind: "IC Memo (PDF)", sizeMB: 2.6 });
    }
    showToast(`IC Memo (${format === "word" ? "Word" : "PDF"}) exported`);
  }

  return (
    <div className="space-y-4">
      {/* Computed workbook banner */}
      <Card className="border-accent-100 bg-accent-50/60">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-accent-600"><FileSpreadsheet size={18} /></div>
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-semibold">Computed workbook on file</p>
            <p className="mt-0.5 text-[12px] text-ink-600">
              Download the blueprint, fill formula cells (IRR, DSCR) in real Excel, re-upload — it becomes the highest-priority data source for every output.
            </p>
            {computedWorkbook.ingesting ? (
              <div className="mt-2 inline-flex items-center gap-2 rounded-lg border border-accent-100 bg-white px-2.5 py-1.5 text-[12px] text-accent-700">
                <Loader2 size={13} className="animate-spin" /> Reading tabs, locating computed outputs…
              </div>
            ) : (
              <div className="mt-2 inline-flex items-center gap-2 rounded-lg border border-accent-100 bg-white px-2.5 py-1.5 text-[12px]">
                <FileSpreadsheet size={13} className="text-pos-600" />
                <span className="font-medium">Financial_Model_v3.2.xlsx</span>
                <span className="text-ink-400">uploaded Jul 12 · highest-priority source</span>
                <button onClick={ingestComputedWorkbook} className="ml-1 font-medium text-accent-700 hover:underline">Replace</button>
              </div>
            )}
          </div>
          <button
            onClick={ingestComputedWorkbook}
            disabled={computedWorkbook.ingesting}
            className="flex shrink-0 items-center gap-2 rounded-lg border-2 border-dashed border-accent-200 bg-white/60 px-4 py-3 text-[12px] font-medium text-accent-700 hover:border-accent-500 disabled:opacity-50"
          >
            <UploadCloud size={15} /> Drop computed workbook
          </button>
        </div>
        {computedWorkbook.uploaded && !computedWorkbook.ingesting && (equityIRR || projectIRR || minDSCR) && (
          <div className="mt-4 grid grid-cols-3 gap-3 border-t border-accent-100 pt-4 fade-up">
            {equityIRR && <ComputedStat label="Equity IRR (levered)" value={equityIRR.value} />}
            {projectIRR && <ComputedStat label="Project IRR" value={projectIRR.value} />}
            {minDSCR && <ComputedStat label="Target DSCR (min)" value={minDSCR.value} />}
          </div>
        )}
      </Card>

      {/* Output cards */}
      <div className="grid grid-cols-4 gap-4">
        {outputs.map((o) => (
          <Card key={o.id} className={cn("transition-shadow", preview === o.id && "ring-2 ring-accent-600/30")}>
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-ink-100 text-ink-600"><o.icon size={17} /></div>
            <p className="text-[14px] font-semibold">{o.title}</p>
            <div className="mt-1.5"><Badge tone="blue">{o.badge}</Badge></div>
            <p className="mt-2 text-[11.5px] leading-snug text-ink-500">
              {o.id === "excel" && `${blueprintRows.filter((r) => r.state !== "missing").length} of ${blueprintRows.length} cells populated · ${blueprintRows.filter((r) => r.state === "missing").length} blocked`}
              {o.id === "word" && "16 sections · editable"}
              {o.id === "pdf" && "Same content, board-ready layout"}
              {o.id === "deck" && "2 charts auto-generated · field-reviewable"}
            </p>
            <div className="mt-4 flex gap-1.5">
              <Button variant="secondary" className="px-2.5 py-1.5 text-[12px]" onClick={() => setPreview(preview === o.id ? null : o.id)}>
                {preview === o.id ? "Close" : "Preview"}
              </Button>
              <Button className="px-2.5 py-1.5 text-[12px]" onClick={() => handleGenerate(o.id)} disabled={busy === o.id}>
                {busy === o.id ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />} {busy === o.id ? "Generating…" : "Generate"}
              </Button>
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
              <Button onClick={() => handleGenerate(preview)}><FileDown size={13} /> Export</Button>
            </div>
          </div>
          {preview === "excel" && <ExcelPreview rows={blueprintRows} populated={blueprintPopulated} />}
          {(preview === "word" || preview === "pdf") && <MemoPreview icMemoSections={icMemoSections} icMemoContent={icMemoContent} />}
          {preview === "deck" && <DeckPreview icDeckSlides={icDeckSlides} fundingWaterfall={fundingWaterfall} revenueProjection={revenueProjection} />}
        </Card>
      )}

      {/* Memo Studio */}
      <MemoStudio
        templates={promptTemplates}
        generation={memoGeneration}
        icMemoSections={icMemoSections}
        icMemoContent={icMemoContent}
        onGenerate={startMemoGeneration}
        onClose={closeMemoGeneration}
        onExport={exportMemo}
      />
    </div>
  );
}

function ComputedStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white bg-white/70 p-3">
      <p className="text-[11px] font-medium text-ink-500">{label}</p>
      <p className="num mt-1 text-[19px] font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function ExcelPreview({ rows, populated }: { rows: BlueprintRow[]; populated: boolean }) {
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
          {rows.map((r, i) => (
            <tr
              key={r.cell}
              className={cn(r.state === "missing" && "bg-crit-50/60", populated && "fade-up")}
              style={populated ? { animationDelay: `${i * 70}ms`, animationFillMode: "backwards" } : undefined}
            >
              <td className="border-r border-ink-100 px-2 py-2 text-center font-mono text-[10.5px] text-ink-300">{i + 1}</td>
              <td className="num px-3 py-2 text-[11.5px] text-ink-500">{r.cell}</td>
              <td className="px-3 py-2 text-[12.5px] font-medium">{r.field}</td>
              <td className="num px-3 py-2 text-[12.5px] font-semibold">{r.value || <span className="font-normal text-crit-600">—</span>}</td>
              <td className="px-3 py-2">
                {r.state === "populated" && <Badge tone="green">populated</Badge>}
                {r.state === "computed" && <Badge tone="blue">computed in Excel</Badge>}
                {r.state === "missing" && <Badge tone="red">missing — blocked</Badge>}
              </td>
              <td className="px-3 py-2">{r.src ? <SourceChip doc={r.src} page={r.page ?? 0} field={r.field} value={r.value} /> : <span className="text-[11px] text-ink-300">—</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MemoPreview({ icMemoSections, icMemoContent }: { icMemoSections: string[]; icMemoContent: Record<string, string> }) {
  return (
    <div className="grid grid-cols-[1fr_240px] gap-6">
      <div className="max-w-prose space-y-5">
        {icMemoSections.slice(0, 3).map((title, i) => (
          <section key={title}>
            <h4 className="text-[17px] font-semibold tracking-tight">{i + 1}. {title}</h4>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-700">{icMemoContent[title]}</p>
          </section>
        ))}
      </div>
      <div className="space-y-1 border-l border-ink-100 pl-5">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Sections</p>
        {icMemoSections.map((s) => (
          <p key={s} className="flex items-center gap-2 text-[12px] text-ink-600">
            <Check size={12} className="text-pos-600" />
            <span>{s}</span>
          </p>
        ))}
      </div>
    </div>
  );
}

function DeckPreview({
  icDeckSlides, fundingWaterfall, revenueProjection,
}: {
  icDeckSlides: string[];
  fundingWaterfall: { name: string; value: number; color: string }[];
  revenueProjection: { year: string; revenue: number; cfads: number }[];
}) {
  return (
    <div className="grid grid-cols-5 gap-3">
      {icDeckSlides.map((s, i) => (
        <div key={s} className="aspect-video rounded-lg border border-ink-200 bg-white p-2.5 shadow-[0_1px_2px_rgba(11,14,20,0.04)]">
          <div className="flex items-center justify-between">
            <span className="num text-[9px] font-semibold text-ink-300">{String(i + 1).padStart(2, "0")}</span>
            {i === 0 && <span className="text-[8px] font-bold tracking-wide text-ink-900">vitta</span>}
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
                  <Line type="monotone" dataKey="revenue" stroke="#0e5f45" strokeWidth={1.5} dot={false} />
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

function MemoStudio({
  templates, generation, icMemoSections, icMemoContent, onGenerate, onClose, onExport,
}: {
  templates: { id: string; name: string; outputKind: string; systemPrompt: string; lastEditedBy: string; lastEditedAt: string }[];
  generation: { active: boolean; templateId: string | null; sectionIndex: number; done: boolean };
  icMemoSections: string[];
  icMemoContent: Record<string, string>;
  onGenerate: (id: string) => void;
  onClose: () => void;
  onExport: (format: "word" | "pdf") => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editing, setEditing] = useState<Record<string, string>>({});
  const updatePromptTemplate = useStore((s) => s.updatePromptTemplate);

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[15px] font-semibold tracking-tight">Memo Studio</p>
          <p className="mt-0.5 text-[12.5px] text-ink-500">Custom system prompts, tailored to how each firm writes.</p>
        </div>
      </div>

      {!generation.active && (
        <div className="grid grid-cols-4 gap-3">
          {templates.map((t) => (
            <div key={t.id} className="rounded-lg border border-ink-200 p-3.5">
              <p className="text-[13px] font-semibold leading-snug">{t.name}</p>
              <p className="mt-1 text-[11px] text-ink-400">Edited by {t.lastEditedBy} · {t.lastEditedAt}</p>
              <button
                onClick={() => setExpanded(expanded === t.id ? null : t.id)}
                className="mt-2 flex items-center gap-1 text-[11.5px] font-medium text-accent-700 hover:underline"
              >
                View system prompt <ChevronDown size={12} className={cn("transition-transform", expanded === t.id && "rotate-180")} />
              </button>
              {expanded === t.id && (
                <div className="mt-2 space-y-2">
                  <textarea
                    defaultValue={t.systemPrompt}
                    onChange={(e) => setEditing((s) => ({ ...s, [t.id]: e.target.value }))}
                    rows={6}
                    className="w-full rounded-lg border border-ink-200 bg-ink-50 px-2.5 py-1.5 font-mono text-[11px] leading-relaxed outline-none focus:border-accent-500"
                  />
                  <Button
                    variant="secondary"
                    className="w-full px-2.5 py-1.5 text-[11.5px]"
                    onClick={() => updatePromptTemplate(t.id, editing[t.id] ?? t.systemPrompt)}
                  >
                    Save prompt
                  </Button>
                </div>
              )}
              {t.id === "ic-memo" && (
                <Button className="mt-2.5 w-full px-2.5 py-1.5 text-[12px]" onClick={() => onGenerate(t.id)}>
                  <Play size={12} /> Generate
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {generation.active && (
        <div className="fade-up">
          <div className="mb-4 flex items-center justify-between border-b border-ink-100 pb-3">
            <div className="flex items-center gap-2">
              {!generation.done ? <Loader2 size={15} className="animate-spin text-accent-600" /> : <Check size={15} className="text-pos-600" />}
              <p className="text-[13.5px] font-semibold">{generation.done ? "IC Memo generated" : "Generating IC Memo…"}</p>
            </div>
            <div className="flex gap-2">
              {generation.done && (
                <>
                  <Button variant="secondary" className="px-2.5 py-1.5 text-[12px]" onClick={() => onExport("word")}><FileDown size={13} /> Export DOCX</Button>
                  <Button className="px-2.5 py-1.5 text-[12px]" onClick={() => onExport("pdf")}><FileDown size={13} /> Export PDF</Button>
                </>
              )}
              <Button variant="ghost" className="px-2.5 py-1.5 text-[12px]" onClick={onClose}>Close</Button>
            </div>
          </div>
          <div className="grid grid-cols-[220px_1fr] gap-6">
            <div className="space-y-1">
              {icMemoSections.map((s, i) => (
                <div
                  key={s}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12.5px]",
                    i <= generation.sectionIndex ? "text-pos-700" : "text-ink-400"
                  )}
                >
                  {i <= generation.sectionIndex ? <Check size={13} /> : <span className="h-3 w-3 rounded-full border border-ink-300" />}
                  {s}
                </div>
              ))}
            </div>
            <div className="max-h-[420px] space-y-4 overflow-y-auto pr-2">
              {icMemoSections.slice(0, generation.sectionIndex + 1).map((s, i) => (
                <section key={s} className="fade-up">
                  <h4 className="text-[14.5px] font-semibold tracking-tight">{i + 1}. {s}</h4>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-ink-700">{icMemoContent[s]}</p>
                </section>
              ))}
              {generation.sectionIndex < 0 && <p className="text-[12.5px] text-ink-400">Starting…</p>}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
