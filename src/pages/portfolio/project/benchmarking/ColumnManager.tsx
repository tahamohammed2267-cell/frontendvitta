import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { industries, portfolioProjects, regions, type PortfolioProject } from "../../../../lib/portfolioData";
import { globalIndustryBenchmarks } from "../../../../lib/globalBenchmarks";
import { Badge } from "../../../../lib/ui";
import { cn } from "../../../../lib/cn";
import { makeEntityId, type ComparableEntity, type ComparableEntityKind } from "../../comparisons/comparisonEntities";
import { useCustomGroups, customGroupToEntity } from "./customGroupStore";
import { makeEntityColumn, makeTimeColumn, timeComparisonMeta, type BenchmarkColumn, type TimeComparisonKind } from "./benchmarkColumns";
import ColumnChip from "./ColumnChip";
import CustomGroupBuilderModal from "./CustomGroupBuilderModal";

const kindTone: Record<ComparableEntityKind, "blue" | "green" | "orange" | "dark"> = {
  project: "blue", region: "green", industry: "orange", industryAverage: "orange",
  regionAverage: "green", portfolioAverage: "dark", globalPortfolio: "dark",
  customGroup: "blue", globalBenchmark: "orange",
};
const kindLabel: Record<ComparableEntityKind, string> = {
  project: "Project", region: "Region", industry: "Industry", industryAverage: "Industry Avg",
  regionAverage: "Region Avg", portfolioAverage: "Portfolio Avg", globalPortfolio: "Global",
  customGroup: "Custom Group", globalBenchmark: "Global Benchmark",
};

function buildEntityCandidates(): ComparableEntity[] {
  const benchmarkKinds = [...new Set(globalIndustryBenchmarks.map((b) => b.driverKind).filter(Boolean))];
  return [
    ...portfolioProjects.map((p) => ({ kind: "project" as const, id: makeEntityId("project", p.id), refId: p.id, label: p.name, industryKey: p.industryKey })),
    ...regions.map((r) => ({ kind: "regionAverage" as const, id: makeEntityId("regionAverage", r.id), refId: r.id, label: `${r.name} — Region Average`, industryKey: r.industryKey })),
    ...industries.map((i) => ({ kind: "industryAverage" as const, id: makeEntityId("industryAverage", i.key), refId: i.key, label: `${i.name} — Industry Average`, industryKey: i.key })),
    { kind: "portfolioAverage" as const, id: makeEntityId("portfolioAverage", ""), refId: "", label: "Portfolio Average" },
    { kind: "globalPortfolio" as const, id: makeEntityId("globalPortfolio", ""), refId: "", label: "Global Portfolio" },
    ...industries.filter((i) => benchmarkKinds.includes(i.driverKind)).map((i) => ({
      kind: "globalBenchmark" as const, id: makeEntityId("globalBenchmark", i.key), refId: i.key, label: `${i.name} — Global Benchmark`, industryKey: i.key,
    })),
  ];
}

const timeKinds = Object.keys(timeComparisonMeta) as TimeComparisonKind[];

