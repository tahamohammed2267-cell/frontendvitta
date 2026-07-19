import { useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus } from "lucide-react";
import { Badge } from "../lib/ui";
import { cn } from "../lib/cn";

type NodeType = "deal" | "company" | "contract" | "asset" | "risk";
interface GNode { id: string; label: string; type: NodeType; x: number; y: number; facts: string[] }

const typeColor: Record<NodeType, string> = {
  deal: "#1d4ed8", company: "#12161f", contract: "#059669", asset: "#d97706", risk: "#dc2626",
};

const nodes: GNode[] = [
  { id: "helios", label: "Project Helios", type: "deal", x: 460, y: 260, facts: ["120 MWp Solar · Spain", "€96M deal size · In Diligence", "14 documents · 124 canonical fields"] },
  { id: "solarbond", label: "SolarBond (EPC)", type: "company", x: 220, y: 140, facts: ["EPC contractor on 2 firm deals", "Fixed lump-sum €96.4M on Helios", "No prior defaults in knowledge base"] },
  { id: "vitta", label: "Northbridge Capital Partners", type: "company", x: 460, y: 70, facts: ["Senior lender · €67.5M facility", "Margin Euribor 6M + 265 bps", "Lender on 5 active deals"] },
  { id: "iberdrola", label: "Iberdrola (Offtaker)", type: "company", x: 720, y: 140, facts: ["Appears in 3 deals · 5 contracts", "Offtaker on Helios PPA (10y)", "Also offtaker on Solara One"] },
  { id: "site", label: "Andalusia Site", type: "asset", x: 240, y: 400, facts: ["312-hectare parcel", "Land lease 25y + 5y option", "220 kV Seville East substation · 105 MWac"] },
  { id: "ppa", label: "PPA (Executed)", type: "contract", x: 700, y: 300, facts: ["€52.40/MWh · 10 years", "Escalation 1.8% p.a.", "84 pages · 31 fields extracted"] },
  { id: "term", label: "Term Sheet", type: "contract", x: 460, y: 460, facts: ["€54.00/MWh sizing floor", "70% gearing · 17y tenor", "Lock-up DSCR 1.15x"] },
  { id: "solara", label: "Solara One", type: "deal", x: 880, y: 240, facts: ["Portfolio asset · €74M", "Shares offtaker Iberdrola", "EBITDA margin 78% · On Track"] },
  { id: "nordwind", label: "Nordwind Park II", type: "deal", x: 620, y: 40, facts: ["Portfolio asset · €132M", "Shares lender Northbridge Capital Partners", "On Watch — below P50"] },
  { id: "curtail", label: "Grid Curtailment", type: "risk", x: 120, y: 290, facts: ["Unquantified exposure", "Regional curtailment 2.1% in 2025", "High severity · open"] },
  { id: "lease", label: "Land Lease", type: "contract", x: 380, y: 520, facts: ["25y + 5y option", "€312,000 /yr", "Extension at lessor discretion — risk"] },
];

const edges: [string, string, string?][] = [
  ["helios", "solarbond", "builds"],
  ["helios", "vitta", "lends €67.5M"],
  ["helios", "iberdrola", "offtakes"],
  ["helios", "site", "located at"],
  ["helios", "ppa", "governed by"],
  ["helios", "term", "sized on"],
  ["iberdrola", "solara", "also offtakes"],
  ["vitta", "nordwind", "also lends"],
  ["curtail", "site", "threatens"],
  ["lease", "site", "secures"],
  ["ppa", "iberdrola"],
  ["term", "vitta"],
];

const filters = ["All", "Companies", "Contracts", "Risks"] as const;

