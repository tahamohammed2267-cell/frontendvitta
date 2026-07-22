import { useEffect, useState } from "react";
import { Save, Trash2 } from "lucide-react";
import type { MetricKey } from "../../../../lib/portfolioData";
import { Badge, Button, Modal } from "../../../../lib/ui";
import { cn } from "../../../../lib/cn";
import {
  addBenchmarkPreset, removeBenchmarkPreset, useBenchmarkPresets,
  type BaseColumnKey, type BenchmarkFilters, type BenchmarkPreset, type BenchmarkSortState,
} from "./benchmarkPresetStore";
import type { BenchmarkColumn } from "./benchmarkColumns";

interface CurrentView {
  metrics: MetricKey[];
  columns: BenchmarkColumn[];
  filters: BenchmarkFilters;
  sort: BenchmarkSortState;
  visibleColumnKeys: BaseColumnKey[];
}

export default function BenchmarkPresetBar({
  activePresetId, onApply, currentView, saveRequestToken,
}: {
  activePresetId: string | null;
  onApply: (preset: BenchmarkPreset) => void;
  currentView: CurrentView;
  // Bumping this number (from a parent-owned counter) opens the save modal —
  // lets MetricSelectionPanel's "Save as Metric Preset" button trigger the
  // same save flow without duplicating the modal/state here.
  saveRequestToken?: number;
}) {
  const presets = useBenchmarkPresets();
  const [saveOpen, setSaveOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    if (saveRequestToken !== undefined && saveRequestToken > 0) setSaveOpen(true);
  }, [saveRequestToken]);

  function save() {
    if (!name.trim()) return;
    const created = addBenchmarkPreset({ name: name.trim(), ...currentView });
    onApply(created);
    setName(""); setSaveOpen(false);
  }

  return (
    <div className="mb-3 flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-400">Presets</span>
      {presets.map((p) => (
        <button
          key={p.id} onClick={() => onApply(p)}
          className={cn(
            "rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors",
            activePresetId === p.id ? "border-ink-900 bg-ink-900 text-white" : "border-ink-200 text-ink-600 hover:border-ink-300"
          )}
        >
          {p.name}
        </button>
      ))}
      <Button variant="secondary" className="px-2.5 py-1.5 text-[12px]" onClick={() => setSaveOpen(true)}><Save size={12} /> Save current view</Button>
      {presets.length > 0 && (
        <Button variant="ghost" className="px-2.5 py-1.5 text-[12px]" onClick={() => setManageOpen(true)}>Manage</Button>
      )}

      <Modal open={saveOpen} onClose={() => setSaveOpen(false)} title="Save current view as preset" width="380px">
        <input
          value={name} onChange={(e) => setName(e.target.value)} placeholder="Preset name (e.g. Risk Committee)" autoFocus
          onKeyDown={(e) => e.key === "Enter" && save()}
          className="mb-3 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-[12.5px] outline-none placeholder:text-ink-400 focus:border-accent-500"
        />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setSaveOpen(false)}>Cancel</Button>
          <Button className={!name.trim() ? "pointer-events-none opacity-40" : ""} onClick={save}>Save preset</Button>
        </div>
      </Modal>

      <Modal open={manageOpen} onClose={() => setManageOpen(false)} title="Manage presets" width="420px">
        <div className="space-y-1.5">
          {presets.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-2 rounded-lg border border-ink-100 px-3 py-2">
              <div>
                <p className="text-[12.5px] font-medium text-ink-800">{p.name}</p>
                <p className="text-[11px] text-ink-400">{p.metrics.length} metrics · {p.columns.length} columns</p>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge tone="gray">{p.updatedAt}</Badge>
                <button onClick={() => removeBenchmarkPreset(p.id)} className="rounded p-1.5 text-ink-400 hover:bg-crit-50 hover:text-crit-600"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
          {presets.length === 0 && <p className="py-4 text-center text-[12.5px] text-ink-400">No saved presets yet.</p>}
        </div>
      </Modal>
    </div>
  );
}
