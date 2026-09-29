# HACKDATA V2 — DEPLOYMENT STRATEGY & RUNBOOK

> **Deployment Strategy:** Localhost-First MVP  
> **Primary Environment:** Local Development  
> **Cloud Deployment:** Optional — Deferred Until MVP Is Stable  
> **Status:** Baseline Deployment Plan  
> **Scope:** Development, local verification, optional future deployment

---

## 1. Deployment Philosophy

HackData V2 will follow a **localhost-first deployment strategy**.

The primary objective is to build, test, integrate, and demonstrate the complete synthetic-data platform locally before introducing cloud deployment complexity.

### 1.1 Current Deployment Principle

```text
Development
    ↓
Local Backend
    ↓
Local Frontend
    ↓
Local AI Service
    ↓
Local Validation / Evaluation
    ↓
Local Export
    ↓
QA
    ↓
Stable MVP
```

Cloud deployment is not part of the mandatory MVP path.

1.2 Why Localhost First

The localhost-first approach provides:

Faster development iteration
Easier debugging
Full control over the runtime environment
Easier experimentation with generation algorithms
No dependency on cloud deployment availability
No requirement to configure production infrastructure before the core system is stable

Important: Localhost is an execution/development strategy. It does not automatically guarantee better synthetic-data accuracy or quality.

## 2. Current Deployment Topology

The MVP deployment topology is intentionally simple:

                    USER
                     │
                     ▼
              Local Web Browser
                     │
                     ▼
          ┌─────────────────────┐
          │ Frontend Application│
          │ React / Next.js     │
          │ localhost:3000      │
          └──────────┬──────────┘
                     │
                     │ HTTP / JSON
                     ▼
          ┌─────────────────────┐
          │ FastAPI Backend     │
          │ localhost:8000      │
          └──────────┬──────────┘
                     │
          ┌──────────┼───────────┐
          ▼          ▼           ▼
      Tabular    Relational   Document
       Engine      Engine      Engine
          │          │           │
          └──────────┼───────────┘
                     ▼
              Validation Layer
                     │
                     ▼
             Evaluation Layer
                     │
                     ▼
               Export Layer

                     │
                     ▼
                AI Service
                  (Groq)

2.1 MVP Components
Component MVP Environment Responsibility
Frontend Localhost Unified workspace and user interaction
Backend Localhost API, orchestration, generation pipeline
AI Layer Backend → Groq Schema understanding, semantic synthesis, edge-case specification
Tabular Engine Local Bulk tabular generation
Relational Engine Local Multi-table generation and relationship preservation
Document Engine Local Invoice and bank-statement generation
Validation Local Structural and business-rule validation
Evaluation Local Statistical, privacy, structural, and utility evaluation
Export Local CSV, JSON, SQL/database-compatible and document output
Database Optional Used only where persistence is actually required

## 3. Local Development Environment

3.1 Frontend

Expected local frontend environment:

URL: http://localhost:3000

The frontend is responsible for:

Unified workspace
Data-type selection
Configuration
Preview
Generation controls
Validation/evaluation display
Export controls
3.2 Backend

Expected local backend environment:

URL: http://localhost:8000

The backend is responsible for:

API endpoints
Request validation
Schema processing
DataProfile
Generation orchestration
Validation
Evaluation
Regeneration
Export
AI-service communication
3.3 AI Provider

The initial AI provider is Groq.

The frontend must never directly expose the Groq API key.

Frontend
↓
FastAPI Backend
↓
AI Service
↓
Groq

AI credentials must remain in backend environment variables.

## 4. Environment Configuration

4.1 Backend Environment

Create a local environment file such as:

backend/.env

Example:

ENVIRONMENT=development
PORT=8000

GROQ_API_KEY=<your-local-groq-api-key>

ALLOWED_ORIGINS=http://localhost:3000

Additional variables should only be added when the corresponding service is actually used.

4.2 Frontend Environment

Example:

NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_ENV=development
4.3 Environment Rules
Never commit .env files containing secrets.
Keep API keys backend-only.
Use .env.example for documented variable names.
Do not hard-code provider credentials.
Development and future production configuration must remain separate.

