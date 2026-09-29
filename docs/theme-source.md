# HACKDATA V2 — OFFICIAL THEME SOURCE DOCUMENTATION

> **Source File:** `theme.pdf` (Project Root)  
> **Extraction Date:** September 29, 2026  
> **Analysis Engine:** Microsoft MarkItDown 0.1.8 & PyMuPDF (12 Pages Inspected Visually & Textually)  
> **Status:** Authoritative Baseline (Strict Fidelity to Official Presentation)

---

## 1. Executive Summary & Document Metadata

- **Event:** HackData V2
- **Track / Focus:** Synthetic Data Platform
- **Official Tagline:** _Realistic, privacy-safe tabular, relational and document data — generated on demand._
- **Core Pillars:**
  1. Tabular Data
  2. Relational Structures
  3. Document Generator
- **Target Audience / Stakeholders:** Engineering teams, QA testers, data scientists, product teams, partner integrations facing privacy compliance, messy/skewed datasets, and multi-week data procurement cycles.

---

## 2. Complete Slide-by-Slide Extraction

### Slide 1: Cover Page

- **Header Eyebrow:** `HACKDATAV2 · SUBMISSION`
- **Title:** `Synthetic data platform`
- **Subtitle:** `Realistic, privacy-safe tabular, relational and document data — generated on demand.`
- **Visual Pills / Core Subsystems:**
  - Tabular Data
  - Relational Structures
  - Document Generator
- **Visual Structure:** Clean light aesthetic (`#F8F7F4` canvas background), deep navy typography (`#0F172A`), mint/teal circular background accent graphics.

---

### Slide 2: The Problem

- **Header Eyebrow:** `THE PROBLEM`
- **Title:** `Real data is scarce, sensitive, and slow to get`
- **Three Core Problem Cards:**
  1. **Privacy & compliance**
     - _Official Description:_ "Teams can't freely share production data across environments, partners, or the cloud."
     - _Visual Cue:_ Lock / Shield icon.
  2. **Limited, messy datasets**
     - _Official Description:_ "Real datasets are small, skewed, or missing the edge cases engineers need to test against."
     - _Visual Cue:_ Database / Cylinder icon.
  3. **Slow procurement cycles**
     - _Official Description:_ "Getting a sanctioned data extract for a demo or a test suite can take weeks of sign-off."
     - _Visual Cue:_ Clock / Delay icon.

---

### Slide 3: Our Approach

- **Header Eyebrow:** `OUR APPROACH`
- **Title:** `Schema-aware, not random`
- **Four-Step End-to-End Pipeline (Horizontal Flow with Directional Connectors):**
  1. **Ingest schema**
     - _Action:_ Infer tables, columns, types and keys from a sample or a schema file.
     - _Icon:_ Database cylinder.
  2. **Model relationships**
     - _Action:_ Learn distributions, correlations and foreign-key cardinalities across tables.
     - _Icon:_ Interlocking chain link.
  3. **Generate with AI**
     - _Action:_ An AI layer fills in realistic names, text, and edge cases the schema alone can't describe.
     - _Icon:_ Glowing lightbulb.
  4. **Validate & export**
     - _Action:_ Check referential integrity and statistical fidelity, then export to your format of choice.
     - _Icon:_ Checkmark circle.

---

### Slide 4: System Design

- **Header Eyebrow:** `SYSTEM DESIGN`
- **Title:** `From schema to shippable data`
- **Architecture Diagram (3-Stage Flow):**
  - **Stage 1: Inputs**
    - Schema definition
    - Sample dataset
    - Business rules
  - **Stage 2: Generation Engine** (Highlighted Mint Container)
    - Tabular engine
    - Relational engine
    - Document engine
    - _Spanning Rule:_ **AI LAYER RUNS ACROSS ALL THREE**
  - **Stage 3: Outputs**
    - CSV / JSON tables
    - Relational DB dump (SQL / DDL + inserts)
    - PDF-style documents

---

### Slide 5: Feature — Tabular Data Generation

