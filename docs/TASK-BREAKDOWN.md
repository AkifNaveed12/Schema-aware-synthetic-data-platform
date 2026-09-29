# HACKDATA V2 — TASK BREAKDOWN & WORK BREAKDOWN STRUCTURE (WBS)

> **Project:** HackData V2  
> **Execution Model:** Dependency-aware, quality-first, localhost-first implementation plan  
> **Priority:** P0 (Mandatory MVP) · P1 (Core Quality) · P2 (Enhancement) · P3 (Differentiator) · P4 (Experimental)  
> **Primary Goal:** Deliver a reliable end-to-end synthetic-data platform within the hackathon timeframe.  
> **Status:** Finalized Execution Plan — Ready for Development

---

# 1. Execution Philosophy

HackData V2 must be implemented as a complete synthetic-data pipeline rather than as a collection of disconnected generators.

The core execution flow is:

```text
INPUT
  ↓
SCHEMA / DATA UNDERSTANDING
  ↓
DataProfile
  ↓
SPECIALIZED GENERATION ENGINE
  ├── Tabular
  ├── Relational
  └── Document
  ↓
VALIDATION
  ↓
QUALITY EVALUATION
  ├── Statistical
  ├── Structural
  ├── Privacy
  ├── Business Rules
  └── Utility where feasible
  ↓
PASS / FAIL
  ├── PASS → EXPORT
  └── FAIL → CONTROLLED REGENERATIONS
```

Feature breadth must never be allowed to reduce the quality of the core generators.

## 2. Team Ownership

2.1 Akif — Project Lead / Architect / Backend / AI / Integration / Deployment

Akif owns:

Overall project architecture
Requirements interpretation
Backend architecture
API implementation
DataProfile
Schema understanding
Tabular generation
Relational generation
Document generation
AI/Groq integration
LLM optimization
Validation architecture
Evaluation architecture
Backend/frontend integration
Integration coordination
Deployment preparation
Final technical decisions
2.2 Haroon — Frontend Engineer

Haroon owns:

Frontend application
Workspace UI
Tabular interface
Relational interface
Document interface
Configuration controls
Preview experience
Validation/evaluation visualization
Export UX
Responsive behavior
Frontend API integration

The official theme's workspace direction should be respected, but the frontend is not required to mechanically reproduce a fixed CSS layout.

2.3 Hamza — QA / Security / Integration Verification

Hamza owns:

Formal QA
Security verification
API contract verification
Integration testing
Data integrity testing
Privacy verification
Regression testing
Failure-path testing
Final acceptance verification
Demo stability verification

All team members continue testing their own work continuously.

## 3. Development Strategy

3.1 Localhost First

The MVP must run locally.

Primary environment:

Frontend
↓
FastAPI
↓
Generation / Validation / Evaluation
↓
Local Compute
↓
Groq only when AI reasoning is required

Cloud deployment is not an MVP dependency.

Vercel and Render deployment may be performed after the local MVP is stable and only if time permits.

3.2 AI Is Not the Bulk Generator

LLMs must not generate synthetic rows one-by-one.

Instead:

Schema / Request
↓
AI / Rules
↓
Structured DataProfile
↓
Local Generation Engine
↓
Bulk Synthetic Data

LLMs are primarily responsible for:

Schema understanding
Semantic type inference
Natural-language query interpretation
Semantic content
Edge-case proposals
Document semantics

Deterministic/statistical engines handle bulk generation.

3.3 Quality Gate

No major feature is considered complete until:

IMPLEMENT
↓
LOCAL TEST
↓
VALIDATE
↓
INTEGRATE
↓
QA

A feature that works visually but produces invalid synthetic data is not considered complete.

## 4. Dependency-Aware Milestone Roadmap

Important:

Phases may overlap where dependencies permit.

The roadmap is dependency-aware, not a requirement that every teammate remain idle until the previous phase is completely finished.

## 5. PHASE 0 — FOUNDATION & CONTRACTS

Objective

Establish the project structure, API contracts, shared models, configuration, and development environment before implementing complex generation logic.

T-P0-001 — Backend Foundation

Owner: Akif — Backend

Set up:

