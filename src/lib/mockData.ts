// ─────────────────────────────────────────────────────────────
// Vitta mock data — the single source every page reads from.
// Everything here simulates what the backend API would return.
// ─────────────────────────────────────────────────────────────

export type Technology = "Solar" | "Wind" | "Infrastructure";
export type InfraSubType = "Shopping Complex" | "Hostel" | "Logistics Park" | "Data Center";

export interface Project {
  id: string;
  name: string;
  technology: Technology;
  infraSubType?: InfraSubType;
  country: string;
  countryCode: string;
  capacityMW?: number;
  status: "In Diligence" | "IC Review" | "Approved" | "Closed" | "Passed";
  lead: string;
  createdAt: string;
  docsUploaded: number;
  docsTotal: number;
  fieldsConfirmed: number;
  fieldsTotal: number;
  openConflicts: number;
  openRisks: { critical: number; high: number; medium: number; low: number };
  dealSizeM: number;
  stage: string;
}

export type DocStatus = "uploading" | "parsing" | "classifying" | "extracting" | "done" | "failed";

export interface DealDocument {
  id: string;
  name: string;
  type: string; // classified document type
  status: DocStatus;
  pages: number;
  sizeMB: number;
  uploadedAt: string;
  uploadedBy: string;
  progress: number; // 0-100 for in-flight statuses
  fieldsExtracted: number;
  ocrApplied: boolean;
  format: "PDF" | "DOCX" | "XLSX" | "PPTX" | "PNG";
}

export interface CanonicalField {
  id: string;
  field: string; // canonical vocabulary name
  category: string;
  value: string;
  numericValue?: number;
  unit?: string;
  confidence: number; // 0-1
  source: { doc: string; page: number; snippet: string };
  status: "ai-extracted" | "human-confirmed" | "overridden" | "computed" | "missing";
  override?: { by: string; at: string; reason: string; previousValue: string };
  aliases: string[]; // raw labels seen in documents
}

export interface Conflict {
  id: string;
  field: string;
  category: string;
  severity: "critical" | "high" | "medium" | "low";
  candidates: {
    value: string;
    source: string;
    page: number;
    confidence: number;
    snippet: string;
  }[];
  status: "open" | "resolved";
  resolution?: { chosen: string; by: string; at: string; note: string };
}

export interface ValidationFlag {
  id: string;
  rule: string;
  field: string;
  message: string;
  severity: "critical" | "high" | "medium" | "low";
  detail: string;
}

export interface RiskItem {
  id: string;
  title: string;
  category: string;
  severity: "critical" | "high" | "medium" | "low";
  confidence: number;
  description: string;
  evidence: { doc: string; page: number; snippet: string }[];
  suggestedQuestions: string[];
}

export interface ActionItem {
  id: string;
  text: string;
  owner: string;
  due: string;
  done: boolean;
  source: string;
}

export interface ChecklistItem {
  id: string;
  kind: "document" | "field";
  label: string;
  severity: "blocking" | "important" | "nice-to-have";
  status: "missing" | "present" | "partial";
  note: string;
  custom?: boolean;
}

export interface GeneratedFile {
  id: string;
  name: string;
  kind: "Excel Model" | "IC Memo (Word)" | "IC Memo (PDF)" | "IC Deck (PPTX)" | "CSV Export" | "JSON Export";
  sizeMB: number;
  generatedAt: string;
  generatedBy: string;
  version: number;
}

// ── Projects ────────────────────────────────────────────────

