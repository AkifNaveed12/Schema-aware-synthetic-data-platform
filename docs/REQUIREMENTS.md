# HACKDATA V2 — REQUIREMENTS SPECIFICATION

> **Authoritative Theme:** Synthetic Data Platform (`theme.pdf`)  
> **Classification Standard:** P0 (Mandatory MVP) · P1 (Core Quality & Demo Value) · P2 (Explicit Bonus / Enhancement) · P3 (Differentiator) · P4 (Experimental)  
> **Status:** Baseline Specification for Review

---

## 1. Problem Statement & User Personas

### 1.1 The Core Problem

Modern software development, testing, and AI training suffer from three compounding bottlenecks (Theme Slide 2):

1. **Privacy & Compliance:** Production data cannot be freely shared across non-production environments, offshore teams, third-party contractors, or public cloud infrastructures due to GDPR, HIPAA, and corporate security policies.
2. **Limited, Messy Datasets:** Real test datasets are frequently small, historically skewed, or lacking the edge cases (nulls, boundary spikes, invalid values) required for resilient testing.
3. **Slow Procurement Cycles:** Securing an official sanitized data extract requires legal, compliance, and DBA sign-offs that can take weeks or months.

### 1.2 Target Personas

- **QA Engineers & SDETs:** Need realistic relational data structures, edge-case injections, and document artifacts (invoices, statements) to validate downstream ETL, billing, and reconciliation pipelines.
- **Backend & Full-Stack Developers:** Need instant, local, deterministic seed data with valid foreign keys and realistic names/addresses for UI prototyping, demos, and integration testing.
- **Data Engineers & Compliance Officers:** Need privacy-safe datasets with verifiable masking, hashing, and differential noise without exposing PII.

### 1.3 Expected Outcome & Minimum Viable Solution (MVP)

A unified, zero-code web workspace providing on-demand synthetic generation across three core data modalities:

1. **Tabular Data** (configurable distributions, seeds, privacy rules)
2. **Relational Data** (referential integrity, foreign key cardinalities, cross-table math reconciliation)
3. **Document Data** (templated invoices and bank statements with reconciled ledgers)

---

## 2. Priority Classification Framework

| Priority | Definition                | Scope in HackData V2                                                                                   |
| :------: | :------------------------ | :----------------------------------------------------------------------------------------------------- |
|  **P0**  | **Mandatory MVP**         | Without this, the submission does not satisfy the official theme challenge. Must work end-to-end.      |
|  **P1**  | **Core Quality & Demo**   | Required for high evaluation scores, visual polish, and AI differentiation.                            |
|  **P2**  | **Important Enhancement** | Explicit theme features that add depth (e.g. natural language queries, regional invoice templates).    |
|  **P3**  | **Differentiator**        | Distinctive capabilities (e.g. live interactive ERD canvas, differential privacy epsilon calibration). |
|  **P4**  | **Experimental**          | Exploratory features to attempt only if all prior tiers are completely locked.                         |

---

## 3. Functional Requirements

### 3.1 Ingestion & Schema Understanding (Theme Slide 3, 4, 9)

| ID         | Title                       | Description                                                                                                                            | Priority | Theme Ref  |
| :--------- | :-------------------------- | :------------------------------------------------------------------------------------------------------------------------------------- | :------: | :--------- |
| **FR-001** | Schema File Ingestion       | System must accept schema definitions (SQL DDL, JSON Schema, or CSV headers) to configure generation pipelines.                        |  **P0**  | Slide 3, 4 |
| **FR-002** | Sample Dataset Ingestion    | System must accept small sample CSV/JSON datasets to infer column types, formats, value ranges, and foreign key hints.                 |  **P0**  | Slide 3, 4 |
| **FR-003** | AI Schema Inference         | AI layer must automatically infer semantic types (e.g. email, full name, currency, timestamp) from sample rows without manual mapping. |  **P1**  | Slide 3, 9 |
| **FR-004** | Business Rule Specification | System must allow users to define or override generation rules (e.g., minimum balance, allowable date ranges).                         |  **P1**  | Slide 4    |

---

### 3.2 Tabular Data Generation (Theme Slide 4, 5)

