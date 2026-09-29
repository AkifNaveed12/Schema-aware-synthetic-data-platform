# HACKDATA V2 — OFFICIAL THEME SOURCE DOCUMENTATION

> **Source File:** `theme.pdf` (Project Root)  
> **Extraction Date:** September 29, 2026  
> **Analysis Engine:** Microsoft MarkItDown 0.1.8 & PyMuPDF  
> **Pages Inspected:** 12 of 12  
> **Status:** Authoritative Baseline — Strict Fidelity to Official Presentation

---

## 1. Executive Summary & Document Metadata

### 1.1 Event Information

- **Event:** HackData V2
- **Track / Focus:** Synthetic Data Platform
- **Official Tagline:** _Realistic, privacy-safe tabular, relational and document data — generated on demand._

### 1.2 Core Pillars

1. **Tabular Data**
2. **Relational Structures**
3. **Document Generator**

### 1.3 Target Audience

The platform addresses engineering teams, QA testers, data scientists, product teams, and partner integrations dealing with:

- Privacy and compliance restrictions
- Limited or messy datasets
- Skewed datasets
- Missing edge cases
- Slow data procurement cycles

---

## 2. Complete Slide-by-Slide Extraction

### 2.1 Slide 1 — Cover Page

- **Header:** `HACKDATAV2 · SUBMISSION`
- **Title:** `Synthetic data platform`
- **Subtitle:** `Realistic, privacy-safe tabular, relational and document data — generated on demand.`

#### Visual Structure

- Canvas background: `#F8F7F4`
- Typography: Deep navy `#0F172A`
- Accent: Mint/teal circular graphics
- Core subsystem labels:
  - Tabular Data
  - Relational Structures
  - Document Generator

---

### 2.2 Slide 2 — The Problem

- **Header:** `THE PROBLEM`
- **Title:** `Real data is scarce, sensitive, and slow to get`

#### Core Problem 1 — Privacy & Compliance

> Teams can't freely share production data across environments, partners, or the cloud.

**Visual cue:** Lock / Shield

#### Core Problem 2 — Limited, Messy Datasets

> Real datasets are small, skewed, or missing the edge cases engineers need to test against.

**Visual cue:** Database / Cylinder

#### Core Problem 3 — Slow Procurement Cycles

> Getting a sanctioned data extract for a demo or a test suite can take weeks of sign-off.

**Visual cue:** Clock / Delay

---

### 2.3 Slide 3 — Our Approach

- **Header:** `OUR APPROACH`
- **Title:** `Schema-aware, not random`

#### Four-Step Pipeline

1. **Ingest Schema**
   - Infer tables, columns, types, and keys from a sample or schema file.

2. **Model Relationships**
   - Learn distributions, correlations, and foreign-key cardinalities across tables.

3. **Generate with AI**
   - Use an AI layer to provide realistic names, text, and edge cases that the schema alone cannot describe.

4. **Validate & Export**
   - Check referential integrity and statistical fidelity before exporting to the requested format.

---

### 2.4 Slide 4 — System Design

- **Header:** `SYSTEM DESIGN`
- **Title:** `From schema to shippable data`

#### Stage 1 — Inputs

- Schema definition
- Sample dataset
- Business rules

#### Stage 2 — Generation Engine

- Tabular engine
- Relational engine
- Document engine
- **AI layer runs across all three engines**

#### Stage 3 — Outputs

- CSV / JSON tables
- Relational database dump
- PDF-style documents

---

### 2.5 Slide 5 — Tabular Data Generation

- **Header:** `FEATURE`
- **Title:** `Tabular data generation`

#### Explicit Capabilities

- Statistically faithful distributions for numeric and categorical columns
- Configurable row count
- Configurable random seed
- Configurable null rates
- Configurable outlier rates
- Column-level privacy controls:
  - Masking
  - Hashing
  - Differential noise

#### Sample Output

|    ID | Name          | Email                 | Signup     | Balance |
| ----: | ------------- | --------------------- | ---------- | ------: |
| 10231 | Maria Chen    | m.chen@example.com    | 2025-02-11 | $482.10 |
| 10232 | Ahmed Raza    | a.raza@example.com    | 2025-03-04 | $129.55 |
| 10233 | Sofia Ivanova | s.ivanova@example.com | 2025-01-27 | $918.42 |

---

### 2.6 Slide 6 — Relational Data Structures

- **Header:** `FEATURE`
- **Title:** `Relational data structures`

#### Explicit Capabilities

- Automatic referential integrity across generated tables
- Configurable cardinalities:
  - `1:1`
  - `1:N`
  - `N:N`
- Cross-table consistency
- Order totals reconcile with their line items

#### Example Relationship

```text
Customers
(customer_id PK, name, email)
        │
        │ 1:N
        ▼
Orders
(order_id PK, customer_id FK, order_date)
        │
        │ 1:N
        ▼
Order Items
(item_id PK, order_id FK, sku, qty)
```