- **Header Eyebrow:** `FEATURE`
- **Title:** `Tabular data generation`
- **Explicit Capabilities:**
  - Statistically faithful distributions for numeric and categorical columns
  - Configurable row count, random seed, and null / outlier rates
  - Column-level privacy controls: masking, hashing, and differential noise
- **Sample Synthetic Output Table:**
  | ID | Name | Email | Signup | Balance |
  | :--- | :--- | :--- | :--- | :--- |
  | 10231 | Maria Chen | m.chen@example.com | 2025-02-11 | $482.10 |
  | 10232 | Ahmed Raza | a.raza@example.com | 2025-03-04 | $129.55 |
  | 10233 | Sofia Ivanova | s.ivanova@example.com | 2025-01-27 | $918.42 |

---

### Slide 6: Feature — Relational Data Structures

- **Header Eyebrow:** `FEATURE`
- **Title:** `Relational data structures`
- **Explicit Capabilities:**
  - Referential integrity maintained automatically across every generated table
  - Cardinalities are configurable — `1:1`, `1:N`, and `N:N`
  - Cross-table consistency: order totals reconcile with their line items
- **Visual Entity-Relationship Chain (Directional):**
  - `Customers` [customer_id (PK), name, email]  
    ↓ (1:N)
  - `Orders` [order_id (PK), customer_id (FK), order_date]  
    ↓ (1:N)
  - `Order items` [item_id (PK), order_id (FK), sku, qty]

---

### Slide 7: Feature · Document Generator — Invoices

- **Header Eyebrow:** `FEATURE · DOCUMENT GENERATOR`
- **Title:** `Invoices`
- **Explicit Capabilities:**
  - Realistic line items, tax rules, and totals that reconcile automatically
  - Templated layouts per region — date formats, currency, tax labels
  - Bulk generation for testing invoicing and reconciliation pipelines
- **Visual Document Sample (Rendered Invoice):**
  - **Document Title:** `INVOICE #INV-10432`
  - **Billed to:** `Northwind Supplies Ltd.`
  - **From:** `Synth Data Co.`
  - **Line Items Table:**
    | Item | Qty | Price | Amount |
    | :--- | :---: | :---: | :---: |
    | API access — Pro tier | 1 | $1,100.00 | $1,100.00 |
    | Onboarding support | 1 | $140.00 | $140.00 |
  - **Total:** `$1,240.00` (Strict mathematical reconciliation: 1,100.00 + 140.00 = 1,240.00)

---

### Slide 8: Feature · Document Generator — Bank Statements & Queries

- **Header Eyebrow:** `FEATURE · DOCUMENT GENERATOR`
- **Title:** `Bank statements & queries`
- **Explicit Capabilities:**
  - Transaction histories with realistic merchants, amounts, and running balances
  - Structured exports (JSON / CSV) or formatted statement documents
  - Query-style generation, e.g. _"last 90 days, balance over $500"_
- **Visual Document Sample (Statement Excerpt):**
  | Date | Description | Debit | Credit | Balance |
  | :--- | :--- | :---: | :---: | :---: |
  | 08-14 | Greenleaf Market | $42.10 | | $1,204.30 |
  | 08-15 | Payroll deposit | | $2,150.00 | $3,354.30 |
  | 08-17 | Riverside Utilities | $96.40 | | $3,257.90 |
  - _Mathematical Check:_  
    $1,204.30 + $2,150.00 = $3,354.30;  
    $3,354.30 - $96.40 = $3,257.90. (Exact running balance integrity).

---

### Slide 9: AI Layer — Where AI Does the Work

- **Header Eyebrow:** `AI LAYER`
- **Title:** `Where AI does the work`
- **Three Explicit AI Sub-Functions:**
  1. **Schema understanding:** Infers column types, formats and relationships directly from a small sample, no manual mapping.
  2. **Realistic content synthesis:** Names, addresses and free-text fields read naturally instead of looking machine-generated.
  3. **Edge-case injection:** Proposes nulls, outliers, and rare patterns so test suites cover more than the happy path.

---

### Slide 10: Experience — One Workspace, Three Data Types

