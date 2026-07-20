import { Gauge } from "lucide-react";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import type { Industry, PortfolioProject } from "../../../lib/portfolioData";
import { esgForProject } from "../../../lib/projectIntelligence";
import { Card, CardHeader, EmptyState, SectionLabel } from "../../../lib/ui";

export default function BusinessDriversTab({ project: proj, industry: ind }: { project: PortfolioProject; industry: Industry }) {
  const esg = esgForProject(proj.id);

  if (proj.drivers.metrics.length === 0) {
    return <EmptyState icon={<Gauge size={20} />} title="No business driver data" sub="This project has no business driver metrics seeded." />;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Business drivers" sub={`${ind.sector} · ${proj.drivers.kind} operating metrics`} />
        <div className="grid grid-cols-3 gap-3">
          {proj.drivers.metrics.map((m) => (
            <div key={m.label} className="rounded-lg border border-ink-100 p-3">
              <p className="text-[11px] font-medium text-ink-500">{m.label}</p>
              <p className="num mt-1 break-words text-[18px] font-semibold leading-tight tracking-tight">{m.value.toLocaleString()}{m.unit}</p>
              {m.target !== undefined && <p className="mt-0.5 text-[10.5px] text-ink-400">Target {m.target}{m.unit}</p>}
              {m.trend.length > 1 && (
                <div className="mt-2 h-[36px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={m.trend.map((v, i) => ({ i, v }))}>
                      <Line type="monotone" dataKey="v" stroke="#0e5f45" strokeWidth={1.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {esg.length > 0 && (
        <Card>
          <CardHeader title="ESG metrics" />
          <SectionLabel>Environmental & social</SectionLabel>
          <div className="grid grid-cols-3 gap-3">
            {esg.map((m) => (
              <div key={m.label} className="rounded-lg border border-ink-100 p-3">
                <p className="text-[11px] font-medium text-ink-500">{m.label}</p>
                <p className="num mt-1 text-[17px] font-semibold tracking-tight">{m.value.toLocaleString()}{m.unit}</p>
                {m.target !== undefined && <p className="mt-0.5 text-[10.5px] text-ink-400">Target {m.target}{m.unit}</p>}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
