import { institutionalSignals, institutionalSignalStats } from "../../lib/intelligence/institutionalSignals";
import { Card } from "../../lib/ui";

export default function SignalsSummaryStrip() {
  const total = institutionalSignals.length;
  const emerging = institutionalSignals.filter((s) => s.frequency === "Increasing").length;
  const highImpact = institutionalSignals.filter((s) => institutionalSignalStats[s.id].impact === "High").length;

  return (
    <Card>
      <div className="grid grid-cols-3 divide-x divide-ink-100">
        <div className="flex items-center gap-2.5 pr-4">
          <p className="text-[11.5px] font-medium text-ink-500">Total Patterns</p>
          <p className="num text-[17px] font-semibold text-ink-900">{total}</p>
        </div>
        <div className="flex items-center gap-2.5 px-4">
          <p className="text-[11.5px] font-medium text-ink-500">Emerging Signals</p>
          <p className="num text-[17px] font-semibold text-accent-700">{emerging}</p>
        </div>
        <div className="flex items-center gap-2.5 pl-4">
          <p className="text-[11.5px] font-medium text-ink-500">High Impact Signals</p>
          <p className="num text-[17px] font-semibold text-crit-700">{highImpact}</p>
        </div>
      </div>
    </Card>
  );
}
