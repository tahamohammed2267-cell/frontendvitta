import { useState } from "react";
import { Database, Download, FileSpreadsheet, FileText, FileType, Presentation } from "lucide-react";
import { generatedFiles } from "../../../lib/mockData";
import { Badge, Card } from "../../../lib/ui";
import { cn } from "../../../lib/cn";

const kindMeta: Record<string, { icon: typeof FileText; tone: "green" | "blue" | "red" | "orange" | "gray" }> = {
  "Excel Model": { icon: FileSpreadsheet, tone: "green" },
  "IC Memo (Word)": { icon: FileText, tone: "blue" },
  "IC Memo (PDF)": { icon: FileType, tone: "red" },
  "IC Deck (PPTX)": { icon: Presentation, tone: "orange" },
  "CSV Export": { icon: Database, tone: "gray" },
  "JSON Export": { icon: Database, tone: "gray" },
};

const filters = ["All", "Excel Model", "IC Memo (Word)", "IC Memo (PDF)", "IC Deck (PPTX)", "Exports"] as const;

export default function DownloadsTab() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const rows = generatedFiles.filter((f) => {
    if (filter === "All") return true;
    if (filter === "Exports") return f.kind.includes("Export");
    return f.kind === filter;
  });
  const latestByName = new Map<string, number>();
  generatedFiles.forEach((f) => {
    const base = f.name.replace(/_v\d+/, "");
    latestByName.set(base, Math.max(latestByName.get(base) ?? 0, f.version));
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-ink-500">Every generated file is kept per project — re-download anything without regenerating.</p>
        <div className="flex gap-1.5">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11.5px] font-medium transition-colors",
                filter === f ? "border-ink-900 bg-ink-900 text-white" : "border-ink-200 bg-white text-ink-500 hover:border-ink-300"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <Card pad={false} className="overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-ink-100 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-400">
              <th className="px-5 py-3">File</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Version</th>
              <th className="px-4 py-3">Size</th>
              <th className="px-4 py-3">Generated</th>
              <th className="px-4 py-3">By</th>
              <th className="px-5 py-3 text-right">Download</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {rows.map((f) => {
              const meta = kindMeta[f.kind];
              const isLatest = latestByName.get(f.name.replace(/_v\d+/, "")) === f.version;
              return (
                <tr key={f.id} className={cn("transition-colors hover:bg-ink-50", !isLatest && "opacity-60")}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <meta.icon size={16} className="shrink-0 text-ink-400" />
                      <span className="text-[13px] font-medium">{f.name}</span>
                      {isLatest && <Badge tone="green">Latest</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge tone={meta.tone}>{f.kind}</Badge></td>
                  <td className="px-4 py-3"><span className="num rounded bg-ink-100 px-1.5 py-0.5 text-[11px] font-medium text-ink-600">v{f.version}</span></td>
                  <td className="num px-4 py-3 text-[12.5px] text-ink-600">{f.sizeMB} MB</td>
                  <td className="px-4 py-3 text-[12.5px] text-ink-500">{f.generatedAt}</td>
                  <td className="px-4 py-3 text-[12.5px] text-ink-500">{f.generatedBy}</td>
                  <td className="px-5 py-3 text-right">
                    <button className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-2.5 py-1.5 text-[12px] font-medium text-ink-700 hover:bg-ink-50">
                      <Download size={13} /> Download
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
      <p className="text-[12px] text-ink-400">7 files · 14.2 MB total · last generated Jul 17, 18:15</p>
    </div>
  );
}
