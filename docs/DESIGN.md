# HACKDATA V2 — DESIGN SYSTEM & VISUAL SPECIFICATION

> **Product:** Synthetic Data Platform — tabular, relational and document (invoices, bank statements) data, generated on demand.
> **Inspiration:** HackDataV2 theme deck (`Synthetic_Data_Platform___HackDataV2.pdf`) + attio.com (inspiration only, never copied).
> **Status:** Authoritative. Agents must NOT silently modify this file. If an implementation conflicts with it, report the conflict before proceeding.

---

## 0. Decision Hierarchy (never reverse)

1. Official hackathon requirements + UI restrictions (see §11 — paste the original text there)
2. Product / functional requirements (`REQUIREMENTS.md`, `UI-REQUIREMENTS.md`)
3. Accessibility & usability
4. This design system
5. Topic-specific visual storytelling (bento visuals, SVG)
6. Decorative enhancement

Judging criteria the UI must visibly serve: **System design · Features · UI · AI · Problem approach.**

---

## 1. Design Direction

Feel: sophisticated, minimal, calm, product-led, information-dense without clutter.

Core rule: **product functionality becomes the visual.** Bento cards contain miniature working interfaces (tables, schema graphs, invoices, ledgers, validation badges) — not decorative placeholders.

Do NOT: copy Attio branding, assets, copy, or exact compositions. No random gradients, glassmorphism, glow effects, purple/blue "AI" palettes, or oversized rounded cards.

---

## 2. Typography

- **Primary UI font:** `Inter` (Google Fonts), fallback `-apple-system, "Segoe UI", Roboto, sans-serif`
- **Data font:** `JetBrains Mono` (fallback `ui-monospace, "SF Mono", monospace`) for IDs, balances, dates, hashes, schema types
- **Weights:** headings **600**; nav, body, labels **500**; long paragraphs may use 400 for readability; mono data 400/500.

| Level           | Size / Line-height          | Weight              | Notes                                  |
| :-------------- | :-------------------------- | :------------------ | :------------------------------------- |
| Landing Hero H1 | 56px / ~58px (mobile 36/40) | 600                 | tracking -0.02em, color`--text-hero` |
| Section H2      | 40px / 46px (mobile 28/34)  | 600                 | tracking -0.02em                       |
| H3              | 24px / 30px                 | 600                 |                                        |
| Hero subtext    | 18px / 26px                 | 500                 | color`--text-secondary`              |
| Nav             | 15px / 22px                 | 500                 | color`--text-nav`                    |
| Body            | 14–15px / 20–22px         | 500 (400 long text) |                                        |
| Eyebrow         | 11px / 16px                 | 600                 | uppercase, tracking 0.08em, teal       |
| Mono data       | 13px / 18px                 | 400                 | tabular-nums, right-aligned numerics   |
| Caption         | 12px / 16px                 | 500                 | badges, hints                          |

Sizes are a baseline; adjust responsively, do not hard-code rigidly.

---

## 3. Color Tokens

```css
:root {
  /* Attio-derived foundation (verified from attio.com) */
  --text-hero: #1c1d1f;
  --text-nav: #202124;
  --text-secondary: #6f7988;
  --bg-white: #ffffff;
  --bg-tint: #ebeffe;          /* rgb(235,239,254) soft cool section tint */

  /* Hackathon deck theme (official look) */
  --bg-app: #f8f7f4;           /* warm off-white app canvas (workspace) */
  --bg-sidebar: #0f172a;       /* deep navy sidebar / dark sections */
  --bg-sidebar-hover: #1e293b;
  --bg-surface: #ffffff;
  --bg-subtle: #f1f5f9;
  --bg-mint: #e6f4f1;          /* engine / badge containers */
  --primary: #0d9488;          /* teal brand + Export CTA */
  --primary-hover: #0f766e;
  --primary-focus: #14b8a6;

  --border-light: #e2e8f0;
  --border-dark: #334155;

  --success: #10b981;          /* referential integrity pass */
  --warning: #f59e0b;          /* edge-case / outlier */
  --danger: #ef4444;           /* broken constraint */
}
```

**Where each background applies**

- Landing hero → `--bg-white`, then transitions to `--bg-tint` sections, product/bento surfaces back to white, dark storytelling/footer → `--bg-sidebar`.
- App workspace → `--bg-app` canvas, white stage card, navy sidebar, white config drawer.
- Teal is the single accent. Status colors only for status.

---

## 4. Layout

### 4.1 Landing page

Hero (white) → product bento (tint) → three-engine section → AI layer → workflow/schema story → dark closing CTA. Generous but not empty whitespace; product UI is the decoration.

### 4.2 App workspace — fixed 3-pane (Theme slide 10)

