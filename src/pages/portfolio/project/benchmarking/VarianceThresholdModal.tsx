import { useState } from "react";
import { Button, Modal } from "../../../../lib/ui";
import { defaultVarianceThresholds, type VarianceThresholds } from "./varianceVerdict";

export default function VarianceThresholdModal({
  open, onClose, thresholds, onChange,
}: { open: boolean; onClose: () => void; thresholds: VarianceThresholds; onChange: (t: VarianceThresholds) => void }) {
  const [moderate, setModerate] = useState(thresholds.moderateThresholdPct);
  const [significant, setSignificant] = useState(thresholds.significantThresholdPct);
  const invalid = significant <= moderate;

  function apply() {
    if (invalid) return;
    onChange({ moderateThresholdPct: moderate, significantThresholdPct: significant });
    onClose();
  }

  function reset() {
    setModerate(defaultVarianceThresholds.moderateThresholdPct);
    setSignificant(defaultVarianceThresholds.significantThresholdPct);
  }

  return (
    <Modal open={open} onClose={onClose} title="Variance thresholds" sub="Configure what counts as a moderate vs. significant variance" width="420px">
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-ink-700">Moderate threshold (%)</label>
          <input
            type="number" min={0} step={0.5} value={moderate} onChange={(e) => setModerate(Number(e.target.value))}
            className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-[13px] outline-none focus:border-accent-500"
          />
          <p className="mt-1 text-[11.5px] text-ink-400">Variance below this magnitude is classified "In Line."</p>
        </div>
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-ink-700">Significant threshold (%)</label>
          <input
            type="number" min={0} step={0.5} value={significant} onChange={(e) => setSignificant(Number(e.target.value))}
            className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-[13px] outline-none focus:border-accent-500"
          />
          <p className="mt-1 text-[11.5px] text-ink-400">Variance above this magnitude is classified "Significant."</p>
          {invalid && <p className="mt-1 text-[11.5px] text-crit-600">Significant threshold must be greater than moderate threshold.</p>}
        </div>
        <div className="flex justify-between">
          <Button variant="ghost" onClick={reset}>Reset to default</Button>
          <Button className={invalid ? "pointer-events-none opacity-40" : ""} onClick={apply}>Apply</Button>
        </div>
      </div>
    </Modal>
  );
}
