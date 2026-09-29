# HACKDATA V2 — MANDATORY UI/UX REQUIREMENTS

> **Authoritative Basis:** `theme.pdf` (Slide 10 Experience Mockup & Feature Slides 5, 6, 7, 8)  
> **Compliance Level:** Non-Negotiable Core Constraint  
> **Enforcement Rule:** Theme UI requirements take absolute precedence over agent defaults, templates, and generic styling frameworks.

---

## 1. Official 3-Pane Workspace Architecture (Slide 10)

The application interface must strictly adhere to the unified 3-pane split screen layout demonstrated on official Theme Slide 10:

```
+---------------------------------------------------------------------------------------------------------+
|                                    HACKDATA V2 SYNTHETIC DATA PLATFORM                                  |
+---------------------+-------------------------------------------------------+---------------------------+
| 1. WORKSPACE        | 2. LIVE PREVIEW CANVAS                                | 3. CONFIGURATION          |
|    (Dark Sidebar)   |    (Center Stage - Light Canvas)                      |    (Right Control Drawer) |
|                     |                                                       |                           |
| [o] Tabular         |  +--------------------------------------------------+ |  Row count:               |
| [ ] Relational      |  | ID    | Name        | Email           | Balance  | |  [ 100               ]  |
| [ ] Documents       |  |-------|-------------|-----------------|----------| |                          |
|     - Invoices      |  | 10231 | Maria Chen  | m.chen@demo.com | $482.10  | |  Random seed:           |
|     - Statements    |  | 10232 | Ahmed Raza  | a.raza@demo.com | $129.55  | |  [ 42              ][*] |
|                     |  | 10233 | Sofia Iva.. | s.ivan@demo.com | $918.42  | |                          |
|                     |  +--------------------------------------------------+ |  Locale & currency:       |
|                     |                                                       |  [ en-US ($ USD)     v ]  |
|                     |  *Updates instantly as settings change on the right*  |                          |
|                     |                                                       |  Privacy rules:           |
|                     |                                                       |  [x] Masking              |
|                     |                                                       |  [x] Hashing (SHA-256)    |
|                     |                                                       |  [ ] Differential noise   |
|                     |                                                       |                           |
|                     |                                                       |  +---------------------+  |
|                     |                                                       |  |       EXPORT        |  |
|                     |                                                       |  +---------------------+  |
+---------------------+-------------------------------------------------------+---------------------------+
```

---

## 2. Pane Specifications

### 2.1 Left Pane — Workspace Navigation (`WORKSPACE`)

- **Visual Background:** Dark Navy / Deep Slate (`#0F172A` / `#111827`).
- **Header Label:** `WORKSPACE` in subtle uppercase tracking (`text-xs font-semibold tracking-wider text-slate-400`).
- **Core Navigation Items:**
  1. **Tabular:** Primary table view for single-entity synthetic data.
  2. **Relational:** Multi-table view (Customers, Orders, Order Items) displaying relational links.
  3. **Documents:** Sub-selectable or tabbed views for:
     - Invoices (INV-10432 layout)
     - Bank Statements (running balance ledger)
- **Active Selection State:** Highlighted pill with emerald/dark teal accent background (`#115E59` / `#0D9488`), white text, rounded corners.
- **Inactive Selection State:** Muted slate text (`#94A3B8`), subtle hover effect (`bg-slate-800/60`).

### 2.2 Center Pane — Live Preview Canvas (`Live preview canvas`)

- **Visual Background:** Crisp Light / Off-White (`#FFFFFF` with `#F8F7F4` stage container).
- **Core Behavior Requirement (Slide 10):** _"See generated rows update instantly as settings change on the right."_
  - Sub-second UI reactivity (< 200ms preview reload).
  - Visual loading shimmer during re-generation without causing jarring layout shifts.
- **View Modes:**
  1. **Tabular View:** Clean data grid displaying columns (`ID`, `Name`, `Email`, `Signup`, `Balance`) matching Slide 5 sample data.
  2. **Relational View:** Multi-table view showing Customers, Orders, and Order Items with clear primary key (PK) and foreign key (FK) indicators matching Slide 6.
  3. **Document View (Invoices):** Visual rendered invoice matching Slide 7 (`#INV-10432`, Billed to, From, line item breakdown, total reconciliation).
  4. **Document View (Bank Statements):** Financial ledger matching Slide 8 (`Date`, `Description`, `Debit`, `Credit`, `Balance` with running calculation).

### 2.3 Right Pane — Configuration Panel (`CONFIGURATION`)

