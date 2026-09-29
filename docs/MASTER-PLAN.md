HACKDATA V2 — MASTER EXECUTION PLAN

Single Source of Truth for Project Orchestration
Challenge: Synthetic Data Platform (theme.pdf)
Current Phase: Phase 1 — Application Development (Backend + AI MVP Verification Complete)
Status: BACKEND & AI MVP VERIFIED · 67 TESTS PASSING · FRONTEND BUILD PASSING
Next Milestone: Full Team End-to-End Integration & Demo Prep
Gate: Backend + AI verification complete and merged to main

## 1. Executive Summary & Mission

1.1 The Challenge

The challenge identifies three major problems:

Privacy & compliance barriers — production data may be sensitive or unsuitable for unrestricted development/testing.
Limited and messy datasets — teams need realistic distributions and meaningful edge cases.
Slow data procurement — obtaining sanctioned test data can introduce significant delays.
1.2 The Solution

HackData V2 is a unified synthetic-data workspace for generating realistic, privacy-safe data across three core modalities:

Modality Core Capability
Tabular Statistically faithful numeric/categorical synthetic data with configurable generation and privacy controls
Relational Multi-table synthetic datasets with PK/FK integrity, configurable relationships, and cross-table consistency
Documents Synthetic invoices and bank statements with realistic content and deterministic business-rule validation

A cross-cutting AI layer supports:

Schema understanding and inference
Semantic content synthesis
Meaningful edge-case generation
Natural-language configuration where applicable
1.3 Core Architectural Principle

AI is not the bulk data generator.

The platform follows a hybrid architecture:

Input
↓
Schema / Data Understanding
↓
DataProfile
↓
Specialized Generation Engines
├── Tabular
├── Relational
└── Document
↓
Constraint & Business-Rule Validation
↓
Quality Evaluation
├── Statistical Fidelity
├── Structural Integrity
├── Privacy
├── Utility
└── Business Rules
↓
PASS ─────────→ Export
│
FAIL
↓
Controlled Regeneration

## 2. Project State Dashboard

Metric Current Status Notes
Current Execution Pass Phase 1 MVP Verification Complete Backend, AI, Engines, Ingestion, & Models verified
Theme Analysis Complete Official theme analyzed across all 12 pages
Documentation Baseline Complete All core documentation files established and updated
Development Status Backend MVP COMPLETE 67 automated backend tests passing; frontend build passing
CTGAN & TVAE Verified Live in Python 3.14 environment Real SDV/PyTorch/CTGAN model adapters active
External Datasets Verified Generalizes across Kaggle datasets Tested on bank_customers, employee_salary, Churn_Modelling
Relational DAG Verified Real multi-table Olist schema Zero orphaned FKs across customers->orders->order_items->products
Document Engine Verified Dynamic input-aware extraction Invoices and statements extract items/merchants from DataProfile
Architecture Approved FastAPI backend + React/Vite frontend
API Contract Baseline Specified Defined in docs/API-CONTRACT.md
UI Requirements Baseline Specified Unified workspace experience derived from the theme
QA Plan Baseline Specified Defined in docs/TEST-PLAN.md
AI Provider Groq / Hybrid Deterministic Fallback In-memory cache + rate limiting + graceful fallbacks
Deployment Strategy Localhost First Cloud deployment is optional if time permits
Database Localhost First In-memory thread-safe state + Supabase client fallback ready
Human Review Gate Ready for review Full MVP backend & AI test suite green, merged to main

## 3. Specialist Agent Ownership

Role Responsibility Primary Deliverables Status
Project Lead / Architect — Akif Orchestration, requirements, architecture, backend, AI, integration, final execution Architecture, decisions, backend, AI, integration ACTIVE
Frontend — Haroon UI implementation, workspace interaction, responsive behavior, frontend state Frontend application STANDING BY
QA / Security / Integration — Hamza Testing, security verification, integration verification, quality gates Test suites, QA reports, security checks STANDING BY
Deployment — Akif Deployment and production verification if required Vercel/Render configuration OPTIONAL / LATER
3.1 Ownership Rules
Akif owns the overall architecture and integration.
Haroon owns frontend implementation.
Hamza owns formal QA, security, and integration verification.
All team members perform local testing during development.
No specialist should silently modify another specialist's core responsibility without coordination.
The master plan and approved documentation remain the source of truth.

## 4. Execution Priorities

4.1 P0 — Mandatory MVP

