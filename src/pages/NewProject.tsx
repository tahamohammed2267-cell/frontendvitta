import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Building2, Check, FileSpreadsheet, Sun, Wind } from "lucide-react";
import { Badge, Button, Card, CardHeader, SectionLabel } from "../lib/ui";
import { useStore } from "../lib/store";
import { cn } from "../lib/cn";

type Tech = "Solar" | "Wind" | "Infrastructure" | null;
const infraTypes = ["Shopping Complex", "Hostel", "Logistics Park", "Data Center"];

const blueprints: Record<string, { name: string; docs: number; fields: string[]; required: string[] }> = {
  Solar: {
    name: "Solar PV Blueprint v4", docs: 14,
    fields: ["Installed capacity (MWp)", "P50 specific yield", "PPA tariff & escalation", "Total CAPEX (EPC lump sum)", "O&M cost / MWp", "Debt sizing & gearing", "Module degradation", "Merchant tail price"],
    required: ["PPA (executed)", "EPC Contract", "Financial Model", "Resource / Yield Report", "Land Lease", "O&M Agreement"],
  },
  Wind: {
    name: "Wind Onshore Blueprint v3", docs: 16,
    fields: ["Turbine count & model", "Capacity per turbine (MW)", "Net capacity factor", "PPA / merchant tariff", "Total CAPEX", "O&M per MW", "Debt sizing & DSCR", "Curtailment assumption"],
    required: ["Wind Resource Assessment", "EPC / TSA Contract", "Financial Model", "PPA (executed)", "Grid Agreement", "Permits Bundle"],
  },
  "Shopping Complex": {
    name: "CRE Retail Blueprint v2", docs: 18,
    fields: ["GLA (sqm)", "Occupancy rate", "Weighted avg lease term", "Passing rent / sqm", "Acquisition price & yield", "Capex program", "LTV & facility sizing", "Exit cap rate"],
    required: ["Rent Roll", "Lease Abstracts", "Appraisal / Valuation", "Financial Model", "Technical DD Report", "Insurance Package"],
  },
  Hostel: {
    name: "Hospitality Living Blueprint v2", docs: 16,
    fields: ["Bed count", "Occupancy & ADR", "RevPAR", "Acquisition price", "FF&E capex", "Operator contract terms", "LTV & DSCR", "Exit assumptions"],
    required: ["Operator Agreement", "Financial Model", "Appraisal / Valuation", "Rent Roll / Booking Data", "Licenses", "Insurance Package"],
  },
};