- **Visual Background:** Clean light background (`#FFFFFF` or `#F8F7F4`), subtle border left (`#E2E8F0`).
- **Header Label:** `CONFIGURATION` in teal/emerald uppercase tracking (`#0D9488 font-semibold text-xs tracking-wider`).
- **Required Controls (Strictly derived from Slide 10):**
  1. **Row Count:** Number input / slider control allowing selection (e.g. 10 to 10,000 rows).
  2. **Random Seed:** Numeric seed input with a "Lock / Regenerate Seed" action button to guarantee deterministic repeatability.
  3. **Locale & Currency:** Selector dropdown (e.g., `en-US / USD ($)`, `en-GB / GBP (£)`, `de-DE / EUR (€)`, `ja-JP / JPY (¥)`).
  4. **Privacy Rules:** Column-level toggle switches for:
     - _Masking_ (e.g. PII email/name obfuscation)
     - _Hashing_ (one-way SHA-256)
     - _Differential Noise_ (Laplacian/Gaussian perturbation on numeric balances)
- **Primary Call to Action:** Prominent **Export** button (`bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 rounded-lg shadow-sm`).

---

## 3. Official Visual Design Tokens & Palette

Derived directly from the official `theme.pdf` slide deck and UI mockup:

| Token Name              | Hex Code  | Visual Application in UI                           |
| :---------------------- | :-------- | :------------------------------------------------- |
| `--color-canvas-bg`     | `#F8F7F4` | Global application canvas background               |
| `--color-sidebar-bg`    | `#0F172A` | Left workspace navigation sidebar                  |
| `--color-card-bg`       | `#FFFFFF` | Preview canvas containers, invoice card, tables    |
| `--color-primary`       | `#0D9488` | Active buttons, primary CTA, badges, active tabs   |
| `--color-primary-hover` | `#0F766E` | Hover state for primary buttons                    |
| `--color-mint-light`    | `#E6F4F1` | Accent backgrounds, badge fills, system flow cards |
| `--color-text-main`     | `#0F172A` | Primary headings, table text, invoice typography   |
| `--color-text-muted`    | `#64748B` | Secondary descriptions, column metadata, labels    |
| `--color-border`        | `#E2E8F0` | Subtle container borders and table dividers        |
| `--color-border-dark`   | `#334155` | Left sidebar dividers and inactive border strokes  |

---

## 4. Typography Hierarchy

- **Font Family:** Clean modern geometric sans-serif (Inter, Geist, or Plus Jakarta Sans).
- **Scale:**
  - `Header 1 (Page Title):` `text-2xl font-bold tracking-tight text-slate-900`
  - `Header 2 (Section Title):` `text-lg font-semibold text-slate-900`
  - `Section Sub-header:` `text-xs font-semibold uppercase tracking-wider text-teal-600`
  - `Table Content:` `text-sm font-normal font-mono (for numeric/IDs) / font-sans (for text)`
  - `Document Typography:` Serif/Monospace blend for realistic invoice and financial statement fidelity.

---

## 5. UI Requirements Traceability Matrix

| UI Req ID  | Requirement Description                                                              |   Official Source    | Mandatory Status |
| :--------- | :----------------------------------------------------------------------------------- | :------------------: | :--------------: |
| **UI-001** | Unified 3-pane split screen workspace                                                |       Slide 10       |  **MANDATORY**   |
| **UI-002** | Left sidebar with Tabular, Relational, and Documents navigation                      |       Slide 10       |  **MANDATORY**   |
| **UI-003** | Live preview canvas in center pane with instantaneous update response                |       Slide 10       |  **MANDATORY**   |
| **UI-004** | Right configuration panel with Row Count, Seed, Locale, Privacy Rules, Export        |       Slide 10       |  **MANDATORY**   |
| **UI-005** | Tabular synthetic table view displaying ID, Name, Email, Signup, Balance             |       Slide 5        |  **MANDATORY**   |
| **UI-006** | Relational multi-table view displaying Customers, Orders, and Order Items            |       Slide 6        |  **MANDATORY**   |
| **UI-007** | Rendered Invoice document component with itemized amounts and reconciled total       |       Slide 7        |  **MANDATORY**   |
| **UI-008** | Bank Statement document component with running balance calculations                  |       Slide 8        |  **MANDATORY**   |
| **UI-009** | Zero-code export action triggering multi-format downloads (CSV, JSON, SQL, PDF)      |   Slide 4, 10, 11    |  **MANDATORY**   |
| **UI-010** | High-contrast accessibility (WCAG AA compliant contrast between text and background) | Engineering Standard |  **MANDATORY**   |

---

## 6. Prohibited UI Patterns

- **NO Hidden Settings / Deep Modal Mazes:** Configuration must remain immediately accessible in the right pane as designed in Slide 10.
- **NO Cluttered Generic Dashboards:** Do not replace the 3-pane workspace with generic administrative widgets or unrelated analytics charts.
- **NO Code-Only Interfaces:** All configuration must be zero-code operable through buttons, inputs, sliders, and toggles (Slide 11).
- **NO Stale Visual Previews:** Live canvas must update automatically or provide an immediate feedback indicator when configuration variables change.
