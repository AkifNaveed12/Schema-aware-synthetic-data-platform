# HackData V2 — Zero-Cost Deployment Plan

## 0. Purpose

This document is the deployment source of truth for HackData V2.

The goal is to move the verified local MVP into a real distributed deployment while preserving the working implementation and maintaining a strict \**₹0 / $0 infrastructure constraint for the hackathon*S\*.

The target deployment is:

```text
Browser
   |
   v
Vercel — React/Vite frontend (NO Docker)
   |
   | HTTPS
   v
Render — FastAPI API (Docker)
   |
   | enqueue job
   v
Zero-cost Redis-compatible queue
   |
   | consume job
   v
Render — ML Background Worker (Docker)
   |
   v
Supabase — database + storage
```

### Core deployment principles

1. Audit before changing code.
2. Do not rewrite working MVP functionality.
3. Do not introduce infrastructure unless the audit proves it is needed.
4. No paid services, paid compute, paid queue, paid database, or paid storage for the hackathon.
5. No accidental billing: do not attach a payment method or select paid plans merely to unlock a deployment.
6. Frontend is deployed natively on Vercel; it is not Dockerized.
7. Backend and ML worker are Dockerized because the Python/ML runtime must remain reproducible.
8. The ML worker is a Render Background Worker, not a public HTTP service.
9. If a distributed queue is required, prefer Render Key Value / Valkey Free because the API and worker are already on Render.
10. If Render Key Value is unsuitable for the audited implementation, use the currently available free Upstash Redis tier as the fallback, subject to its documented limits.
11. Never store datasets, generated files, or other large artifacts inside the queue.
12. Supabase is the durable system of record for metadata, job state, and artifacts where appropriate.
13. Queue state is disposable infrastructure; the application must be designed to recover from queue/worker restarts.
14. Never claim deployment success without real logs, health checks, and end-to-end evidence.

---

# 1. Current MVP Baseline

The MVP is considered locally verified before this deployment phase.

Reported baseline:

- Backend tests: 67/67 passing.
- Frontend production build: passing.
- CTGAN/TVAE verified locally.
- Python 3.14.5.
- SDV 1.38.5.
- torch 2.14.0+cpu.
- ctgan 0.12.1.
- scikit-learn 1.9.1.
- External test datasets verified.
- Relational Olist-style four-table flow verified with referential integrity.
- Document engine verified as input-aware.
- AI semantic batching/cache/fallback verified.
- MAX_ALLOWED_ROWS=50,000.
- Cancellation exists between pipeline stages.
- Security tests include zero-byte input, null-byte input, and SQL-injection escaping.
- Main merge commit reported as f4c1fe5.

These claims are the baseline to protect, not an invitation to reimplement the MVP.

If repository evidence contradicts this baseline, report the contradiction before changing behavior.

---

# 2. Repository Authority

Before modifying code, read:

1. `docs/theme-source.md`
2. `docs/REQUIREMENTS.md`
3. `docs/UI-REQUIREMENTS.md`
4. `docs/ARCHITECTURE.md`
5. `docs/API-CONTRACT.md`
6. `docs/DESIGN.md`
7. `docs/TASK-BREAKDOWN.md`
8. `docs/TEST-PLAN.md`
9. `docs/DEPLOYMENT.md`
10. `docs/DECISIONS.md`
11. `docs/MASTER-PLAN.md`

Authority:

- theme-source → theme requirements
- REQUIREMENTS → functional requirements
- UI-REQUIREMENTS → UI behavior
- DESIGN → UI/design
- ARCHITECTURE → architecture
- API-CONTRACT → API contract
- TASK-BREAKDOWN → ownership/dependencies
- TEST-PLAN → testing
- DEPLOYMENT → deployment
- DECISIONS → architectural decisions
- MASTER-PLAN → overall status/execution

If documents conflict, inspect DECISIONS, MASTER-PLAN, and TASK-BREAKDOWN first and surface unresolved conflicts.