## 5. Backend Local Setup

5.1 Create Virtual Environment
cd backend

python -m venv .venv
5.2 Activate Virtual Environment
.venv\Scripts\Activate.ps1
5.3 Install Dependencies
pip install -r requirements.txt
5.4 Start FastAPI
uvicorn app.main:app --reload --port 8000
5.5 Backend Verification

Verify:

http://localhost:8000/api/v1/health

The endpoint should return a successful health response according to the API contract.

## 6. Frontend Local Setup

6.1 Install Dependencies
cd frontend

npm install
6.2 Start Development Server
npm run dev
6.3 Frontend Verification

Open:

http://localhost:3000

Verify that:

The application loads.
The backend URL is correctly configured.
The workspace renders.
API requests reach the local FastAPI server.

## 7. Local Service Startup Order

Use the following startup order during development:

1. Backend
   ↓
2. AI configuration verification
   ↓
3. Frontend
   ↓
4. Browser verification
   ↓
5. Generation test
   ↓
6. Validation / Evaluation
   ↓
7. Export test
   7.1 Recommended Startup Checklist
   [ ] Backend virtual environment active
   [ ] Dependencies installed
   [ ] Local environment variables available
   [ ] Groq API configuration verified
   [ ] FastAPI running
   [ ] Health endpoint responding
   [ ] Frontend dependencies installed
   [ ] Frontend running
   [ ] Frontend can reach backend

## 8. Local API Verification

8.1 Health Check

Verify:

GET /api/v1/health

Expected:

HTTP 200
8.2 Schema Inference

Verify that a sample dataset/schema can be submitted and produces a valid DataProfile.

8.3 Tabular Generation

Verify:

POST /api/v1/generate/tabular

Check:

Request validation
Generation
Row count
Seed behavior
Privacy configuration
Validation result
8.4 Relational Generation

Verify:

POST /api/v1/generate/relational

Check:

Multiple tables
Primary keys
Foreign keys
Cardinalities
Cross-table consistency
8.5 Document Generation

Verify:

POST /api/v1/generate/documents/invoice
POST /api/v1/generate/documents/bank-statement

Check:

Document generation
Business calculations
Validation
Rendering/export

## 9. Local Generation Pipeline

Every generation workflow should follow:

User Configuration
↓
API Request
↓
Schema / Input Understanding
↓
DataProfile
↓
Generation Engine
↓
Validation
↓
Quality Evaluation
↓
┌──┴──┐
▼ ▼
PASS FAIL
│ │
▼ ▼
Export Regenerate
9.1 Export Rule

Only a validated generation should be exported.

Generate
↓
Validate
↓
Evaluate
↓
PASS
↓
Export

Export must not silently trigger a new generation.

## 10. Local QA Smoke Tests

Before considering the local MVP stable, perform the following checks.

10.1 Backend Health
GET /api/v1/health

Expected:

HTTP 200
10.2 Tabular Smoke Test

Generate a small dataset.

Verify:

Requested row count.
Expected columns.
Correct data types.
Seed behavior.
Validation result.
10.3 Relational Smoke Test

Generate:

Customers
↓
Orders
↓
Order Items

Verify:

No orphaned foreign keys.
Primary keys are valid.
Relationships are preserved.
Order totals reconcile with applicable line items.
10.4 Invoice Smoke Test

Generate an invoice.

Verify:

Line Items
↓
Subtotal
↓
Tax / Discount
↓
Total

The final calculation must reconcile according to the configured business rules.

10.5 Bank Statement Smoke Test

Generate a statement.

Verify:

Previous Balance +
Credits -
Debits
=
Current Balance

Verify this for every transaction.

10.6 Export Smoke Test

Test applicable:

CSV
JSON
SQL/database-compatible export
Document/PDF-style output

Verify that exported files can be opened/parsed successfully.

## 11. Local AI Service Verification

11.1 AI Responsibilities

Verify that Groq is used for semantic tasks such as:

