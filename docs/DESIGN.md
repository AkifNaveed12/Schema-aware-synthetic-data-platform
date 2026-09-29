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

| Level          | Font Size          | Weight       | Tracking             | Line Height | Usage                                              |
| :------------- | :----------------- | :----------- | :------------------- | :---------- | :------------------------------------------------- |
| **Eyebrow**    | `11px (0.6875rem)` | 600 SemiBold | `0.08em (uppercase)` | `16px`      | Section tags (`WORKSPACE`, `CONFIGURATION`)        |
| **H1 Title**   | `24px (1.5rem)`    | 700 Bold     | `-0.02em`            | `32px`      | Main header ("One workspace, three data types")    |
| **H2 Subhead** | `18px (1.125rem)`  | 600 SemiBold | `-0.01em`            | `24px`      | Section titles ("Live preview canvas", "Invoices") |
| **Body**       | `14px (0.875rem)`  | 400 Regular  | `0`                  | `20px`      | Table rows, general descriptions                   |
| **Mono Data**  | `13px (0.8125rem)` | 400 Regular  | `0`                  | `18px`      | IDs, balances, hashes, dates, schema types         |
| **Caption**    | `12px (0.75rem)`   | 500 Medium   | `0`                  | `16px`      | Badge labels, hints, metadata                      |

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