export default function NewProject() {
  const [step, setStep] = useState(1);
  const [tech, setTech] = useState<Tech>(null);
  const [sub, setSub] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [country, setCountry] = useState("Spain");
  const [capacity, setCapacity] = useState("");
  const [size, setSize] = useState("");
  const navigate = useNavigate();
  const startNewDeal = useStore((s) => s.startNewDeal);

  function createWorkspace() {
    startNewDeal(name || "Project Helios");
    navigate("/projects/helios?tab=documents");
  }

  const key = tech === "Infrastructure" ? sub : tech;
  const bp = key ? blueprints[key] : null;

  return (
    <div className="mx-auto max-w-[1000px] px-6 py-8">
      <div className="mb-6 fade-up">
        <h1 className="text-[22px] font-semibold tracking-tight">New Deal</h1>
        <p className="mt-0.5 text-[13px] text-ink-500">Technology choice determines the Excel blueprint template and document checklist.</p>
      </div>

      {/* Stepper */}
      <div className="mb-8 flex items-center gap-2 fade-up">
        {["Technology", "Deal details", "Review & blueprint"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold",
              step > i + 1 ? "bg-pos-600 text-white" : step === i + 1 ? "bg-ink-900 text-white" : "bg-ink-100 text-ink-400"
            )}>
              {step > i + 1 ? <Check size={12} /> : i + 1}
            </div>
            <span className={cn("text-[13px] font-medium", step === i + 1 ? "text-ink-900" : "text-ink-400")}>{s}</span>
            {i < 2 && <div className="mx-2 h-px w-12 bg-ink-200" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 fade-up">
          {step === 1 && (
            <div>
              <SectionLabel>Select technology</SectionLabel>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { t: "Solar" as const, icon: Sun, d: "PV plants, utility scale" },
                  { t: "Wind" as const, icon: Wind, d: "Onshore & offshore" },
                  { t: "Infrastructure" as const, icon: Building2, d: "Real assets & CRE" },
                ]).map((o) => (
                  <button
                    key={o.t}
                    onClick={() => { setTech(o.t); setSub(null); }}
                    className={cn(
                      "rounded-lg border p-4 text-left transition-all",
                      tech === o.t ? "border-accent-600 bg-accent-50 shadow-[0_0_0_3px_rgba(37,99,235,0.1)]" : "border-ink-200 bg-white hover:border-ink-300"
                    )}
                  >
                    <o.icon size={20} strokeWidth={1.8} className={tech === o.t ? "text-accent-600" : "text-ink-500"} />
                    <p className="mt-2.5 text-[13.5px] font-semibold">{o.t}</p>
                    <p className="mt-0.5 text-[11.5px] text-ink-500">{o.d}</p>
                  </button>
                ))}
              </div>
              {tech === "Infrastructure" && (
                <div className="mt-4 fade-up">
                  <SectionLabel>Asset sub-type</SectionLabel>
                  <div className="grid grid-cols-2 gap-3">
                    {infraTypes.map((t) => (
                      <button
                        key={t}
                        onClick={() => setSub(t)}
                        className={cn(
                          "rounded-lg border px-4 py-3 text-left text-[13px] font-medium transition-all",
                          sub === t ? "border-accent-600 bg-accent-50 text-accent-700" : "border-ink-200 bg-white hover:border-ink-300"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 fade-up">
              <Field label="Deal name"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Project Helios" className={inputCls} /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Country">
                  <select value={country} onChange={(e) => setCountry(e.target.value)} className={inputCls}>
                    {["Spain", "Germany", "United Kingdom", "Portugal", "Denmark"].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Deal lead">
                  <select className={inputCls}>{["Jane Moreau", "A. Lindqvist", "R. Chen", "S. Okafor"].map((c) => <option key={c}>{c}</option>)}</select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label={tech === "Infrastructure" ? "Capacity (n/a for infrastructure)" : "Capacity (MW)"}>
                  <input
                    value={capacity} onChange={(e) => setCapacity(e.target.value)} disabled={tech === "Infrastructure"}
                    placeholder={tech === "Infrastructure" ? "Not applicable" : "e.g. 120"} className={cn(inputCls, "disabled:bg-ink-50 disabled:text-ink-400")}
                  />
                </Field>
                <Field label="Target deal size (€M)">
                  <input value={size} onChange={(e) => setSize(e.target.value)} placeholder="e.g. 96" className={inputCls} />
                </Field>
              </div>
            </div>
          )}

          {step === 3 && bp && (
            <div className="space-y-4 fade-up">
              <Card>
                <CardHeader title={bp.name} sub="Excel business-case template — auto-populated cell-by-cell from extracted data" right={<Badge tone="blue"><FileSpreadsheet size={11} /> Blueprint</Badge>} />
                <SectionLabel>Sample input cells</SectionLabel>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                  {bp.fields.map((f) => (
                    <p key={f} className="flex items-center gap-2 text-[12.5px] text-ink-600"><span className="h-1 w-1 rounded-full bg-accent-600" />{f}</p>
                  ))}
                </div>
              </Card>
              <Card>
                <CardHeader title="Document checklist" sub={`${bp.docs} required documents will be tracked from upload`} />
                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                  {bp.required.map((f) => (
                    <p key={f} className="flex items-center gap-2 text-[12.5px] text-ink-600"><span className="h-1 w-1 rounded-full bg-pos-600" />{f}</p>
                  ))}
                </div>
              </Card>
            </div>
          )}

          <div className="mt-8 flex justify-between">
            <Button variant="ghost" onClick={() => (step === 1 ? navigate("/projects") : setStep(step - 1))}>
              <ArrowLeft size={15} /> Back
            </Button>
            {step < 3 ? (
              <Button onClick={() => setStep(step + 1)} className={cn((!tech || (tech === "Infrastructure" && !sub)) && "pointer-events-none opacity-40")}>
                Continue <ArrowRight size={15} />
              </Button>
            ) : (
              <Button onClick={createWorkspace}>Create workspace <ArrowRight size={15} /></Button>
            )}
          </div>
        </div>

        {/* Summary rail */}
        <div className="fade-up">
          <Card className="sticky top-6">
            <CardHeader title="Summary" />
            <dl className="space-y-3 text-[12.5px]">
              <SummaryRow k="Technology" v={tech ?? "—"} />
              {tech === "Infrastructure" && <SummaryRow k="Sub-type" v={sub ?? "—"} />}
              <SummaryRow k="Name" v={name || "—"} />
              <SummaryRow k="Country" v={step >= 2 ? country : "—"} />
              {tech !== "Infrastructure" && <SummaryRow k="Capacity" v={capacity ? `${capacity} MW` : "—"} />}
              <SummaryRow k="Deal size" v={size ? `€${size}m` : "—"} />
              <SummaryRow k="Blueprint" v={bp?.name ?? "—"} accent />
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-[13px] outline-none placeholder:text-ink-400 focus:border-accent-500";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-medium text-ink-600">{label}</span>
      {children}
    </label>
  );
}

function SummaryRow({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-ink-500">{k}</dt>
      <dd className={cn("text-right font-medium", accent ? "text-accent-700" : "text-ink-900")}>{v}</dd>
    </div>
  );
}