export const projects: Project[] = [
  {
    id: "helios",
    name: "Project Helios",
    technology: "Solar",
    country: "Spain",
    countryCode: "ES",
    capacityMW: 120,
    status: "In Diligence",
    lead: "J. Moreau",
    createdAt: "2026-06-24",
    docsUploaded: 14,
    docsTotal: 19,
    fieldsConfirmed: 87,
    fieldsTotal: 124,
    openConflicts: 4,
    openRisks: { critical: 1, high: 3, medium: 6, low: 4 },
    dealSizeM: 96,
    stage: "Diligence",
  },
  {
    id: "boreas",
    name: "Project Boreas",
    technology: "Wind",
    country: "Germany",
    countryCode: "DE",
    capacityMW: 210,
    status: "IC Review",
    lead: "A. Lindqvist",
    createdAt: "2026-05-11",
    docsUploaded: 22,
    docsTotal: 22,
    fieldsConfirmed: 141,
    fieldsTotal: 148,
    openConflicts: 1,
    openRisks: { critical: 0, high: 2, medium: 4, low: 5 },
    dealSizeM: 284,
    stage: "IC Memo Draft",
  },
  {
    id: "meridian",
    name: "Meridian Retail Park",
    technology: "Infrastructure",
    infraSubType: "Shopping Complex",
    country: "United Kingdom",
    countryCode: "GB",
    status: "In Diligence",
    lead: "S. Okafor",
    createdAt: "2026-06-30",
    docsUploaded: 8,
    docsTotal: 16,
    fieldsConfirmed: 34,
    fieldsTotal: 96,
    openConflicts: 6,
    openRisks: { critical: 2, high: 4, medium: 7, low: 3 },
    dealSizeM: 142,
    stage: "Document Collection",
  },
  {
    id: "atlas",
    name: "Atlas Student Living",
    technology: "Infrastructure",
    infraSubType: "Hostel",
    country: "Portugal",
    countryCode: "PT",
    status: "Approved",
    lead: "M. Ferreira",
    createdAt: "2026-03-18",
    docsUploaded: 18,
    docsTotal: 18,
    fieldsConfirmed: 118,
    fieldsTotal: 118,
    openConflicts: 0,
    openRisks: { critical: 0, high: 0, medium: 2, low: 3 },
    dealSizeM: 58,
    stage: "Closed",
  },
  {
    id: "zephyr",
    name: "Project Zephyr",
    technology: "Wind",
    country: "Denmark",
    countryCode: "DK",
    capacityMW: 96,
    status: "Passed",
    lead: "J. Moreau",
    createdAt: "2026-02-02",
    docsUploaded: 11,
    docsTotal: 11,
    fieldsConfirmed: 76,
    fieldsTotal: 102,
    openConflicts: 0,
    openRisks: { critical: 0, high: 1, medium: 2, low: 2 },
    dealSizeM: 121,
    stage: "Archived",
  },
];

// ── Documents (Project Helios) ──────────────────────────────

export const documents: DealDocument[] = [
  { id: "d1", name: "Helios_PPA_Executed_vFinal.pdf", type: "Power Purchase Agreement", status: "done", pages: 84, sizeMB: 6.2, uploadedAt: "Jul 12, 10:04", uploadedBy: "J. Moreau", progress: 100, fieldsExtracted: 31, ocrApplied: false, format: "PDF" },
  { id: "d2", name: "EPC_Contract_SolarBond.pdf", type: "EPC Contract", status: "done", pages: 212, sizeMB: 18.4, uploadedAt: "Jul 12, 10:06", uploadedBy: "J. Moreau", progress: 100, fieldsExtracted: 47, ocrApplied: false, format: "PDF" },
  { id: "d3", name: "Financial_Model_v3.2.xlsx", type: "Financial Model", status: "done", pages: 1, sizeMB: 3.1, uploadedAt: "Jul 12, 10:11", uploadedBy: "R. Chen", progress: 100, fieldsExtracted: 58, ocrApplied: false, format: "XLSX" },
  { id: "d4", name: "Solar_Resource_Assessment_PVSyst.pdf", type: "Resource / Yield Report", status: "done", pages: 96, sizeMB: 11.8, uploadedAt: "Jul 12, 10:14", uploadedBy: "R. Chen", progress: 100, fieldsExtracted: 22, ocrApplied: false, format: "PDF" },
  { id: "d5", name: "Land_Lease_Andalusia.pdf", type: "Land Lease", status: "done", pages: 41, sizeMB: 4.4, uploadedAt: "Jul 12, 11:32", uploadedBy: "J. Moreau", progress: 100, fieldsExtracted: 14, ocrApplied: true, format: "PDF" },
  { id: "d6", name: "Insurance_Placement_Slip.pdf", type: "Insurance", status: "done", pages: 12, sizeMB: 1.2, uploadedAt: "Jul 13, 09:20", uploadedBy: "A. Lindqvist", progress: 100, fieldsExtracted: 9, ocrApplied: false, format: "PDF" },
  { id: "d7", name: "Grid_Connection_Agreement.pdf", type: "Grid Connection Agreement", status: "done", pages: 58, sizeMB: 5.6, uploadedAt: "Jul 13, 09:24", uploadedBy: "A. Lindqvist", progress: 100, fieldsExtracted: 12, ocrApplied: false, format: "PDF" },
  { id: "d8", name: "Om_Agreement_Draft.docx", type: "O&M Agreement", status: "done", pages: 36, sizeMB: 2.8, uploadedAt: "Jul 14, 14:02", uploadedBy: "J. Moreau", progress: 100, fieldsExtracted: 11, ocrApplied: false, format: "DOCX" },
  { id: "d9", name: "Term_Sheet_VittaCapital.pdf", type: "Term Sheet", status: "done", pages: 9, sizeMB: 0.8, uploadedAt: "Jul 14, 14:05", uploadedBy: "J. Moreau", progress: 100, fieldsExtracted: 16, ocrApplied: false, format: "PDF" },
  { id: "d10", name: "Permits_Bundle_Sevilla.pdf", type: "Permits & Licenses", status: "done", pages: 133, sizeMB: 24.1, uploadedAt: "Jul 15, 08:47", uploadedBy: "R. Chen", progress: 100, fieldsExtracted: 18, ocrApplied: true, format: "PDF" },
  { id: "d11", name: "Environmental_Impact_Study.pdf", type: "Environmental Report", status: "extracting", pages: 187, sizeMB: 31.2, uploadedAt: "Jul 17, 16:30", uploadedBy: "R. Chen", progress: 64, fieldsExtracted: 7, ocrApplied: true, format: "PDF" },
  { id: "d12", name: "Lender_Technical_Advisor_Scope.docx", type: "Technical Advisory", status: "classifying", pages: 15, sizeMB: 1.9, uploadedAt: "Jul 18, 09:12", uploadedBy: "A. Lindqvist", progress: 38, fieldsExtracted: 0, ocrApplied: false, format: "DOCX" },
  { id: "d13", name: "Substation_Photos_Site_Visit.png", type: "Site Evidence", status: "parsing", pages: 1, sizeMB: 8.7, uploadedAt: "Jul 18, 09:58", uploadedBy: "J. Moreau", progress: 12, fieldsExtracted: 0, ocrApplied: true, format: "PNG" },
  { id: "d14", name: "Investor_Presentation_Q2.pptx", type: "Sponsor Presentation", status: "done", pages: 42, sizeMB: 14.3, uploadedAt: "Jul 15, 11:21", uploadedBy: "A. Lindqvist", progress: 100, fieldsExtracted: 8, ocrApplied: false, format: "PPTX" },
];