2.7 Slide 7 — Document Generator: Invoices
Header: FEATURE · DOCUMENT GENERATOR
Title: Invoices
Explicit Capabilities
Realistic line items
Tax rules
Automatically reconciled totals
Regional templates
Region-specific:
Date formats
Currency
Tax labels
Bulk generation for testing invoicing and reconciliation pipelines
Official Sample

Invoice: #INV-10432

Billed to: Northwind Supplies Ltd.

From: Synth Data Co.

Item Qty Price Amount
API access — Pro tier 1 $1,100.00 $1,100.00
Onboarding support 1 $140.00 $140.00

Total: $1,240.00

Verification:

$1,100.00 + $140.00 = $1,240.00
2.8 Slide 8 — Document Generator: Bank Statements & Queries
Header: FEATURE · DOCUMENT GENERATOR
Title: Bank statements & queries
Explicit Capabilities
Realistic merchants
Realistic transaction amounts
Running balances
Structured JSON / CSV exports
Formatted statement documents
Query-style generation
Example Query

last 90 days, balance over $500

Sample Statement
Date Description Debit Credit Balance
08-14 Greenleaf Market $42.10 — $1,204.30
08-15 Payroll deposit — $2,150.00 $3,354.30
08-17 Riverside Utilities $96.40 — $3,257.90
Mathematical Verification
$1,204.30 + $2,150.00 = $3,354.30
$3,354.30 - $96.40 = $3,257.90
2.9 Slide 9 — AI Layer
Header: AI LAYER
Title: Where AI does the work
AI Function 1 — Schema Understanding

Infer:

Column types
Formats
Relationships

The official theme specifies inference from a small sample without manual mapping.

AI Function 2 — Realistic Content Synthesis

Generate realistic:

Names
Addresses
Free-text fields
AI Function 3 — Edge-Case Injection

Propose:

Nulls
Outliers
Rare patterns
2.10 Slide 10 — Experience
Header: EXPERIENCE
Title: One workspace, three data types
Official Three-Pane Layout
Left — Workspace Navigation
Dark navy background: #0F172A
Tabular
Relational
Documents
Active state uses a dark emerald/teal accent
Center — Live Preview Canvas
Light/white canvas
Generated rows update as configuration changes
Right — Configuration Panel
Header: CONFIGURATION
Teal accent
Controls:
Row count
Random seed
Locale & currency
Privacy rules
Primary action:
Export
Teal/Emerald: #0D9488
2.11 Slide 11 — Why It Wins
Header: WHY IT WINS
Title: Built against the judging criteria
Criterion Official Delivery
System Design Modular tabular, relational, and document generators sharing one schema-aware pipeline
Features Tabular, relational, and document generation in one platform
UI One workspace to configure, preview, and export with no code required
AI Schema inference, realistic content synthesis, and meaningful edge cases
Problem Approach Addresses data scarcity and privacy constraints without touching real records
2.12 Slide 12 — Closing
Header: HACKDATAV2
Title: Thank you
Subtitle: Synthetic Data Platform — questions, and a live demo.
Pill Badges:
Tabular
Relational
Documents

## 3. Explicit vs. Engineering Boundaries

Category Explicit in Official Theme Engineering Implication
Problem Domain Data scarcity, privacy/compliance restrictions, slow procurement Target testing, demo, staging, and compliance-safe environments
Data Types Tabular, relational, documents Support all three in one workspace
UI Structure Three-pane workspace Implement the documented workspace experience
Configuration Row count, seed, locale/currency, privacy rules, export Provide corresponding configuration controls
AI Workload Schema inference, content synthesis, edge-case injection AI handles semantic tasks; implementation details remain an engineering decision
Relational Rules PK/FK integrity, 1:1, 1:N, N:N, cross-table reconciliation Dependency-aware relational generation
Document Rules Line items, regional templates, running balances, reconciliation Deterministic calculation and document rendering
Output Formats CSV, JSON, relational DB dump, PDF-style documents Implement format-specific exporters

## 4. Verification Summary

4.1 Source Verification
Total Slides: 12
Slides Inspected: 12
Theme Coverage: Complete
4.2 Arithmetic Verification
Invoice
$1,100.00 + $140.00 = $1,240.00
Bank Statement
$1,204.30 + $2,150.00 - $96.40 = $3,257.90

Both examples reconcile exactly.

4.3 Source Boundary

This document distinguishes between:

Official theme requirements
Engineering implications

Technologies, frameworks, implementation strategies, performance targets, and other implementation-specific decisions should not be presented as mandatory theme requirements unless explicitly stated by the official source.

## 5. Source Fidelity Status

Check Result
12/12 pages reviewed PASS
Core three modalities preserved PASS
Official pipeline preserved PASS
Official AI responsibilities preserved PASS
Official relational requirements preserved PASS
Official document requirements preserved PASS
Official UI structure preserved PASS
Official configuration controls preserved PASS
Official output formats preserved PASS
Official arithmetic examples preserved PASS
Engineering assumptions separated from source requirements PASS

Status: AUTHORITATIVE BASELINE — VERIFIED
