# PRD — vitta.ai Product Demo (v2)

**Status:** Approved for build
**Purpose:** Turn this repo into an investor/customer-facing demo that shows the full
vitta.ai vision — live deal execution (today's product, at flagship quality) and
portfolio monitoring (new) — running entirely on scripted fake data. Self-contained:
read this document and build, phase by phase (§9).

**Context:** this repo is the first iteration (Vite + React + Tailwind v4 + Recharts).
Its fixtures and feature surface are good; its problems are that nothing is
interactive, the upload/extraction moment doesn't exist, and the skin is generic.
**Upgrade this repo in place** — do not scaffold a new app. Section 2 says exactly
what to keep and what to replace. Baseline commit `4d1a63f` is the revert point;
commit at the end of each phase.

---

## 1. What we're building and why

A standalone client-side SPA that looks and feels like a shipped, institutional-grade
product. It is a *performance*: real UI over hand-crafted fixture data; every "AI
moment" is choreographed animation with realistic timing. Nothing is live, so nothing
can fail live.

**Three acts:**
- **Act 1 — Deal execution:** create a deal → upload documents → watch a ~100-second
  extraction pipeline run → review extracted values with source provenance → resolve
  conflicts manually → validation flags & risks → Excel blueprint export with
  canonical values auto-filled → computed workbook comes back → generate IC memo /
  deck with per-firm custom system prompts.
- **Act 2 — Portfolio monitoring:** the firm's whole book (solar, wind, storage,
  infrastructure) monitored post-close: dashboards, covenant tracking, actuals vs.
  underwriting, alerts, reporting packs.
- **Act 3 — Firm intelligence:** benchmarks, patterns, knowledge graph — the existing
  Intelligence + Knowledge Graph pages, polished, behind an "early access" badge.

**Success criteria:**
1. A first-time viewer cannot tell it isn't production software.
2. **Every visible button does something.** No dead controls anywhere. If a control
   can't have a real effect, it gets a working scripted effect or it's removed.
3. Deterministic: same clicks → same result; works offline; zero console errors.
4. 60fps animations, no layout shift, instant navigation.
5. Presenter can reset/fast-forward invisibly (hotkeys, §3.6).

**Non-goals:** real auth (fake login → always succeeds), real LLM calls, backend,
mobile. Target 1440×900 and 1920×1080 only.

---

## 2. Current state — keep / replace

### Keep (do not rebuild these from scratch)
- **Stack & structure:** Vite + React + TS + Tailwind v4 + Recharts + lucide,
  route/page layout, workspace tab structure (Overview · Documents · Data Extraction ·
  Reconciliation · Intelligence · Checklist · Outputs · Downloads).
- **All fixture content in `src/lib/mockData.ts`** — Project Helios (120 MWp solar,
  Andalusia) and its internally consistent story: executed PPA €52.40/MWh vs.
  €54.00/MWh term-sheet sizing floor, threading through conflicts → validation →
  risks → IC memo. Extend, don't discard.
- **Feature surface:** canonical fields with aliases + status lifecycle
  (ai-extracted / human-confirmed / overridden / computed / missing), conflict cards
  with candidate panels + manual override, validation layer (benchmark / cross-field /
  plausibility / missing-required), risk register with evidence + suggested sponsor
  questions, document checklist (blocking/important, missing/partial/present),
  action items, 5-pass extraction explainer, computed-workbook-as-highest-priority-
  source banner, Excel blueprint preview with per-cell provenance and
  "missing — blocked" rows, IC memo 16-section preview, deck thumbnails with live
  mini-charts, new-deal wizard (technology → blueprint + checklist), deal-scoped AI
  chat with numbered citations, firm Intelligence page (benchmarks with distribution
  markers, pattern recognition, lessons), Knowledge Graph (SVG, click-to-inspect).

### Replace / fix
1. **Nothing works.** Static data imported directly into components; no store. →
   Add a Zustand store + timeline engine (§3.5–3.6); wire *every* control (§7).
2. **No upload → no pipeline moment.** The centerpiece of the pitch is missing. →
   Build the ingestion choreography (§5.2–5.3).
3. **Generic-SaaS skin.** Default Tailwind blue `#2563eb`, sparkles icons, BETA
   badge, rounded-full pills, gradient area charts with legends. → Reskin per §3;
   de-slop rules in §3.4.
4. **Naming collision:** the fictional lender is "Vitta Capital" while the product
   is vitta.ai. → The customer firm becomes **Northbridge Capital Partners**
   (rename `Term_Sheet_VittaCapital.pdf` → `Term_Sheet_Northbridge.pdf`, memo copy,
   knowledge-graph node, etc.). The product wordmark is **vitta** (§3.1).