FastAPI
Uvicorn
Pydantic
NumPy
Pandas
SciPy where required
Faker
Statistical/synthetic-data dependencies selected during implementation
PDF/document generation dependencies where required
HTTP client for Groq
Testing framework
Acceptance Criteria
Backend starts successfully.
/api/v1/health returns 200.
Configuration is environment-driven.
Secrets are not hardcoded.
T-P0-002 — Frontend Foundation

Owner: Haroon — Frontend

Set up the selected React/Next.js frontend stack according to the team's approved implementation.

Acceptance Criteria
Frontend starts locally.
API base URL is configurable.
No secrets are exposed to browser code.
Basic application shell renders successfully.
T-P0-003 — API Contract Implementation

Owner: Akif — Backend / Architect

Implement the core Pydantic request/response models from API-CONTRACT.md.

Acceptance Criteria
API schemas are validated automatically.
OpenAPI documentation is generated.
Error envelope is standardized.
Request IDs are supported.
T-P0-004 — DataProfile Model

Owner: Akif — Architect / Backend / AI

Implement the central DataProfile structure.

It must represent:

modality
schema
columns
semantic types
formats
distributions
relationships
constraints
privacy configuration
generation configuration
evaluation configuration
Acceptance Criteria
DataProfile can be serialized/deserialized.
Generation engines can consume it.
Validation can consume it.
AI/schema inference can produce it.
T-P0-005 — Configuration & Environment Management

Owner: Akif

Configure:

Environment variables
Groq API configuration
Backend settings
CORS
Logging
File limits
Generation limits
Rate limits
Cache settings
Acceptance Criteria
.env is never committed.
Secrets are backend-only.
Configuration works locally without code changes.
T-P0-006 — Frontend API Client

Owner: Haroon

Create a centralized frontend API client for communication with FastAPI.

Acceptance Criteria
No scattered raw API calls.
API errors are handled consistently.
Loading/error/success states are available.
T-P0-007 — Initial Integration Verification

Owner: Hamza — QA / Integration

Verify:

Frontend starts.
Backend starts.
Frontend can call /health.
CORS works.
API error structure is correct.
Acceptance Criteria

Basic frontend → backend communication passes.

## 6. PHASE 1 — CORE SYNTHETIC DATA PIPELINE

Objective

Build the actual synthetic-data generation pipeline before polishing advanced AI features.

6.1 Tabular Engine
T-P1-001 — Tabular Data Profiling

Owner: Akif

Implement profiling for:

Numeric columns
Categorical columns
String columns
Date/time columns
Missingness
Ranges
Basic distributions
Correlations where practical
Semantic hints
Acceptance Criteria

A representative dataset produces a usable DataProfile.

T-P1-002 — Tabular Generator

Owner: Akif

Implement an appropriate statistical/synthetic generation strategy.

The implementation must support relevant characteristics such as:

Numeric distributions
Categorical distributions
Missing values
Outliers
Semantic fields
Random seeds

The generator must not be hardcoded to one algorithm for every dataset.

Acceptance Criteria
Generated rows match expected schema.
Seeded generation is reproducible.
Generated values remain within configured constraints.
Statistical similarity can be measured.
T-P1-003 — Tabular Validation

Owner: Akif

Implement:

Schema validation
Data-type validation
Missingness checks
Distribution checks
Range checks
Outlier checks
Privacy checks where applicable
Acceptance Criteria

Invalid generated data is detected before export.

T-P1-004 — Tabular API

Owner: Akif

Implement:

POST /api/v1/schema/infer
POST /api/v1/generate/tabular
POST /api/v1/generate/tabular/jobs
GET /api/v1/profiles/{profile_id}
Acceptance Criteria

Frontend can request tabular preview and full generation.

6.2 Relational Engine
T-P1-005 — Relational Schema Model

Owner: Akif

Implement representation of:

Tables
Primary keys
Foreign keys
Relationships
Cardinalities
Constraints
Acceptance Criteria

The relational schema can be represented inside DataProfile.

T-P1-006 — Dependency-Aware Relational Generator

Owner: Akif

Implement dependency-ordered generation:

Parent Tables
↓
Child Tables
↓
Nested / Junction Tables

Example:

Customers
↓
Orders
↓
Order Items
Acceptance Criteria
No invalid foreign keys.
No unintended orphan records.
Parent records exist before children.
Seeded generation is reproducible.
T-P1-007 — Relationship Cardinality

Owner: Akif

Implement configurable:

1:1
1:N

Support N:N through junction tables where feasible.