Schema understanding
Semantic content synthesis
Edge-case specification
11.2 Bulk Generation Rule

The LLM should not be called once per generated row.

Expected architecture:

Sample / Schema
↓
Groq
↓
Structured Generation Specification
↓
Local Specialized Generator
↓
Bulk Synthetic Dataset
11.3 AI Reliability Checks

Verify:

Structured output handling
Retry behavior
Rate limiting
Token budgeting
Caching where appropriate
Error handling
Usage tracking

## 12. Local Performance Verification

Performance should be measured using realistic workloads.

12.1 Areas to Measure
Schema inference
Preview generation
Tabular generation
Relational generation
Document generation
Validation
Statistical evaluation
Export
AI response time
12.2 Preview Performance

Preview interactions should feel responsive.

Do not enforce an arbitrary universal <200ms architectural guarantee.

Instead:

Measure
↓
Identify Bottleneck
↓
Optimize
↓
Measure Again
12.3 Large Generation Jobs

Heavy generation/evaluation workloads should not unnecessarily block normal HTTP requests.

Where required, use the job architecture defined in API-CONTRACT.md:

Request
↓
Generation Job
↓
Background Processing
↓
Status
↓
Completed / Failed

## 13. Local Security Checklist

Before the MVP is considered stable:

Groq API key is not exposed to the frontend.
.env files are excluded from Git.
File uploads are validated.
Input size limits are enforced.
Export filenames are sanitized.
SQL generation is safely handled.
User-controlled paths cannot cause path traversal.
API errors do not expose secrets.
Logs do not unnecessarily expose sensitive source data.
CORS allows only intended development origins.

## 14. Optional Database Usage

Supabase/PostgreSQL is not required for every generation workflow.

Use persistence only where it provides a concrete benefit, such as:

Saved generation configurations
Saved schemas
Presets
User/session data
Generation metadata
Job state

Core synthetic-data generation should remain functional without unnecessary database dependency where practical.

## 15. Repository & Local Configuration

Recommended structure:

HackData-V2/
│
├── frontend/
│ ├── ...
│ ├── .env.local
│ └── package.json
│
├── backend/
│ ├── app/
│ ├── tests/
│ ├── .env
│ ├── .env.example
│ ├── requirements.txt
│ └── ...
│
├── docs/
│ ├── theme-source.md
│ ├── REQUIREMENTS.md
│ ├── UI-REQUIREMENTS.md
│ ├── ARCHITECTURE.md
│ ├── API-CONTRACT.md
│ ├── DESIGN.md
│ ├── TASK-BREAKDOWN.md
│ ├── TEST-PLAN.md
│ ├── DEPLOYMENT.md
│ ├── DECISIONS.md
│ └── MASTER-PLAN.md
│
└── README.md

## 16. Deployment Readiness Gate

Cloud deployment should not begin immediately.

The project must first satisfy the local MVP gate.

16.1 Local MVP Gate
[ ] Backend works locally
[ ] Frontend works locally
[ ] AI integration works
[ ] Tabular engine works
[ ] Relational engine works
[ ] Document engine works
[ ] Validation works
[ ] Evaluation works
[ ] Regeneration works
[ ] Export works
[ ] Integration tests pass
[ ] Critical security checks pass
[ ] Demo workflow works locally

Only after these conditions are satisfied should the team consider cloud deployment.

## 17. Future Cloud Deployment — Deferred

Cloud deployment is intentionally excluded from the current MVP execution path.

If the team later decides that deployment is useful or required, a dedicated deployment task/prompt should be created to address:

Frontend hosting
Backend hosting
Environment variables
CORS
Domain configuration
Database connectivity
Container deployment
Health checks
Production logging
Production smoke tests
Secrets management
Production verification

Possible future platforms may include:

Frontend → Vercel
Backend → Render
Database → Supabase / PostgreSQL

These are future options, not current MVP requirements.

## 18. Future Cloud Deployment Gate

When cloud deployment is eventually requested:

Stable Local MVP
↓
Human Approval
↓
Deployment Planning
↓
Cloud Configuration
↓
Staging Deployment
↓
Smoke Tests
↓
Production Deployment
↓
Production Verification

