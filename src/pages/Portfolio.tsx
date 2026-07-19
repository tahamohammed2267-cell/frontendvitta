import { Line, LineChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useStore } from "../lib/store";
import { Badge, Card, CardHeader, Stat } from "../lib/ui";

const colors = ["#0e5f45", "#1d4ed8", "#b45309", "#7c3aed"];
const alerts = [
  { text: "Nordwind Park II — Q2 production 4.1% below P50", sev: "High" as const, when: "2d ago" },
  { text: "Koper Logistics Hub — anchor tenant lease expires in 9 months", sev: "Medium" as const, when: "5d ago" },
  { text: "Atlas Student Living — occupancy at record 94%", sev: "Low" as const, when: "1w ago" },
];

export default function Portfolio() {
  const portfolio = useStore((s) => s.portfolio);
  // merge trend arrays into recharts rows
  const trendRows = portfolio[0].trend.map((_, i) => ({
    q: `Q${i + 1}`,
    ...Object.fromEntries(portfolio.map((p) => [p.name, p.trend[i]])),
  }));
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-6">
      <div className="mb-6 fade-up">
        <h1 className="text-[22px] font-semibold tracking-tight">Portfolio</h1>
        <p className="mt-0.5 text-[13px] text-ink-500">Post-acquisition monitoring — KPIs, performance and alerts across 4 assets.</p>
      </div>

      <div className="mb-6 grid grid-cols-4 gap-4 fade-up">
        <Card><Stat label="Total invested" value="€310m" sub="4 assets" /></Card>
        <Card><Stat label="Avg EBITDA margin" value="60.5%" sub="+0.8pt QoQ" trend="up" /></Card>
        <Card><Stat label="On track" value="2" sub="Atlas · Solara One" /></Card>
        <Card><Stat label="On watch" value="2" sub="Nordwind · Koper" trend="down" /></Card>
      </div>

      <div className="mb-4 grid grid-cols-4 gap-4 fade-up">
        {portfolio.map((p, i) => (
          <Card key={p.name}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[13.5px] font-semibold">{p.name}</p>
                <p className="mt-0.5 text-[11.5px] text-ink-500">{p.sector} · {p.country}</p>
              </div>
              <Badge tone={p.status === "On Track" ? "green" : "orange"}>{p.status}</Badge>
            </div>
            <p className="num mt-3 text-[24px] font-semibold leading-none">{p.ebitdaMargin}%</p>
            <p className="mt-0.5 text-[11px] text-ink-400">EBITDA margin · <span className="num">€{p.investedM}m</span> invested{p.occupancy > 0 ? ` · ${p.occupancy}% occ.` : ""}</p>
            <div className="mt-2 h-[56px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={p.trend.map((v, j) => ({ j, v }))} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                  <Line type="monotone" dataKey="v" stroke={colors[i]} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 fade-up">
        <Card className="col-span-2">
          <CardHeader title="EBITDA margin trend" sub="Last 6 quarters · %" />
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendRows} margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
                <XAxis dataKey="q" tick={{ fontSize: 11, fill: "#8a93a6" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#8a93a6" }} axisLine={false} tickLine={false} domain={[30, 85]} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #dde1e9" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {portfolio.map((p, i) => (
                  <Line key={p.name} type="monotone" dataKey={p.name} stroke={colors[i]} strokeWidth={2} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHeader title="Alerts" sub="Portfolio monitoring" />
          <div className="space-y-3">
            {alerts.map((a) => (
              <div key={a.text} className="rounded-lg border border-ink-100 p-3">
                <div className="flex items-center justify-between">
                  <Badge tone={a.sev === "High" ? "red" : a.sev === "Medium" ? "orange" : "gray"}>{a.sev}</Badge>
                  <span className="text-[11px] text-ink-400">{a.when}</span>
                </div>
                <p className="mt-2 text-[12.5px] leading-snug text-ink-800">{a.text}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
