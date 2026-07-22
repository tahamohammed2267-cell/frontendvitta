import { useState } from "react";
import { BookOpen, Check, FileSpreadsheet, FileText, Gavel, Image as ImageIcon, ShieldCheck } from "lucide-react";
import type { MISDocKind, PortfolioProject } from "../../../lib/portfolioData";
import { storiesForProject } from "../../../lib/projectIntelligence";
import { Badge, Button, Card, CardHeader, EmptyState, SectionLabel } from "../../../lib/ui";
import { cn } from "../../../lib/cn";
import { metricLabels } from "../builder/metricSeries";

const docIcon: Record<MISDocKind, typeof FileText> = {
  MIS: FileSpreadsheet, "Financial Statement": FileText, Contract: Gavel, "Technical Report": ImageIcon,
  "EPC Document": ImageIcon, "Inspection Report": ShieldCheck, "Regulatory Document": ShieldCheck, Other: FileText,
};

const docKinds: (MISDocKind | "All")[] = ["All", "MIS", "Financial Statement", "Contract", "Technical Report", "EPC Document", "Inspection Report", "Regulatory Document", "Other"];

const reportSections = [
  { id: "dashboards", label: "Dashboards" },
  { id: "benchmarks", label: "Benchmarks" },
  { id: "insights", label: "AI Insights" },
  { id: "misIntelligence", label: "MIS Intelligence" },
  { id: "charts", label: "Charts" },
  { id: "tables", label: "Tables" },
];

function StorySection({ proj }: { proj: PortfolioProject }) {
  const stories = storiesForProject(proj.id);
  return (
    <div>
      <SectionLabel>Story</SectionLabel>
      {stories.length === 0 ? (
        <EmptyState icon={<BookOpen size={20} />} title="No story yet" sub="Vitta AI hasn't generated a narrative for this project yet." />
      ) : (
        <div className="space-y-4">
          <p className="text-[12.5px] text-ink-500">An automatically generated narrative of this project's performance — every figure below is drawn directly from the underlying data.</p>
          {stories.map((s) => (
            <Card key={s.id}>
              <CardHeader title={s.period} />
              <p className="text-[13.5px] leading-relaxed text-ink-800">{s.narrative}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {s.citedMetrics.map((m) => (
                  <Badge key={m} tone="gray">{metricLabels[m as keyof typeof metricLabels] ?? m}</Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function DocumentsSection({ proj }: { proj: PortfolioProject }) {
  const [filter, setFilter] = useState<MISDocKind | "All">("All");
  const rows = filter === "All" ? proj.documents : proj.documents.filter((d) => d.kind === filter);

  return (
    <div>
      <SectionLabel>Documents</SectionLabel>
      {proj.documents.length === 0 ? (
        <EmptyState icon={<FileText size={20} />} title="No documents yet" sub="No documents have been uploaded for this project." />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {docKinds.map((k) => {
              const count = k === "All" ? proj.documents.length : proj.documents.filter((d) => d.kind === k).length;
              if (k !== "All" && count === 0) return null;
              return (
                <button key={k} onClick={() => setFilter(k)} className={cn("rounded-md border px-3 py-1.5 text-[12px] font-medium", filter === k ? "border-ink-900 bg-ink-900 text-white" : "border-ink-200 text-ink-600 hover:border-ink-300")}>{k} ({count})</button>
              );
            })}
          </div>

          <Card pad={false} className="overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-ink-100 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-400">
                  <th className="px-5 py-3">Document</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Uploaded</th>
                  <th className="px-5 py-3 text-right">By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {rows.map((d) => {
                  const Icon = docIcon[d.kind];
                  return (
                    <tr key={d.id} className="hover:bg-ink-50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <Icon size={15} className="shrink-0 text-ink-400" />
                          <span className="text-[13px] font-medium">{d.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3"><Badge tone="gray">{d.kind}</Badge></td>
                      <td className="px-4 py-3 text-[12.5px] text-ink-500">{d.uploadedAt}</td>
                      <td className="px-5 py-3 text-right text-[12.5px] text-ink-500">{d.uploadedBy}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </div>
  );
}

function ReportsSection({ proj }: { proj: PortfolioProject }) {
  const [selected, setSelected] = useState<string[]>(["dashboards", "insights"]);
  const [generated, setGenerated] = useState(false);

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  function generate() {
    setGenerated(true);
    setTimeout(() => setGenerated(false), 1500);
  }

  return (
    <div>
      <SectionLabel>Reports</SectionLabel>
      <Card>
        <CardHeader title="Generate a report" sub={`For ${proj.name} — choose any combination of sections`} />
        <div className="flex flex-wrap gap-1.5">
          {reportSections.map((s) => (
            <button
              key={s.id}
              onClick={() => toggle(s.id)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors",
                selected.includes(s.id) ? "border-accent-600 bg-accent-50 text-accent-700" : "border-ink-200 text-ink-600 hover:border-ink-300"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="mt-5 flex justify-end">
          <Button className={selected.length === 0 ? "pointer-events-none opacity-40" : ""} onClick={generate}>
            {generated ? <Check size={14} /> : <FileText size={14} />} {generated ? "Report generated" : "Generate report"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default function StoryAndReportsTab({ project: proj }: { project: PortfolioProject }) {
  return (
    <div className="space-y-6">
      <StorySection proj={proj} />
      <DocumentsSection proj={proj} />
      <ReportsSection proj={proj} />
    </div>
  );
}