No production deployment should be performed simply because deployment tooling is available.

## 19. Rollback & Recovery — Local MVP

19.1 Application Failure

If a new change breaks the local application:

Stop the affected service.
Identify the failing change.
Revert or isolate the change.
Re-run the relevant tests.
Restart the local services.
Verify the critical workflow again.
19.2 Generation Failure

A failed generation must remain distinguishable from a validated generation.

Generation
↓
Validation
↓
FAIL
↓
Regeneration / Error

It must not be treated as successfully generated data.

## 20. Final Local Verification Checklist

Backend
FastAPI starts successfully.
Health endpoint works.
API contract is implemented.
Generation endpoints work.
Validation works.
Evaluation works.
Regeneration works.
Export works.
AI
Groq connection works.
API key remains backend-only.
Structured AI responses work.
Retry/rate-limit handling works.
Token usage is controlled.
Frontend
Next.js application starts.
Unified workspace loads.
Tabular workflow works.
Relational workflow works.
Document workflow works.
Preview works.
Configuration works.
Validation/evaluation results are visible.
Export works.
Data Quality
Statistical checks pass.
PK/FK integrity passes.
Cardinality checks pass.
Business rules pass.
Invoice totals reconcile.
Bank balances reconcile.
Privacy checks pass.
Security
Secrets are protected.
Input validation works.
File handling is safe.
Export paths are sanitized.
CORS is correctly configured.
Demo
Complete workflow works locally.
Demo dataset is prepared.
Core features are stable.
Failure recovery is understood.
No cloud dependency exists for the MVP demo.

## 21. Final Deployment Strategy

The approved deployment strategy for the current HackData V2 phase is:

                    HACKDATA V2 MVP
                           │
                           ▼
                    LOCALHOST FIRST
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
       Next.js Frontend           FastAPI Backend
       localhost:3000             localhost:8000
                                        │
                              ┌─────────┼─────────┐
                              ▼         ▼         ▼
                           Tabular  Relational  Documents
                              │         │         │
                              └─────────┼─────────┘
                                        ▼
                                  Validation
                                        ▼
                                   Evaluation
                                        ▼
                                  Export / Retry
                                        │
                                        ▼
                                      Demo

Current Rule

Build, integrate, test, validate, and demonstrate locally first.

Deferred Rule

Only after the local MVP is stable should the team consider a separate cloud-deployment workflow.

Cloud deployment is not part of the mandatory MVP path.

1.2 Why Localhost First

The localhost-first approach provides:

Faster development iteration
Easier debugging
Full control over the runtime environment
Easier experimentation with generation algorithms
No dependency on cloud deployment availability
No requirement to configure production infrastructure before the core system is stable

Important: Localhost is an execution/development strategy. It does not automatically guarantee better synthetic-data accuracy or quality.

## 2. Current Deployment Topology

The MVP deployment topology is intentionally simple:

                    USER
                     │
                     ▼
              Local Web Browser
                     │
                     ▼
          ┌─────────────────────┐
          │ Frontend Application│
          │ React / Next.js     │
          │ localhost:3000      │
          └──────────┬──────────┘
                     │
                     │ HTTP / JSON
                     ▼
          ┌─────────────────────┐
          │ FastAPI Backend     │
          │ localhost:8000      │
          └──────────┬──────────┘
                     │
          ┌──────────┼───────────┐
          ▼          ▼           ▼
      Tabular    Relational   Document
       Engine      Engine      Engine
          │          │           │
          └──────────┼───────────┘
                     ▼
              Validation Layer
                     │
                     ▼
             Evaluation Layer
                     │
                     ▼
               Export Layer

                     │
                     ▼
                AI Service
                  (Groq)