Acceptance Criteria

Generated relationship counts follow the configured profile.

T-P1-008 — Cross-Table Business Rules

Owner: Akif

Implement deterministic cross-table rules.

Example:

# Order.total_amount

SUM(OrderItem.quantity × OrderItem.unit_price)
Acceptance Criteria

Zero arithmetic discrepancies in successfully validated output.

T-P1-009 — Relational Validation

Owner: Akif + Hamza

Validate:

Primary-key uniqueness
Foreign-key integrity
Cardinality
Orphan detection
Cross-table calculations
Schema consistency
Acceptance Criteria

Automated tests detect intentionally injected relational failures.

T-P1-010 — Relational API

Owner: Akif

Implement:

POST /api/v1/generate/relational
POST /api/v1/generate/relational/jobs
Acceptance Criteria

Relational generation works through the documented API.

6.3 Document Engine
T-P1-011 — Invoice Generator

Owner: Akif

Implement deterministic invoice generation containing:

Invoice number
Seller
Buyer
Date
Due date
Line items
Quantity
Unit price
Subtotal
Tax
Total
Acceptance Criteria

Every generated invoice passes arithmetic validation.

T-P1-012 — Invoice Validator

Owner: Akif + Hamza

Validate:

quantity × unit_price
subtotal
tax
discount
total
Acceptance Criteria

Zero calculation discrepancy for validated invoices.

T-P1-013 — Bank Statement Generator

Owner: Akif

Implement:

Account metadata
Transaction dates
Merchant descriptions
Debits
Credits
Running balances
Starting balance
Ending balance
Acceptance Criteria

Every balance satisfies:

# current_balance

previous_balance

- credit

* debit
  T-P1-014 — Bank Statement Validator

Owner: Akif + Hamza

Validate:

Chronological ordering
Running balances
Transaction values
Starting/ending balance consistency
Acceptance Criteria

Injected arithmetic errors are detected automatically.

T-P1-015 — Document API

Owner: Akif

Implement:

POST /api/v1/generate/documents/invoice
POST /api/v1/generate/documents/bank-statement
Acceptance Criteria

Both document types can be generated and validated through the API.

## 7. PHASE 2 — AI INTELLIGENCE & API OPTIMIZATION

Objective

Integrate AI where it provides genuine value without making the platform dependent on expensive row-by-row LLM generation.

7.1 Groq AI Service
T-P2-001 — AI Service Abstraction

Owner: Akif — AI Engineer

Create a dedicated AI service layer.

Responsibilities:

Model Selection
Prompt Construction
Structured Output
Caching
Rate Limiting
Retry / Backoff
Token Budget
Usage Tracking
Error Handling
Acceptance Criteria

Generation engines never directly contain provider-specific Groq logic.

T-P2-002 — Groq Integration

Owner: Akif

Integrate the configured Groq API.

Model selection must be configuration-driven.

Acceptance Criteria
API key loaded from environment.
Provider errors are normalized.
Timeouts exist.
No credentials reach frontend code.
T-P2-003 — AI Schema Understanding

Owner: Akif

Implement AI-assisted interpretation of:

Semantic types
Formats
Relationships
Column meaning
Domain information

AI output must become structured DataProfile information.

Acceptance Criteria

Representative schemas can be semantically understood without manual mapping.

T-P2-004 — AI Semantic Content

Owner: Akif

Implement selective AI-assisted semantic generation for content such as:

Names
Addresses
Company names
Descriptions
Narrative text

Bulk numeric/structural generation remains local.

Acceptance Criteria

Generated semantic content is realistic without requiring an LLM call per row.

T-P2-005 — Natural Language Query Interpretation

Owner: Akif

Implement structured interpretation of requests such as:

"Generate a 90-day bank statement
with several high-value transactions."
Acceptance Criteria

Natural-language input is converted into deterministic generation configuration.

7.2 LLM Optimization
T-P2-006 — AI Response Cache

Owner: Akif

Implement caching for equivalent AI requests.

Cache candidates include:

Schema inference
Semantic classification
Query interpretation
Reusable semantic profiles
Acceptance Criteria

Repeated equivalent requests avoid unnecessary provider calls.

T-P2-007 — AI Rate Limiting

Owner: Akif

Implement application-level rate limiting.

Acceptance Criteria

Excessive AI requests return controlled 429 responses.