// ── Canonical fields (Project Helios) ───────────────────────

export const canonicalFields: CanonicalField[] = [
  {
    id: "f1", field: "Total CAPEX", category: "Costs", value: "€96.4M", numericValue: 96.4, unit: "€M",
    confidence: 0.94, source: { doc: "EPC_Contract_SolarBond.pdf", page: 14, snippet: "…the Contract Price shall be a fixed lump sum of EUR 96,400,000 inclusive of all works…" },
    status: "human-confirmed", aliases: ["Contract Price", "EPC Price", "Total Investment"],
  },
  {
    id: "f2", field: "Installed Capacity", category: "Technical", value: "120 MWp", numericValue: 120, unit: "MWp",
    confidence: 0.99, source: { doc: "EPC_Contract_SolarBond.pdf", page: 3, snippet: "…a photovoltaic plant with a total installed capacity of one hundred twenty (120) MWp…" },
    status: "human-confirmed", aliases: ["Plant Capacity", "Nameplate Capacity"],
  },
  {
    id: "f3", field: "PPA Tariff", category: "Revenue", value: "€52.40 /MWh", numericValue: 52.4, unit: "€/MWh",
    confidence: 0.88, source: { doc: "Helios_PPA_Executed_vFinal.pdf", page: 22, snippet: "…the Energy Price for Delivery Years 1–10 shall be EUR 52.40 per MWh, escalating at 1.8% p.a.…" },
    status: "overridden", aliases: ["Energy Price", "Energy Tariff", "PPA Price"],
    override: { by: "J. Moreau", at: "Jul 16, 15:40", reason: "Term sheet floor price €54/MWh governs; PPA escalation applied from COD not signing.", previousValue: "€51.10 /MWh" },
  },
  {
    id: "f4", field: "PPA Tenor", category: "Revenue", value: "10 years", numericValue: 10, unit: "yrs",
    confidence: 0.97, source: { doc: "Helios_PPA_Executed_vFinal.pdf", page: 22, snippet: "…Delivery Years 1–10 from the Commercial Operation Date…" },
    status: "human-confirmed", aliases: ["Delivery Term", "Contract Duration"],
  },
  {
    id: "f5", field: "P50 Annual Yield", category: "Technical", value: "1,812 kWh/kWp", numericValue: 1812, unit: "kWh/kWp",
    confidence: 0.91, source: { doc: "Solar_Resource_Assessment_PVSyst.pdf", page: 41, snippet: "…P50 specific yield estimated at 1,812 kWh/kWp with P90 at 1,706 kWh/kWp…" },
    status: "ai-extracted", aliases: ["Specific Yield", "P50 Yield"],
  },
  {
    id: "f6", field: "O&M Cost (Year 1)", category: "Costs", value: "€11.2k /MWp/yr", numericValue: 11.2, unit: "€k/MWp",
    confidence: 0.83, source: { doc: "Om_Agreement_Draft.docx", page: 7, snippet: "…annual O&M fee of EUR 1,344,000, subject to CPI indexation…" },
    status: "ai-extracted", aliases: ["O&M Fee", "Maintenance Cost"],
  },
  {
    id: "f7", field: "Land Lease (Annual)", category: "Costs", value: "€312,000 /yr", numericValue: 0.312, unit: "€M",
    confidence: 0.9, source: { doc: "Land_Lease_Andalusia.pdf", page: 9, snippet: "…rent of EUR 312,000 per annum for the 312-hectare parcel…" },
    status: "human-confirmed", aliases: ["Ground Rent", "Surface Rent"],
  },
  {
    id: "f8", field: "Debt Facility Size", category: "Financing", value: "€67.5M", numericValue: 67.5, unit: "€M",
    confidence: 0.95, source: { doc: "Term_Sheet_VittaCapital.pdf", page: 2, snippet: "…senior secured facility of EUR 67,500,000, approximately 70% of total project cost…" },
    status: "human-confirmed", aliases: ["Senior Debt", "Facility Amount"],
  },
  {
    id: "f9", field: "Gearing", category: "Financing", value: "70 %", numericValue: 70, unit: "%",
    confidence: 0.95, source: { doc: "Term_Sheet_VittaCapital.pdf", page: 2, snippet: "…approximately 70% of total project cost…" },
    status: "ai-extracted", aliases: ["Leverage", "Debt-to-Cost"],
  },
  {
    id: "f10", field: "Interest Rate", category: "Financing", value: "Euribor 6M + 265 bps",
    confidence: 0.92, source: { doc: "Term_Sheet_VittaCapital.pdf", page: 3, snippet: "…margin of 265 basis points over 6-month EURIBOR, floored at 0%…" },
    status: "human-confirmed", aliases: ["Margin", "Spread"],
  },
  {
    id: "f11", field: "Debt Tenor", category: "Financing", value: "17 years", numericValue: 17, unit: "yrs",
    confidence: 0.96, source: { doc: "Term_Sheet_VittaCapital.pdf", page: 3, snippet: "…door-to-door tenor of 17 years from financial close…" },
    status: "human-confirmed", aliases: ["Loan Maturity", "Facility Term"],
  },
  {
    id: "f12", field: "Target DSCR (min)", category: "Financing", value: "1.30x", numericValue: 1.3, unit: "x",
    confidence: 0.9, source: { doc: "Term_Sheet_VittaCapital.pdf", page: 4, snippet: "…lock-up at DSCR below 1.15x and default below 1.05x; target minimum 1.30x…" },
    status: "ai-extracted", aliases: ["Minimum DSCR", "Coverage Ratio"],
  },
  {
    id: "f13", field: "Equity IRR (levered)", category: "Returns", value: "11.8 %", numericValue: 11.8, unit: "%",
    confidence: 0.99, source: { doc: "Financial_Model_v3.2.xlsx", page: 1, snippet: "Sheet 'Outputs'!C14 — computed cell, uploaded computed workbook" },
    status: "computed", aliases: ["Lev IRR", "Equity Return"],
  },
  {
    id: "f14", field: "Project IRR", category: "Returns", value: "8.4 %", numericValue: 8.4, unit: "%",
    confidence: 0.99, source: { doc: "Financial_Model_v3.2.xlsx", page: 1, snippet: "Sheet 'Outputs'!C12 — computed cell, uploaded computed workbook" },
    status: "computed", aliases: ["Unlevered IRR"],
  },
  {
    id: "f15", field: "Commercial Operation Date", category: "Timeline", value: "Q3 2027",
    confidence: 0.86, source: { doc: "EPC_Contract_SolarBond.pdf", page: 31, snippet: "…Guaranteed Completion Date of 30 September 2027, subject to extension events…" },
    status: "ai-extracted", aliases: ["COD", "Guaranteed Completion Date"],
  },
  {
    id: "f16", field: "Grid Connection Capacity", category: "Technical", value: "105 MWac", numericValue: 105, unit: "MWac",
    confidence: 0.93, source: { doc: "Grid_Connection_Agreement.pdf", page: 5, snippet: "…evacuation capacity of 105 MWac at the 220 kV Seville East substation…" },
    status: "human-confirmed", aliases: ["Evacuation Capacity", "Export Capacity"],
  },
  {
    id: "f17", field: "Insurance Premium (Construction)", category: "Costs", value: "€1.45M",
    confidence: 0.78, source: { doc: "Insurance_Placement_Slip.pdf", page: 2, snippet: "…CAR premium EUR 1,450,000 for the construction period…" },
    status: "ai-extracted", aliases: ["CAR Premium"],
  },
  {
    id: "f18", field: "Module Degradation Rate", category: "Technical", value: "0.45 % /yr", numericValue: 0.45, unit: "%/yr",
    confidence: 0.84, source: { doc: "Solar_Resource_Assessment_PVSyst.pdf", page: 55, snippet: "…annual degradation assumed at 0.45% linear from Year 2…" },
    status: "ai-extracted", aliases: ["Degradation"],
  },
  {
    id: "f19", field: "Merchant Tail Assumption", category: "Revenue", value: "", unit: "€/MWh",
    confidence: 0, source: { doc: "—", page: 0, snippet: "" },
    status: "missing", aliases: ["Merchant Price", "Post-PPA Price"],
  },
  {
    id: "f20", field: "Sponsor Equity Commitment", category: "Financing", value: "", unit: "€M",
    confidence: 0, source: { doc: "—", page: 0, snippet: "" },
    status: "missing", aliases: ["Equity Contribution"],
  },
];