2.1 MVP Components
Component MVP Environment Responsibility
Frontend Localhost Unified workspace and user interaction
Backend Localhost API, orchestration, generation pipeline
AI Layer Backend → Groq Schema understanding, semantic synthesis, edge-case specification
Tabular Engine Local Bulk tabular generation
Relational Engine Local Multi-table generation and relationship preservation
Document Engine Local Invoice and bank-statement generation
Validation Local Structural and business-rule validation
Evaluation Local Statistical, privacy, structural, and utility evaluation
Export Local CSV, JSON, SQL/database-compatible and document output
Database Optional Used only where persistence is actually required

## 3. Local Development Environment

3.1 Frontend

Expected local frontend environment:

URL: http://localhost:3000

The frontend is responsible for:

Unified workspace
Data-type selection
Configuration
Preview
Generation controls
Validation/evaluation display
Export controls
3.2 Backend

Expected local backend environment:

URL: http://localhost:8000

The backend is responsible for:

API endpoints
Request validation
Schema processing
DataProfile
Generation orchestration
Validation
Evaluation
Regeneration
Export
AI-service communication
3.3 AI Provider

The initial AI provider is Groq.

The frontend must never directly expose the Groq API key.

Frontend
↓
FastAPI Backend
↓
AI Service
↓
Groq

AI credentials must remain in backend environment variables.

## 4. Environment Configuration

4.1 Backend Environment

Create a local environment file such as:

backend/.env

Example:

ENVIRONMENT=development
PORT=8000

GROQ_API_KEY=<your-local-groq-api-key>

ALLOWED_ORIGINS=http://localhost:3000

Additional variables should only be added when the corresponding service is actually used.

4.2 Frontend Environment

Example:

NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_ENV=development
4.3 Environment Rules
Never commit .env files containing secrets.
Keep API keys backend-only.
Use .env.example for documented variable names.
Do not hard-code provider credentials.
Development and future production configuration must remain separate.

## 5. Backend Local Setup

5.1 Create Virtual Environment
cd backend

python -m venv .venv
5.2 Activate Virtual Environment
.venv\Scripts\Activate.ps1
5.3 Install Dependencies
pip install -r requirements.txt
5.4 Start FastAPI
uvicorn app.main:app --reload --port 8000
5.5 Backend Verification

Verify:

http://localhost:8000/api/v1/health

The endpoint should return a successful health response according to the API contract.

## 6. Frontend Local Setup

6.1 Install Dependencies
cd frontend

npm install
6.2 Start Development Server
npm run dev
6.3 Frontend Verification

Open:

http://localhost:3000

Verify that:

The application loads.
The backend URL is correctly configured.
The workspace renders.
API requests reach the local FastAPI server.

## 7. Local Service Startup Order

Use the following startup order during development:

1. Backend
   ↓
2. AI configuration verification
   ↓
3. Frontend
   ↓
4. Browser verification
   ↓
5. Generation test
   ↓
6. Validation / Evaluation
   ↓
7. Export test
   7.1 Recommended Startup Checklist
   [ ] Backend virtual environment active
   [ ] Dependencies installed
   [ ] Local environment variables available
   [ ] Groq API configuration verified
   [ ] FastAPI running
   [ ] Health endpoint responding
   [ ] Frontend dependencies installed
   [ ] Frontend running
   [ ] Frontend can reach backend

## 8. Local API Verification

8.1 Health Check

Verify:

GET /api/v1/health

Expected:

HTTP 200
8.2 Schema Inference

Verify that a sample dataset/schema can be submitted and produces a valid DataProfile.

8.3 Tabular Generation

Verify:

POST /api/v1/generate/tabular

Check:

Request validation
Generation
Row count
Seed behavior
Privacy configuration
Validation result
8.4 Relational Generation

Verify:

POST /api/v1/generate/relational

Check:

Multiple tables
Primary keys
Foreign keys
Cardinalities
Cross-table consistency
8.5 Document Generation

Verify:

POST /api/v1/generate/documents/invoice
POST /api/v1/generate/documents/bank-statement

Check:

Document generation
Business calculations
Validation
Rendering/export

## 9. Local Generation Pipeline

Every generation workflow should follow:

User Configuration
↓
API Request
↓
Schema / Input Understanding
↓
DataProfile
↓
Generation Engine
↓
Validation
↓
Quality Evaluation
↓
┌──┴──┐
▼ ▼
PASS FAIL
│ │
▼ ▼
Export Regenerate
9.1 Export Rule

Only a validated generation should be exported.

Generate
↓
Validate
↓
Evaluate
↓
PASS
↓
Export

Export must not silently trigger a new generation.

## 10. Local QA Smoke Tests

Before considering the local MVP stable, perform the following checks.

10.1 Backend Health
GET /api/v1/health

Expected:

HTTP 200
10.2 Tabular Smoke Test

Generate a small dataset.

Verify:

Requested row count.
Expected columns.
Correct data types.
Seed behavior.
Validation result.
10.3 Relational Smoke Test

Generate:

Customers
↓
Orders
↓
Order Items

Verify:

No orphaned foreign keys.
Primary keys are valid.
Relationships are preserved.
Order totals reconcile with applicable line items.
10.4 Invoice Smoke Test

Generate an invoice.

Verify:

Line Items
↓
Subtotal
↓
Tax / Discount
↓
Total

The final calculation must reconcile according to the configured business rules.

10.5 Bank Statement Smoke Test

Generate a statement.

Verify:

Previous Balance +
Credits -
Debits
=
Current Balance

Verify this for every transaction.

10.6 Export Smoke Test

Test applicable:

CSV
JSON
SQL/database-compatible export
Document/PDF-style output

Verify that exported files can be opened/parsed successfully.

## 11. Local AI Service Verification

11.1 AI Responsibilities

Verify that Groq is used for semantic tasks such as:

Schema understanding
Semantic content synthesis
Edge-case specification
11.2 Bulk Generation Rule

The LLM should not be called once per generated row.

Expected architecture:

Sample / Schema
↓
Groq
↓
Structured Generation Specification
↓
Local Specialized Generator
↓
Bulk Synthetic Dataset
11.3 AI Reliability Checks

Verify:

Structured output handling
Retry behavior
Rate limiting
Token budgeting
Caching where appropriate
Error handling
Usage tracking

## 12. Local Performance Verification

Performance should be measured using realistic workloads.

12.1 Areas to Measure
Schema inference
Preview generation
Tabular generation
Relational generation
Document generation
Validation
Statistical evaluation
Export
AI response time
12.2 Preview Performance

Preview interactions should feel responsive.

Do not enforce an arbitrary universal <200ms architectural guarantee.

Instead:

Measure
↓
Identify Bottleneck
↓
Optimize
↓
Measure Again
12.3 Large Generation Jobs

Heavy generation/evaluation workloads should not unnecessarily block normal HTTP requests.

Where required, use the job architecture defined in API-CONTRACT.md:

Request
↓
Generation Job
↓
Background Processing
↓
Status
↓
Completed / Failed

## 13. Local Security Checklist

Before the MVP is considered stable:

Groq API key is not exposed to the frontend.
.env files are excluded from Git.
File uploads are validated.
Input size limits are enforced.
Export filenames are sanitized.
SQL generation is safely handled.
User-controlled paths cannot cause path traversal.
API errors do not expose secrets.
Logs do not unnecessarily expose sensitive source data.
CORS allows only intended development origins.

## 14. Optional Database Usage

Supabase/PostgreSQL is not required for every generation workflow.

Use persistence only where it provides a concrete benefit, such as:

Saved generation configurations
Saved schemas
Presets
User/session data
Generation metadata
Job state

Core synthetic-data generation should remain functional without unnecessary database dependency where practical.

## 15. Repository & Local Configuration

Recommended structure:

HackData-V2/
│
├── frontend/
│ ├── ...
│ ├── .env.local
│ └── package.json
│
├── backend/
│ ├── app/
│ ├── tests/
│ ├── .env
│ ├── .env.example
│ ├── requirements.txt
│ └── ...
│
├── docs/
│ ├── theme-source.md
│ ├── REQUIREMENTS.md
│ ├── UI-REQUIREMENTS.md
│ ├── ARCHITECTURE.md
│ ├── API-CONTRACT.md
│ ├── DESIGN.md
│ ├── TASK-BREAKDOWN.md
│ ├── TEST-PLAN.md
│ ├── DEPLOYMENT.md
│ ├── DECISIONS.md
│ └── MASTER-PLAN.md
│
└── README.md

