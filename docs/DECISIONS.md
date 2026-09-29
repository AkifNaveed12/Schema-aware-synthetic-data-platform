# HACKDATA V2 — ARCHITECTURE DECISIONS & LOG (ADR)

> **Project:** HackData V2  
> **Purpose:** Record important architectural, technical, and implementation decisions.  
> **Status:** Finalized Pre-Development Decision Log

---

## 1. Decision Classification

### 1.1 Theme-Mandated

Decisions directly supported by the official HackData V2 theme material.

These should not be changed unless the team determines that the implementation still satisfies the official requirement through an equivalent approach.

### 1.2 Engineering Selection

Technical decisions selected by the team to satisfy the requirements.

These may be changed if a better implementation is identified without violating the approved requirements.

### 1.3 Team Decision

Decisions made by Akif, Haroon, and Hamza based on implementation constraints, available time, reliability, and hackathon strategy.

---

# 2. Architecture Decision Records

## ADR-01 — Python / FastAPI Backend

### Category

Engineering Selection

### Status

**APPROVED**

### Decision

Use Python with FastAPI as the primary backend framework.

### Rationale

Python provides the required ecosystem for:

- NumPy
- Pandas
- SciPy
- Faker
- Statistical analysis
- Synthetic-data generation
- Machine-learning utilities
- AI integrations

FastAPI provides:

- Request validation through Pydantic
- OpenAPI documentation
- Asynchronous HTTP support
- Clean API routing
- Good separation between API and generation services

### Alternative Considered

Node.js/Express.

### Decision Reason

Python is better aligned with the statistical, synthetic-data, and AI workloads required by HackData V2.

---

## ADR-02 — React / Next.js Frontend

### Category

Engineering Selection

### Status

**APPROVED**

### Decision

Use the team's selected React/Next.js frontend stack with TypeScript.

### Rationale

The frontend requires:

- Interactive configuration
- Live previews
- API integration
- Dynamic validation results
- Evaluation visualization
- Export controls

The exact component/layout implementation remains the frontend team's responsibility.

### Important Constraint

The architecture does **not** require a rigid hardcoded 3-pane implementation.

The official theme provides a workspace experience direction, while the final UI implementation is owned by Haroon and must remain consistent with the approved requirements.

---

## ADR-03 — Unified Workspace Experience

### Category

Theme-Derived Experience

### Status

**APPROVED**

### Decision

The application will provide a unified workspace supporting:

- Tabular data
- Relational data
- Documents

The workspace should allow users to:

1. Configure generation
2. Preview data
3. Inspect validation/evaluation
4. Regenerate when necessary
5. Export validated results

### Rationale

The official theme describes a single workspace covering the three core data types and a configure → preview → export experience.

The exact visual layout is intentionally left to the frontend implementation.

---

## ADR-04 — Schema-Aware Architecture

### Category

Theme-Derived Architecture

### Status

**LOCKED**

### Decision

HackData V2 will use a schema-aware generation pipeline.

The system must understand:

- Schema
- Column types
- Semantic types
- Relationships
- Constraints
- Relevant distributions
- Privacy configuration

before generating the final synthetic dataset.

### Rationale

The official theme explicitly describes a schema-aware approach rather than random data generation.

---

## ADR-05 — DataProfile as the Central Representation

### Category

Engineering Selection

### Status

**LOCKED**

### Decision

Introduce a normalized `DataProfile` between schema understanding and generation.

```text
Input
  ↓
Schema Understanding
  ↓
DataProfile
  ↓
Generation Engine
```

# HACKDATA V2 — ARCHITECTURE DECISIONS & LOG (ADR)

> **Project:** HackData V2  
> **Purpose:** Record important architectural, technical, and implementation decisions.  
> **Status:** Finalized Pre-Development Decision Log

---

## 1. Decision Classification

### 1.1 Theme-Mandated

Decisions directly supported by the official HackData V2 theme material.

These should not be changed unless the team determines that the implementation still satisfies the official requirement through an equivalent approach.

### 1.2 Engineering Selection

Technical decisions selected by the team to satisfy the requirements.

These may be changed if a better implementation is identified without violating the approved requirements.

### 1.3 Team Decision

Decisions made by Akif, Haroon, and Hamza based on implementation constraints, available time, reliability, and hackathon strategy.

---

# 2. Architecture Decision Records

## ADR-01 — Python / FastAPI Backend

### Category

Engineering Selection

### Status

**APPROVED**

