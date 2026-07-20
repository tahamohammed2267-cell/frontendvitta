import { useState } from "react";
import { FileSpreadsheet, FileText, Gavel, Image as ImageIcon, ShieldCheck } from "lucide-react";
import type { MISDocKind, PortfolioProject } from "../../../lib/portfolioData";
import { Badge, Card, EmptyState } from "../../../lib/ui";
import { cn } from "../../../lib/cn";

const docIcon: Record<MISDocKind, typeof FileText> = {
  MIS: FileSpreadsheet, "Financial Statement": FileText, Contract: Gavel, "Technical Report": ImageIcon,
  "EPC Document": ImageIcon, "Inspection Report": ShieldCheck, "Regulatory Document": ShieldCheck, Other: FileText,
};

const kinds: (MISDocKind | "All")[] = ["All", "MIS", "Financial Statement", "Contract", "Technical Report", "EPC Document", "Inspection Report", "Regulatory Document", "Other"];

export default function DocumentsTab({ project: proj }: { project: PortfolioProject }) {
  const [filter, setFilter] = useState<MISDocKind | "All">("All");
  const rows = filter === "All" ? proj.documents : proj.documents.filter((d) => d.kind === filter);

  if (proj.documents.length === 0) {
    return <EmptyState icon={<FileText size={20} />} title="No documents yet" sub="No documents have been uploaded for this project." />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {kinds.map((k) => {
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
  );
}
