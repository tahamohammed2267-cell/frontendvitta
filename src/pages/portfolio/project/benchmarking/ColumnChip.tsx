import { X } from "lucide-react";
import type { PortfolioProject } from "../../../../lib/portfolioData";
import { Badge } from "../../../../lib/ui";
import { describeColumn, type BenchmarkColumn } from "./benchmarkColumns";

const kindTone: Record<string, "blue" | "green" | "orange" | "dark" | "gray"> = {
  project: "blue", region: "green", industry: "orange", industryAverage: "orange",
  regionAverage: "green", portfolioAverage: "dark", globalPortfolio: "dark",
  customGroup: "blue", globalBenchmark: "orange",
};

function chipTone(col: BenchmarkColumn): "blue" | "green" | "orange" | "dark" | "gray" {
  if (col.kind === "time") return "orange";
  if (col.kind === "entity") return kindTone[col.entity.kind] ?? "gray";
  return "dark";
}

function chipKindLabel(col: BenchmarkColumn): string {
  if (col.kind === "current") return "Current";
  if (col.kind === "time") return "Time";
  const kindLabels: Record<string, string> = {
    project: "Project", region: "Region", industry: "Industry", industryAverage: "Industry Avg",
    regionAverage: "Region Avg", portfolioAverage: "Portfolio Avg", globalPortfolio: "Global",
    customGroup: "Custom Group", globalBenchmark: "Global Benchmark",
  };
  return kindLabels[col.entity.kind] ?? col.entity.kind;
}

export default function ColumnChip({ column, project, onRemove }: { column: BenchmarkColumn; project: PortfolioProject; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-ink-200 bg-white py-1 pl-1 pr-2 text-[12px] font-medium text-ink-700">
      <Badge tone={chipTone(column)}>{chipKindLabel(column)}</Badge>
      {describeColumn(column, project)}
      {onRemove && (
        <button onClick={onRemove} className="rounded p-0.5 text-ink-400 hover:bg-ink-100 hover:text-crit-600"><X size={11} /></button>
      )}
    </span>
  );
}