---

# 3. Mandatory Audit Before Implementation

The first task is an audit. Do not implement queue/Docker/deployment changes before the audit is complete.

Inspect the actual repository for:

- `backend/`
- frontend source
- `jobs/`
- worker implementation
- job store
- queue implementation
- background threads/processes
- Celery/RQ/Dramatiq/Arq/etc.
- Dockerfiles
- docker-compose files
- Render configuration
- Vercel configuration
- Supabase integration
- environment variables
- storage paths
- generated artifacts
- API health endpoints
- CORS configuration
- frontend API base URL configuration
- model adapters
- ML dependencies
- cancellation
- retry behavior
- job persistence
- idempotency
- logging

Produce an audit report before implementation.

The audit must explicitly answer:

### A. Jobs

- Does the existing job system represent job lifecycle?
- Is job state durable?
- Does it survive API process restart?
- Does it survive worker restart?

### B. Queue

Determine whether a real distributed queue already exists.

A local background thread, Python queue, in-memory list, or in-memory job store is **not automatically a production distributed queue**.

If a real queue already exists:

- reuse it if appropriate;
- do not install another queue framework.

If no real queue exists:

- determine whether asynchronous ML generation actually requires one;
- if yes, introduce the minimum required queue infrastructure.

### C. Worker

Determine whether the current worker:

- is separate from the API process;
- can run independently;
- consumes jobs;
- handles failures;
- reports status;
- supports cancellation;
- can be packaged into its own Docker image.

### D. Supabase

Determine:

- what is stored in Supabase;
- whether Storage is already integrated;
- whether job metadata is stored in Postgres;
- whether large datasets/artifacts are stored externally;
- whether server-only credentials are protected.

### E. Deployment

Determine:

- what can run directly on Vercel;
- what must run on Render;
- which components need Docker;
- whether current Python/ML dependencies are compatible with the target container;
- whether any existing configuration accidentally assumes localhost.

---

# 4. Strict Zero-Cost Policy

## 4.1 Non-negotiable constraint

For this hackathon, the deployment must be designed for **₹0 / $0 additional infrastructure spend**.

This means:

- no paid Render service plans;
- no paid Redis;
- no paid Upstash plan;
- no paid database;
- no paid object storage;
- no paid AI provider required for the core deployment;
- no accidental auto-upgrades;
- no paid add-ons.

Free tiers are acceptable.

Free-tier limits must be explicitly documented.

## 4.2 Payment protection

The Project Lead must not:

- enter a card merely to unlock a paid feature;
- upgrade a service automatically;
- enable paid overages;
- assume a free trial is equivalent to a permanent free tier;
- report "free" based only on promotional credits.

If a required component cannot operate within a genuine free tier, STOP and report the blocker.

Do not silently substitute a paid service.

---

# 5. Queue Decision

## 5.1 Do not assume Redis

The project should use a queue only if the repository audit establishes that the ML workload requires distributed asynchronous execution.

If the existing implementation can be deployed safely without a distributed queue, do not add Redis/Valkey/Celery solely because they are common technologies.

## 5.2 If a queue is required

Preferred order:

### Option 1 — Render Key Value / Valkey Free

Prefer Render Key Value when compatible with the selected worker framework.

Current Render documentation states that new Render Key Value instances run Valkey and are Redis-compatible for typical clients. Render documents Key Value as suitable for caching and job queues, and its Free compute plan is available at no charge.

Important free-tier limitation:

- Free Key Value is in-memory only.
- A restart can delete all queue data.
- Only one Free Key Value instance may be active per workspace.

Therefore:

**Do not treat the queue as durable application storage.**

The durable job record must live elsewhere, such as Supabase Postgres, and the system must tolerate queue loss.

### Option 2 — Upstash Redis Free

If Render Key Value is technically unsuitable, use the currently documented Upstash Redis Free tier.

