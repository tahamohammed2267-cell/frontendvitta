import { useState } from "react";
import { Check, FileText } from "lucide-react";
import type { PortfolioProject } from "../../../lib/portfolioData";
import { Button, Card, CardHeader } from "../../../lib/ui";
import { cn } from "../../../lib/cn";

const sections = [
  { id: "dashboards", label: "Dashboards" },
  { id: "comparisons", label: "Comparisons" },
  { id: "benchmarks", label: "Benchmarks" },
  { id: "predictions", label: "Predictions" },
  { id: "insights", label: "AI Insights" },
  { id: "misIntelligence", label: "MIS Intelligence" },
  { id: "charts", label: "Charts" },
  { id: "tables", label: "Tables" },
];

export default function ReportsTab({ project: proj }: { project: PortfolioProject }) {
  const [selected, setSelected] = useState<string[]>(["dashboards", "insights"]);
  const [generated, setGenerated] = useState(false);

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  function generate() {
    setGenerated(true);
    setTimeout(() => setGenerated(false), 1500);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Generate a report" sub={`For ${proj.name} — choose any combination of sections`} />
        <div className="flex flex-wrap gap-1.5">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => toggle(s.id)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors",
                selected.includes(s.id) ? "border-accent-600 bg-accent-50 text-accent-700" : "border-ink-200 text-ink-600 hover:border-ink-300"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="mt-5 flex justify-end">
          <Button className={selected.length === 0 ? "pointer-events-none opacity-40" : ""} onClick={generate}>
            {generated ? <Check size={14} /> : <FileText size={14} />} {generated ? "Report generated" : "Generate report"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
