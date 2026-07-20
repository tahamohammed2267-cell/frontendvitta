import { useState } from "react";
import { FileText } from "lucide-react";
import { projects } from "../../lib/mockData";
import { assembleReport, reportSectionLabels, type ReportSectionId } from "../../lib/intelligence/reportAssembly";
import { Badge, Button, Card, CardHeader, Modal } from "../../lib/ui";
import { cn } from "../../lib/cn";
import EntityRefChip from "./EntityRefChip";

const allSections = Object.keys(reportSectionLabels) as ReportSectionId[];

export default function IntelligenceReportBuilder() {
  const [dealId, setDealId] = useState(projects[0].id);
  const [selected, setSelected] = useState<ReportSectionId[]>(["decisions", "recommendations"]);
  const [previewOpen, setPreviewOpen] = useState(false);

  function toggle(id: ReportSectionId) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  const report = previewOpen ? assembleReport(dealId, selected) : null;

  return (
    <Card>
      <CardHeader title="Generate an institutional report" sub="Combine decisions, analyst intelligence, playbooks, recommendations and lessons into one document" />

      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-400">Deal</p>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {projects.map((p) => (
          <button
            key={p.id}
            onClick={() => setDealId(p.id)}
            className={cn("rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors", dealId === p.id ? "border-ink-900 bg-ink-900 text-white" : "border-ink-200 text-ink-600 hover:border-ink-300")}
          >
            {p.name}
          </button>
        ))}
      </div>

      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-400">Sections</p>
      <div className="mb-5 flex flex-wrap gap-1.5">
        {allSections.map((id) => (
          <button
            key={id}
            onClick={() => toggle(id)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors",
              selected.includes(id) ? "border-accent-600 bg-accent-50 text-accent-700" : "border-ink-200 text-ink-600 hover:border-ink-300"
            )}
          >
            {reportSectionLabels[id]}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <Badge tone="gray">Preview only — this mock does not produce downloadable files</Badge>
        <Button className={selected.length === 0 ? "pointer-events-none opacity-40" : ""} onClick={() => setPreviewOpen(true)}>
          <FileText size={14} /> Generate report
        </Button>
      </div>

      {report && (
        <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} title={`Institutional Report — ${report.dealName}`} sub={`Generated ${report.generatedAt}`} width="820px">
          <div className="space-y-5">
            {report.sections.every((s) => s.blocks.length === 0) && (
              <p className="py-6 text-center text-[12.5px] text-ink-400">No content available for the selected sections on this deal yet.</p>
            )}
            {report.sections.map((s) => s.blocks.length > 0 && (
              <div key={s.id}>
                <p className="mb-2 text-[13px] font-semibold text-ink-900">{s.title}</p>
                <div className="space-y-2.5">
                  {s.blocks.map((b, i) => (
                    <div key={i} className="rounded-lg border border-ink-100 p-3.5">
                      <p className="text-[12.5px] font-medium text-ink-800">{b.heading}</p>
                      {b.body.length > 0 && (
                        <ul className="mt-1.5 list-disc space-y-1 pl-4">
                          {b.body.map((line, j) => <li key={j} className="text-[12px] leading-relaxed text-ink-600">{line}</li>)}
                        </ul>
                      )}
                      {b.evidence.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {b.evidence.map((e) => <EntityRefChip key={e.kind + e.id} entityRef={e} />)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </Card>
  );
}