- **Header Eyebrow:** `EXPERIENCE`
- **Title:** `One workspace, three data types`
- **Official Layout Architecture (Three-Pane Split):**
  1. **Left Column / Navigation Sidebar (`WORKSPACE`):**
     - Dark Navy background (`#0F172A`)
     - Selectable items:
       - `Tabular` (active state highlighted in dark emerald/teal)
       - `Relational`
       - `Documents`
  2. **Center Column / Live Preview (`Live preview canvas`):**
     - Light/white canvas
     - Dynamic update behavior: _"See generated rows update instantly as settings change on the right."_
  3. **Right Column / Configuration Panel (`CONFIGURATION`):**
     - Header: `CONFIGURATION` (in teal accent text)
     - Form Controls:
       - Row count
       - Random seed
       - Locale & currency
       - Privacy rules
     - Primary Action: `Export` button (Teal/Emerald `#0D9488`)

---

### Slide 11: Why It Wins — Built Against the Judging Criteria

- **Header Eyebrow:** `WHY IT WINS`
- **Title:** `Built against the judging criteria`
- **Official Evaluation Matrix:**
  | Criterion | How we deliver |
  | :--- | :--- |
  | **System design** | Modular engine — tabular, relational and document generators share one schema-aware pipeline |
  | **Features** | Tabular, relational, and document generation (invoices, bank statements) in a single platform |
  | **UI** | One workspace to configure, preview, and export — no code required |
  | **AI** | AI infers schemas, synthesizes realistic content, and injects meaningful edge cases |
  | **Problem approach** | Solves data scarcity and privacy constraints without ever touching real records |

---

### Slide 12: Closing & Demo Call to Action

- **Header Eyebrow:** `HACKDATAV2`
- **Title:** `Thank you`
- **Subtitle:** `Synthetic Data Platform — questions, and a live demo.`
- **Pill Badges:** `Tabular` | `Relational` | `Documents`

---

## 3. Explicit vs Implied Boundaries

| Category             | Explicit in Official Theme                                                                         | Engineering Assumption / Implication                                                        |
| :------------------- | :------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------ |
| **Problem Domain**   | Real data scarcity, privacy/compliance lockouts, slow procurement cycles.                          | Target testing suites, demo environments, staging databases, compliance sandbox.            |
| **Data Types**       | 1) Tabular, 2) Relational, 3) Documents (Invoices, Bank statements).                               | Must support all 3 in a unified UI workspace.                                               |
| **UI Structure**     | 3-pane workspace: Sidebar (left), Canvas (center), Config (right). Zero-code.                      | React / Next.js single-page application with immediate reactive state updates.              |
| **Config Controls**  | Row count, random seed, locale & currency, privacy rules (masking, hashing, noise), export.        | Numerical steppers, seed lock, dropdowns for locale/currency, toggle switches for privacy.  |
| **AI Workload**      | 1) Schema inference, 2) Realistic content synthesis, 3) Edge-case injection.                       | LLM (Gemini) for semantic understanding; local fast engines for high-volume row generation. |
| **Relational Rules** | PK/FK referential integrity, 1:1, 1:N, N:N cardinalities, cross-table mathematical reconciliation. | Dependency-ordered DAG generation (Customers -> Orders -> Order Items).                     |
| **Document Rules**   | Realistic line items, region templating, running balances, arithmetic reconciliation.              | Structured JSON/CSV export + visual PDF/HTML preview and downloadable documents.            |
| **Output Formats**   | CSV, JSON, Relational DB dump (SQL), PDF-style documents.                                          | Multi-format exporter with instant download & copy to clipboard.                            |

---

## 4. Verification Check

- **Total Slides Verified:** 12 of 12.
- **Visual Discrepancies:** None. The visual layout in Slide 10 defines the authoritative UI architecture.
- **Arithmetic Verifications:**
  - Invoice: $1,100 + $140 = $1,240 (Exact match).
  - Bank Statement: $1,204.30 + $2,150.00 - $96.40 = $3,257.90 (Exact match).
- **Zero Hallucination Guarantee:** No external features, technologies, or rules outside this document are declared as mandatory.
