import { cn } from "../../../lib/cn";

export interface GeoPoint { region: string; countryCode: string; value: number; x: number; y: number } // x/y: illustrative 0-100 layout, not a real projection

function formatValue(value: number, unit: string) {
  return unit === "€M" ? `€${value}m` : `${value}${unit}`;
}

export default function GeoMapMock({ points, unit = "€M" }: { points: GeoPoint[]; unit?: string }) {
  const max = Math.max(...points.map((p) => p.value), 1);

  return (
    <div>
      <div className="relative h-[180px] overflow-hidden rounded-lg border border-ink-100 bg-ink-50/60">
        {points.map((p) => {
          const size = 14 + (p.value / max) * 28;
          return (
            <div
              key={p.region}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              title={`${p.region}: ${formatValue(p.value, unit)}`}
            >
              <div className="rounded-full bg-accent-600/80 ring-2 ring-white" style={{ width: size, height: size }} />
              <span className="mt-1 whitespace-nowrap text-[10px] font-medium text-ink-600">{p.region}</span>
            </div>
          );
        })}
        <p className="absolute bottom-1.5 right-2 text-[9.5px] text-ink-300">Illustrative regional layout — not to scale</p>
      </div>
      <div className="mt-3 space-y-1.5">
        {points.map((p) => (
          <div key={p.region} className="flex items-center gap-2.5">
            <span className="w-20 shrink-0 text-[11.5px] text-ink-600">{p.region}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-100">
              <div className={cn("h-full rounded-full bg-accent-600")} style={{ width: `${(p.value / max) * 100}%` }} />
            </div>
            <span className="num w-14 shrink-0 text-right text-[11px] text-ink-500">{formatValue(p.value, unit)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