At the time this plan was prepared, Upstash documents:

- $0/month;
- 256 MB data;
- 500K commands/month;
- 10 GB monthly bandwidth;
- one free database.

The Project Lead must verify the current limits at implementation time.

Do not add a payment method.

Do not upgrade to pay-as-you-go.

### Option 3 — Local Docker Valkey/Redis

For local development and deterministic distributed testing, use a local container if useful.

This does not create a cloud cost.

The local broker should use the same protocol/API assumptions as production.

## 5.3 Do not introduce both queue providers

Do not deploy Render Key Value and Upstash simultaneously.

One broker only.

---

# 6. Recommended Target Architecture

```text
                         INTERNET
                            |
                            v
                 +---------------------+
                 |       Vercel        |
                 |    React / Vite     |
                 |      NO Docker      |
                 +----------+----------+
                            |
                         HTTPS
                            |
                            v
                 +---------------------+
                 |       Render        |
                 |   FastAPI Web API   |
                 |       Docker        |
                 +----------+----------+
                            |
                      create job
                            |
                            v
                 +---------------------+
                 | Queue / Broker      |
                 | Render Valkey Free  |
                 | OR Upstash Free     |
                 +----------+----------+
                            |
                      consume job
                            |
                            v
                 +---------------------+
                 |       Render        |
                 |  ML Background      |
                 |      Worker         |
                 |      Docker         |
                 +----------+----------+
                            |
                            v
                 +---------------------+
                 |      Supabase       |
                 | Postgres + Storage  |
                 +---------------------+
```

---

# 7. Vercel Frontend

The frontend remains a normal React/Vite deployment.

Do NOT Dockerize the frontend merely because Docker is used elsewhere.

Configure:

- production API base URL;
- production environment variables;
- no server-only secrets;
- CORS-compatible origin.

The frontend must never contain:

- Supabase service-role/secret credentials;
- Groq server key;
- queue credentials;
- worker credentials;
- any privileged backend secret.

Only public/browser-safe configuration belongs in Vercel frontend environment variables.

---

# 8. Render FastAPI Backend

Deploy the FastAPI backend as a Render Web Service.

Use Docker.

The Docker image must preserve the locally verified Python and ML dependency versions where possible.

The backend responsibilities are:

- authentication/authorization if implemented;
- input validation;
- ingestion;
- profiling;
- semantic interpretation;
- job creation;
- queue submission;
- job status;
- result retrieval;
- export coordination;
- cancellation requests;
- API health/readiness;
- secure access to Supabase;
- secure access to AI providers.

The API must not perform long-running CTGAN/TVAE generation synchronously if the worker architecture has been established.

---

# 9. Dedicated ML Worker

Deploy the ML worker as a Render Background Worker.

Dockerize it.

The worker must:

- start independently;
- connect to the queue;
- consume generation jobs;
- load datasets/artifacts by reference;
- execute the existing generation pipeline;
- update durable job state;
- write artifacts to Supabase Storage where appropriate;
- handle failures;
- support retries where safe;
- honor cancellation between pipeline stages;
- avoid duplicate generation where idempotency is required.

The worker does NOT need a public URL if it only consumes jobs.

Do not create an unnecessary ML Worker Web Service.

---

# 10. Container Strategy

Use separate Dockerfiles or clearly separated build targets for:

- backend;
- ML worker.

The images may share a common dependency base if that reduces duplication, but the runtime entrypoints must remain explicit.

Example conceptual structure:

```text
backend/
  Dockerfile
  ...

worker/
  Dockerfile
  ...

frontend/
  ...                 # no Dockerfile required
```

The exact repository structure must be adapted to the actual codebase.

Do not move working code merely to satisfy a preferred folder structure.

---

# 11. ML Runtime Reproducibility

The Docker worker must preserve the verified ML stack as closely as possible:

- Python 3.14.5
- SDV 1.38.5
- torch 2.14.0+cpu
- ctgan 0.12.1
- scikit-learn 1.9.1