// ── Conflicts ───────────────────────────────────────────────

export const conflicts: Conflict[] = [
  {
    id: "c1", field: "Total CAPEX", category: "Costs", severity: "high", status: "open",
    candidates: [
      { value: "€96.4M", source: "EPC_Contract_SolarBond.pdf", page: 14, confidence: 0.94, snippet: "…fixed lump sum of EUR 96,400,000…" },
      { value: "€98.1M", source: "Financial_Model_v3.2.xlsx", page: 1, confidence: 0.86, snippet: "Inputs!D22 'Total Investment incl. contingency' = 98.1" },
      { value: "€94.8M", source: "Investor_Presentation_Q2.pptx", page: 17, confidence: 0.71, snippet: "Slide 17: 'Total project cost €94.8m'" },
    ],
  },
  {
    id: "c2", field: "PPA Tariff", category: "Revenue", severity: "critical", status: "resolved",
    candidates: [
      { value: "€52.40 /MWh", source: "Helios_PPA_Executed_vFinal.pdf", page: 22, confidence: 0.88, snippet: "…EUR 52.40 per MWh, escalating at 1.8% p.a.…" },
      { value: "€54.00 /MWh", source: "Term_Sheet_VittaCapital.pdf", page: 5, confidence: 0.81, snippet: "…minimum floor price of EUR 54.00/MWh for the facility sizing case…" },
      { value: "€51.10 /MWh", source: "Financial_Model_v3.2.xlsx", page: 1, confidence: 0.77, snippet: "Inputs!D31 'Base tariff (real)' = 51.10" },
    ],
    resolution: { chosen: "€52.40 /MWh", by: "J. Moreau", at: "Jul 16, 15:40", note: "PPA contract is executed and governs. Term sheet floor is a sizing covenant, not a tariff. Model was pre-signing draft." },
  },
  {
    id: "c3", field: "Commercial Operation Date", category: "Timeline", severity: "medium", status: "open",
    candidates: [
      { value: "Q3 2027", source: "EPC_Contract_SolarBond.pdf", page: 31, confidence: 0.86, snippet: "…Guaranteed Completion Date of 30 September 2027…" },
      { value: "Q2 2027", source: "Investor_Presentation_Q2.pptx", page: 9, confidence: 0.62, snippet: "Slide 9 timeline shows COD June 2027" },
    ],
  },
  {
    id: "c4", field: "O&M Cost (Year 1)", category: "Costs", severity: "medium", status: "open",
    candidates: [
      { value: "€11.2k /MWp/yr", source: "Om_Agreement_Draft.docx", page: 7, confidence: 0.83, snippet: "…annual O&M fee of EUR 1,344,000…" },
      { value: "€12.8k /MWp/yr", source: "Financial_Model_v3.2.xlsx", page: 1, confidence: 0.74, snippet: "Inputs!D44 'O&M per MWp' = 12.8" },
    ],
  },
  {
    id: "c5", field: "P50 Annual Yield", category: "Technical", severity: "low", status: "open",
    candidates: [
      { value: "1,812 kWh/kWp", source: "Solar_Resource_Assessment_PVSyst.pdf", page: 41, confidence: 0.91, snippet: "…P50 specific yield estimated at 1,812 kWh/kWp…" },
      { value: "1,795 kWh/kWp", source: "Financial_Model_v3.2.xlsx", page: 1, confidence: 0.8, snippet: "Inputs!D18 'P50 yield' = 1795" },
    ],
  },
];