```
| Top bar 56px: logo | dataset status | active preset | docs |
| Sidebar 256px navy | Live Preview Stage (flex-1)  | Config drawer 320px |
| Tabular            | white stage card on          | CONFIGURATION       |
| Relational         | --bg-app, header w/ row      | Row count, Seed,    |
| Documents          | badge + status pills         | Locale & currency,  |
|                    |                              | Privacy rules,      |
|                    |                              | [Export] full width |
```

The preview canvas must be the flexible center pane and never collapse (the deck's slide 10 squeezed it — do not repeat that).
Responsive: tablet → drawer becomes slide-over; mobile → sidebar becomes bottom tab bar, config in a sheet.

---

## 5. Bento System

- Asymmetric grid (12-col, 16px gap). One hero tile per composition; tiles differ in size.
- Card: `bg-white`, `1px solid` border (`--border-light` / rgba), radius 12–16px, **no heavy shadows** (max `shadow-xs`).
- Every tile shows real synthetic data (see §8). Never lorem ipsum, never empty.

**Landing bento tiles (mapped to product):**

| Tile      | Content                                                                                                        |
| :-------- | :------------------------------------------------------------------------------------------------------------- |
| A (large) | Live tabular preview: 6–8 rows customers table, masked email column, row-count badge                          |
| B         | Relational graph SVG: Customers → Orders → Order items with PK/FK badges + "Referential Integrity 100%" pill |
| C         | Invoice miniature (INV-10432) with reconciling total                                                           |
| D         | Bank statement ledger with running balance                                                                     |
| E         | Distribution mini-charts (numeric histogram + categorical bars) "Statistical fidelity"                         |
| F         | AI layer: schema inference → edge-case injection status timeline                                              |
| G         | Privacy controls: Masking / Hashing / Differential noise toggles                                               |

---

## 6. Components (from deck)

- **Nav item (sidebar):** 40px, `rounded-lg`, default `text-slate-400`, active `bg-teal-700/80 text-white border-teal-500/30`. Icons (Lucide): Tabular `Table`, Relational `Network`, Documents `Receipt`.
- **Preview card header:** title + row-count badge + status pills (`Referential Integrity: 100% Valid`).
- **Data grid:** header `bg-slate-50 uppercase 12px 600`; row 44px; numerics right-aligned mono; masked cells `font-mono bg-slate-100/60 text-slate-400 rounded px-1.5`.
- **Invoice:** paper card, `INVOICE #INV-…`, Billed to / From, table (Item, Qty, Price, Amount), bold reconciled total in teal.
- **Bank statement:** Date, Description, Debit, Credit, Balance (bold mono), running-balance audit header. Debit neutral/red, credit neutral/green.
- **Config controls:** Row count (number + quick chips 10/50/100/1k/10k), Random seed (lock/refresh), Locale & currency (USD/EUR/GBP…), Privacy rule switches (Masking/Hashing/Differential noise), **Export** full-width teal button.
- Required states everywhere: loading (pulse shimmer), empty, success, error, AI processing, retry.

---

## 7. Motion

Purposeful only: opacity, translate, scale, path drawing, staggered reveal, chart draw-in, workflow node progression, generated-rows update.

- 150–250ms micro · 300–500ms component · 500–900ms storytelling. Ease-out / soft spring.
- Preview updates <200ms with shimmer, no full reloads.
- Respect `prefers-reduced-motion`. No bouncing, constant looping, parallax, particles, 3D.
- Tooling order: CSS → Motion (React) → custom SVG → Lottie/Rive only if justified. One animation runtime per visual.

---

## 8. Synthetic Data & SVG Rules (must feel REAL)

- Data is seeded and internally consistent: names/emails match (`m.chen@example.com`), dates plausible, IDs sequential (`10231…`), currency formatted with locale.
- **Math must reconcile:** invoice lines sum to total (`$1,100.00 + $140.00 = $1,240.00`); statement running balance is exact (`1,204.30 → +2,150.00 = 3,354.30 → −96.40 = 3,257.90`); order totals = sum of line items; every FK exists.
- Numeric distributions skewed like real data (log-normal balances, weekday-weighted dates), not uniform random.
- SVGs are custom and restrained: charts draw the *actual* preview data (histogram bins from the generated column, ledger sparkline from running balance, schema graph from real table/FK metadata). No decorative blobs, no over-illustration.
- Icons: Lucide. Custom SVG for schema graph, distribution charts, workflow.

---

## 9. Accessibility

WCAG 2.1 AA (4.5:1 body, 3:1 large). Full keyboard traversal (sidebar, grid, config). Visible focus ring `--primary-focus`. Semantic HTML, labelled inputs, ≥44px touch targets, table headers scoped, status not conveyed by color alone.

---

## 10. Stitch / Implementation Workflow

1. Agent reads this file + `UI-REQUIREMENTS.md`; builds a detailed Stitch prompt (tokens, screens, bento composition, data samples).
2. Stitch generates screens; pulled via MCP.
3. Convert to clean **React + Tailwind** (tokens above in Tailwind config, components reusable, no Stitch inline junk).
4. Visual QA against this file. Attio is reference only.

---

## 11. Official Hackathon Requirements & UI Restrictions

> **PLACEHOLDER — paste the verbatim text from the original hackathon PDF here.** Not inferred by design. Everything above yields to this section.

Known from theme deck: three data types (Tabular, Relational, Documents), Live preview canvas + Configuration panel, Export, Row count / Random seed / Locale & currency / Privacy rules, invoices & bank statements (incl. query-style: "last 90 days, balance over $500"), AI: schema understanding, realistic content synthesis, edge-case injection.

---

## 12. Open Discrepancies (to resolve)

- Deck uses a geometric display font + IBM Plex-like body; **decision locked: Inter** (per attio analysis).
- Deck slide 10 workspace has a squeezed preview column and slide 11 "Documents" pill styling is inconsistent — fix in implementatio

# HACKDATA V2 — DESIGN SYSTEM & VISUAL SPECIFICATION

> **Inspiration & Compliance:** `theme.pdf` (Slide 10 Workspace Layout & Official Aesthetic) + Attio Modern B2B Product Aesthetic
> **Brand Identity:** High-precision, zero-noise, technical data engineering workbench.
> **Status:** Baseline Design System

---

## 1. Design Principles

1. **Information High-Density, Low Visual Noise:** Data records, column metadata, and financial figures take visual center stage. No bloated margins or decorative distractions.
2. **Instant Visual Feedback:** Sliders and inputs trigger immediate canvas feedback (<200ms) with lightweight shimmering transitions instead of destructive full-page reloads.
3. **Strict Mathematical Fidelity:** Monetary figures, percentages, dates, and balances are styled with monospace alignments to emphasize calculation precision.
4. **Authoritative 3-Pane Geometry:** The three vertical zones (Navigation, Stage, Configuration) maintain predictable boundaries and consistent visual hierarchy.

---

## 2. Color Palette & Semantic Tokens

```css
:root {
  /* Canvas & Structural Backgrounds */
  --bg-app: #f8f7f4; /* Warm neutral off-white canvas (Theme Deck background) */
  --bg-sidebar: #0f172a; /* Deep midnight slate (Theme Slide 10 Sidebar) */
  --bg-sidebar-hover: #1e293b; /* Subtle hover state on sidebar items */
  --bg-surface: #ffffff; /* Clean card and canvas panel background */
  --bg-subtle: #f1f5f9; /* Muted table header and tag backgrounds */
  --bg-accent-mint: #e6f4f1; /* Light mint container for engines & badges */

  /* Text & Content */
  --text-main: #0f172a; /* Primary headers and table cell content */
  --text-muted: #64748b; /* Secondary descriptions, column types, subtext */
  --text-inverse: #f8fafc; /* Text on dark navy sidebar and active buttons */
  --text-accent: #0d9488; /* Teal headings, section eyebrows, active indicators */

  /* Primary Brand & Interactive */
  --primary: #0d9488; /* Emerald/Teal brand action color (Theme export button) */
  --primary-hover: #0f766e; /* Darker teal for button hover */
  --primary-focus: #14b8a6; /* Lighter teal focus ring */

  /* Borders & Dividers */
  --border-light: #e2e8f0; /* Card and table cell dividers */
  --border-dark: #334155; /* Sidebar dividers */
  --border-focus: #0d9488; /* Active input stroke */

  /* Status Colors */
  --success: #10b981; /* Validated referential integrity / pass badge */
  --warning: #f59e0b; /* Edge-case alert / synthetic outlier indicator */
  --danger: #ef4444; /* Error state / invalid schema / broken constraint */
}
```

---

## 3. Typography & Monospace Systems

- **Primary UI Typeface:** `Inter`, `Geist Sans`, or system `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`
- **Data & Numerical Typeface:** `JetBrains Mono`, `Geist Mono`, or `ui-monospace, "SF Mono", monospace` (Used for IDs, balances, hashes, dates, and schema types).

### Typographic Hierarchy Scale:

| Level                | Font Size            | Weight       | Tracking               | Line Height | Usage                                              |
| :------------------- | :------------------- | :----------- | :--------------------- | :---------- | :------------------------------------------------- |
| **Eyebrow**    | `11px (0.6875rem)` | 600 SemiBold | `0.08em (uppercase)` | `16px`    | Section tags (`WORKSPACE`, `CONFIGURATION`)    |
| **H1 Title**   | `24px (1.5rem)`    | 700 Bold     | `-0.02em`            | `32px`    | Main header ("One workspace, three data types")    |
| **H2 Subhead** | `18px (1.125rem)`  | 600 SemiBold | `-0.01em`            | `24px`    | Section titles ("Live preview canvas", "Invoices") |
| **Body**       | `14px (0.875rem)`  | 400 Regular  | `0`                  | `20px`    | Table rows, general descriptions                   |
| **Mono Data**  | `13px (0.8125rem)` | 400 Regular  | `0`                  | `18px`    | IDs, balances, hashes, dates, schema types         |
| **Caption**    | `12px (0.75rem)`   | 500 Medium   | `0`                  | `16px`    | Badge labels, hints, metadata                      |

---

## 4. Layout & Spacing Architecture

### Fixed 3-Pane Structure:

```
+---------------------------------------------------------------------------------------------------+
| Top Navigation Bar (h-14 / 56px): Brand Logo | Dataset Status | Active Preset | Docs Link         |
+---------------------+-------------------------------------------------------+---------------------+
| Workspace Sidebar   | Live Preview Stage                                    | Configuration Drawer|
| w-64 (256px)        | flex-1 (Dynamic fluid width)                          | w-80 (320px)        |
| bg-slate-900        | bg-app (#F8F7F4) with bg-white Stage Container        | bg-white            |
| border-r border-dark| p-6 flex flex-col gap-4 overflow-y-auto               | border-l border-gray|
+---------------------+-------------------------------------------------------+---------------------+
```

---

## 5. Core Component Specifications

### 5.1 Workspace Navigation Item

- **Height:** 40px (`h-10 px-3 py-2 rounded-lg flex items-center gap-3`)
- **Default State:** Transparent background, `text-slate-400 hover:text-white hover:bg-slate-800/60`
- **Active State:** `bg-teal-700/80 text-white font-medium shadow-sm border border-teal-500/30`
- **Icons:** Lucide icons matching theme slides:
  - Tabular: `Table` / `BarChart3`
  - Relational: `Network` / `Link2`
  - Documents: `FileText` / `Receipt`

### 5.2 Live Preview Canvas Card

- **Container:** `bg-white rounded-xl border border-slate-200 shadow-xs flex-1 flex flex-col overflow-hidden`
- **Card Header:** Title + row count badge + status pills (e.g. `Referential Integrity: 100% Valid`)
- **Tabular Grid:**
  - Header Row: `bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase`
  - Body Row: `h-11 px-4 border-b border-slate-100 hover:bg-slate-50/80 transition-colors`
  - Numeric cells: Right-aligned monospace font.
  - Masked cells: `font-mono text-slate-400 bg-slate-100/60 px-1.5 py-0.5 rounded`

### 5.3 Invoice Document Component (Theme Slide 7)

- **Container:** Paper invoice preview card (`max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-slate-200`)
- **Header:** Deep navy `INVOICE #INV-10432`, Billed to vs From grid.
- **Table:** Minimalist line items with strict column alignment (Item, Qty, Price, Amount).
- **Footer:** Bold reconciled total (`Total: $1,240.00` in `--color-primary` or `--text-main`).

### 5.4 Bank Statement Component (Theme Slide 8)

- **Container:** Financial ledger preview table with running balance audit header.
- **Rows:** Date, Description, Debit (red or neutral), Credit (green or neutral), Balance (bold monospace).

### 5.5 Configuration Controls (Theme Slide 10)

- **Row Count:** Number input with quick-increment buttons (`10`, `50`, `100`, `1k`, `10k`).
- **Random Seed:** Numeric field with "Lock / Refresh" button icon.
- **Locale & Currency:** Clean selector with flag/currency glyphs (`USD ($)`, `EUR (€)`, `GBP (£)`).
- **Privacy Rules:** Column-level switches with badge indicators (`Masking`, `Hashing`, `Differential Noise`).
- **Export CTA:** Full-width primary button (`bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white py-3 font-semibold rounded-lg shadow-sm transition-all`).

---

## 6. Accessibility & Motion Guidelines

- **Contrast Ratios:** Text-to-background contrast exceeds WCAG 2.1 AA requirements (Minimum 4.5:1 for body, 3:1 for large headers).
- **Keyboard Navigation:** Full tab-index traversal across sidebar items, canvas tables, and configuration inputs.
- **Motion:**
  - Fast feedback transitions: `150ms ease-out`.
  - Loading states: Lightweight pulse shimmer (`animate-pulse bg-slate-100`) rather than spinning wheels that obscure context.
  - Zero dizzying parallax or aggressive non-functional animations.