Before deployment:

1. Build the image.
2. Install dependencies.
3. Run unit/integration tests inside the container.
4. Execute a real CTGAN test.
5. Execute a real TVAE test.
6. Verify statistical baseline.
7. Verify relational generation.
8. Verify document engine.
9. Verify cancellation.
10. Verify resource limits.

If the production container cannot support the exact verified stack, document the discrepancy and prove the replacement stack passes the same relevant tests.

Do not silently downgrade models.

---

# 12. Data Flow

Large files must not travel through queue messages.

Use this pattern:

```text
Upload
  |
  v
Supabase Storage
  |
  v
API creates job metadata
  |
  v
Queue contains:
  job_id
  dataset_id
  configuration/reference IDs
  |
  v
Worker
  |
  v
Downloads/reads source by reference
  |
  v
Generates
  |
  v
Validates
  |
  v
Writes result to Storage
  |
  v
Updates job status
```

Queue messages should contain small identifiers/configuration, not full CSV contents.

---

# 13. Durable Job State

Even if the queue is ephemeral, application job state must be durable.

Recommended conceptual states:

```text
created
queued
running
validating
completed
failed
cancel_requested
cancelled
```

The exact existing contract takes precedence.

Persist enough information to recover after:

- API restart;
- worker restart;
- queue restart;
- deployment;
- transient failure.

---

# 14. Retry and Idempotency

The worker must distinguish:

- retryable infrastructure errors;
- invalid user input;
- model/data errors;
- cancellation;
- permanent failures.

Do not blindly retry expensive ML jobs forever.

Use:

- bounded retries;
- backoff;
- deterministic job identifiers;
- idempotency checks where appropriate.

A retry must not silently create multiple conflicting output artifacts for the same logical job.

---

# 15. Supabase

Use Supabase for durable application data and storage where appropriate.

Potential responsibilities:

### Postgres

- datasets;
- dataset metadata;
- job records;
- job status;
- generation configuration;
- result metadata;
- evaluation metadata.

### Storage

- uploaded datasets;
- generated datasets;
- exports;
- large artifacts.

Do not put large generated files into:

- Redis/Valkey;
- queue messages;
- environment variables;
- API responses unnecessarily.

Use signed/private access patterns for sensitive artifacts.

The backend/worker may use privileged server-side Supabase credentials.

The browser must not receive privileged credentials.

Audit the installed Supabase SDK/config before changing key names or authentication patterns.

---

# 16. Environment Variables

Create a clean environment-variable contract.

Conceptually:

```text
# API
SUPABASE_URL=
SUPABASE_SERVER_KEY=
SUPABASE_BUCKET=
DATABASE_URL=               # only if actually required

# Queue
REDIS_URL=                  # or equivalent broker URL

# AI
GROQ_API_KEY=
GROQ_ASSISTANT_API_KEY=    # only if actually implemented
JEW_API_KEY=               # only if actually implemented

# Security
CORS_ORIGINS=
APP_ENV=production
```

Do not invent variables that the code does not consume.

Do not expose server secrets to Vite/browser variables.

If the actual project uses different names, preserve the existing contract or deliberately migrate it with a documented change.

---

# 17. CORS

Production CORS must allow only the deployed frontend origin(s).

Do not use:

```text
*
```

for production unless the API is explicitly designed for public unauthenticated access and the security review accepts it.

Local development may allow localhost origins separately.

Example conceptual configuration:

```text
Development:
http://localhost:5173

Production:
https://<actual-vercel-domain>
```

Use the actual deployed domain after deployment.

---

# 18. Local Distributed Deployment Before Cloud

Before deploying to Render/Vercel, reproduce the architecture locally.

Minimum:

### Terminal 1

```text
Vite frontend
```

### Terminal 2

```text
FastAPI backend
```

### Terminal 3

```text
ML worker
```

### Supporting infrastructure

