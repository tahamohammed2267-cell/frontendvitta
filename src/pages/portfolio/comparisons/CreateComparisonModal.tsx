import { useMemo, useState } from "react";
import type { MetricKey, ProjectStatus, TimeRange } from "../../../lib/portfolioData";
import { driverSchemaLabels, findIndustry } from "../../../lib/portfolioData";
import { Button, Modal, SectionLabel } from "../../../lib/ui";
import { cn } from "../../../lib/cn";
import { metricCategories, metricCategoryLabels, metricLabels, type MetricCategory } from "../builder/metricSeries";
import EntityPicker, { EntityChip } from "./EntityPicker";
import type { ComparableEntity } from "./comparisonEntities";
import { addComparison } from "./comparisonStore";

const timeRanges: TimeRange[] = ["MTD", "QTD", "YTD", "Custom"];
const statuses: ProjectStatus[] = ["Operational", "Ramp-up", "Under Construction", "Watch", "At Risk"];
const categoryOrder: MetricCategory[] = ["topline", "earnings", "costBreakdown", "operationalKPIs", "financialKPIs", "custom"];

export default function CreateComparisonModal({
  open, onClose, onCreated,
}: { open: boolean; onClose: () => void; onCreated: (id: string) => void }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [entities, setEntities] = useState<ComparableEntity[]>([]);
  const [metrics, setMetrics] = useState<MetricKey[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>("YTD");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus[]>([]);

  const metricsByCategory = useMemo(() => {
    const m = new Map<MetricCategory, MetricKey[]>();
    (Object.keys(metricLabels) as MetricKey[]).forEach((k) => {
      const cat = metricCategories[k];
      m.set(cat, [...(m.get(cat) ?? []), k]);
    });
    return m;
  }, []);

  const driverIndustries = [...new Set(entities.map((e) => e.industryKey).filter(Boolean))];
  const compatibleDriverKind = driverIndustries.length === 1 ? findIndustry(driverIndustries[0]!)?.driverKind : null;

  function reset() {
    setStep(1); setName(""); setEntities([]); setMetrics([]); setTimeRange("YTD"); setStatusFilter([]);
  }
  function close() { reset(); onClose(); }

  function toggleMetric(m: MetricKey) {
    setMetrics((ms) => (ms.includes(m) ? ms.filter((x) => x !== m) : [...ms, m]));
  }
  function toggleStatus(s: ProjectStatus) {
    setStatusFilter((ss) => (ss.includes(s) ? ss.filter((x) => x !== s) : [...ss, s]));
  }

  function submit() {
    if (entities.length < 2 || metrics.length === 0) return;
    const id = `cmp-${Date.now()}`;
    const now = "Just now";
    addComparison({
      id, name: name.trim() || "New Comparison", entities, metrics, timeRange,
      comparisonFilters: statusFilter.length > 0 ? { status: statusFilter } : {},
      createdAt: now, updatedAt: now, owner: "Jane Moreau", sharedWith: [],
    });
    close();
    onCreated(id);
  }

  const showFilters = entities.some((e) => e.kind !== "project");

  return (
    <Modal open={open} onClose={close} title="Create comparison" sub={`Step ${step} of 4`} width="600px">
      {step === 1 && (
        <div>
          <p className="mb-1.5 block text-[12px] font-medium text-ink-600">Comparison name</p>
          <input
            value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Solar vs Wind — Q3 review"
            className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-[13px] outline-none placeholder:text-ink-400 focus:border-accent-500"
          />
          <div className="mt-5 flex justify-end"><Button onClick={() => setStep(2)}>Continue</Button></div>
        </div>
      )}

      {step === 2 && (
        <div>
          <p className="mb-3 text-[12.5px] text-ink-500">Add any mix of projects, regions, industries or the global portfolio — at least 2 required.</p>
          {entities.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {entities.map((e) => (
                <EntityChip key={e.id} entity={e} onRemove={() => setEntities((es) => es.filter((x) => x.id !== e.id))} />
              ))}
            </div>
          )}
          <EntityPicker selected={entities} onAdd={(e) => setEntities((es) => [...es, e])} />
          <div className="mt-5 flex justify-between">
            <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
            <Button className={entities.length < 2 ? "pointer-events-none opacity-40" : ""} onClick={() => setStep(3)}>Continue</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <div className="max-h-[320px] space-y-4 overflow-y-auto pr-1">
            {compatibleDriverKind && (
              <div>
                <SectionLabel>{metricCategoryLabels.businessDrivers}</SectionLabel>
                <div className="flex flex-wrap gap-1.5">
                  {driverSchemaLabels[compatibleDriverKind].map((label) => (
                    <span key={label} className="rounded-md border border-ink-200 px-3 py-1.5 text-[12px] font-medium text-ink-400" title="Business driver metrics are shown for reference — select from the categories below for numeric comparison.">
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {categoryOrder.map((cat) => {
              const keys = metricsByCategory.get(cat) ?? [];
              if (keys.length === 0) return null;
              return (
                <div key={cat}>
                  <SectionLabel>{metricCategoryLabels[cat]}</SectionLabel>
                  <div className="flex flex-wrap gap-1.5">
                    {keys.map((m) => (
                      <button
                        key={m}
                        onClick={() => toggleMetric(m)}
                        className={cn(
                          "rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors",
                          metrics.includes(m) ? "border-accent-600 bg-accent-50 text-accent-700" : "border-ink-200 text-ink-600 hover:border-ink-300"
                        )}
                      >
                        {metricLabels[m]}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 flex justify-between">
            <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
            <Button className={metrics.length === 0 ? "pointer-events-none opacity-40" : ""} onClick={() => setStep(4)}>Continue</Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Time range</p>
          <div className="mb-4 flex gap-1.5">
            {timeRanges.map((t) => (
              <button key={t} onClick={() => setTimeRange(t)} className={cn("rounded-md border px-3 py-1.5 text-[12px] font-medium", timeRange === t ? "border-ink-900 bg-ink-900 text-white" : "border-ink-200 text-ink-600 hover:border-ink-300")}>{t}</button>
            ))}
          </div>
          {showFilters && (
            <>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Filter by status (optional)</p>
              <div className="mb-5 flex flex-wrap gap-1.5">
                {statuses.map((s) => (
                  <button key={s} onClick={() => toggleStatus(s)} className={cn("rounded-md border px-3 py-1.5 text-[12px] font-medium", statusFilter.includes(s) ? "border-accent-600 bg-accent-50 text-accent-700" : "border-ink-200 text-ink-600 hover:border-ink-300")}>{s}</button>
                ))}
              </div>
            </>
          )}
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(3)}>Back</Button>
            <Button onClick={submit}>Create comparison</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