T-P2-008 — Retry / Exponential Backoff

Owner: Akif

Implement bounded retry handling for:

Rate limits
Timeouts
Temporary provider failures
Acceptance Criteria

No infinite retry loops.

T-P2-009 — AI Request Deduplication

Owner: Akif

Prevent duplicate simultaneous AI requests where practical.

Acceptance Criteria

Repeated identical in-flight requests are consolidated or served from cache.

T-P2-010 — AI Usage Monitoring

Owner: Akif

Track:

Request count
Cache hits
Cache misses
Retry count
Errors
Approximate token usage
Latency
Acceptance Criteria

The team can identify unnecessary AI usage during development/demo testing.

## 8. PHASE 3 — PRIVACY & QUALITY EVALUATION

Objective

Make synthetic data quality measurable rather than relying only on visual inspection.

T-P3-001 — Privacy Transformations

Owner: Akif

Implement supported privacy transformations:

Masking
Hashing
Synthetic replacement
Controlled numerical noise where correctly applicable
Acceptance Criteria

Privacy transformations work without unintentionally breaking required constraints.

T-P3-002 — Privacy Validation

Owner: Akif + Hamza

Check for:

Exact record overlap
Suspicious source-value reuse
Sensitive-value leakage
Identifier leakage
Acceptance Criteria

Known leakage scenarios are detected.

T-P3-003 — Statistical Fidelity Evaluation

Owner: Akif

Implement evaluation of applicable:

Numeric distributions
Categorical distributions
Correlations
Missingness
Ranges
Outliers
Acceptance Criteria

Evaluation produces structured metrics rather than only PASS/FAIL.

T-P3-004 — Structural Fidelity Evaluation

Owner: Akif

Evaluate:

Schema conformity
PK integrity
FK integrity
Cardinality
Relationships
Required fields
Acceptance Criteria

Structural failures are measurable and reportable.

T-P3-005 — Business Rule Evaluation

Owner: Akif

Evaluate:

Invoice arithmetic
Bank balances
Order totals
Configured constraints
Cross-table relationships
Acceptance Criteria

Business-rule failures are reported with diagnostics.

T-P3-006 — TSTR Utility Evaluation

Owner: Akif

Where feasible, implement:

Train on Synthetic
↓
Model
↓
Test on Real
Acceptance Criteria

The system can report task-appropriate utility metrics when a valid evaluation dataset is supplied.

This remains optional if time/data constraints prevent reliable implementation.

T-P3-007 — Generate → Validate → Evaluate → Regenerate

Owner: Akif

Implement the controlled quality loop:

Generate
↓
Validate
↓
Evaluate
↓
PASS ─────→ Export
│
FAIL
↓
Adjust
↓
Regenerate
Acceptance Criteria
Mandatory validation occurs before export.
Failed outputs are clearly identified.
Regeneration is bounded.
Infinite retry loops are impossible.

## 9. PHASE 4 — FRONTEND WORKSPACE

Frontend development may proceed in parallel with backend work once the API contract and basic mock responses are available.

T-P4-001 — Unified Workspace

Owner: Haroon

Implement the unified workspace supporting:

Tabular
Relational
Documents

The exact visual layout remains under frontend ownership.

Acceptance Criteria

Users can navigate between all core modalities without leaving the main application workflow.

T-P4-002 — Tabular Configuration UI

Owner: Haroon

Provide controls for applicable:

Row count
Random seed
Locale
Null rate
Outlier rate
Privacy settings
Acceptance Criteria

Controls map correctly to backend API configuration.

T-P4-003 — Relational Configuration UI

Owner: Haroon

Provide controls for:

Schema selection
Table configuration
Cardinality
Row counts
Seed
Relevant constraints
Acceptance Criteria

Relational configuration produces correct API requests.

T-P4-004 — Document Configuration UI

Owner: Haroon

Provide interfaces for:

Invoice generation
Bank statement generation
Locale
Currency
Transaction count
Date range
Relevant document settings
Acceptance Criteria

Document configuration produces valid backend requests.

T-P4-005 — Live Preview

Owner: Haroon

Implement lightweight preview rendering.

Preview must use small datasets rather than regenerating full workloads.

Acceptance Criteria

Preview updates without unnecessary API/LLM calls.

T-P4-006 — Validation & Evaluation Dashboard

Owner: Haroon

Display:

Validation status
Statistical metrics
Structural checks
Privacy checks
Business-rule checks
Utility results where available
Failure diagnostics
Acceptance Criteria

Users can understand why a generation passed or failed.

T-P4-007 — Export UX

Owner: Haroon

Implement export controls for supported formats.

Acceptance Criteria

Export uses the existing validated generation rather than triggering unnecessary regeneration.

## 10. PHASE 5 — FRONTEND / BACKEND INTEGRATION

T-P5-001 — API Integration

Owner: Akif + Haroon

Connect frontend workflows to:

Schema inference
Generation
Jobs
Validation
Evaluation
Regeneration
Export
Acceptance Criteria

No critical workflow relies on mock data.

T-P5-002 — Loading & Error States

Owner: Haroon

Implement:

Loading states
Job progress
Empty states
API errors
Validation failures
Retry actions
Acceptance Criteria

Backend failures do not leave the UI in an inconsistent state.

T-P5-003 — Integration Verification

Owner: Hamza

Verify complete frontend → API → engine → validation → frontend flows.

Acceptance Criteria

Core workflows operate correctly without manual backend intervention.

## 11. PHASE 6 — QA, SECURITY & HARDENING

Objective

Stabilize the complete system before any optional deployment.

T-P6-001 — Unit Test Suite

Owner: Akif + Hamza

Test:

Generators
Validators
DataProfile
Business rules
Privacy transformations
AI service
API schemas
Acceptance Criteria

Critical P0 components have automated tests.

T-P6-002 — Tabular Integrity Testing

Owner: Hamza

Test across multiple seeds and configurations.

Verify:

Schema validity
Reproducibility
Distributions
Null rates
Outliers
Privacy behavior
T-P6-003 — Relational Integrity Testing

Owner: Hamza

Verify:

PK uniqueness
FK integrity
Cardinality
No orphan records
Cross-table calculations
Acceptance Criteria

Intentional corruption is detected.

T-P6-004 — Document Integrity Testing

Owner: Hamza

Test:

Invoice arithmetic
Tax calculations
Running balances
Date ordering
Document rendering
Export correctness
T-P6-005 — API Contract Testing

Owner: Hamza

Verify:

Request validation
Response schemas
Error codes
HTTP status codes
Job states
Rate limits
T-P6-006 — Security Testing

Owner: Hamza

Verify:

Secrets are not exposed
Frontend cannot access provider credentials
Invalid uploads are rejected
Oversized uploads are rejected
Malformed input is rejected
Internal stack traces are not exposed
User-controlled paths cannot access arbitrary files
T-P6-007 — AI Failure Testing

Owner: Hamza + Akif

Simulate:

Groq timeout
Rate limit
Invalid response
Provider unavailable
Malformed structured output
Acceptance Criteria

The application fails gracefully and does not corrupt generation state.

T-P6-008 — Privacy Testing

Owner: Hamza

Verify:

No unintended source-value copying
Masking works
Hashing works
Sensitive fields are handled correctly
Large source datasets are not unnecessarily transmitted externally
T-P6-009 — Regression Testing

Owner: Hamza

Run the complete test suite after major integration changes.

Acceptance Criteria

No previously passing P0 workflow regresses.

## 12. PHASE 7 — PERFORMANCE & RELIABILITY

T-P7-001 — Preview Performance

Owner: Akif + Haroon

Optimize preview generation.

Focus on:

Small preview datasets
Caching
Debouncing
Avoiding duplicate requests
Avoiding unnecessary AI calls
T-P7-002 — Bulk Generation Performance

Owner: Akif

Optimize:

Vectorized generation
Batching
Memory usage
Local computation
Worker execution
T-P7-003 — API Reliability

Owner: Akif

Verify:

Timeouts
Retries
Rate limits
Error handling
Request IDs
Job state recovery
T-P7-004 — Resource Safety

Owner: Akif

Ensure large workloads do not unnecessarily exhaust:

RAM
CPU
GPU
Disk
API quota

## 13. PHASE 8 — OPTIONAL DEPLOYMENT

Deployment is not required for MVP completion.

It should only begin after the localhost MVP is stable.

T-P8-001 — Deployment Readiness

Owner: Akif

Verify:

Environment configuration
Production settings
CORS
Secrets
Build process
Backend startup
Frontend API configuration
T-P8-002 — Backend Deployment