Run the local queue/broker in Docker if the final architecture requires one.

Supabase may be the configured remote development backend if that is already part of the project workflow, but do not accidentally point development at production data.

The browser must communicate with the API.

The API must enqueue.

The worker must consume.

The worker must generate.

The result must become visible through the API/frontend.

This is the first real distributed end-to-end milestone.

---

# 19. Local Test Matrix

Before cloud deployment, test:

## Basic

- frontend starts;
- API starts;
- worker starts;
- queue connects;
- health endpoint works.

## Tabular

- CSV upload;
- JSON/TSV where supported;
- profiling;
- schema detection;
- statistical generation;
- CTGAN;
- TVAE;
- validation;
- export.

## Relational

- multiple tables;
- dependency DAG;
- foreign-key integrity;
- parent-before-child generation;
- referential integrity after generation.

## Document

- document input;
- document-aware generation;
- output validation.

## AI semantic layer

- valid AI response;
- malformed AI response;
- timeout;
- retry;
- cache hit;
- fallback behavior;
- rate limiting.

## Jobs

- queued;
- running;
- completed;
- failed;
- cancelled;
- worker restart;
- API restart;
- duplicate request/idempotency.

## Security

- zero-byte file;
- null-byte input;
- path traversal;
- SQL injection escaping;
- oversized input;
- unauthorized artifact access;
- secret exposure;
- CORS.

## Resource controls

- MAX_ALLOWED_ROWS=50,000;
- cancellation between pipeline stages;
- concurrent jobs;
- memory pressure;
- worker failure.

---

# 20. Docker Verification

Before cloud deployment:

```text
build backend image
build worker image
start queue
start backend
start worker
start frontend
```

Then execute the same E2E test matrix.

Do not deploy an image that only builds but has not executed the actual ML workflow.

At minimum prove:

```text
Frontend
  -> API
  -> Queue
  -> Worker
  -> ML model
  -> Validation
  -> Supabase Storage/DB
  -> API
  -> Frontend
```

---

# 21. Render Deployment Order

Deploy in this order:

### Step 1

Provision the free queue/broker only if the audit says it is required.

Preferred:

```text
Render Key Value / Valkey Free
```

Fallback:

```text
Upstash Redis Free
```

### Step 2

Deploy ML worker.

Verify worker startup and queue connection.

### Step 3

Deploy FastAPI backend.

Verify:

- startup;
- health;
- environment variables;
- queue connection;
- Supabase connection;
- CORS configuration.

### Step 4

Deploy frontend to Vercel.

Configure the production API URL.

### Step 5

Update production CORS to the real Vercel origin.

### Step 6

Run production E2E.

---

# 22. Free-Tier Verification

Before provisioning each service, verify its current free-tier availability.

Do not rely on old tutorials.

Record:

- provider;
- service;
- free plan;
- resource limits;
- expiration rules;
- restart/sleep behavior;
- whether a card is required;
- whether automatic upgrade is possible;
- whether overage billing can occur.

If a service requires payment information or can automatically create billable usage, stop and ask for explicit approval rather than enabling it.

---

# 23. Render-Specific Expectations

Expected Render services:

```text
hackdata-api
    type: Web Service
    Docker

hackdata-ml-worker
    type: Background Worker
    Docker

hackdata-queue
    type: Key Value
    Free
    only if queue is required
```

Do not create a public worker URL.

Do not create a second queue.

Do not create a paid service.

Use a Render Blueprint (`render.yaml`) if doing so improves reproducibility, but do not force infrastructure-as-code where it conflicts with the actual repository.

---

# 24. Vercel Deployment

Deploy the existing React/Vite frontend normally.

Verify:

- build succeeds;
- environment variables are correct;
- API URL points to Render;
- no localhost URL remains;
- no secret is bundled;
- production routing works;
- browser console has no critical errors.

Do not introduce Docker into the Vercel deployment unless a later requirement explicitly proves it necessary.