### Decision

Use Python with FastAPI as the primary backend framework.

### Rationale

Python provides the required ecosystem for:

- NumPy
- Pandas
- SciPy
- Faker
- Statistical analysis
- Synthetic-data generation
- Machine-learning utilities
- AI integrations

FastAPI provides:

- Request validation through Pydantic
- OpenAPI documentation
- Asynchronous HTTP support
- Clean API routing
- Good separation between API and generation services

### Alternative Considered

Node.js/Express.

### Decision Reason

Python is better aligned with the statistical, synthetic-data, and AI workloads required by HackData V2.

---

## ADR-02 — React / Next.js Frontend

### Category

Engineering Selection

### Status

**APPROVED**

### Decision

Use the team's selected React/Next.js frontend stack with TypeScript.

### Rationale

The frontend requires:

- Interactive configuration
- Live previews
- API integration
- Dynamic validation results
- Evaluation visualization
- Export controls

The exact component/layout implementation remains the frontend team's responsibility.

### Important Constraint

The architecture does **not** require a rigid hardcoded 3-pane implementation.

The official theme provides a workspace experience direction, while the final UI implementation is owned by Haroon and must remain consistent with the approved requirements.

---

## ADR-03 — Unified Workspace Experience

### Category

Theme-Derived Experience

### Status

**APPROVED**

### Decision

The application will provide a unified workspace supporting:

- Tabular data
- Relational data
- Documents

The workspace should allow users to:

1. Configure generation
2. Preview data
3. Inspect validation/evaluation
4. Regenerate when necessary
5. Export validated results

### Rationale

The official theme describes a single workspace covering the three core data types and a configure → preview → export experience.

The exact visual layout is intentionally left to the frontend implementation.

---

## ADR-04 — Schema-Aware Architecture

### Category

Theme-Derived Architecture

### Status

**LOCKED**

### Decision

HackData V2 will use a schema-aware generation pipeline.

The system must understand:

- Schema
- Column types
- Semantic types
- Relationships
- Constraints
- Relevant distributions
- Privacy configuration

before generating the final synthetic dataset.

### Rationale

The official theme explicitly describes a schema-aware approach rather than random data generation.

---

## ADR-05 — DataProfile as the Central Representation

### Category

Engineering Selection

### Status

**LOCKED**

### Decision

Introduce a normalized `DataProfile` between schema understanding and generation.

```text
Input
  ↓
Schema Understanding
  ↓
DataProfile
  ↓
Generation Engine
```

DataProfile Contains
Modality
Schema
Columns
Data types
Semantic types
Distributions
Relationships
Constraints
Privacy configuration
Generation configuration
Evaluation configuration
Rationale

A shared representation allows the three generation engines to consume the same normalized understanding of the input.

It also allows schema analysis to be cached and reused.

ADR-06 — Hybrid AI + Local Generation
Category

Engineering Selection

Status

LOCKED

Decision

Use AI for semantic intelligence while using local specialized engines for bulk synthetic-data generation.

AI
↓
Structured Generation Specification
↓
Local Generation Engine
↓
Bulk Synthetic Data
AI Responsibilities
Schema understanding
Semantic type inference
Natural-language query interpretation
Semantic content generation
Edge-case proposals
Local Engine Responsibilities
Bulk row generation
Statistical sampling
Relationship generation
Deterministic calculations
Validation
Privacy transformations
Critical Rule

The LLM must not generate synthetic rows one-by-one.

Rationale

Row-by-row LLM generation would introduce unnecessary:

Latency
API usage
Cost
Rate-limit pressure
Inconsistency
ADR-07 — Groq as Initial AI Provider
Category

Engineering Selection

Status

APPROVED

Decision

Use Groq as the initial external AI provider.

The provider must be accessed through an internal AI service abstraction.

Backend
↓
AI Service
↓
Groq
Rationale

The abstraction prevents generation engines from becoming tightly coupled to a provider.

It also allows future provider changes without rewriting the generation architecture.

Important Constraint

Groq credentials must remain server-side.

The frontend must never communicate directly with Groq.

ADR-08 — AI Request Optimization
Category

Engineering Selection

Status

LOCKED

Decision

The AI service must implement:

Response caching
Request deduplication where practical
Application-level rate limiting
Bounded retries
Exponential backoff
Token budgeting
Structured outputs
Usage tracking
Rationale

The hackathon requires fast and reliable AI-assisted functionality while avoiding unnecessary provider requests.