// ── Validation flags ────────────────────────────────────────

export const validationFlags: ValidationFlag[] = [
  { id: "v1", rule: "Benchmark range", field: "PPA Tariff", severity: "high", message: "Tariff €52.40/MWh is 18% below the Iberian benchmark range (€62–70/MWh) for comparable 2026 PPAs.", detail: "Sourced from 14 comparable Iberian solar PPAs in firm knowledge base." },
  { id: "v2", rule: "Cross-field logic", field: "Gearing × Debt Facility", severity: "medium", message: "70% gearing on €96.4M CAPEX implies €67.5M debt — consistent. However on the conflicting €98.1M CAPEX it implies €68.7M.", detail: "Resolve CAPEX conflict to confirm facility sizing." },
  { id: "v3", rule: "Missing required", field: "Merchant Tail Assumption", severity: "critical", message: "Merchant price assumption for post-PPA years is missing. Required for Excel blueprint and IC memo.", detail: "Blueprint cell Revenue!C38 has no source." },
  { id: "v4", rule: "Plausibility", field: "O&M Cost (Year 1)", severity: "low", message: "€11.2k/MWp/yr is at the low end of the €11–16k/MWp range for Southern Europe. Acceptable but verify scope includes module washing.", detail: "O&M agreement is a draft — final pricing may move." },
  { id: "v5", rule: "Cross-field logic", field: "Grid Connection vs Capacity", severity: "medium", message: "DC/AC ratio of 1.14 (120 MWp / 105 MWac) is within norms but leaves limited clipping headroom given 1,812 kWh/kWp yield.", detail: "Confirm inverter sizing in EPC schedule 7." },
];