export default function KnowledgeGraph() {
  const [selected, setSelected] = useState<GNode | null>(null);
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

  const dim = (n: GNode) =>
    (filter === "Companies" && n.type !== "company") || (filter === "Contracts" && n.type !== "contract") || (filter === "Risks" && n.type !== "risk");

  return (
    <div className="px-6 py-6">
      <div className="mb-4 fade-up">
        <h1 className="text-[22px] font-semibold tracking-tight">Knowledge Graph</h1>
        <p className="mt-0.5 text-[13px] text-ink-500">Companies, contracts, assets and risks — connected across every deal the firm has touched.</p>
      </div>

      <div className="relative h-[calc(100vh-220px)] overflow-hidden rounded-lg border border-ink-200 bg-white fade-up">
        {/* Legend */}
        <div className="absolute left-4 top-4 z-10 rounded-lg border border-ink-200 bg-white/95 p-3 shadow-sm">
          <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-wide text-ink-400">Node types</p>
          {(Object.keys(typeColor) as NodeType[]).map((t) => (
            <p key={t} className="flex items-center gap-2 py-0.5 text-[12px] capitalize text-ink-700">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: typeColor[t] }} /> {t}
            </p>
          ))}
        </div>

        {/* Toolbar */}
        <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
          <div className="flex gap-1 rounded-lg border border-ink-200 bg-white p-1">
            {filters.map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={cn("rounded-md px-2.5 py-1 text-[11.5px] font-medium", filter === f ? "bg-ink-900 text-white" : "text-ink-500 hover:text-ink-900")}>{f}</button>
            ))}
          </div>
          <div className="flex rounded-lg border border-ink-200 bg-white">
            <button className="p-2 text-ink-500 hover:text-ink-900"><Plus size={14} /></button>
            <button className="border-l border-ink-100 p-2 text-ink-500 hover:text-ink-900"><Minus size={14} /></button>
          </div>
        </div>

        <svg viewBox="0 0 1000 580" className="h-full w-full">
          {/* edges */}
          {edges.map(([a, b, label]) => {
            const na = byId[a]; const nb = byId[b];
            return (
              <g key={`${a}-${b}`}>
                <line x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} stroke="#dde1e9" strokeWidth={1.5} />
                {label && (
                  <text x={(na.x + nb.x) / 2} y={(na.y + nb.y) / 2 - 5} textAnchor="middle" fontSize={10} fill="#8a93a6">{label}</text>
                )}
              </g>
            );
          })}
          {/* nodes */}
          {nodes.map((n) => (
            <g key={n.id} onClick={() => setSelected(n)} className="cursor-pointer" opacity={dim(n) ? 0.15 : 1} style={{ transition: "opacity .2s" }}>
              <circle cx={n.x} cy={n.y} r={n.type === "deal" ? 16 : 11} fill={typeColor[n.type]} opacity={selected?.id === n.id ? 1 : 0.92} stroke={selected?.id === n.id ? "#0e5f45" : "white"} strokeWidth={selected?.id === n.id ? 4 : 2.5} />
              <text x={n.x} y={n.y + (n.type === "deal" ? 30 : 24)} textAnchor="middle" fontSize={11.5} fontWeight={600} fill="#12161f">{n.label}</text>
            </g>
          ))}
        </svg>

        {/* Detail panel */}
        {selected && (
          <div className="absolute right-0 top-0 z-20 h-full w-72 border-l border-ink-200 bg-white p-5 fade-up">
            <div className="flex items-center justify-between">
              <Badge tone={selected.type === "risk" ? "red" : selected.type === "contract" ? "green" : selected.type === "asset" ? "orange" : selected.type === "deal" ? "blue" : "dark"}>{selected.type}</Badge>
              <button onClick={() => setSelected(null)} className="text-[12px] text-ink-400 hover:text-ink-700">Close</button>
            </div>
            <p className="mt-3 text-[16px] font-semibold tracking-tight">{selected.label}</p>
            <div className="mt-3 space-y-2">
              {selected.facts.map((f) => (
                <p key={f} className="flex gap-2 text-[12.5px] leading-snug text-ink-700">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-400" /> {f}
                </p>
              ))}
            </div>
            {(selected.id === "solara" || selected.id === "nordwind" || selected.id === "helios") && (
              <Link to={`/projects/${selected.id === "helios" ? "helios" : "helios"}`} className="mt-4 inline-block text-[12.5px] font-medium text-accent-700 hover:underline">
                View related deal →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