Core Principle
AI calls should be proportional to
semantic reasoning requirements,
not number of generated rows.
ADR-09 — Relational Generation Using Dependency Graphs
Category

Engineering Selection

Status

APPROVED

Decision

Represent relational dependencies as a directed graph and generate parent entities before dependent entities.

Example:

Customers
↓
Orders
↓
Order Items
Requirements

The relational engine must preserve:

Primary keys
Foreign keys
Cardinality
Parent-child relationships
Cross-table constraints
Rationale

Generation order must respect dependency relationships so that child records reference valid parent records.

ADR-10 — Deterministic Business Logic
Category

Engineering Selection

Status

LOCKED

Decision

Critical calculations must be performed by deterministic application logic rather than relying on LLM output.

Examples:

Invoice
line_amount = quantity × unit_price

subtotal = Σ(line_amount)

total = subtotal + tax - discount
Bank Statement
current_balance
=
previous_balance + credit - debit
Relational Data
order_total
=
Σ(order_item.amount)
Rationale

Financial and relational calculations require exact correctness.

ADR-11 — Validation Before Export
Category

Theme-Derived / Engineering Selection

Status

LOCKED

Decision

Generated data must pass mandatory validation before becoming exportable.

Generate
↓
Validate
↓
Evaluate
↓
PASS → Export

FAIL
↓
Regenerate
Validation Includes
Schema validation
Structural validation
Referential integrity
Business-rule validation
Mathematical validation
Statistical checks
Privacy checks where applicable
Rationale

The platform's output must be trustworthy rather than merely plausible.

ADR-12 — Quality Evaluation Layer
Category

Engineering Selection

Status

LOCKED

Decision

Synthetic data quality must be evaluated using multiple dimensions where applicable.

Evaluation Areas
Statistical fidelity
Structural fidelity
Business-rule fidelity
Privacy
Utility / TSTR where feasible
Rationale

Valid schema does not automatically mean high-quality synthetic data.

The evaluation layer provides measurable evidence of generation quality.

ADR-13 — Controlled Regeneration
Category

Engineering Selection

Status

APPROVED

Decision

Failed validation/evaluation may trigger controlled regeneration.

Generate
↓
Validate
↓
Evaluate
↓
FAIL
↓
Diagnose
↓
Adjust
↓
Regenerate
Constraints
Retry count must be bounded.
Infinite regeneration loops are prohibited.
Failure reasons should be preserved.
Successful validated generations should become exportable.
ADR-14 — Localhost-First MVP
Category

Team Decision

Status

LOCKED

Decision

The MVP will be developed and demonstrated primarily on localhost.

Frontend
↓
FastAPI
↓
Local Generation
↓
Local Validation / Evaluation
↓
Groq when AI reasoning is required
Rationale

Local-first execution provides:

Greater control
Easier debugging
Faster experimentation
Local compute availability
Lower deployment risk
No dependency on cloud hosting for the core MVP
Important Clarification

Localhost does not automatically make the generated data more accurate.

Accuracy comes from:

Generation algorithms
Schema understanding
Validation
Evaluation
Business-rule enforcement
ADR-15 — Optional Cloud Deployment
Category

Team Decision

Status

APPROVED — OPTIONAL

Decision

Cloud deployment will only be attempted after the localhost MVP is stable.

Potential deployment:

Frontend → Vercel
Backend → Render
Rationale

Deployment must not become a blocker for the core hackathon deliverable.

If deployment introduces instability or consumes excessive development time, the localhost MVP remains the primary deliverable.

ADR-16 — Optional Supabase Persistence
Category

Engineering Selection

Status

APPROVED — OPTIONAL

Decision

Supabase/PostgreSQL may be used for:

Saved schemas
Presets
Generation configurations
Optional application state
Constraint

Core synthetic-data generation must not depend on Supabase.

The platform must remain capable of running locally without cloud database dependency.

ADR-17 — Asynchronous Jobs for Heavy Workloads
Category

Engineering Selection

Status

APPROVED

Decision

Large generation, evaluation, and export workloads should use background jobs instead of blocking HTTP requests.

POST /generate/.../jobs
↓
job_id
↓
GET /jobs/{job_id}
Suitable Workloads
Large tabular datasets
Large relational datasets
Bulk document generation
Expensive evaluation
Large exports
Rationale

Long-running generation should not keep a FastAPI request open unnecessarily.

ADR-18 — Preview Is a Separate Lightweight Operation
Category