---

# 25. Health and Readiness

Backend should expose an appropriate health endpoint, such as:

```text
GET /health
```

If appropriate, separate:

```text
GET /health
GET /ready
```

Readiness should verify required dependencies without turning health checks into expensive operations.

Worker startup logs must clearly identify:

- worker started;
- queue connection;
- worker version/commit;
- model environment;
- configuration mode.

---

# 26. Production Smoke Test

After deployment, execute a real test:

1. Open deployed Vercel frontend.
2. Upload a small valid test dataset.
3. Confirm API receives it.
4. Confirm job is created.
5. Confirm queue receives it.
6. Confirm worker consumes it.
7. Confirm generation runs.
8. Confirm validation runs.
9. Confirm artifact is stored.
10. Confirm job reaches `completed`.
11. Confirm frontend retrieves/downloads result.

Then repeat with:

- CTGAN;
- TVAE;
- relational dataset;
- document input if available.

---

# 27. Concurrency Test

At least two jobs should be submitted close together.

Verify:

```text
Job A -> queued -> worker -> result
Job B -> queued -> worker -> result
```

No job should:

- overwrite another job's metadata;
- overwrite another job's artifact;
- disappear silently;
- remain permanently queued without explanation.

If the free worker/queue capacity prevents safe concurrency, document the limitation rather than pretending it is solved.

---

# 28. Failure-Recovery Tests

Intentionally test:

### Worker restart

- queue/job state;
- recovery;
- retry behavior.

### API restart

- existing job records;
- status retrieval;
- worker independence.

### Queue restart

- expected loss of transient queue entries;
- recovery from durable job records;
- no silent permanent data loss.

### ML failure

- job becomes failed;
- useful error recorded;
- worker remains alive;
- unrelated jobs continue.

---

# 29. Deployment Security

Verify:

- HTTPS;
- production CORS;
- no secrets in frontend bundle;
- no secrets in Git;
- no `.env` committed;
- server-only Supabase credentials;
- queue credentials server-side only;
- secure artifact access;
- input validation;
- file-size limits;
- row limits;
- path validation;
- SQL escaping;
- no debug stack traces exposed publicly.

---

# 30. Performance and Cost Protection

The system must remain within free-tier limits.

Control:

- maximum rows;
- maximum file size;
- number of concurrent jobs;
- worker concurrency;
- AI request rate;
- retry counts;
- queue commands;
- storage growth.

Do not run uncontrolled stress tests against free hosted infrastructure.

For local stress testing, prefer local Docker resources.

The goal is to prove correctness without generating unexpected cloud usage.

---

# 31. AI Provider Cost Control

Groq or another provider may be used according to the existing architecture.

AI must remain a semantic/control layer.

It must not generate millions of synthetic rows through LLM calls.

Use:

- caching;
- batching;
- structured outputs;
- rate limits;
- bounded retries;
- deterministic fallback where implemented;
- usage logging.

Any optional provider with limited credit must be treated as optional and heavily rate-limited.

The core synthetic generation system must remain functional without depending on expensive LLM calls for bulk row generation.

---

# 32. Deployment Evidence

The Project Lead must collect real evidence.

Minimum evidence:

```text
Git commit
Docker build logs
Backend health response
Worker startup log
Queue connectivity
Supabase connectivity
Frontend deployment URL
Production CORS result
One successful tabular job
One successful CTGAN/TVAE job
One relational job
Job lifecycle
Artifact retrieval
Concurrency result
Failure/recovery result
Security smoke results
```

Do not write:

```text
"Deployment successful"
```

without evidence.

---

# 33. Rollback

Before production changes:

- commit current working state;
- record commit SHA;
- preserve known-good local baseline.

If deployment fails:

1. identify failure;
2. revert only the failing change;
3. preserve working MVP;
4. rerun tests;
5. do not pile unrelated fixes onto a broken deployment.

---