// ── Risks ───────────────────────────────────────────────────

export const risks: RiskItem[] = [
  {
    id: "r1", title: "PPA tariff below term sheet floor", category: "Financial", severity: "critical", confidence: 0.92,
    description: "Executed PPA prices energy at €52.40/MWh while the lender term sheet assumes a €54.00/MWh floor for the sizing case. At the executed tariff, base-case DSCR compresses toward the 1.30x target in Years 3–5.",
    evidence: [
      { doc: "Helios_PPA_Executed_vFinal.pdf", page: 22, snippet: "…EUR 52.40 per MWh…" },
      { doc: "Term_Sheet_VittaCapital.pdf", page: 5, snippet: "…minimum floor price of EUR 54.00/MWh…" },
    ],
    suggestedQuestions: ["Was the term sheet sized on the pre-signing tariff?", "Does the sponsor offer a revenue top-up guarantee?"],
  },
  {
    id: "r2", title: "O&M agreement still in draft", category: "Legal", severity: "high", confidence: 0.95,
    description: "The O&M agreement is unsigned. Extracted pricing (€11.2k/MWp/yr) is indicative and scope (module washing, vegetation control) is not yet fixed.",
    evidence: [{ doc: "Om_Agreement_Draft.docx", page: 1, snippet: "DRAFT — FOR DISCUSSION PURPOSES ONLY" }],
    suggestedQuestions: ["When is execution expected?", "Is pricing fixed or CPI-capped in the final draft?"],
  },
  {
    id: "r3", title: "Grid curtailment exposure not quantified", category: "Technical", severity: "high", confidence: 0.71,
    description: "Grid connection agreement grants 105 MWac evacuation but is silent on curtailment compensation. Yield report assumes zero curtailment. Regional curtailment ran 2.1% in 2025.",
    evidence: [
      { doc: "Grid_Connection_Agreement.pdf", page: 5, snippet: "…evacuation capacity of 105 MWac…" },
      { doc: "Solar_Resource_Assessment_PVSyst.pdf", page: 41, snippet: "…no curtailment adjustment applied…" },
    ],
    suggestedQuestions: ["Request a curtailment study from the TSO.", "Does insurance cover business interruption from curtailment?"],
  },
  {
    id: "r4", title: "Land lease term shorter than debt tenor", category: "Legal", severity: "high", confidence: 0.89,
    description: "Land lease runs 25 years with a single 5-year extension option, while the debt tenor is 17 years plus tail. Extension is at the lessor's discretion after year 20.",
    evidence: [{ doc: "Land_Lease_Andalusia.pdf", page: 11, snippet: "…initial term of twenty-five (25) years… extension subject to Lessor consent…" }],
    suggestedQuestions: ["Can the extension option be made unilateral?", "Is a surface right (derecho de superficie) registrable?"],
  },
  {
    id: "r5", title: "Environmental permit conditions pending", category: "ESG", severity: "medium", confidence: 0.66,
    description: "Environmental impact study flags a conditional approval tied to a steppe-bird mitigation plan. Extraction still in progress; conditions may affect construction sequencing.",
    evidence: [{ doc: "Environmental_Impact_Study.pdf", page: 3, snippet: "…conditional upon implementation of the little bustard habitat plan…" }],
    suggestedQuestions: ["What is the cost and schedule impact of the habitat plan?"],
  },
];

// ── Action items ────────────────────────────────────────────

export const actionItems: ActionItem[] = [
  { id: "a1", text: "Resolve Total CAPEX conflict (3 candidate values)", owner: "J. Moreau", due: "Jul 19", done: false, source: "Reconciliation" },
  { id: "a2", text: "Obtain merchant tail price assumption from sponsor", owner: "R. Chen", due: "Jul 20", done: false, source: "Missing field" },
  { id: "a3", text: "Request executed O&M agreement (currently draft)", owner: "A. Lindqvist", due: "Jul 22", done: false, source: "Risk r2" },
  { id: "a4", text: "Upload lender technical advisor final scope", owner: "A. Lindqvist", due: "Jul 21", done: false, source: "Checklist" },
  { id: "a5", text: "Confirm curtailment study with TSO", owner: "R. Chen", due: "Jul 24", done: false, source: "Risk r3" },
  { id: "a6", text: "Review insurance broker letter of undertaking", owner: "J. Moreau", due: "Jul 25", done: true, source: "Checklist" },
];

