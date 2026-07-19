import { useState } from "react";
import { CheckCircle2, ChevronDown, FileUp, ScanText } from "lucide-react";
import { documents, type DealDocument } from "../../../lib/mockData";
import { Badge, Card, SourceChip } from "../../../lib/ui";
import { cn } from "../../../lib/cn";

const fmtChip = "bg-ink-50 text-ink-600 border-ink-200";

const sampleExtractions: Record<string, { field: string; value: string; page: number }[]> = {
  d1: [
    { field: "PPA Tariff", value: "€52.40 /MWh", page: 22 },
    { field: "PPA Tenor", value: "10 years", page: 22 },
    { field: "Escalation", value: "1.8% p.a.", page: 22 },
  ],
  d2: [
    { field: "Total CAPEX", value: "€96.4M", page: 14 },
    { field: "Installed Capacity", value: "120 MWp", page: 3 },
    { field: "Guaranteed COD", value: "Q3 2027", page: 31 },
  ],
};

export default function DocumentsTab() {
  const [open, setOpen] = useState<string | null>(null);
  const done = documents.filter((d) => d.status === "done");

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex items-center gap-6 rounded-lg border border-ink-200 bg-white px-5 py-3.5 text-[12.5px]">
        <span className="text-ink-500"><span className="num font-semibold text-ink-900">14</span> uploaded</span>
        <span className="text-ink-500"><span className="num font-semibold text-pos-700">11</span> complete</span>
        <span className="text-ink-500"><span className="num font-semibold text-accent-700">3</span> processing</span>
        <span className="text-ink-500"><span className="num font-semibold text-ink-900">253</span> fields extracted</span>
        <span className="ml-auto flex items-center gap-1.5 text-ink-400"><ScanText size={14} /> OCR fallback active on scanned docs</span>
      </div>

      {/* Dropzone */}
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-ink-200 bg-white py-9 text-center transition-colors hover:border-accent-500/50 hover:bg-accent-50/30">
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-50 text-accent-600"><FileUp size={18} /></div>
        <p className="text-[13.5px] font-medium">Drop deal documents here</p>
        <p className="mt-1 text-[12px] text-ink-500">PDF, DOCX, XLSX, PPTX, scanned images · parsing, classification and extraction run automatically</p>
      </div>

      {/* Table */}
      <Card pad={false} className="overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-ink-100 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-400">
              <th className="px-5 py-3">Document</th>
              <th className="px-4 py-3">Classified type</th>
              <th className="px-4 py-3">Pages / size</th>
              <th className="px-4 py-3">Uploaded</th>
              <th className="px-4 py-3">Fields</th>
              <th className="px-5 py-3">Status</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {documents.map((d) => (
              <DocRow key={d.id} d={d} open={open === d.id} onToggle={() => setOpen(open === d.id ? null : d.id)} />
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function DocRow({ d, open, onToggle }: { d: DealDocument; open: boolean; onToggle: () => void }) {
  const samples = sampleExtractions[d.id];
  return (
    <>
      <tr onClick={onToggle} className="cursor-pointer transition-colors hover:bg-ink-50">
        <td className="px-5 py-3">
          <div className="flex items-center gap-2.5">
            <span className={cn("rounded border px-1.5 py-0.5 text-[10px] font-bold", fmtChip)}>{d.format}</span>
            <span className="max-w-[280px] truncate text-[13px] font-medium">{d.name}</span>
            {d.ocrApplied && <Badge tone="gray">OCR</Badge>}
          </div>
        </td>
        <td className="px-4 py-3">{d.status === "done" ? <Badge tone="blue">{d.type}</Badge> : <span className="text-[12px] text-ink-400">{d.status === "classifying" ? "detecting…" : d.type}</span>}</td>
        <td className="num px-4 py-3 text-[12px] text-ink-500">{d.pages}p · {d.sizeMB}MB</td>
        <td className="px-4 py-3 text-[12px] text-ink-500">{d.uploadedBy}<br /><span className="text-ink-400">{d.uploadedAt}</span></td>
        <td className="num px-4 py-3 text-[12.5px] font-medium">{d.fieldsExtracted > 0 ? d.fieldsExtracted : "—"}</td>
        <td className="px-5 py-3"><StatusCell d={d} /></td>
        <td className="pr-4"><ChevronDown size={14} className={cn("text-ink-400 transition-transform", open && "rotate-180")} /></td>
      </tr>
      {open && (
        <tr className="bg-ink-50/50">
          <td colSpan={7} className="px-5 py-4">
            <div className="flex flex-wrap gap-6">
              <div>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Extraction passes</p>
                <div className="space-y-1 text-[12.5px] text-ink-600">
                  <p><span className="num font-medium">{Math.ceil(d.fieldsExtracted * 0.4)}</span> blueprint fields</p>
                  <p><span className="num font-medium">{Math.floor(d.fieldsExtracted * 0.6)}</span> open-pass values</p>
                  <p><span className="num font-medium">{d.format === "XLSX" ? 6 : 2}</span> structured tables</p>
                </div>
              </div>
              {samples && (
                <div className="min-w-[320px] flex-1">
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Sample extractions</p>
                  <div className="space-y-1.5">
                    {samples.map((s) => (
                      <div key={s.field} className="flex items-center gap-3">
                        <span className="w-36 text-[12.5px] text-ink-500">{s.field}</span>
                        <span className="num text-[12.5px] font-semibold">{s.value}</span>
                        <SourceChip doc={d.name} page={s.page} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function StatusCell({ d }: { d: DealDocument }) {
  if (d.status === "done")
    return <span className="flex items-center gap-1.5 text-[12.5px] font-medium text-pos-700"><CheckCircle2 size={14} /> Done</span>;
  return (
    <div className="w-36">
      <p className="mb-1 text-[11.5px] font-medium capitalize text-accent-700 pulse-soft">{d.status}…</p>
      <div className="h-1.5 overflow-hidden rounded-full bg-ink-100">
        <div className="h-full rounded-full bg-accent-600 transition-all" style={{ width: `${d.progress}%` }} />
      </div>
    </div>
  );
}
