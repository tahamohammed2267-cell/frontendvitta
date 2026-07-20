import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { PortfolioProject } from "../../../lib/portfolioData";
import { budgetActualsForProject } from "../../../lib/projectIntelligence";
import { Card, CardHeader, SectionLabel } from "../../../lib/ui";

export default function FinancialsTab({ project: proj }: { project: PortfolioProject }) {
  const budgetActuals = budgetActualsForProject(proj.id);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <MiniStatCard label="Revenue" value={`€${proj.financials.topline.revenueM}m`} />
        <MiniStatCard label="EBITDA" value={`€${proj.financials.earnings.ebitdaM}m`} />
        <MiniStatCard label="EBIT" value={`€${proj.financials.earnings.ebitM}m`} />
        <MiniStatCard label="Cash flow" value={`€${proj.kpis.cashFlowM}m`} />
      </div>

      <Card>
        <CardHeader title="Historical trends" sub="Revenue, last 6 months" />
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={proj.financials.topline.byMonth} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
              <CartesianGrid vertical={false} stroke="#eceef3" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#8a93a6" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#8a93a6" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #dde1e9" }} />
              <Bar dataKey="revenueM" fill="#0e5f45" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {budgetActuals.length > 0 && (
        <Card>
          <CardHeader title="Budget vs actual / forecast vs actual" />
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetActuals} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
                <CartesianGrid vertical={false} stroke="#eceef3" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#8a93a6" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#8a93a6" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #dde1e9" }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="budgetM" name="Budget" fill="#8a93a6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actualM" name="Actual" fill="#0e5f45" radius={[4, 4, 0, 0]} />
                <Bar dataKey="forecastM" name="Forecast" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      <Card>
        <CardHeader title="Debt" />
        <div className="grid grid-cols-3 gap-3">
          <MiniStatCard label="Debt outstanding" value={`€${proj.kpis.debtOutstandingM}m`} />
          <MiniStatCard label="Debt service" value={`€${proj.financials.costs.debtServiceM}m`} />
          <MiniStatCard label="Net income" value={`€${proj.financials.earnings.netIncomeM}m`} />
        </div>
      </Card>

      <Card>
        <CardHeader title="Cost breakdown" />
        <SectionLabel>Operating & financing costs</SectionLabel>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          {([
            ["O&M / Grid charges", proj.financials.costs.opexM], ["Contractor costs", proj.financials.costs.capexM],
            ["Maintenance", proj.financials.costs.maintenanceM], ["Payroll", proj.financials.costs.payrollM],
            ["Fuel", proj.financials.costs.fuelM], ["Insurance", proj.financials.costs.insuranceM],
            ["Administrative", proj.financials.costs.adminM], ["Financing costs (debt service)", proj.financials.costs.debtServiceM],
          ] as [string, number][]).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between rounded-lg border border-ink-100 px-3 py-2">
              <span className="text-[12px] text-ink-600">{label}</span>
              <span className="num text-[12.5px] font-semibold">€{value}m</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function MiniStatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-[11px] font-medium text-ink-500">{label}</p>
      <p className="num mt-1 text-[19px] font-semibold tracking-tight">{value}</p>
    </Card>
  );
}
