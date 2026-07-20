import { Gauge } from "../../../lib/ui";

export default function GaugeWidget({ label, value, max = 100, target, unit = "%" }: { label: string; value: number; max?: number; target?: number; unit?: string }) {
  return (
    <div className="flex items-center justify-center py-2">
      <Gauge value={value} max={max} target={target} label={label} unit={unit} />
    </div>
  );
}
