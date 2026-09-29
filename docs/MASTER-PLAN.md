# HACKDATA V2 — MASTER EXECUTION PLAN

> **Single Source of Truth for Project Orchestration**  
> **Challenge:** Synthetic Data Platform (`theme.pdf`)  
> **Current Phase:** Phase 0 — Baseline Theme Analysis & Documentation Generation (COMPLETED · AWAITING HUMAN REVIEW)  
> **Next Milestone:** Phase 1 — Application Development Kickoff (Requires Human Team Review & Sign-Off)

---

## 1. Executive Summary & Mission

### 1.1 The Challenge
Modern software engineering teams face severe bottlenecks due to:
1. **Privacy & compliance barriers** preventing production data sharing.
2. **Limited, messy datasets** lacking realistic distributions and stress-testing edge cases.
3. **Multi-week procurement cycles** to secure sanctioned test extracts.

### 1.2 The Solution
**HackData V2 Synthetic Data Platform:** A unified, zero-code web workspace providing on-demand synthetic generation across three core data modalities:
- **Tabular Data:** Statistically faithful numeric & categorical distributions with seed determinism and column-level privacy rules (masking, hashing, differential noise).
- **Relational Structures:** 100% referential integrity across multi-table hierarchies (`Customers -> Orders -> Order Items`) with configurable cardinalities (1:1, 1:N, N:N) and cross-table mathematical reconciliation.
- **Document Generator:** Templated, localized invoices and running-balance bank statements with strict arithmetic consistency.
- **Unified AI Layer:** Infers schemas from samples, synthesizes realistic human content, and injects meaningful edge cases across all three generation engines.

---

## 2. Project State Dashboard

| Metric | Current Status | Notes |
| :--- | :--- | :--- |
| **Current Execution Pass** | Pass 1: Theme Analysis & Doc Baseline | Complete. Ready for Git commit and push to `main`. |
| **Theme Source Analysis** | 100% Complete | 12 of 12 slides visually and textually verified from `theme.pdf`. |
| **Documentation Baseline** | 100% Complete | All 11 core documentation files created/updated in `docs/`. |
| **Development Status** | FROZEN / STOPPED | Development agents halted pending manual human review. |
| **Architecture Status** | Approved (FastAPI + Next.js 15) | Detailed in `docs/ARCHITECTURE.md`. |
| **API Contract Status** | Baseline Specified | Detailed in `docs/API-CONTRACT.md`. |
| **UI Compliance Status** | Baseline Specified (3-Pane Layout) | Detailed in `docs/UI-REQUIREMENTS.md`. |
| **QA Plan Status** | Baseline Specified | Detailed in `docs/TEST-PLAN.md`. |
| **Deployment Target** | Vercel (FE) + Render (BE) + Supabase | Detailed in `docs/DEPLOYMENT.md`. |

---

## 3. Specialist Agent Ownership & Matrix

| Specialist Agent | Domain & Scope | Primary Deliverables | Status |
| :--- | :--- | :--- | :---: |
| **Project Lead** | Orchestration, requirements, priorities, master plan, quality gates | `docs/MASTER-PLAN.md`, `docs/REQUIREMENTS.md`, execution control | **ACTIVE** |
| **Architect** | System design, technical trade-offs, architecture decisions | `docs/ARCHITECTURE.md`, `docs/DECISIONS.md` | Ready |
| **Frontend Agent** | 3-pane workspace UI, responsive layouts, design tokens, live preview | Next.js components, Zustand state, Tailwind styling | Standing By |
| **Backend Agent** | FastAPI service, tabular engine, relational DAG engine, document generator | `backend/app/engine/`, statistical distributions, API endpoints | Standing By |
| **AI Engineer** | LLM orchestration, schema understanding, semantic text synthesis, edge-cases | `backend/app/ai/`, Gemini integration, prompt pipelines | Standing By |
| **Integration Agent** | Cross-modality plumbing, live debounced preview, export serializers | End-to-end data flow, schema-to-UI binding | Standing By |
| **QA / Security Agent**| Mathematical reconciliation audit, referential integrity tests, UI compliance | Test suites (`tests/`), Playwright browser tests, security audit | Standing By |
| **Deployment Agent** | Containerization, Vercel & Render configuration, smoke verification | Dockerfile, cloud deployment, production verification | Standing By |

