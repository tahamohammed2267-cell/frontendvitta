import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Play, Share2 } from "lucide-react";
import { checklist, conflicts, documents, projects } from "../../lib/mockData";
import { Badge, Button } from "../../lib/ui";
import { cn } from "../../lib/cn";
import OverviewTab from "./tabs/OverviewTab";
import DocumentsTab from "./tabs/DocumentsTab";
import ExtractionTab from "./tabs/ExtractionTab";
import ReconciliationTab from "./tabs/ReconciliationTab";
import IntelligenceTab from "./tabs/IntelligenceTab";
import ChecklistTab from "./tabs/ChecklistTab";
import OutputsTab from "./tabs/OutputsTab";
import DownloadsTab from "./tabs/DownloadsTab";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "documents", label: "Documents", count: documents.length },
  { id: "extraction", label: "Data Extraction" },
  { id: "reconciliation", label: "Reconciliation", count: conflicts.filter((c) => c.status === "open").length, warn: true },
  { id: "intelligence", label: "Intelligence" },
  { id: "checklist", label: "Checklist", count: checklist.filter((c) => c.status !== "present").length, warn: true },
  { id: "outputs", label: "Outputs" },
  { id: "downloads", label: "Downloads" },
];

export default function ProjectWorkspace() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") ?? "overview";
  const project = projects.find((p) => p.id === id) ?? projects[0];

  return (
    <div>
      {/* Header */}
      <div className="border-b border-ink-200 bg-white px-6 pb-0 pt-5">
        <div className="mx-auto max-w-[1200px]">
          <Link to="/projects" className="mb-2 inline-flex items-center gap-1 text-[12px] font-medium text-ink-400 hover:text-ink-700">
            <ArrowLeft size={13} /> All deals
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-[22px] font-semibold tracking-tight">{project.name}</h1>
                <Badge tone="blue">{project.status}</Badge>
              </div>
              <div className="mt-1.5 flex items-center gap-2 text-[12.5px] text-ink-500">
                <span>{project.technology}{project.infraSubType ? ` · ${project.infraSubType}` : ""}</span>
                <span className="text-ink-300">·</span>
                <span>{project.country}</span>
                {project.capacityMW && (<><span className="text-ink-300">·</span><span className="num">{project.capacityMW} MW</span></>)}
                <span className="text-ink-300">·</span>
                <span className="num">€{project.dealSizeM}m</span>
                <span className="text-ink-300">·</span>
                <span>Stage: {project.stage}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary"><Share2 size={14} /> Share</Button>
              <Button onClick={() => setParams({ tab: "outputs" })}><Play size={14} /> Generate Output</Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-4 flex gap-1 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setParams({ tab: t.id })}
                className={cn(
                  "relative flex items-center gap-1.5 whitespace-nowrap rounded-t-lg px-3.5 py-2.5 text-[13px] font-medium transition-colors",
                  tab === t.id ? "text-ink-900" : "text-ink-500 hover:text-ink-800"
                )}
              >
                {t.label}
                {t.count !== undefined && (
                  <span className={cn(
                    "num rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold",
                    t.warn && t.count > 0 ? "bg-warn-100 text-warn-700" : "bg-ink-100 text-ink-500"
                  )}>
                    {t.count}
                  </span>
                )}
                {tab === t.id && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-accent-600" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="mx-auto max-w-[1200px] px-6 py-6" key={tab}>
        <div className="fade-up">
          {tab === "overview" && <OverviewTab />}
          {tab === "documents" && <DocumentsTab />}
          {tab === "extraction" && <ExtractionTab />}
          {tab === "reconciliation" && <ReconciliationTab />}
          {tab === "intelligence" && <IntelligenceTab />}
          {tab === "checklist" && <ChecklistTab />}
          {tab === "outputs" && <OutputsTab />}
          {tab === "downloads" && <DownloadsTab />}
        </div>
      </div>
    </div>
  );
}