export default function ColumnManager({
  project, columns, onAdd, onRemove,
}: { project: PortfolioProject; columns: BenchmarkColumn[]; onAdd: (col: BenchmarkColumn) => void; onRemove: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [groupBuilderOpen, setGroupBuilderOpen] = useState(false);
  const customGroups = useCustomGroups();
  const candidates = useMemo(buildEntityCandidates, []);
  const selectedIds = new Set(columns.map((c) => c.id));

  const filteredEntities = candidates.filter((c) => c.label.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
        {columns.map((col) => (
          <ColumnChip key={col.id} column={col} project={project} onRemove={col.kind === "current" ? undefined : () => onRemove(col.id)} />
        ))}
        <div className="relative">
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-1 rounded-md border border-dashed border-ink-300 px-2.5 py-1 text-[12px] font-medium text-ink-500 hover:border-accent-500 hover:text-accent-700"
          >
            <Plus size={12} /> Add column
          </button>
          {open && (
            <div className="absolute left-0 top-[calc(100%+6px)] z-40 w-[340px] rounded-lg border border-ink-200 bg-white p-3 shadow-[0_10px_30px_-8px_rgba(11,14,20,0.25)]">
              <div className="relative mb-2.5">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search projects, regions, industries…" autoFocus
                  className="w-full rounded-lg border border-ink-200 bg-white py-1.5 pl-8 pr-3 text-[12.5px] outline-none placeholder:text-ink-400 focus:border-accent-500"
                />
              </div>

              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-400">Custom groups</p>
              <div className="mb-2 space-y-0.5">
                {customGroups.map((g) => {
                  const entity = customGroupToEntity(g);
                  const isSelected = selectedIds.has(`entity:${entity.id}`);
                  return (
                    <button
                      key={g.id} disabled={isSelected}
                      onClick={() => { onAdd(makeEntityColumn(entity)); setOpen(false); }}
                      className={cn("flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[12.5px]", isSelected ? "cursor-not-allowed opacity-40" : "hover:bg-ink-50")}
                    >
                      <Badge tone="blue">Custom Group</Badge>
                      <span className="truncate font-medium text-ink-800">{g.name}</span>
                    </button>
                  );
                })}
                <button
                  onClick={() => { setGroupBuilderOpen(true); setOpen(false); }}
                  className="flex w-full items-center gap-1.5 rounded-lg border border-dashed border-ink-300 px-2 py-1.5 text-[12px] font-medium text-ink-500 hover:border-accent-500 hover:text-accent-700"
                >
                  <Plus size={12} /> Build new group
                </button>
              </div>

              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-400">Projects &amp; averages</p>
              <div className="mb-2 max-h-[180px] space-y-0.5 overflow-y-auto">
                {filteredEntities.map((c) => {
                  const isSelected = selectedIds.has(`entity:${c.id}`);
                  return (
                    <button
                      key={c.id} disabled={isSelected}
                      onClick={() => { onAdd(makeEntityColumn(c)); setOpen(false); }}
                      className={cn("flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[12.5px]", isSelected ? "cursor-not-allowed opacity-40" : "hover:bg-ink-50")}
                    >
                      <Badge tone={kindTone[c.kind]}>{kindLabel[c.kind]}</Badge>
                      <span className="truncate font-medium text-ink-800">{c.label}</span>
                    </button>
                  );
                })}
                {filteredEntities.length === 0 && <p className="px-2 py-2 text-center text-[12px] text-ink-400">No matches.</p>}
              </div>

              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-400">Time-based</p>
              <div className="space-y-0.5">
                {timeKinds.map((k) => {
                  const id = `time:${k}`;
                  const isSelected = selectedIds.has(id);
                  return (
                    <button
                      key={k} disabled={isSelected}
                      onClick={() => { onAdd(makeTimeColumn(k)); setOpen(false); }}
                      className={cn("flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[12.5px]", isSelected ? "cursor-not-allowed opacity-40" : "hover:bg-ink-50")}
                    >
                      <Badge tone="orange">Time</Badge>
                      <span className="truncate font-medium text-ink-800">{timeComparisonMeta[k].label}</span>
                      <span className="ml-auto text-[10.5px] text-ink-400">modeled</span>
                    </button>
                  );
                })}
                <button disabled className="flex w-full cursor-not-allowed items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[12.5px] opacity-40">
                  <Badge tone="orange">Time</Badge>
                  <span className="truncate font-medium text-ink-800">Custom Reporting Period</span>
                  <span className="ml-auto text-[10.5px] text-ink-400">not yet supported</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <CustomGroupBuilderModal
        open={groupBuilderOpen}
        onClose={() => setGroupBuilderOpen(false)}
        onCreated={(group) => onAdd(makeEntityColumn(customGroupToEntity(group)))}
      />
    </div>
  );
}