---

## 4. Priority Feature Matrix

```
[P0 Mandatory MVP]
├── Tabular Engine (Distributions, seed reproducibility, row count)
├── Relational Engine (100% FK integrity, 1:1 & 1:N cardinalities, Customers->Orders->Items)
├── Document Engine (Invoices with reconciled totals, Bank statements with running balance)
├── Unified 3-Pane UI (Left Nav, Center Live Canvas, Right Config Drawer)
├── Live Preview Reactivity (<200ms preview reload)
├── Privacy Controls (Masking, Hashing, Differential Noise)
└── Export Multi-Format Engine (CSV, JSON, SQL Dump, PDF)

[P1 Core Quality & Demo Value]
├── AI Schema Understanding (Infers types from uploaded sample CSV/JSON)
├── AI Semantic Content Synthesis (Natural names, companies, line items)
├── AI Edge-Case Injection (Nulls, boundary spikes, anomaly badges)
├── Regional Invoice Templating (Currency symbols, date formats, tax labels)
└── Seed Lock / Refresh Button

[P2 Enhancements]
├── Query-Style Generation ("last 90 days, balance over $500")
├── N:N Relational Cardinalities via join tables
└── In-Browser SQL DDL Previewer

[P3 Differentiators]
├── Live Interactive ERD Schema Canvas
├── Differential Privacy Epsilon Calibration Slider
└── Export Archive Packaging (Multi-table ZIP)
```

---

## 5. Live Demonstration Flight Plan (Winning 3-Minute Demo)

1. **Minute 1: The Problem & Tabular Generation**
   - Demonstrate the scarcity and privacy lockouts of production data.
   - Show the live 3-pane workspace.
   - Adjust row count and random seed; show live rows updating in `<200ms`.
   - Toggle privacy masking and differential noise; highlight instantaneous data protection.
2. **Minute 2: Relational Structures & Integrity**
   - Switch to `Relational` view (`Customers -> Orders -> Order Items`).
   - Demonstrate 100% referential integrity: zero orphaned foreign keys.
   - Highlight mathematical reconciliation: show that order total equals the exact sum of order line items.
3. **Minute 3: Document Generation & AI Synthesis**
   - Switch to `Documents -> Invoices`: show rendered `#INV-10432` with perfectly balanced totals.
   - Switch to `Documents -> Bank Statements`: show running transaction ledger where `balance == prev_balance + credit - debit`.
   - Demonstrate AI edge-case injection.
   - Click `Export`: download complete package (CSV, JSON, SQL dump) in one second.

---

## 6. Definition of Done (DoD)

The project will be declared complete only when:
1. **Mandatory Scope Functional:** Tabular, Relational, and Document engines generate valid data matching all theme specifications.
2. **Mathematical Truth Verified:** 100% referential integrity (0 orphaned FKs) and $0.00 calculation variance across invoices and bank balances.
3. **UI Compliance Audited:** 3-pane layout strictly matches Theme Slide 10 with sub-200ms live preview reactivity.
4. **AI Layer Integrated:** AI infers schemas, synthesizes natural language content, and injects realistic edge cases across all three data types.
5. **Multi-Format Export Operable:** CSV, JSON, SQL DDL dumps, and printable PDF documents download cleanly.
6. **Production Deployed:** Deployed and verified live on Vercel (Frontend) and Render (Backend).
7. **Demo Rehearsed:** 3-minute critical user journey executes smoothly without errors.

---

## 7. Immediate Next Steps (Human Review Boundary)

1. **Phase 0 Documentation Check:** Completed.
2. **Git Commit & Push:** Commit documentation baseline to `main` branch.
3. **Handoff to Human Team:** Stop and wait for Akif, Haroon, and Hamza to review, refine, and approve the baseline documentation before Phase 1 development commences.