# 34. Definition of Done

Deployment is complete only when all are true:

### Architecture

- [ ] frontend on Vercel;
- [ ] backend on Render;
- [ ] ML worker on Render Background Worker;
- [ ] backend Dockerized;
- [ ] worker Dockerized;
- [ ] frontend not unnecessarily Dockerized;
- [ ] queue introduced only if required;
- [ ] only one queue provider;
- [ ] queue uses a genuine free tier.

### Zero-cost

- [ ] no paid service;
- [ ] no paid queue;
- [ ] no paid compute;
- [ ] no accidental auto-upgrade;
- [ ] no paid AI dependency for core functionality;
- [ ] free-tier limits documented.

### Functionality

- [ ] tabular generation;
- [ ] CTGAN;
- [ ] TVAE;
- [ ] relational generation;
- [ ] document engine;
- [ ] validation;
- [ ] export;
- [ ] job lifecycle;
- [ ] cancellation;
- [ ] retry behavior;
- [ ] artifact storage.

### Reliability

- [ ] API restart tested;
- [ ] worker restart tested;
- [ ] queue failure/recovery behavior tested;
- [ ] concurrent jobs tested;
- [ ] idempotency checked.

### Security

- [ ] production CORS;
- [ ] secrets server-side;
- [ ] input validation;
- [ ] artifact access controlled;
- [ ] no secrets in frontend.

### Evidence

- [ ] real production E2E;
- [ ] logs captured;
- [ ] URLs recorded;
- [ ] commit SHA recorded;
- [ ] final deployment report written.

---

# 35. Hard Stop Conditions

The Project Lead MUST stop and report rather than guessing if:

1. a required service is not actually free;
2. a provider requires payment information for the intended configuration;
3. free-tier limits make the architecture unsafe;
4. the repository's current job architecture conflicts with this plan;
5. a required dependency cannot run in the Docker environment;
6. Supabase credentials/configuration are unclear;
7. production CORS cannot be configured safely;
8. the worker cannot independently execute the ML pipeline;
9. the queue cannot be made compatible with the selected worker implementation;
10. deployment would require rewriting verified MVP logic;
11. a test fails and the cause is not understood.

---

# 36. Final Execution Order

The Project Lead should execute exactly this broad sequence:

```text
1. Read repository authority documents
        |
        v
2. Audit existing jobs / queue / worker / ML / Supabase
        |
        v
3. Produce audit report
        |
        v
4. Decide whether a distributed queue is actually required
        |
        +---- NO ----> keep current architecture
        |
        +---- YES ---> Render Valkey Free
                       |
                       +--> Upstash Free only if necessary
        |
        v
5. Define worker contract
        |
        v
6. Dockerize backend
        |
        v
7. Dockerize dedicated ML worker
        |
        v
8. Set up local queue if required
        |
        v
9. Run 3-terminal distributed local E2E
        |
        v
10. Run Docker E2E
        |
        v
11. Configure free Supabase production resources
        |
        v
12. Deploy queue if required
        |
        v
13. Deploy ML worker
        |
        v
14. Deploy FastAPI
        |
        v
15. Deploy Vercel frontend
        |
        v
16. Configure production CORS
        |
        v
17. Run real production E2E
        |
        v
18. Run concurrency / failure / security tests
        |
        v
19. Record evidence
        |
        v
20. Produce final deployment report
```

---

# 37. Final Principle

HackData V2 is a hackathon project.

The objective is not to maximize infrastructure.

The objective is:

> **Use the smallest reliable architecture that can run the verified ML workload remotely, while spending ₹0/$0 and preserving the working MVP.**

Therefore:

```text
Vercel
   +
Render API
   +
Render ML Worker
   +
Supabase
   +
ONE free queue only if actually required
```

is the target.

Do not add infrastructure for prestige.

Do not pay for infrastructure.

Do not rewrite working code unnecessarily.

Do not claim success without evidence.