| ID         | Title                         | Description                                                                                                                       | Priority | Theme Ref   |
| :--------- | :---------------------------- | :-------------------------------------------------------------------------------------------------------------------------------- | :------: | :---------- |
| **FR-010** | Statistical Distributions     | Numeric and categorical columns must follow faithful statistical distributions (uniform, normal, bimodal, categorical frequency). |  **P0**  | Slide 5     |
| **FR-011** | Configurable Row Count        | User must be able to specify arbitrary row counts for generated tables (e.g. 10, 50, 100, 1,000, 10,000).                         |  **P0**  | Slide 5, 10 |
| **FR-012** | Deterministic Random Seed     | Generation must support a configurable seed to enable exact reproduction of synthetic datasets across runs.                       |  **P0**  | Slide 5, 10 |
| **FR-013** | Null & Outlier Rates          | User must be able to configure percentage rates for injected nulls and statistical outliers.                                      |  **P1**  | Slide 5     |
| **FR-014** | Column-Level Privacy Controls | Support masking (e.g. `m.****@example.com`), SHA-256 hashing, and differential noise on sensitive columns.                        |  **P0**  | Slide 5, 10 |

---

### 3.3 Relational Data Generation (Theme Slide 4, 6)

| ID         | Title                              | Description                                                                                                                                          | Priority | Theme Ref |
| :--------- | :--------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------- | :------: | :-------- |
| **FR-020** | Referential Integrity Preservation | Foreign keys must strictly reference valid primary keys in parent tables without orphaned child records.                                             |  **P0**  | Slide 6   |
| **FR-021** | Configurable Cardinalities         | Support 1:1, 1:N (e.g. 1 Customer to N Orders), and N:N (Orders to Products via Order Items) relationship cardinalities.                             |  **P0**  | Slide 6   |
| **FR-022** | Cross-Table Arithmetic Consistency | Computed parent values must mathematically reconcile with child lines (e.g. `Order.total_amount` equals `SUM(Order_Items.price * Order_Items.qty)`). |  **P0**  | Slide 6   |
| **FR-023** | Multi-Table Preset Schema          | Out-of-the-box support for the official Customers -> Orders -> Order Items relational schema.                                                        |  **P0**  | Slide 6   |

---

### 3.4 Document Data Generation (Theme Slide 4, 7, 8)

| ID         | Title                            | Description                                                                                                                             | Priority | Theme Ref |
| :--------- | :------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- | :------: | :-------- |
| **FR-030** | Synthetic Invoice Generation     | Generate realistic invoices featuring invoice number, buyer/seller addresses, line items, taxes, and reconciled totals.                 |  **P0**  | Slide 7   |
| **FR-031** | Regional Invoice Templating      | Support customizable layouts, date formats (ISO, US, EU), currency symbols ($, €, £), and regional tax labels (VAT, Sales Tax).         |  **P1**  | Slide 7   |
| **FR-032** | Bulk Document Generation         | Support batch generation of invoices for reconciliation and load testing pipelines.                                                     |  **P1**  | Slide 7   |
| **FR-033** | Bank Statement Generation        | Generate financial statements with chronologically ordered transaction histories, realistic merchant names, and valid running balances. |  **P0**  | Slide 8   |
| **FR-034** | Strict Running Balance Integrity | Every row's balance must strictly equal previous balance + credit - debit.                                                              |  **P0**  | Slide 8   |
| **FR-035** | Query-Style Generation           | Support natural language or structured parameter queries (e.g., _"last 90 days, balance over $500"_).                                   |  **P1**  | Slide 8   |

---

### 3.5 AI Layer Capabilities (Theme Slide 3, 4, 9)

| ID         | Title                           | Description                                                                                                          | Priority | Theme Ref   |
| :--------- | :------------------------------ | :------------------------------------------------------------------------------------------------------------------- | :------: | :---------- |
| **FR-040** | Semantic Content Synthesis      | AI infers realistic, natural human names, addresses, descriptions, and company names rather than crude mock strings. |  **P0**  | Slide 9     |
| **FR-041** | Edge-Case Proposer              | AI proposes realistic edge cases, rare strings, boundary conditions, and corruptions to stress test suites.          |  **P1**  | Slide 9     |
| **FR-042** | Cross-Modality AI Orchestration | Single unified AI layer runs across tabular, relational, and document pipelines.                                     |  **P0**  | Slide 4, 11 |

---

### 3.6 Workspace & User Experience (Theme Slide 10, 11)

| ID         | Title                      | Description                                                                                                            | Priority | Theme Ref   |
| :--------- | :------------------------- | :--------------------------------------------------------------------------------------------------------------------- | :------: | :---------- |
| **FR-050** | Unified 3-Pane Workspace   | Fixed 3-column layout: Navigation Sidebar (left), Live Preview Canvas (center), Configuration Panel (right).           |  **P0**  | Slide 10    |
| **FR-051** | Instant Live Preview       | Preview canvas updates reactively as sliders, row counts, and seed settings change on the configuration panel.         |  **P0**  | Slide 10    |
| **FR-052** | Zero-Code Operation        | Full workflow executable without writing code or terminal commands.                                                    |  **P0**  | Slide 11    |
| **FR-053** | Multi-Format Export Engine | Export generated data directly as CSV, JSON, Relational SQL DDL/Dumps, and printable/downloadable PDF-style documents. |  **P0**  | Slide 4, 10 |

