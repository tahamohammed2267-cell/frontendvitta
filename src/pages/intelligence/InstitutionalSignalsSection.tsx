import { Card, CardHeader } from "../../lib/ui";
import { useInstitutionalSignalsTable } from "./useInstitutionalSignalsTable";
import SignalsSummaryStrip from "./SignalsSummaryStrip";
import SignalsFilterBar from "./SignalsFilterBar";
import InstitutionalSignalsTable from "./InstitutionalSignalsTable";

export default function InstitutionalSignalsSection() {
  const table = useInstitutionalSignalsTable();

  return (
    <div className="space-y-4">
      <SignalsSummaryStrip />
      <Card>
        <CardHeader title="Patterns" sub={`${table.rows.length} of ${table.allCount} signals`} />
        <SignalsFilterBar
          filters={table.filters}
          onFiltersChange={table.setFilters}
          onClearRelatedFilter={table.clearRelatedFilter}
        />
        <InstitutionalSignalsTable
          rows={table.rows}
          sort={table.sort}
          onSort={table.toggleSort}
          expandedId={table.expandedId}
          onToggleExpanded={table.toggleExpanded}
          onSelectRelated={table.filterByRelated}
        />
      </Card>
    </div>
  );
}
