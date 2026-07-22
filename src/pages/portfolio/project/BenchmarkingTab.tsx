import { useState } from "react";
import { Download, FileSpreadsheet, Printer, Rows3, TableProperties } from "lucide-react";
import type { PortfolioProject } from "../../../lib/portfolioData";
import { Button, CardHeader } from "../../../lib/ui";
import { cn } from "../../../lib/cn";
import { currentColumn, makeEntityColumn } from "./benchmarking/benchmarkColumns";
import { makeEntityId } from "../comparisons/comparisonEntities";
import MetricSelectionPanel from "./benchmarking/MetricSelectionPanel";
import ColumnManager from "./benchmarking/ColumnManager";
import BenchmarkFilterBar from "./benchmarking/BenchmarkFilterBar";
import BenchmarkPresetBar from "./benchmarking/BenchmarkPresetBar";
import BenchmarkTable from "./benchmarking/BenchmarkTable";
import BenchmarkTrendView from "./benchmarking/BenchmarkTrendView";
import BenchmarkDrillDownDrawer from "./benchmarking/BenchmarkDrillDownDrawer";
import VarianceThresholdModal from "./benchmarking/VarianceThresholdModal";
import { useBenchmarkTable, type BenchmarkRow } from "./benchmarking/useBenchmarkTable";

const defaultIndustryAvgEntity = (proj: PortfolioProject) => ({
  kind: "industryAverage" as const,
  id: makeEntityId("industryAverage", proj.industryKey),
  refId: proj.industryKey,
  label: `${proj.industryKey[0].toUpperCase()}${proj.industryKey.slice(1)} — Industry Average`,
  industryKey: proj.industryKey,
});

export default function BenchmarkingTab({ project: proj }: { project: PortfolioProject }) {
  const table = useBenchmarkTable(proj, [currentColumn, makeEntityColumn(defaultIndustryAvgEntity(proj))]);
  const [view, setView] = useState<"snapshot" | "trend">("snapshot");
  const [drillDownRow, setDrillDownRow] = useState<BenchmarkRow | null>(null);
  const [thresholdsOpen, setThresholdsOpen] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [saveRequestToken, setSaveRequestToken] = useState(0);

  return (
    <div className="space-y-4">
      <p className="text-[12.5px] text-ink-500">
        Benchmark {proj.name} against any combination of peer projects, industry/region/portfolio/custom-group averages, and time-based comparisons —
        all as columns in one table.
      </p>

      <BenchmarkPresetBar
        activePresetId={activePresetId}
        onApply={(preset) => { table.applyPreset(preset); setActivePresetId(preset.id); }}
        currentView={{
          metrics: table.selectedMetrics, columns: table.columns, filters: table.filters,
          sort: table.sort, visibleColumnKeys: table.visibleColumnKeys,
        }}
        saveRequestToken={saveRequestToken}
      />

      <MetricSelectionPanel
        selected={table.selectedMetrics}
        onToggle={table.toggleMetric}
        onSelectAll={table.selectAllMetrics}
        onClearAll={table.clearAllMetrics}
        onSaveAsPreset={() => setSaveRequestToken((t) => t + 1)}
      />

      <ColumnManager project={proj} columns={table.columns} onAdd={table.addColumn} onRemove={table.removeColumn} />

      <BenchmarkFilterBar
        filters={table.filters}
        onFiltersChange={table.setFilters}
        visibleColumnKeys={table.visibleColumnKeys}
        onVisibleColumnKeysChange={table.setVisibleColumnKeys}
        onOpenThresholds={() => setThresholdsOpen(true)}
      />

      <div className="flex items-center justify-between">
        <CardHeader title="" sub={`${table.rows.length} of ${table.allRowCount} metrics shown`} />
        <div className="flex items-center gap-1.5">
          <div className="flex rounded-lg border border-ink-200 p-0.5">
            <button
              onClick={() => setView("snapshot")}
              className={cn("flex items-center gap-1 rounded-md px-2.5 py-1 text-[12px] font-medium", view === "snapshot" ? "bg-ink-900 text-white" : "text-ink-600 hover:bg-ink-50")}
            >
              <TableProperties size={13} /> Snapshot
            </button>
            <button
              onClick={() => setView("trend")}
              className={cn("flex items-center gap-1 rounded-md px-2.5 py-1 text-[12px] font-medium", view === "trend" ? "bg-ink-900 text-white" : "text-ink-600 hover:bg-ink-50")}
            >
              <Rows3 size={13} /> Trend
            </button>
          </div>
          <Button variant="secondary" className="px-2.5 py-1.5 text-[12px]"><FileSpreadsheet size={13} /> Export to Excel (CSV)</Button>
          <Button variant="secondary" className="px-2.5 py-1.5 text-[12px]"><Download size={13} /> Export to JSON</Button>
          <Button variant="secondary" className="px-2.5 py-1.5 text-[12px]"><Printer size={13} /> Print / Save as PDF</Button>
        </div>
      </div>

      {view === "snapshot" ? (
        <BenchmarkTable
          rows={table.rows}
          project={proj}
          columns={table.columns}
          visibleColumnKeys={table.visibleColumnKeys}
          sort={table.sort}
          onSort={table.toggleSort}
          onRemoveColumn={table.removeColumn}
          onOpenDrillDown={setDrillDownRow}
        />
      ) : (
        <BenchmarkTrendView rows={table.rows} project={proj} columns={table.columns} />
      )}

      {drillDownRow && (
        <BenchmarkDrillDownDrawer
          row={drillDownRow}
          project={proj}
          columns={table.columns}
          thresholds={table.thresholds}
          onClose={() => setDrillDownRow(null)}
        />
      )}

      <VarianceThresholdModal
        open={thresholdsOpen}
        onClose={() => setThresholdsOpen(false)}
        thresholds={table.thresholds}
        onChange={table.setThresholds}
      />
    </div>
  );
}