The MVP must establish the complete end-to-end synthetic-data pipeline.

[P0 — Mandatory]

├── Schema / Input Understanding
├── DataProfile Representation
│
├── Tabular Engine
│ ├── Numeric & categorical distributions
│ ├── Row count
│ ├── Seed reproducibility
│ ├── Missingness / outliers
│ └── Privacy controls
│
├── Relational Engine
│ ├── PK/FK integrity
│ ├── 1:1 / 1:N relationships
│ ├── Multi-table generation
│ └── Cross-table consistency
│
├── Document Engine
│ ├── Invoices
│ ├── Bank statements
│ ├── Deterministic calculations
│ └── Rendered document output
│
├── Validation
│ ├── Structural validation
│ ├── Business-rule validation
│ ├── Statistical validation
│ └── Privacy checks
│
├── Quality Evaluation
│ ├── Statistical fidelity
│ ├── Structural fidelity
│ ├── Privacy
│ └── Utility where feasible
│
├── Controlled Regeneration
│
├── Unified Workspace Experience
│
└── Export of Validated Results
4.2 P1 — Core Quality & Demo Value
[P1 — Quality]

├── AI-assisted schema understanding
├── AI semantic content synthesis
├── AI edge-case injection
├── Regional invoice configuration
├── Locale & currency configuration
├── Privacy configuration
├── Configurable preview
└── Seed / regeneration controls
4.3 P2 — Enhancements
[P2 — Enhancements]

├── Natural-language/query-style generation
├── N:N relational cardinalities through join tables
├── Advanced document variations
└── Additional export/preview capabilities
4.4 P3 — Optional Differentiators

These features are implemented only if the core pipeline is stable:

[P3 — Optional]

├── Interactive ERD visualization
├── Advanced differential-privacy configuration
├── Multi-table export packaging
└── Additional document types

Priority Rule: Quality and fidelity take precedence over feature count.

## 5. Quality-First Execution Strategy

5.1 Generation Pipeline

Every major generation workflow should follow:

INPUT
↓
UNDERSTAND
↓
PROFILE
↓
GENERATE
↓
VALIDATE
↓
EVALUATE
↓
PASS? ── YES ──→ EXPORT
│
NO
↓
CONTROLLED REGENERATION
5.2 Quality Dimensions
Dimension Examples
Statistical Fidelity Distributions, proportions, correlations, missingness, outliers
Structural Fidelity PK/FK integrity, cardinalities, relationships
Business Consistency Invoice totals, taxes, line items, running balances
Privacy Masking, hashing, controlled noise, avoidance of direct record reproduction
Utility TSTR or other meaningful downstream utility evaluation where feasible
5.3 Quality Gate

A generation should not be exported simply because data was successfully produced.

The result must first pass the applicable validation and evaluation checks.

## 6. AI Strategy

6.1 AI Responsibilities

The AI layer should focus on tasks requiring semantic reasoning:

Schema interpretation
Semantic column/type understanding
Realistic names and free text
Document semantics
Edge-case specification
Natural-language configuration
6.2 Bulk Generation Rule

The LLM must not be called once per generated row or document.

Instead:

User Input
↓
Groq / AI Service
↓
Structured Generation Specification
↓
Specialized Local Generation Engine
↓
Bulk Synthetic Data
6.3 AI Service Controls

The AI service should provide:

Structured input/output
Request caching
Schema-analysis deduplication
Rate limiting
Retry with exponential backoff
Token budgeting
Usage tracking
Provider abstraction
6.4 Initial Provider

Groq is the initial AI provider.

The implementation should maintain a provider abstraction so the model/provider can be changed without redesigning the generation engines.

## 7. Frontend Execution Direction

7.1 Unified Workspace

The frontend should provide a unified workspace covering:

Tabular generation
Relational generation
Document generation
Configuration
Preview
Validation/evaluation feedback
Export

The theme establishes the workspace experience, but does not require an implementation-specific fixed three-pane architecture.

7.2 Frontend Ownership

Haroon owns:

Visual implementation
Component architecture
Interaction design
Responsive behavior
Frontend state management
Preview experience
Theme-aligned UI implementation
7.3 Performance Principle

Preview interactions should feel responsive.

A rigid <200ms requirement is not an architectural guarantee. Actual performance targets should be established through profiling and optimized where practical.

## 8. Live Demonstration Plan

8.1 Demonstration Objective

The demo should prove the platform's core value rather than attempt to demonstrate every feature.