5. **Portfolio page is thin** (4 assets, EBITDA-only). → Full Act 2 build (§6).
6. **No custom system prompts** on outputs. → Memo Studio (§5.8).
7. **No provenance viewer** beyond inline snippets. → Source drawer (§5.5).

---

## 3. Brand & design system (apply first — everything else inherits it)

### 3.1 Brand
Product name **vitta.ai**. Wordmark: lowercase `vitta` in the UI sans, 600 weight,
-0.02em tracking; `.ai` omitted in-app (login screen may show `vitta.ai`). Replace
the current "V" square + "Vitta" + BETA with the plain wordmark. Login footnote:
"vitta — Sanskrit: capital". No logo glyph, no gradients, no emoji anywhere.
Voice: calm, institutional; no exclamation marks.

### 3.2 Typography & numbers
Keep Inter + JetBrains Mono (`.num` class with tabular-nums — already right).
Body 13px on dense screens; page titles 20–22px/600; KPI numerals 26–32px/600 with
11–12px labels. **Financial formatting conventions everywhere:** `€96.4m` (lowercase
m), `1.30x`, `265 bps`, `70.0%`, negative values in parentheses `(€1.2m)` where a
banker would expect it. Right-align numeric table columns.

### 3.3 Color
Light theme only. Keep the ink scale in `index.css`. **Replace the blue accent
with deep evergreen:** accent-600 `#0E5F45`, accent-700 `#0A4A36`, accent-500
`#16805D`, accent-100 `#D6EFE5`, accent-50 `#EFF9F4`. Keep pos/warn/crit scales.
Confidence chips keep the existing thresholds. Chart rules: primary series accent;
benchmark/comparison series `#94A3B8` dashed; categorical max 5:
`#0E5F45 #1D4ED8 #B45309 #7C3AED #475569`; gridlines `#F5F5F4` horizontal only;
axis text 11px `#8a93a6`; **no gradients, no legends when direct labels fit,
tooltips styled like the app (hairline border, white, 12px)**.

### 3.4 De-slop pass (explicit checklist)
- Replace every `Sparkles` icon: the AI panel gets a neutral mark (2-letter "vi"
  monogram or `MessageSquareText`); "AI findings" → "Findings"; "Vitta AI" → "Ask vitta".
- Kill colored file-format chips (red PDF / green XLSX) → single neutral outline
  chip with the extension.
- `rounded-full` pills → `rounded-md` chips except status dots.
- Buttons: primary = accent fill; remove the blue glow shadow.
- One card radius (8px), hairline borders, `shadow-sm` only on overlays/drawers.
- No "Good morning, Jane" → "Deals" as the landing headline (bankers, not consumer).

### 3.5 State store (the thing that makes buttons work)
Single Zustand store, initialized from fixtures, persisted to localStorage
(`vitta-demo-state`), with a `reset()` that restores pristine fixtures. All screens
read from the store — never from `mockData` directly. Store slices: deals, documents,
pipeline runs, fields, conflicts, flags, checklist, actionItems, generatedFiles,
chatThreads, portfolio, alerts, promptTemplates.

### 3.6 Timeline engine + presenter controls
One `runTimeline(steps)` utility drives every scripted sequence (upload, pipeline,
generation, chat streaming) from per-sequence config files — all pacing tunable in
one place. Global keyboard handler (no visible UI):
`→` skip current stage · `⇧→` complete running sequence instantly · `r` reset all
demo state → `/` · `1`/`2`/`3` jump to Acts. Motion rules: micro-interactions
150–200ms ease-out, list stagger 25ms, KPI count-ups 400ms on first mount,
skeleton→content crossfade, rich sustained animation **only** in pipeline, generation,
and chat streaming. Add framer-motion for choreography; keep CSS `fade-up` for
simple entrances.

---

## 4. Fixture upgrades

Keep everything in `mockData.ts`, then:

1. **Rename the firm** to Northbridge Capital Partners (docs, memo copy, graph node,
   chat text). Users: Jane Moreau (Investment Principal — presenter persona),
   plus existing A. Lindqvist, R. Chen, S. Okafor as teammates.
2. **Helios pre-upload state:** the demo starts with Helios documents *not yet
   ingested*. Fixtures define the 14 documents as an "incoming deal room" the
   presenter uploads in Act 1. All current field/conflict/risk data becomes the
   *result state* the pipeline reveals. (Other deals — Boreas, Meridian, Atlas,
   Zephyr — stay pre-populated as background.)