Owner: Akif

Deploy FastAPI to Render only if:

Local MVP is stable.
Required resources are available.
Deployment does not jeopardize the demo.
Acceptance Criteria

Production health/readiness checks pass.

T-P8-003 — Frontend Deployment

Owner: Akif + Haroon

Deploy frontend to Vercel only if time permits.

Acceptance Criteria

Frontend connects to the deployed backend successfully.

T-P8-004 — Deployment Verification

Owner: Hamza

Verify:

API availability
CORS
Authentication/secrets
Generation
Export
Error handling

## 14. PHASE 9 — FINAL DEMO PREPARATION

T-P9-001 — Demo Scenario

Owner: Akif — Project Lead

Prepare the primary demonstration:

1. Input / schema
   ↓
2. Schema understanding
   ↓
3. DataProfile
   ↓
4. Tabular generation
   ↓
5. Relational generation
   ↓
6. Document generation
   ↓
7. Validation
   ↓
8. Quality evaluation
   ↓
9. Export
   T-P9-002 — Failure Demonstration

Owner: Akif + Hamza

Prepare at least one controlled example showing:

Generation
↓
Validation failure
↓
Diagnostic
↓
Regeneration
↓
Valid result

This demonstrates that the platform does not blindly export invalid data.

T-P9-003 — Final QA

Owner: Hamza

Run the complete P0 acceptance suite.

Acceptance Criteria

No known critical P0 defect remains.

T-P9-004 — Demo Rehearsal

Owner: Entire Team

Rehearse the complete demonstration.

Verify:

No missing environment variables
No broken API calls
No unexpected LLM failures
No invalid generated data
No broken exports
No frontend crashes

## 15. P0 MVP Definition

The MVP is complete only when the following works locally:

Schema / Sample Input
↓
Schema Understanding
↓
DataProfile
↓
Tabular / Relational / Document Generation
↓
Validation
↓
Quality Evaluation
↓
PASS
↓
Export

And when validation fails:

Generation
↓
Validation
↓
FAIL
↓
Diagnostic
↓
Controlled Regeneration
↓
Validation
↓
PASS

## 16. Mandatory P0 Capabilities

The following are mandatory:

FastAPI backend
Localhost execution
DataProfile
Schema/sample understanding
Tabular generation
Relational generation
Invoice generation
Bank statement generation
Primary/foreign key integrity
Business-rule validation
Statistical validation
Privacy-aware processing
Deterministic seeds
Configurable generation
Validation before export
CSV/JSON export
Relational export where implemented
Document export where implemented
Groq integration where AI reasoning is required
AI request caching
Rate limiting
Retry/backoff
Secure API key handling
Frontend/backend integration
Formal QA
Security verification

## 17. P1 Capabilities

After P0 stability:

Improved semantic synthesis
Natural-language query interpretation
Edge-case intelligence
Advanced statistical evaluation
TSTR utility evaluation
Advanced privacy evaluation
Regional document templates
Better regeneration diagnostics
Bulk document generation
Performance optimization
Advanced job progress UI

## 18. P2 / P3 / P4 Capabilities

Only after P0/P1 stability:

P2
Advanced query generation
Additional document types
Additional relational presets
Advanced export options
SQL preview
Additional evaluation metrics
P3
Advanced automatic generator selection
Advanced privacy mechanisms
Interactive relationship visualization
More sophisticated regeneration strategies
P4
Experimental autonomous generation
Advanced multi-agent generation
Additional modalities
Experimental AI features

These features must never compromise the core MVP.

### 19. Dependency Rules

The following dependencies are mandatory.

Rule 1

DataProfile must exist before advanced generation orchestration.

Rule 2

Core generation must exist before meaningful evaluation.

Rule 3

Validation must exist before export is considered production-ready.

Rule 4

AI must be abstracted through a service layer before extensive AI functionality is added.

Rule 5

Caching/rate limiting/retry must be part of the AI service rather than duplicated throughout the application.

Rule 6

Frontend integration should use the documented API contract rather than directly accessing engines.

Rule 7

Formal QA begins continuously but final QA occurs after complete integration.

Rule 8

Deployment is downstream of localhost stability.

## 20. Parallel Work Strategy

The team should maximize parallel development where dependencies permit.

Akif
├── Backend Foundation
├── DataProfile
├── Generation Engines
├── AI Service
├── Validation
├── Evaluation
└── Integration

