import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { industries, portfolioProjects, regions } from "../../../lib/portfolioData";
import { Badge } from "../../../lib/ui";
import { cn } from "../../../lib/cn";
import { makeEntityId, type ComparableEntity, type ComparableEntityKind } from "./comparisonEntities";

const kindTone: Record<ComparableEntityKind, "blue" | "green" | "orange" | "dark"> = {
  project: "blue", region: "green", industry: "orange", industryAverage: "orange", globalPortfolio: "dark",
};
const kindLabel: Record<ComparableEntityKind, string> = {
  project: "Project", region: "Region", industry: "Industry", industryAverage: "Industry Avg", globalPortfolio: "Global",
};

function buildCandidates(): ComparableEntity[] {
  return [
    ...portfolioProjects.map((p) => ({ kind: "project" as const, id: makeEntityId("project", p.id), refId: p.id, label: p.name, industryKey: p.industryKey })),
    ...regions.map((r) => ({ kind: "region" as const, id: makeEntityId("region", r.id), refId: r.id, label: `${r.name} · ${r.industryKey}`, industryKey: r.industryKey })),
    ...industries.map((i) => ({ kind: "industry" as const, id: makeEntityId("industry", i.key), refId: i.key, label: i.name, industryKey: i.key })),
    ...industries.map((i) => ({ kind: "industryAverage" as const, id: makeEntityId("industryAverage", i.key), refId: i.key, label: `${i.name} — Industry Average`, industryKey: i.key })),
    { kind: "globalPortfolio" as const, id: makeEntityId("globalPortfolio", ""), refId: "", label: "Global Portfolio" },
  ];
}

export default function EntityPicker({ selected, onAdd }: { selected: ComparableEntity[]; onAdd: (entity: ComparableEntity) => void }) {
  const [q, setQ] = useState("");
  const candidates = useMemo(buildCandidates, []);
  const selectedIds = new Set(selected.map((e) => e.id));

  const rows = candidates.filter((c) => c.label.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <div className="relative mb-2.5">
        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search projects, regions, industries…"
          className="w-full rounded-lg border border-ink-200 bg-white py-1.5 pl-8 pr-3 text-[12.5px] outline-none placeholder:text-ink-400 focus:border-accent-500"
        />
      </div>
      <div className="max-h-[240px] space-y-0.5 overflow-y-auto rounded-lg border border-ink-100 p-1.5">
        {rows.map((c) => {
          const isSelected = selectedIds.has(c.id);
          return (
            <button
              key={c.id}
              disabled={isSelected}
              onClick={() => onAdd(c)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[12.5px]",
                isSelected ? "cursor-not-allowed opacity-40" : "hover:bg-ink-50"
              )}
            >
              <Badge tone={kindTone[c.kind]}>{kindLabel[c.kind]}</Badge>
              <span className="truncate font-medium text-ink-800">{c.label}</span>
            </button>
          );
        })}
        {rows.length === 0 && <p className="px-2.5 py-3 text-center text-[12px] text-ink-400">No matches.</p>}
      </div>
    </div>
  );
}

export function EntityChip({ entity, onRemove }: { entity: ComparableEntity; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-ink-200 bg-white py-1 pl-1 pr-2 text-[12px] font-medium text-ink-700">
      <Badge tone={kindTone[entity.kind]}>{kindLabel[entity.kind]}</Badge>
      {entity.label}
      <button onClick={onRemove} className="rounded p-0.5 text-ink-400 hover:bg-ink-100 hover:text-crit-600"><X size={11} /></button>
    </span>
  );
}