3. **Pipeline reveal script:** a `pipelineScript.ts` listing, per stage, what appears
   when (§5.3), including ~24 hand-written field-discovery ticker lines with values
   + page refs drawn from the canonical fields.
4. **Portfolio book:** expand from 4 to **12 assets, €1.9bn committed** across
   Solar / Wind / Storage / Infrastructure and 6 countries. Keep Atlas Student
   Living, Solara One, Nordwind Park II, Koper Logistics Hub; add 8 more in the
   same style (each: technology, geo, size, commitment €m, status
   Operating/Construction, current DSCR, 12-mo DSCR + generation/revenue monthly
   series, last report date, alerts). **Problem asset:** *Ravenna Solar (Italy,
   88 MWp)* — DSCR 1.18x vs 1.20x lock-up (curtailment + May-2026 inverter outage)
   → active breach alert with distribution lock-up. **Second storyline:** Nordwind
   Park II production 4.1% below P50 (existing) + *Aldercroft Wind facility
   Amendment №3* (margin step-down on refi) for the amendment-diff moment.
5. **Covenants:** per operating asset: DSCR lock-up / default thresholds, latest
   value, headroom, next test date; 2 amber, 1 red (Ravenna).
6. **Alerts inbox (8):** 1 red (Ravenna breach), 2 amber (report overdue 9 days;
   availability 96.1% vs 97.0% guarantee), 5 info (ingests, passed tests, the
   Aldercroft amendment with before/after clause text).