Haroon
├── Frontend Foundation
├── Workspace
├── Configuration UI
├── Preview UI
├── Document UI
└── Evaluation/Export UI

Hamza
├── Early API Verification
├── Unit/Integration Test Design
├── Security Test Design
├── Data Integrity Tests
└── Continuous QA

Frontend does not need to wait for every backend feature.

Where an endpoint is not yet available, Haroon may use typed mocks based strictly on API-CONTRACT.md, then replace them with live API calls during integration.

## 21. Development Rules

Do not implement features outside the approved requirements without team approval.
Do not introduce a new modality at the expense of core fidelity.
Do not use LLMs for row-by-row bulk generation.
Do not expose Groq credentials to the frontend.
Do not bypass validation to make a demo appear successful.
Do not export an unvalidated generation.
Do not regenerate unnecessarily during preview or export.
Do not make deployment a blocker for MVP.
Do not add dependencies without evaluating their impact on the local environment.
Do not duplicate business logic between frontend and backend.
Do not hardcode API URLs or secrets.
Do not silently change the API contract.
Do not introduce infinite retries.
Do not allow failed jobs to appear successful.
Do not sacrifice data fidelity for superficial feature count.
Every P0 feature must have an acceptance criterion.
Every critical generation rule must have an automated test.
Every major integration must be verified by Hamza.
All teammates must test their own work continuously.
Documentation must remain synchronized with implementation.

## 22. Definition of Task Completion

A task is considered complete only when:

Implementation
↓
Local Testing
↓
Acceptance Criteria
↓
Integration
↓
Regression Check

For backend generation tasks:

Implementation
↓
Sample Generation
↓
Validation
↓
Automated Test
↓
Integration

For frontend tasks:

Implementation
↓
API Integration / Typed Mock
↓
Interaction Testing
↓
Responsive Testing
↓
Integration

For security tasks:

Threat / Failure Scenario
↓
Test
↓
Expected Safe Behavior
↓
Verification

## 23. Final Critical Path

The shortest critical path to a reliable MVP is:

Backend Foundation
↓
API Contracts
↓
DataProfile
↓
Tabular Engine
↓
Relational Engine
↓
Document Engines
↓
Validation
↓
Evaluation
↓
AI Service
↓
AI Schema / Semantic Layer
↓
Frontend Integration
↓
Privacy / Security
↓
Full QA
↓
Demo

Frontend development runs in parallel wherever possible.

## 24. Final MVP Architecture Flow

The completed system should execute:

                    USER
                      │
                      ▼
              ┌───────────────┐
              │    FRONTEND   │
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │   FASTAPI     │
              │   API LAYER   │
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │ ORCHESTRATOR  │
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │  DataProfile  │
              └───────┬───────┘
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
      TABULAR     RELATIONAL   DOCUMENT
       ENGINE       ENGINE       ENGINE
          │           │           │
          └───────────┼───────────┘
                      ▼
              ┌───────────────┐
              │  VALIDATION   │
              └───────┬───────┘
                      ▼
              ┌───────────────┐
              │  EVALUATION   │
              └───────┬───────┘
                      │
                ┌─────┴─────┐
                ▼           ▼
              PASS         FAIL
                │           │
                ▼           ▼
             EXPORT     REGENERATE

AI operates across the relevant stages:

              ┌─────────────────────┐
              │      AI SERVICE     │
              │                     │
              │ Schema Understanding│
              │ Semantic Synthesis  │
              │ Query Interpretation│
              │ Edge-Case Proposals │
              │                     │
              │ Cache               │
              │ Rate Limit          │
              │ Retry / Backoff     │
              │ Token Budget        │
              └──────────┬──────────┘
                         │
                         ▼
                       GROQ

## 25. Final Execution Principle

HackData V2 must be developed as:

A quality-first synthetic-data platform, not a feature-count competition.

The team must optimize for:

REALISTIC DATA +
CORRECT RELATIONSHIPS +
VALID BUSINESS LOGIC +
PRIVACY +
MEASURABLE QUALITY +
RELIABLE AI +
FAST LOCAL GENERATION +
CLEAN USER EXPERIENCE

The final development objective is:

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
REGENERATE IF REQUIRED
↓
EXPORT

Every task in this WBS exists to make that pipeline reliable.
