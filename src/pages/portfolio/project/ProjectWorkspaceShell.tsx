import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, UploadCloud } from "lucide-react";
import { findCompany, findIndustry, findProject, findRegion, type DetectedChange, type MISFormat } from "../../../lib/portfolioData";
import { risksForProject } from "../../../lib/projectIntelligence";
import { Badge, Button, EmptyState } from "../../../lib/ui";
import { cn } from "../../../lib/cn";
import MISUploadFlow from "../mis/MISUploadFlow";

import OverviewTab from "./OverviewTab";
import DashboardsTab from "./DashboardsTab";
import FinancialsTab from "./FinancialsTab";
import BusinessDriversTab from "./BusinessDriversTab";
import BenchmarkingTab from "./BenchmarkingTab";
import MISTab from "./MISTab";
import StoryAndReportsTab from "./StoryAndReportsTab";

const statusTone: Record<string, "blue" | "orange" | "green" | "gray" | "red"> = {
  Operational: "green", "Ramp-up": "blue", "Under Construction": "gray", Watch: "orange", "At Risk": "red",
};

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "dashboards", label: "Dashboards" },
  { id: "financials", label: "Financials" },
  { id: "business-drivers", label: "Business Drivers" },
  { id: "benchmarking", label: "Benchmarking" },
  { id: "mis", label: "MIS" },
  { id: "story-reports", label: "Story and Reports" },
] as const;

export default function ProjectWorkspaceShell() {
  const { industry, region, company, project } = useParams();
  const [params, setParams] = useSearchParams();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [auditTrail, setAuditTrail] = useState<{ id: string; at: string; user: string; action: string; detail: string }[] | null>(null);
  const tab = params.get("tab") ?? "overview";

  const ind = findIndustry(industry ?? "");
  const reg = findRegion(region ?? "");
  const comp = findCompany(company ?? "");
  const proj = findProject(project ?? "");

  if (!ind || !reg || !comp || !proj) {
    return (
      <div className="mx-auto max-w-[1200px] px-6 py-6">
        <EmptyState icon={<ArrowLeft size={20} />} title="Project not found" sub="Choose a project from the region dashboard." />
      </div>
    );
  }

  const trail = auditTrail ?? proj.auditTrail;
  const risks = risksForProject(proj.id);

  function handleConfirm(changes: DetectedChange[], fileName: string, _format: MISFormat) {
    const accepted = changes.filter((c) => c.decision === "accepted").length;
    const entry = {
      id: `au-new-${Date.now()}`,
      at: "Just now", user: "Jane Moreau", action: "MIS applied",
      detail: `New version — ${accepted} of ${changes.length} detected changes accepted (${fileName})`,
    };
    setAuditTrail([entry, ...trail]);
  }

  return (
    <div>
      <div className="border-b border-ink-200 bg-white px-6 pb-0 pt-5">
        <div className="mx-auto max-w-[1200px]">
          <Link to={`/portfolio/${ind.key}/${reg.id}`} className="mb-2 inline-flex items-center gap-1 text-[12px] font-medium text-ink-400 hover:text-ink-700">
            <ArrowLeft size={13} /> {reg.name}
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-[22px] font-semibold tracking-tight">{proj.name}</h1>
                <Badge tone={statusTone[proj.status]}>{proj.status}</Badge>
                {risks.length > 0 && <Badge tone="orange">{risks.length} risk{risks.length > 1 ? "s" : ""}</Badge>}
              </div>
              <div className="mt-1.5 flex items-center gap-2 text-[12.5px] text-ink-500">
                <span>{comp.name}</span>
                <span className="text-ink-300">·</span>
                <span>{proj.country}</span>
                {proj.capacityMW && (<><span className="text-ink-300">·</span><span className="num">{proj.capacityMW} MW</span></>)}
                <span className="text-ink-300">·</span>
                <span>{ind.name}</span>
                {proj.linkedDealId && <><span className="text-ink-300">·</span><Link to={`/projects/${proj.linkedDealId}`} className="text-accent-600 hover:underline">View diligence workspace</Link></>}
              </div>
            </div>
            <Button variant="secondary" onClick={() => setUploadOpen(true)}><UploadCloud size={14} /> Upload MIS</Button>
          </div>

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
                {tab === t.id && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-accent-600" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-6 py-6" key={tab}>
        <div className="fade-up">
          {tab === "overview" && <OverviewTab project={proj} industry={ind} region={reg} company={comp} auditTrail={trail} onUploadMIS={() => setUploadOpen(true)} />}
          {tab === "dashboards" && <DashboardsTab project={proj} />}
          {tab === "financials" && <FinancialsTab project={proj} />}
          {tab === "business-drivers" && <BusinessDriversTab project={proj} industry={ind} />}
          {tab === "benchmarking" && <BenchmarkingTab project={proj} />}
          {tab === "mis" && <MISTab project={proj} />}
          {tab === "story-reports" && <StoryAndReportsTab project={proj} />}
        </div>
      </div>

      <MISUploadFlow open={uploadOpen} onClose={() => setUploadOpen(false)} projectName={proj.name} onConfirm={handleConfirm} />
    </div>
  );
}