// ── Checklist ───────────────────────────────────────────────

export const checklist: ChecklistItem[] = [
  { id: "k1", kind: "document", label: "Power Purchase Agreement", severity: "blocking", status: "present", note: "Executed version uploaded Jul 12." },
  { id: "k2", kind: "document", label: "EPC Contract", severity: "blocking", status: "present", note: "Executed, 212 pages." },
  { id: "k3", kind: "document", label: "Financial Model", severity: "blocking", status: "present", note: "v3.2 — computed workbook also on file." },
  { id: "k4", kind: "document", label: "O&M Agreement", severity: "blocking", status: "partial", note: "Draft only — executed copy required before IC." },
  { id: "k5", kind: "document", label: "Resource / Yield Report", severity: "blocking", status: "present", note: "PVSyst report, Mar 2026." },
  { id: "k6", kind: "document", label: "Land Lease", severity: "blocking", status: "present", note: "Registered lease, 25y + 5y option." },
  { id: "k7", kind: "document", label: "Grid Connection Agreement", severity: "important", status: "present", note: "105 MWac, 220 kV Seville East." },
  { id: "k8", kind: "document", label: "Insurance Package", severity: "important", status: "partial", note: "Placement slip only — full policy wording missing." },
  { id: "k9", kind: "document", label: "Environmental Permits", severity: "important", status: "partial", note: "Conditional approval — mitigation plan pending." },
  { id: "k10", kind: "document", label: "Equity Commitment Letter", severity: "blocking", status: "missing", note: "Not yet provided by sponsor." },
  { id: "k11", kind: "document", label: "Curtailment Study", severity: "important", status: "missing", note: "Requested from TSO.", custom: true },
  { id: "k12", kind: "field", label: "Merchant Tail Assumption", severity: "blocking", status: "missing", note: "Needed for blueprint Revenue!C38." },
  { id: "k13", kind: "field", label: "Sponsor Equity Commitment", severity: "blocking", status: "missing", note: "Needed for funding waterfall." },
  { id: "k14", kind: "field", label: "PPA Tariff", severity: "blocking", status: "present", note: "Resolved via override (J. Moreau, Jul 16)." },
];

// ── Generated files ─────────────────────────────────────────

export const generatedFiles: GeneratedFile[] = [
  { id: "g1", name: "Helios_BusinessCase_v3.xlsx", kind: "Excel Model", sizeMB: 2.4, generatedAt: "Jul 17, 18:02", generatedBy: "J. Moreau", version: 3 },
  { id: "g2", name: "Helios_IC_Memo_v2.docx", kind: "IC Memo (Word)", sizeMB: 1.1, generatedAt: "Jul 17, 18:14", generatedBy: "J. Moreau", version: 2 },
  { id: "g3", name: "Helios_IC_Memo_v2.pdf", kind: "IC Memo (PDF)", sizeMB: 2.8, generatedAt: "Jul 17, 18:15", generatedBy: "J. Moreau", version: 2 },
  { id: "g4", name: "Helios_IC_Deck_v1.pptx", kind: "IC Deck (PPTX)", sizeMB: 6.7, generatedAt: "Jul 16, 11:40", generatedBy: "A. Lindqvist", version: 1 },
  { id: "g5", name: "Helios_CanonicalFields_Export.csv", kind: "CSV Export", sizeMB: 0.04, generatedAt: "Jul 15, 09:02", generatedBy: "R. Chen", version: 1 },
  { id: "g6", name: "Helios_Extraction_Raw.json", kind: "JSON Export", sizeMB: 1.9, generatedAt: "Jul 15, 09:02", generatedBy: "R. Chen", version: 1 },
  { id: "g7", name: "Helios_BusinessCase_v2.xlsx", kind: "Excel Model", sizeMB: 2.2, generatedAt: "Jul 14, 16:55", generatedBy: "J. Moreau", version: 2 },
];

// ── Cross-deal benchmark data ───────────────────────────────

export const benchmarks = {
  sector: "Solar PV — Southern Europe",
  dealsEvaluated: 17,
  rows: [
    { metric: "CAPEX / MWp", this: "€0.80M", p25: "€0.72M", median: "€0.78M", p75: "€0.86M", verdict: "inline" as const },
    { metric: "PPA Tariff", this: "€52.4/MWh", p25: "€61/MWh", median: "€65/MWh", p75: "€70/MWh", verdict: "below" as const },
    { metric: "P50 Yield", this: "1,812", p25: "1,640", median: "1,705", p75: "1,790", verdict: "above" as const },
    { metric: "O&M / MWp / yr", this: "€11.2k", p25: "€11.0k", median: "€13.4k", p75: "€15.8k", verdict: "inline" as const },
    { metric: "Gearing", this: "70%", p25: "60%", median: "67%", p75: "75%", verdict: "inline" as const },
    { metric: "Min DSCR", this: "1.30x", p25: "1.25x", median: "1.30x", p75: "1.40x", verdict: "inline" as const },
    { metric: "Equity IRR", this: "11.8%", p25: "9.5%", median: "11.2%", p75: "13.0%", verdict: "above" as const },
  ],
};