8.2 Suggested Flow
Part 1 — Problem & Tabular Data
Introduce the data scarcity/privacy problem.
Provide a sample/schema.
Demonstrate schema understanding.
Generate synthetic tabular data.
Change row count/seed/configuration.
Show privacy configuration.
Show validation/evaluation results.
Part 2 — Relational Data
Load or define a relational structure.
Generate related tables.
Demonstrate PK/FK integrity.
Demonstrate cardinality.
Demonstrate cross-table consistency.
Show validation results.
Part 3 — Documents
Generate an invoice.
Demonstrate line-item/tax/total reconciliation.
Generate a bank statement.
Demonstrate transaction/running-balance consistency.
Show AI-assisted semantic content.
Export the validated result.
8.3 Demo Rule

The final demonstration should prioritize:

Correctness
Data quality
Validation evidence
End-to-end workflow
UI polish

Feature breadth should not compromise the reliability of the demonstrated pipeline.

## 9. Definition of Done

The project is complete when the following conditions are satisfied.

9.1 Functional Scope
Tabular generation works end-to-end.
Relational generation works end-to-end.
Document generation works end-to-end.
Schema-aware processing is functional.
AI-assisted semantic capabilities are integrated where required.
9.2 Data Quality
Generated data passes applicable statistical validation.
PK/FK relationships contain no invalid references.
Applicable cardinality constraints are respected.
Invoice calculations reconcile.
Bank-statement running balances reconcile.
Applicable privacy checks pass.
Utility evaluation is implemented where feasible.
9.3 Validation & Regeneration
Validation occurs before export.
Failed generations can be diagnosed.
Controlled regeneration is supported.
Export operates on the validated generation.
9.4 Frontend
Unified workspace is functional.
Tabular, relational, and document workflows are accessible.
Configuration changes correctly affect generation/preview.
Validation/evaluation results are visible.
Export workflow is usable.
Responsive behavior is verified.
9.5 Export
CSV export works where applicable.
JSON export works where applicable.
SQL/database-compatible export works where applicable.
Document/PDF export works where applicable.
9.6 QA & Security
Unit tests pass.
Integration tests pass.
API tests pass.
Frontend workflow tests pass where applicable.
Security checks pass.
Invalid input and failure paths are tested.
9.7 Deployment
Localhost MVP works reliably.
Cloud deployment is not mandatory for MVP.
If time permits, Vercel frontend deployment is verified.
If time permits, Render backend deployment is verified.
Production deployment must not delay or destabilize the core MVP.
9.8 Demo
Critical user journey is rehearsed.
Core generation workflows are reliable.
Validation evidence is available.
Demo can be completed without depending on unstable external services.

## 10. Execution Phases

Phase 0 — Theme Analysis & Documentation

Status: COMPLETED

Analyze official theme.
Extract requirements.
Establish architecture.
Establish API contract.
Establish task ownership.
Establish QA strategy.
Establish deployment strategy.
Produce the 11 documentation files.
Cross-check documentation consistency.
Phase 1 — Foundation

Gate: Human approval required.

Repository/application structure.
Backend foundation.
Frontend foundation.
API contract implementation.
Shared models.
DataProfile.
Generation job/state model.
Initial validation framework.
Phase 2 — Core Generation Engines
Tabular engine.
Relational engine.
Document engine.
Deterministic business rules.
Initial validation.
Phase 3 — AI & Quality Layer
Groq integration.
Schema understanding.
Semantic synthesis.
Edge-case specification.
AI caching/rate limiting/retry.
Statistical evaluation.
Structural evaluation.
Privacy evaluation.
Utility evaluation where feasible.
Controlled regeneration.
Phase 4 — Frontend Integration
Unified workspace.
Configuration.
Preview.
Generation controls.
Validation/evaluation results.
Export workflow.
Phase 5 — Integration & QA
End-to-end integration.
API testing.
Frontend testing.
Cross-modality verification.
Security testing.
Performance profiling.
Failure-path testing.
Phase 6 — Demo Stabilization
Seeded demo datasets.
Demo workflow.
Error recovery.
Performance cleanup.
Final QA.
Demo rehearsal.
Phase 7 — Optional Deployment

Only if sufficient time remains:

Frontend → Vercel
Backend → Render
Database → Supabase/PostgreSQL-compatible

Deployment must not compromise the localhost MVP.

## 11. Human Review Boundary