---

## 4. Non-Functional Requirements (NFR)

| ID          | Category               | Requirement                                         | Target Metric                                                 | Theme Justification                               |
| :---------- | :--------------------- | :-------------------------------------------------- | :------------------------------------------------------------ | :------------------------------------------------ |
| **NFR-001** | Performance            | Live preview recalculation for active view          | `< 200ms` for preview rows (<= 50 rows)                       | Slide 10: _"See generated rows update instantly"_ |
| **NFR-002** | Determinism            | Exact data reproducibility via seed                 | 100% identical dataset on identical seed + config             | Slide 5, 10: Configurable random seed             |
| **NFR-003** | Mathematical Integrity | Arithmetic reconciliation across documents & tables | Zero calculation discrepancy ($0.00 mismatch)                 | Slide 6, 7, 8                                     |
| **NFR-004** | Referential Integrity  | Parent-child foreign key matching                   | 0 orphaned foreign keys                                       | Slide 3, 6                                        |
| **NFR-005** | Privacy Safety         | Zero leakage of real input data                     | 100% synthetic/masked/hashed/noised output                    | Slide 2, 5, 11                                    |
| **NFR-006** | Browser Compatibility  | Web application functionality                       | Modern Evergreen browsers (Chrome, Edge, Firefox, Safari)     | Slide 10: Zero-code web experience                |
| **NFR-007** | Export Fidelity        | Valid formats for downstream tools                  | Valid RFC 4180 CSV, RFC 8259 JSON, valid PostgreSQL/MySQL DDL | Slide 4, 10                                       |

---

## 5. Explicit Constraints & Boundaries

- **CONSTRAINT-01:** Layout structure must follow the official 3-pane paradigm: Workspace Navigation (Left), Live Preview Canvas (Center), Configuration Drawer/Panel (Right). (Theme Slide 10)
- **CONSTRAINT-02:** Document types in the MVP must prominently implement Invoices and Bank Statements as demonstrated in official theme slides 7 and 8.
- **CONSTRAINT-03:** AI layer must be integrated across all three generation engines, not restricted to a disconnected chatbot. (Theme Slide 4)
- **CONSTRAINT-04:** Privacy controls must operate at column level (masking, hashing, differential noise). (Theme Slide 5)
- **CONSTRAINT-05:** Zero exposure of real production records. All pipeline steps must synthesize or transform data safely. (Theme Slide 11)

---

## 6. Official Judging Alignment Matrix (Theme Slide 11)

| Judging Criterion    | Theme Expectation                                               | System Implementation Delivery                                                                        |
| :------------------- | :-------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------- |
| **System Design**    | Modular engine sharing one schema-aware pipeline                | Unified core pipeline with pluggable Tabular, Relational, and Document modules.                       |
| **Features**         | Tabular, relational, and document generation in single platform | End-to-end support for all 3 data types in 1 seamless application.                                    |
| **UI**               | One workspace to configure, preview, and export — zero code     | High-polish 3-pane interface with real-time reactive canvas and instant exports.                      |
| **AI**               | Inferred schemas, realistic synthesis, and edge-case injection  | Multi-task LLM prompt orchestration for schema semantics, realistic names, and boundary stress tests. |
| **Problem Approach** | Solves data scarcity & privacy without real records             | Zero-knowledge synthetic data generation with provable privacy transformations.                       |

---

## 7. Assumptions & Open Questions

### 7.1 Engineering Assumptions

- **A-001:** Backend will be implemented in Python (FastAPI) to take native advantage of statistical modeling (NumPy/SciPy), synthetic generators (Faker), and LLM connectors, while the frontend will be a modern Next.js/React application.
- **A-002:** The live preview canvas will display a fast sample (e.g. 10 to 50 rows) for sub-second responsiveness, while the Export action processes the full requested row count (e.g. 1,000 to 10,000 rows).
- **A-003:** PDF-style documents can be rendered via HTML/CSS printable templates and downloaded as JSON, CSV, or formatted PDF documents.

### 7.2 Open Questions for Human Review

- **OPEN-001:** Should database dumps target PostgreSQL syntax specifically, or offer a selector for MySQL and SQLite? _(Recommended: PostgreSQL default with generic ANSI SQL compatibility)_.
- **OPEN-002:** Which LLM provider is preferred for HackData V2 evaluation? _(Recommended: Google Gemini API as primary with mock fallback for offline resilience)_.