// ── Portfolio (post-acquisition) ────────────────────────────

export const portfolio = [
  { name: "Atlas Student Living", country: "Portugal", sector: "Hostel", investedM: 58, occupancy: 94, ebitdaMargin: 41, trend: [38, 39, 40, 41, 41, 42], status: "On Track" as const },
  { name: "Solara One", country: "Spain", sector: "Solar", investedM: 74, occupancy: 0, ebitdaMargin: 78, trend: [76, 77, 79, 78, 78, 79], status: "On Track" as const },
  { name: "Nordwind Park II", country: "Denmark", sector: "Wind", investedM: 132, occupancy: 0, ebitdaMargin: 71, trend: [74, 73, 71, 69, 70, 71], status: "Watch" as const },
  { name: "Koper Logistics Hub", country: "Slovenia", sector: "Logistics", investedM: 46, occupancy: 88, ebitdaMargin: 52, trend: [55, 54, 53, 52, 51, 52], status: "Watch" as const },
];

// ── Charts ──────────────────────────────────────────────────

export const revenueProjection = [
  { year: "2027", revenue: 8.2, opex: 2.1, cfads: 6.1 },
  { year: "2028", revenue: 11.6, opex: 2.2, cfads: 9.4 },
  { year: "2029", revenue: 11.5, opex: 2.3, cfads: 9.2 },
  { year: "2030", revenue: 11.4, opex: 2.3, cfads: 9.1 },
  { year: "2031", revenue: 11.4, opex: 2.4, cfads: 9.0 },
  { year: "2032", revenue: 11.3, opex: 2.4, cfads: 8.9 },
  { year: "2033", revenue: 11.2, opex: 2.5, cfads: 8.7 },
  { year: "2034", revenue: 11.1, opex: 2.6, cfads: 8.5 },
];

export const fundingWaterfall = [
  { name: "Senior Debt", value: 67.5, color: "#2563eb" },
  { name: "Sponsor Equity", value: 24.1, color: "#059669" },
  { name: "Mezzanine", value: 4.8, color: "#d97706" },
];

export const knowledgeGrowth = [
  { month: "Feb", deals: 4, fields: 1240 },
  { month: "Mar", deals: 6, fields: 2310 },
  { month: "Apr", deals: 9, fields: 3980 },
  { month: "May", deals: 12, fields: 5420 },
  { month: "Jun", deals: 16, fields: 7810 },
  { month: "Jul", deals: 19, fields: 9640 },
];

// ── IC Memo sections (16-section structure) ─────────────────

export const icMemoSections = [
  "Executive Summary", "Borrower Profile", "Transaction Overview", "Project Description",
  "Market Analysis", "Technical Assessment", "Contract Structure", "Financial Summary",
  "Funding Structure", "Repayment Structure", "Risk Factors", "ESG & Environmental",
  "Legal & Regulatory", "Insurance", "Benchmarking & Precedents", "Recommendation",
];

export const icDeckSlides = [
  "Cover", "Project Overview", "Investment Structure", "Funding Breakdown", "Business Plan",
  "Loan & Repayment", "Risk Analysis", "Market Context", "ESG Highlights", "Conclusion & Ask",
];

// ── AI chat sample ──────────────────────────────────────────

export const chatSample = [
  {
    role: "user" as const,
    text: "What are the biggest risks on Project Helios?",
  },
  {
    role: "ai" as const,
    text: "Three stand out. First, the executed PPA tariff (€52.40/MWh) sits below the €54.00/MWh floor the term sheet was sized on, compressing DSCR in Years 3–5 [1][2]. Second, the O&M agreement is still a draft, so the €11.2k/MWp/yr cost is indicative [3]. Third, curtailment exposure is unquantified — the yield report assumes zero, but regional curtailment ran 2.1% in 2025 [4]. Want me to draft sponsor questions for each?",
    citations: [
      { n: 1, doc: "Helios_PPA_Executed_vFinal.pdf", page: 22 },
      { n: 2, doc: "Term_Sheet_VittaCapital.pdf", page: 5 },
      { n: 3, doc: "Om_Agreement_Draft.docx", page: 1 },
      { n: 4, doc: "Solar_Resource_Assessment_PVSyst.pdf", page: 41 },
    ],
  },
];

export const suggestedPrompts = [
  "Summarize this deal in 5 bullet points",
  "Compare Helios with our last 3 solar deals",
  "Where is EBITDA discussed across all documents?",
  "Show every contract with a term longer than 10 years",
  "Draft IC questions for the sponsor",
];

export const currentUser = { name: "Jane Moreau", initials: "JM", role: "Investment Principal" };