11.1 Current State

Phase 0 is complete.

Development remains frozen until the human team reviews the documentation.

11.2 Reviewers
Akif
Haroon
Hamza
11.3 Review Checklist

The team should verify:

Theme requirements are correctly represented.
Architecture is technically feasible.
API contract matches the architecture.
Task ownership is clear.
QA strategy covers critical correctness requirements.
UI direction matches the theme without over-constraining implementation.
AI usage is realistic and cost/token conscious.
MVP scope is achievable within the hackathon timeline.
Optional features are clearly separated from mandatory scope.
No feature is being prioritized over synthetic-data quality.
11.4 Approval Gate

After review:

Human Review
↓
Approved?
┌──┴──┐
NO YES
↓ ↓
Revise Phase 1
Docs Development

No implementation agent should treat the documentation as final until this gate is passed.

## 12. Implementation & Integration Progress

- [x] **Backend Foundation:** FastAPI application shell, configuration management, standard envelope, DataProfile model, health/readiness endpoints.
- [x] **Generation Pipeline (P0):** Tabular engine (distributions, seed determinism, privacy masking/hashing/noise), Relational engine (topological DAG sort, 0 orphaned FKs), Document engine (invoices with $0.00 discrepancy, bank statements with running balance verification).
- [x] **Validation & Evaluation Layer (P0/P1):** Multi-dimensional quality evaluation engine covering Tabular, Relational, and Document modalities (Statistical Fidelity, Structural Integrity, Privacy Compliance, and Business-Rule Reconciliation).
- [x] **Export Capabilities:** Multi-format serialization (RFC 4180 CSV, JSON, ANSI SQL DDL+DML, PDF/HTML representation) with live backend endpoint integration (`POST /api/v1/export`).
- [x] **AI Intelligence & Semantic Layer (P1):** Groq service layer with semantic schema understanding, natural-language query interpretation, semantic content pools, LRU caching, rate limiting, and offline heuristic fallback.
- [x] **Frontend Workspace Integration:** Bento showcase, Theme Slide 10 3-pane workspace, live SVG schema graph, and seamless API client communication.
- [x] **Quality Evaluation Dashboard (P1):** Interactive audit modal displaying 4 objective assessment dimensions with detailed diagnostic chips.
- [x] **Automated Test Coverage:** 31 automated test cases across health, engines, AI, document evaluation, and export pipelines passing with 100% success rate.
- [x] **Localhost Deployment:** Backend verified on `localhost:8000`, frontend built with `tsc -b && vite build` in 885ms with zero compilation errors.

## 13. Master Execution Rules

Rule 1 — Documentation Before Development

No development agent should invent requirements that are absent from the approved documentation.

Rule 2 — Quality Before Breadth

A smaller number of highly reliable capabilities is preferable to a broad set of unreliable generators.

Rule 3 — AI Is Selective

Use AI where semantic reasoning adds value. Do not use an LLM as a row-by-row synthetic-data engine.

Rule 4 — Validate Before Export

Generated data must pass applicable validation/evaluation before being treated as an exportable result.

Rule 5 — Deterministic Business Logic

Arithmetic and strict business constraints should be handled by deterministic application logic rather than relying on LLM reasoning.

Rule 6 — Localhost First

The MVP must be independently usable locally. Cloud infrastructure is optional and comes later.

Rule 7 — No Premature Optimization Guarantees

Performance targets should be measured and optimized through profiling rather than assuming fixed latency guarantees.

Rule 8 — Human Approval Is a Hard Gate

The transition from documentation to implementation requires explicit team review.

Rule 9 — One Source of Truth

When implementation conflicts with approved documentation, stop and resolve the discrepancy rather than silently changing architecture or requirements.

## 14. Final Project Direction

                 HACKDATA V2
                      │
                      ▼
              Unified Workspace
                      │
                      ▼
             Schema / Data Input
                      │
                      ▼
                 DataProfile
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
       Tabular     Relational   Documents
       Engine       Engine       Engine
          │           │           │
          └───────────┼───────────┘
                      ▼
             Validation Layer
                      │
                      ▼
             Quality Evaluation
                      │
                ┌─────┴─────┐
                ▼           ▼
              PASS         FAIL
                │           │
                ▼           ▼
             Export     Regenerate

The central objective is not simply to generate synthetic data. It is to generate synthetic data that is structurally valid, statistically meaningful, privacy-aware, business-consistent, and demonstrably useful.