## 16. Deployment Readiness Gate

Cloud deployment should not begin immediately.

The project must first satisfy the local MVP gate.

16.1 Local MVP Gate
[ ] Backend works locally
[ ] Frontend works locally
[ ] AI integration works
[ ] Tabular engine works
[ ] Relational engine works
[ ] Document engine works
[ ] Validation works
[ ] Evaluation works
[ ] Regeneration works
[ ] Export works
[ ] Integration tests pass
[ ] Critical security checks pass
[ ] Demo workflow works locally

Only after these conditions are satisfied should the team consider cloud deployment.

## 17. Future Cloud Deployment — Deferred

Cloud deployment is intentionally excluded from the current MVP execution path.

If the team later decides that deployment is useful or required, a dedicated deployment task/prompt should be created to address:

Frontend hosting
Backend hosting
Environment variables
CORS
Domain configuration
Database connectivity
Container deployment
Health checks
Production logging
Production smoke tests
Secrets management
Production verification

Possible future platforms may include:

Frontend → Vercel
Backend → Render
Database → Supabase / PostgreSQL

These are future options, not current MVP requirements.

## 18. Future Cloud Deployment Gate

When cloud deployment is eventually requested:

Stable Local MVP
↓
Human Approval
↓
Deployment Planning
↓
Cloud Configuration
↓
Staging Deployment
↓
Smoke Tests
↓
Production Deployment
↓
Production Verification

No production deployment should be performed simply because deployment tooling is available.

## 19. Rollback & Recovery — Local MVP

19.1 Application Failure

If a new change breaks the local application:

Stop the affected service.
Identify the failing change.
Revert or isolate the change.
Re-run the relevant tests.
Restart the local services.
Verify the critical workflow again.
19.2 Generation Failure

A failed generation must remain distinguishable from a validated generation.

Generation
↓
Validation
↓
FAIL
↓
Regeneration / Error

It must not be treated as successfully generated data.

## 20. Final Local Verification Checklist

Backend
FastAPI starts successfully.
Health endpoint works.
API contract is implemented.
Generation endpoints work.
Validation works.
Evaluation works.
Regeneration works.
Export works.
AI
Groq connection works.
API key remains backend-only.
Structured AI responses work.
Retry/rate-limit handling works.
Token usage is controlled.
Frontend
Next.js application starts.
Unified workspace loads.
Tabular workflow works.
Relational workflow works.
Document workflow works.
Preview works.
Configuration works.
Validation/evaluation results are visible.
Export works.
Data Quality
Statistical checks pass.
PK/FK integrity passes.
Cardinality checks pass.
Business rules pass.
Invoice totals reconcile.
Bank balances reconcile.
Privacy checks pass.
Security
Secrets are protected.
Input validation works.
File handling is safe.
Export paths are sanitized.
CORS is correctly configured.
Demo
Complete workflow works locally.
Demo dataset is prepared.
Core features are stable.
Failure recovery is understood.
No cloud dependency exists for the MVP demo.

## 21. Final Deployment Strategy

The approved deployment strategy for the current HackData V2 phase is:

                    HACKDATA V2 MVP
                           │
                           ▼
                    LOCALHOST FIRST
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
       Next.js Frontend           FastAPI Backend
       localhost:3000             localhost:8000
                                        │
                              ┌─────────┼─────────┐
                              ▼         ▼         ▼
                           Tabular  Relational  Documents
                              │         │         │
                              └─────────┼─────────┘
                                        ▼
                                  Validation
                                        ▼
                                   Evaluation
                                        ▼
                                  Export / Retry
                                        │
                                        ▼
                                      Demo

Current Rule

Build, integrate, test, validate, and demonstrate locally first.

Deferred Rule

Only after the local MVP is stable should the team consider a separate cloud-deployment workflow.