7. **Prompt templates (4):** "IC Memo — Northbridge house format", "IC Deck (PPTX)",
   "Credit committee one-pager", "Term sheet summary" — each with a visible,
   editable system prompt (~120 words, e.g. "You write for Northbridge's IC. Lead
   with downside DSCR. Cite every figure to document and page. Sections: … British
   English. Max 6 pages."), last-edited byline.
8. **Chat scripts:** 5 canned Q→A pairs (deal-scoped) with citations; answers
   stream word-by-word. Any free-typed question routes to the closest canned answer.
9. **Static download artifacts** in `public/artifacts/`: blueprint `.xlsx`, IC memo
   `.docx` + `.pdf`, deck `.pptx`, portfolio quarterly pack `.pdf`, CSV/JSON
   exports. Real files, hand-made once, contents roughly matching the previews.

---

## 5. Act 1 — Deal execution (working flow, station by station)

Keep the existing workspace tabs; wire and upgrade as follows.

### 5.1 New Deal wizard (exists — keep)
Wire "Create workspace" to actually create a Helios workspace in the store in
"Document Collection" stage with an empty Documents tab.

### 5.2 Documents tab — upload that works
- Dropzone accepts real drag-drop or file-picker; whatever is dropped, the scripted
  14-document deal room appears (rows animate in, staggered; per-file upload bars
  ~5s, slightly desynced). A **"Run extraction"** primary button arms when uploads
  finish.
- After the run completes, this tab shows the current done-state table (keep it),
  including per-doc expandable sample extractions.

### 5.3 The extraction choreography (~100s — the money shot)
Full-width pipeline panel replaces the dropzone during the run. Left: stage list;
right: live activity. Driven by `pipelineScript.ts`; `→`/`⇧→` work.

1. **Parsing — 18s** — per-doc page counters tick ("212 / 212 pages"); chips:
   `38 tables detected`, `OCR applied` on the two scanned docs.
2. **Classifying — 10s** — type badges flip in with confidence
   (`Power Purchase Agreement · 0.97`); one doc visibly re-classifies
   ("Contract" → "O&M Agreement") — an honest beat.
3. **Extracting — 42s** — ticker streams discovered fields every 600–900ms with
   slight jitter: `✓ PPA Tariff — €52.40/MWh · PPA p.22`. Counters count up:
   **Fields 253 · Tables 12**. Per-doc progress rings. Hover pauses ticker.
4. **Mapping to canonical schema — 8s** — fields sort into category buckets
   (Revenue · Costs · Financing · Technical · Timeline) with counts; alias
   examples flash ("'Energy Price' → PPA Tariff").
5. **Validating — 12s** — checklist cascade (~800ms/line): cross-document totals,
   unit normalization, benchmark ranges, completeness; two lines get amber `!`.
6. **Detecting conflicts — 6s** — amber pulse: "5 conflicts require review".
7. **Done — 4s** — calm completion: "253 fields · 12 tables · 5 conflicts ·
   ~9 analyst-hours saved" + buttons **Review extraction** / **Go to reconciliation**.
   No confetti.

After the run, the store flips Helios to its full post-extraction state; every tab
badge updates (Reconciliation `5`, Checklist `6`, …).

### 5.4 Data Extraction tab (exists — upgrade)
Keep table, filters, category rail, stats strip. Wire:
- **Confirm value** → status flips to human-confirmed (row settles, counts update).
- **Override…** → inline value + mandatory reason; commits to store, logged.
- **Add manually** on missing fields → fills value, checklist item flips to present.
- **CSV / JSON buttons** → download the real artifact files.

### 5.5 Source drawer (new — the provenance moment)
Clicking any source chip (anywhere in the app) opens a right drawer (~560px): a
styled HTML facsimile of the document page (header, clause numbers, justified serif
body) auto-scrolled to the clause, extracted span highlighted with accent tint +
bounding outline; above: field, value, normalized value, confidence, extraction
timestamp. Must open <100ms. Build one `DocumentPage` component fed per-source
fixture text (write facsimile text for the ~12 most-clicked sources; others reuse
the snippet centered on a generic page).

### 5.6 Reconciliation tab (exists — wire it)
- Candidate select → **Resolve conflict** commits: card collapses to resolved row
  ("€96.4m · EPC Contract p.14 · J. Moreau · just now"), canonical table updates,
  tab badge decrements, toast "Written to canonical record".
- Manual override path requires the reason field. **Reopen** works.
- Validation flags: **Dismiss** (row fades) and **Create action item** (appears in
  Overview action items) both work.
- When all conflicts resolve: quiet header state "All conflicts resolved".

### 5.7 Outputs tab — Excel out, computed workbook back (exists — upgrade)
- Blueprint preview (keep) gets a **populate animation** on first open: rows
  shimmer-fill top-to-bottom (~2s) as canonical values land in cells.
- **Download blueprint** → real `.xlsx`. Copy line: "The analyst builds the model —
  vitta fills every input with a sourced value."
- **Drop computed workbook** → accepts any file; 6s ingest animation (reading tabs →
  locating outputs → done) → computed cards animate in (Equity IRR 11.8%, Project
  IRR 8.4%, Min DSCR 1.30x) + annual DSCR bar chart vs covenant line; computed
  fields in the extraction table flip to "Computed in Excel".

### 5.8 Memo Studio (new, inside Outputs) — custom system prompts
- Template gallery (4 fixture templates). Each card: name, last edited, **View
  system prompt** expander showing the prompt in a mono block, editable in a drawer
  (persists to store) — the "tailored to how each firm works" moment.
- **Generate** on IC Memo → generation view: left rail = 16 sections checking off
  one-by-one; right = memo streaming word-by-word (~25s, skippable), inline citation
  chips (`PPA p.22`) that open the source drawer. Content: fixture markdown (~2
  pages) referencing the resolved conflicts and the tariff-floor risk.
- Done → **Export DOCX / PDF / PPTX** download real artifacts; a version row is
  appended to Downloads tab. Deck generation reuses the existing thumbnail preview
  with a 6s assembly animation.

### 5.9 Ask vitta panel (exists — make it scripted-live)
Suggested prompt click or free-typed question → thread animates: user bubble,
0.8s "reading 14 documents…" shimmer, answer streams with citation superscripts;
citations open the source drawer. 5 canned pairs; unknown input maps to nearest.

---

## 6. Act 2 — Portfolio monitoring (new build)

Sub-nav under **Portfolio**: Overview · Assets · Covenants · Alerts · Reports.
The story: *the deal doesn't end at close — same pipeline, post-close.*

### 6.1 Overview
KPI strip (count-ups): Committed €1.9bn · Assets 12 · Weighted avg DSCR 1.36x ·
Open alerts 3 · Reports due this month 4. Below: **asset table** (all 12; tech chip,
geo, size, commitment, status, current DSCR with 12-mo sparkline, last report, alert
dot; sortable; technology filter pills; Ravenna row amber-edged). Right rail:
alerts summary + upcoming covenant tests (next 90 days).

### 6.2 Asset detail (build fully for Ravenna + Nordwind; layout generic)
Header: name, chips, commitment, "Last report Jun 2026 · ingested 4 Jul". Blocks:
1. **Performance vs. underwriting** — monthly generation actual vs P50 dashed;
   revenue actual vs underwriting; Ravenna's May-2026 outage annotated on-chart.
2. **Covenant tracker** — rows: covenant, threshold, current, **headroom bar**,
   next test; Ravenna DSCR row red with negative headroom; expanding a row shows
   the evidence chain (operating report → extracted CFADS figures → source chips
   into the §5.5 drawer — visual continuity with Act 1 is the pitch).
3. **Document timeline** — horizontal dots since close (quarterly reports, covenant
   certificates, insurance renewals, amendments); click → source drawer.
4. **Asset alert feed** with working Acknowledge.

### 6.3 Covenants board
Full-book matrix: asset × covenant, threshold, latest, headroom bar, status chip,
next test date; group-by toggle (asset / covenant type); 1 red, 2 amber. Right rail
test calendar.

### 6.4 Alerts inbox
Filter chips (All 8 · Breach 1 · Overdue 2 · Info 5). Detail panel per alert.
Two hero moments: **Ravenna breach** — computed DSCR with cash-flow line items,
each value source-chipped; note "Distribution lock-up applies per §7.14"; working
Acknowledge/Assign. **Aldercroft Amendment №3** — clause diff, word-level red/green,
caption "detected automatically on ingest".

### 6.5 Reports
Quarterly pack generator: quarter picker, contents checklist (portfolio summary,
covenant compliance certificate, exceptions log, asset one-pagers), **Generate
pack** → 8s page-stacking assembly → Download PDF (real artifact). Caption: "Uses
Northbridge's reporting template" (ties to §5.8).

### 6.6 Charts on Overview (banker-familiar, per §3.3)
2×2 grid: (a) book generation vs P50 indexed, trailing 24m; (b) DSCR distribution
histogram with 1.20x covenant line; (c) exposure by counterparty, horizontal bars —
caption "from the intelligence layer"; (d) debt maturity / repricing wall by year,
stacked by asset. Plus a **rate-shock slider** (+0/+100/+200/+300 bps, snapping
between precomputed fixture states, animated bar transitions) with the line: "Every
position is a live model — the whole book restates in seconds."

---

## 7. "Every button works" — wiring inventory

Wire or remove every control. Non-obvious ones and their scripted behavior:
- Sidebar **Settings** → minimal settings page: org profile, members list, and the
  **Prompt templates** manager (same data as Memo Studio).
- **⌘K search** → command palette over deals/documents/fields (fixture index);
  Enter navigates; searching a field name deep-links to its extraction row.
- Dashboard quick actions, "View all", activity rows → navigate to the real places.
- **Share** on workspace → modal with fake member list + copied-link toast.
- **Escalate to Principal** on conflicts → assigns to D. Okafor, appears in action
  items.
- Chat mic/paperclip: **remove** (dead weight). Chat "+" → clears thread.
- Knowledge graph zoom +/− → actually scales the SVG viewBox.
- Every download button downloads a real file from `public/artifacts/`.

---

## 8. Act 3 — Intelligence (polish + badge, no new scope)

Keep the existing **Intelligence** and **Knowledge Graph** pages (they demo the
private firm-intelligence strategy well): reskin per §3, renumber fixtures to match
the 12-asset book, add an **"Early access"** badge in the header, and add one
locked teaser card — **Ask your book** (disabled query box, ghost text "What's our
average DSCR covenant on merchant solar?", "Coming Q4 2026"). No other new build.

---

## 9. Build plan (phased; verify each before the next; commit per phase)

1. **Reskin** — apply §3 tokens (accent swap, de-slop checklist §3.4), rename firm
   (§4.1), wordmark, kill dead chrome.
   → verify: all routes render in the new skin, zero console errors.
2. **Store + engine** — Zustand store from fixtures, localStorage persist, `reset()`,
   timeline engine, presenter hotkeys. Migrate all pages to read from the store.
   → verify: `r` resets from any screen; state edits survive reload.
3. **Act 1 core** — pre-upload Helios state, upload flow, pipeline choreography,
   post-run state flip. → verify: full 100s run at 60fps; skips work; re-runnable.
4. **Act 1 review flow** — wire extraction actions, reconciliation, validation
   flags, source drawer everywhere. → verify: resolving all 5 conflicts updates
   canonical, badges, checklist end-to-end.
5. **Act 1 outputs** — blueprint populate animation + download, computed-workbook
   ingest, Memo Studio (prompts, streaming generation, artifact downloads,
   Downloads tab versioning), scripted chat. → verify: downloads are real files;
   all sequences skippable.
6. **Act 2** — fixtures expansion (12 assets), Overview, asset detail ×2, covenants,
   alerts (incl. amendment diff), reports, charts + rate-shock. → verify: Ravenna
   story consistent across overview → detail → covenants → alerts.
7. **Act 3 + wiring sweep + polish** — intelligence badge, §7 inventory pass
   (click literally every control), login screen, spacing/typography audit at both
   resolutions, full 8-minute dry-run of the walkthrough.

**Definition of done:** login → new deal → upload → pipeline → extraction →
conflicts → export → computed workbook → memo → portfolio tour → intelligence
preview, with zero errors, zero dead buttons, zero jank.
