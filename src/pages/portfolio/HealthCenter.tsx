import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, HeartPulse, Pencil } from "lucide-react";
import { findIndustry, findRegion, projectsRequiringAttention, type HealthFlagRule, type Severity } from "../../lib/portfolioData";
import { Badge, Button, Card, CardHeader, EmptyState, SeverityBadge } from "../../lib/ui";
import { cn } from "../../lib/cn";
import DashboardCanvas from "./builder/DashboardCanvas";
import { dashboardsForScope, useDashboards } from "./builder/dashboardStore";

const ruleLabels: Record<HealthFlagRule, string> = {
  revenueDown10: "Revenue down >10%",
  ebitdaMarginBelowTarget: "EBITDA margin below target",
  generationBelowForecast: "Generation below forecast",
  highMaintenanceCost: "High maintenance costs",
  misOverdue: "MIS overdue",
  missingData: "Missing data",
  covenantBreach: "Covenant breach",
  lowAssetHealth: "Low asset health score",
};

const sevFilters: (Severity | "all")[] = ["all", "critical", "high", "medium", "low"];

export default function HealthCenter() {
  const [sevFilter, setSevFilter] = useState<(typeof sevFilters)[number]>("all");
  const [ruleFilter, setRuleFilter] = useState<HealthFlagRule | null>(null);
  useDashboards();

  const all = projectsRequiringAttention();
  const healthDash = dashboardsForScope("health", "")[0];

  const ruleCounts = useMemo(() => {
    const m = new Map<HealthFlagRule, number>();
    all.forEach(({ flags }) => flags.forEach((f) => m.set(f.rule, (m.get(f.rule) ?? 0) + 1)));
    return [...m.entries()];
  }, [all]);

  const rows = all.filter(({ flags }) => {
    const bySeverity = sevFilter === "all" || flags.some((f) => f.severity === sevFilter);
    const byRule = !ruleFilter || flags.some((f) => f.rule === ruleFilter);
    return bySeverity && byRule;
  });

  const criticalCount = all.filter(({ flags }) => flags.some((f) => f.severity === "critical")).length;

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-6">
      <Link to="/portfolio" className="mb-3 inline-flex items-center gap-1 text-[12px] font-medium text-ink-400 hover:text-ink-700 fade-up">
        <ArrowLeft size={13} /> Portfolio
      </Link>
      <div className="mb-6 flex items-center gap-2.5 fade-up">
        <HeartPulse size={20} className="text-warn-600" />
        <h1 className="text-[22px] font-semibold tracking-tight">Portfolio Health Center</h1>
      </div>

      <div className="mb-6 grid grid-cols-4 gap-4 fade-up">
        <Card><p className="text-[12px] font-medium text-ink-500">Projects flagged</p><p className="num mt-1 text-[26px] font-semibold text-warn-700">{all.length}</p></Card>
        <Card><p className="text-[12px] font-medium text-ink-500">Critical</p><p className="num mt-1 text-[26px] font-semibold text-crit-700">{criticalCount}</p></Card>
        <Card><p className="text-[12px] font-medium text-ink-500">Total flags</p><p className="num mt-1 text-[26px] font-semibold text-ink-900">{all.reduce((n, r) => n + r.flags.length, 0)}</p></Card>
        <Card><p className="text-[12px] font-medium text-ink-500">Rule types triggered</p><p className="num mt-1 text-[26px] font-semibold text-ink-900">{ruleCounts.length}</p></Card>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3 fade-up">
        <div className="flex gap-1 rounded-lg border border-ink-200 bg-white p-1">
          {sevFilters.map((s) => (
            <button
              key={s}
              onClick={() => setSevFilter(s)}
              className={cn("rounded-md px-3 py-1.5 text-[12.5px] font-medium capitalize transition-colors", sevFilter === s ? "bg-ink-900 text-white" : "text-ink-500 hover:text-ink-900")}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ruleCounts.map(([rule, count]) => (
            <button
              key={rule}
              onClick={() => setRuleFilter(ruleFilter === rule ? null : rule)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11.5px] font-medium transition-colors",
                ruleFilter === rule ? "border-accent-600 bg-accent-50 text-accent-700" : "border-ink-200 bg-white text-ink-500 hover:border-ink-300"
              )}
            >
              {ruleLabels[rule]} <span className="num opacity-70">{count}</span>
            </button>
          ))}
        </div>
      </div>

      <Card pad={false} className="overflow-hidden fade-up">
        {rows.length === 0 ? (
          <EmptyState icon={<HeartPulse size={20} />} title="No projects match these filters" sub="Try clearing the severity or rule filters." />
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-ink-100 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-400">
                <th className="px-5 py-3">Project</th>
                <th className="px-4 py-3">Industry / Region</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Flags</th>
                <th className="px-5 py-3 text-right">Worst severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {rows.map(({ project, flags }) => {
                const ind = findIndustry(project.industryKey);
                const reg = findRegion(project.regionId);
                const worst = flags.reduce((w, f) => (sevRank[f.severity] < sevRank[w] ? f.severity : w), "low" as Severity);
                return (
                  <tr key={project.id} className="cursor-pointer transition-colors hover:bg-ink-50">
                    <td className="px-5 py-3.5">
                      <Link to={`/portfolio/${project.industryKey}/${project.regionId}/${project.companyId}/${project.id}`} className="block">
                        <p className="text-[13.5px] font-semibold hover:text-accent-700 hover:underline">{project.name}</p>
                        <p className="text-[11.5px] text-ink-400">{project.country}</p>
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 text-[12.5px] text-ink-600">{ind?.name} · {reg?.name}</td>
                    <td className="px-4 py-3.5"><Badge tone="gray">{project.status}</Badge></td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {flags.map((f) => <Badge key={f.rule} tone={f.severity === "critical" ? "red" : f.severity === "high" ? "orange" : "gray"}>{ruleLabels[f.rule]}</Badge>)}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right"><SeverityBadge severity={worst} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      {healthDash && (
        <Card pad={false} className="mt-4 fade-up">
          <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
            <CardHeader title={healthDash.name} sub="Custom command-center dashboard" />
            <Link to={`/portfolio/dashboards/${healthDash.id}/edit`}>
              <Button variant="secondary" className="px-2.5 py-1.5 text-[12px]"><Pencil size={12} /> Edit</Button>
            </Link>
          </div>
          <div className="p-5">
            <DashboardCanvas widgets={healthDash.widgets} scope={healthDash.scope} scopeId={healthDash.scopeId} editable={false} />
          </div>
        </Card>
      )}
    </div>
  );
}

const sevRank: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 };