Engineering Selection

Status

APPROVED

Decision

Preview generation must use a small representative dataset.

Preview should:

Be fast
Avoid full generation
Avoid unnecessary AI calls
Reuse cached schema understanding
Avoid repeated expensive operations
Constraint

No fixed <200ms guarantee is treated as an architectural requirement.

Actual performance targets will be established through benchmarking.

ADR-19 — Privacy Architecture
Category

Theme-Derived / Engineering Selection

Status

LOCKED

Decision

The system will support appropriate privacy mechanisms including:

Masking
Hashing
Synthetic replacement
Controlled numerical noise where applicable
Rationale

The official theme emphasizes privacy-safe synthetic data and column-level privacy controls.

Important Clarification

Specific privacy mechanisms must be applied according to data type and use case.

They must not be applied blindly when they would damage required relationships or statistical fidelity.

ADR-20 — Security Boundary
Category

Engineering Selection

Status

LOCKED

Decision

All external provider credentials and sensitive configuration remain backend-only.

The system must:

Validate inputs
Restrict file sizes
Validate file types
Prevent arbitrary filesystem access
Hide stack traces
Protect API credentials
Avoid unnecessary external transmission of source data

## 3. Human Review Items

The previous human-review items are now resolved unless explicitly reopened by the team.

HR-01 — AI Provider
Decision

RESOLVED — GROQ

Groq is the initial AI provider.

Provider-specific logic must remain behind the AI service abstraction.

HR-02 — SQL Export
Decision

RESOLVED — PostgreSQL-Compatible SQL

PostgreSQL-compatible SQL export is the initial relational SQL export target.

Additional dialects are optional and should not block MVP completion.

HR-03 — Preview / Generation Limits
Decision

RESOLVED — Configurable Limits

Preview and generation limits must be configurable.

The implementation should establish practical limits based on:

Dataset size
Available memory
Generation latency
Frontend rendering capability
Hackathon demonstration requirements

No arbitrary fixed 10,000-row or <200ms architectural guarantee is required.

## 4. Decisions Explicitly Rejected

4.1 Row-by-Row LLM Generation

Rejected.

Reason:

Excessive API usage
Slow generation
Rate-limit risk
Increased inconsistency
Poor scalability
4.2 Direct Frontend-to-Groq Communication

Rejected.

Reason:

API key exposure
No centralized rate limiting
No centralized caching
No controlled retries
Poor security boundary
4.3 Cloud-Dependent MVP

Rejected.

Reason:

Deployment risk
Network dependency
Resource constraints
Unnecessary complexity during the core build
4.4 Export-Triggered Regeneration

Rejected.

Export must operate on an existing validated generation.

The system must not silently generate a different dataset when the user clicks Export.

4.5 Feature Breadth at the Expense of Fidelity

Rejected.

Additional modalities must not be added if they materially reduce the quality of the core synthetic-data pipeline.

## 5. Decision Change Policy

An approved decision may be changed only when:

The reason for change is documented.
The impact on requirements is understood.
The impact on architecture is understood.
The relevant documentation is updated.
The team agrees before implementation proceeds.

Major architectural changes must be reflected in:

REQUIREMENTS.md
ARCHITECTURE.md
API-CONTRACT.md
TASK-BREAKDOWN.md
MASTER-PLAN.md

where applicable.

## 6. Final Architectural Direction

The current approved direction is:

                    USER
                      ↓
                  FRONTEND
                      ↓
                  FASTAPI
                      ↓
              SCHEMA UNDERSTANDING
                      ↓
                 DataProfile
                      ↓
       ┌──────────────┼──────────────┐
       ↓              ↓              ↓
    TABULAR       RELATIONAL      DOCUMENT
     ENGINE          ENGINE          ENGINE
       └──────────────┼──────────────┘
                      ↓
                 VALIDATION
                      ↓
                 EVALUATION
                      ↓
                ┌─────┴─────┐
                ↓           ↓
              PASS         FAIL
                ↓           ↓
             EXPORT     REGENERATE

AI operates as a controlled intelligence layer across the pipeline:

             AI SERVICE
                 ↓
        ┌────────┼────────┐
        ↓        ↓        ↓
     Schema   Semantic   Query/

Understanding Content Reasoning
↓ ↓ ↓
DataProfile /
Generation Rules

The core principle is:

Use AI for intelligence, specialized engines for generation, deterministic logic for correctness, and validation/evaluation for trust.
