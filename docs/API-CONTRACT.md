# HACKDATA V2 — API CONTRACT SPECIFICATION

> **Project:** HackData V2  
> **Protocol:** REST over HTTP / JSON  
> **Backend Framework:** Python / FastAPI  
> **API Version:** `/api/v1`  
> **Specification Standard:** OpenAPI 3.1 Compatible  
> **Execution Strategy:** Localhost-first, service-oriented, generation/evaluation driven  
> **Status:** Finalized Contract Baseline — Ready for Implementation

---

# 1. API Design Principles

The HackData V2 API is responsible for orchestrating:

```text
Input
  ↓
Schema Understanding
  ↓
DataProfile
  ↓
Generation
  ↓
Validation
  ↓
Evaluation
  ↓
Pass / Regenerate
  ↓
Export
```

The API must maintain a strict separation between:

Input/schema processing
AI-assisted understanding
Data generation
Validation
Quality evaluation
Export
System/health management

The API must never expose internal implementation details unnecessarily.

The frontend communicates only with the HackData V2 backend.

External AI providers such as Groq are accessed exclusively by the backend AI service.

## 2. Base URL

During MVP development:

http://localhost:<PORT>/api/v1

Example:

http://localhost:8000/api/v1

The port must be configurable through environment/configuration.

The API must not hardcode localhost-specific assumptions into business logic.

## 3. Content Types

3.1 JSON Requests

Default request content type:

Content-Type: application/json
3.2 JSON Responses

Default response content type:

Content-Type: application/json
3.3 File Uploads

File ingestion endpoints may use:

Content-Type: multipart/form-data

Supported file formats are determined by the ingestion implementation and must be explicitly documented.

## 4. Global Response Conventions

4.1 Success Envelope

All normal JSON API responses should follow:

{
"success": true,
"data": {},
"metadata": {
"request_id": "req_01JXYZ",
"execution_time_ms": 42.5
}
}

metadata may contain additional endpoint-specific information.

4.2 Error Envelope

All API errors must follow:

{
"success": false,
"error": {
"code": "INVALID_SCHEMA",
"message": "The supplied schema contains an invalid foreign-key reference.",
"details": [
{
"field": "tables.orders.foreign_keys",
"issue": "Parent table 'customers' does not exist."
}
]
},
"metadata": {
"request_id": "req_01JXYZ"
}
}

Internal stack traces, API keys, filesystem paths, provider credentials, or sensitive implementation details must never be returned to the client.

## 5. HTTP Status Codes

The API must use standard HTTP semantics.

Status Meaning
200 Successful request
201 Resource/job created
202 Request accepted for asynchronous processing
204 Successful request with no response body
400 Invalid request
401 Authentication required/invalid where applicable
403 Request not permitted
404 Resource not found
409 Conflict/idempotency/resource state conflict
413 Payload/file too large
422 Request/schema validation failure
429 Rate limit exceeded
500 Internal server error
502 External provider/service failure
503 Service temporarily unavailable

## 6. Request Identification

Every request should receive a unique:

request_id

The request ID must be included in:

API responses
Error responses
Server logs

This allows failures to be traced without exposing internal implementation details.

## 7. Idempotency

Generation and other potentially expensive POST requests should support:

Idempotency-Key: <unique-client-generated-key>

The backend should use idempotency keys where appropriate to prevent accidental duplicate generation caused by:

Browser retries
Network retries
Double-clicks
Frontend refreshes
Client-side request duplication

Idempotency behavior must be documented for each applicable endpoint.

## 8. Core Domain Objects

The API is based around several central concepts.

8.1 DataProfile

DataProfile is the normalized representation of the dataset/schema after schema understanding.

Conceptually:

{
"modality": "tabular",
"schema": {},
"columns": [],
"semantic_types": {},
"distributions": {},
"relationships": [],
"constraints": [],
"privacy": {},
"generation": {},
"evaluation": {}
}

The exact schema must be defined using Pydantic models.

DataProfile must be reusable by:

Generation engines
Validation engines
Evaluation engines
Regeneration logic
8.2 GenerationJob

Long-running generation requests should be represented by a job.

Example:

{
"job_id": "job_01JXYZ",
"status": "queued",
"modality": "relational",
"created_at": "2026-09-29T10:30:00Z"
}

Supported statuses:

queued
running
validating
evaluating
completed
failed
cancelled
8.3 ValidationResult

Validation results must be machine-readable.

Example:

{
"status": "passed",
"checks": [
{
"name": "foreign_key_integrity",
"status": "passed",
"severity": "critical",
"errors": 0
},
{
"name": "order_total_reconciliation",
"status": "passed",
"severity": "critical",
"errors": 0
}
]
}

The API must not encode validation results only as human-readable strings such as:

"100% Valid"

Both machine-readable status and human-readable explanations may be returned.

8.4 EvaluationResult

Example:

{
"overall_status": "passed",
"statistical_fidelity": {
"status": "passed",
"metrics": {}
},
"structural_fidelity": {
"status": "passed",
"metrics": {}
},
"privacy": {
"status": "passed",
"metrics": {}
},
"utility": {
"status": "not_run",
"reason": "No real evaluation dataset supplied."
}
}

## 9. System & Health Endpoints

9.1 GET /api/v1/health

Returns basic application availability.

Response
{
"success": true,
"data": {
"status": "healthy",
"service": "hackdata-v2-api",
"version": "1.0.0"
},
"metadata": {
"request_id": "req_01JXYZ"
}
}

This endpoint should remain lightweight and should not require external AI calls.

## 10. Readiness Endpoint

GET /api/v1/health/ready

Determines whether required application components are ready.

Response
{
"success": true,
"data": {
"status": "ready",
"services": {
"api": "ready",
"tabular_engine": "ready",
"relational_engine": "ready",
"document_engine": "ready",
"validation_engine": "ready",
"evaluation_engine": "ready",
"ai_service": "ready"
}
}
}

Possible service states:

ready
degraded
unavailable
disabled

The AI service must not be reported as "connected" merely because an API key exists.

Actual connectivity/readiness must be determined by the implementation.

## 11. Schema Understanding API

11.1 POST /api/v1/schema/infer

Analyzes a schema or representative sample and produces a normalized DataProfile.

This endpoint may use the AI service where semantic interpretation is required.

Supported Input Modes

Possible input modes:

sample_data
schema_definition
sql_ddl
json_schema

The implementation must explicitly document which modes are supported.

Request
{
"input_type": "sample_data",
"format": "csv",
"content": "id,name,email,signup_date,balance\n101,John Doe,john@example.com,2025-01-01,150.00\n102,Jane Smith,jane@example.com,2025-01-02,320.50",
"options": {
"use_ai": true,
"detect_relationships": true,
"detect_semantic_types": true
}
}
Response
{
"success": true,
"data": {
"profile_id": "profile_01JXYZ",
"modality": "tabular",
"profile": {
"schema": {
"tables": [
{
"name": "inferred_table",
"columns": [
{
"name": "id",
"data_type": "integer",
"semantic_type": "identifier",
"nullable": false,
"is_primary_key_candidate": true
},
{
"name": "name",
"data_type": "string",
"semantic_type": "full_name"
},
{
"name": "email",
"data_type": "string",
"semantic_type": "email"
},
{
"name": "signup_date",
"data_type": "date",
"semantic_type": "date"
},
{
"name": "balance",
"data_type": "float",
"semantic_type": "currency"
}
]
}
]
},
"relationships": [],
"constraints": [],
"distributions": {},
"privacy": {}
}
},
"metadata": {
"request_id": "req_01JXYZ",
"execution_time_ms": 182.4,
"ai_used": true,
"cache_hit": false
}
}

## 12. Profile Retrieval

GET /api/v1/profiles/{profile_id}

Retrieves a previously created DataProfile.

Response
{
"success": true,
"data": {
"profile_id": "profile_01JXYZ",
"profile": {}
}
}

Profiles should be reusable for subsequent generation requests.

This avoids repeating schema analysis unnecessarily.

## 13. Tabular Generation

POST /api/v1/generate/tabular

Generates synthetic tabular data from either:

A previously created profile_id
An inline DataProfile

The endpoint must support preview and full-generation modes.

13.1 Preview Request
{
"profile_id": "profile_01JXYZ",
"generation": {
"row_count": 25,
"random_seed": 42,
"locale": "en_US",
"null_rate": 0.02,
"outlier_rate": 0.01
},
"privacy": {
"enabled": true,
"rules": []
},
"preview": true
}
13.2 Preview Response

Lightweight previews may return synchronously.

{
"success": true,
"data": {
"generation_id": "gen_01JXYZ",
"status": "completed",
"rows": [
{
"id": 10231,
"name": "Maria Chen",
"email": "m.chen@example.com",
"signup_date": "2025-02-11",
"balance": 482.10
}
],
"row_count": 25
},
"metadata": {
"request_id": "req_01JXYZ",
"seed_used": 42,
"preview": true,
"validation_status": "passed"
}
}

## 14. Full Tabular Generation

For larger generation requests:

POST /api/v1/generate/tabular/jobs
Request
{
"profile_id": "profile_01JXYZ",
"generation": {
"row_count": 10000,
"random_seed": 42,
"locale": "en_US",
"null_rate": 0.02,
"outlier_rate": 0.01
},
"privacy": {
"enabled": true,
"rules": []
},
"evaluation": {
"statistical": true,
"privacy": true,
"utility": false
}
}
Response
{
"success": true,
"data": {
"job_id": "job_01JXYZ",
"status": "queued"
},
"metadata": {
"request_id": "req_01JXYZ"
}
}

HTTP status:

202 Accepted

## 15. Relational Generation

POST /api/v1/generate/relational

Generates a relational dataset while preserving:

Primary keys
Foreign keys
Cardinality
Cross-table relationships
Business constraints
15.1 Preview Request
{
"profile_id": "profile_01JXYZ",
"generation": {
"random_seed": 42,
"locale": "en_US",
"preview": true,
"tables": {
"customers": {
"row_count": 10
},
"orders": {
"cardinality": {
"min": 1,
"max": 4
}
},
"order_items": {
"cardinality": {
"min": 1,
"max": 5
}
}
}
},
"validation": {
"referential_integrity": true,
"business_rules": true
}
}

## 15.2 Response

{
"success": true,
"data": {
"generation_id": "gen_01JXYZ",
"status": "completed",
"tables": {
"customers": [],
"orders": [],
"order_items": []
},
"validation": {
"status": "passed",
"checks": [
{
"name": "primary_key_uniqueness",
"status": "passed"
},
{
"name": "foreign_key_integrity",
"status": "passed",
"errors": 0
},
{
"name": "order_total_reconciliation",
"status": "passed",
"errors": 0
}
]
}
},
"metadata": {
"request_id": "req_01JXYZ",
"seed_used": 42
}
}

## 16. Relational Generation Jobs

POST /api/v1/generate/relational/jobs

Used for larger relational generation workloads.

Response
{
"success": true,
"data": {
"job_id": "job_01JXYZ",
"status": "queued"
}
}

## 17. Invoice Generation

POST /api/v1/generate/documents/invoice

Generates synthetic invoices.

Request
{
"count": 5,
"locale": "en_US",
"currency": "USD",
"random_seed": 10432,
"business_type": "saas",
"line_items": {
"min": 2,
"max": 4
},
"tax": {
"enabled": true,
"rate": 0.05
},
"render": {
"format": "pdf"
}
}
Response
{
"success": true,
"data": {
"generation_id": "gen_01JXYZ",
"status": "completed",
"invoices": [
{
"invoice_number": "INV-10432",
"date": "2026-09-15",
"due_date": "2026-10-15",
"billed_to": {
"name": "Northwind Supplies Ltd."
},
"from": {
"name": "Synth Data Co."
},
"line_items": [
{
"description": "API access",
"quantity": 1,
"unit_price": 1100.0,
"amount": 1100.0
}
],
"subtotal": 1100.0,
"tax": 55.0,
"total": 1155.0
}
],
"validation": {
"status": "passed",
"checks": [
{
"name": "line_item_arithmetic",
"status": "passed"
},
{
"name": "invoice_total",
"status": "passed"
}
]
}
},
"metadata": {
"request_id": "req_01JXYZ",
"seed_used": 10432
}
}

All invoice calculations must be produced and verified by deterministic business logic.

## 18. Bank Statement Generation

POST /api/v1/generate/documents/bank-statement

Generates synthetic bank statements with deterministic running-balance calculations.

Request
{
"locale": "en_US",
"currency": "USD",
"starting_balance": 1246.40,
"transaction_count": 15,
"date_range": {
"days": 90
},
"query": {
"natural_language": "last 90 days, balance over $500"
},
"random_seed": 777
}
Response
{
"success": true,
"data": {
"generation_id": "gen_01JXYZ",
"status": "completed",
"account": {
"account_holder": "Synthetic Account Holder",
"account_number": "\***\*-\*\***-8819"
},
"starting_balance": 1246.40,
"ending_balance": 3257.90,
"transactions": [
{
"date": "2026-08-14",
"description": "Greenleaf Market",
"debit": 42.10,
"credit": null,
"balance": 1204.30
},
{
"date": "2026-08-15",
"description": "Payroll Deposit",
"debit": null,
"credit": 2150.00,
"balance": 3354.30
}
],
"validation": {
"status": "passed",
"checks": [
{
"name": "running_balance",
"status": "passed",
"errors": 0
},
{
"name": "chronological_order",
"status": "passed"
}
]
}
},
"metadata": {
"request_id": "req_01JXYZ",
"seed_used": 777,
"ai_used": true
}
}

The running balance must be calculated deterministically:

# current_balance

previous_balance

- credit

* debit

## 19. Natural-Language Query Interpretation

The AI layer may interpret natural-language generation requests.

Example:

"Generate a 90-day bank statement with at least
20 transactions and include several high-value credits."

The AI layer must convert the request into structured configuration.

Conceptually:

{
"duration_days": 90,
"transaction_count": 20,
"transaction_rules": {
"high_value_credit_count": 3
}
}

The generation engine must then execute the structured configuration.

The LLM must not directly calculate balances or other critical financial arithmetic.

## 20. Validation API

POST /api/v1/validate

Validates an existing generated dataset.

Request
{
"generation_id": "gen_01JXYZ",
"checks": {
"schema": true,
"structural": true,
"business_rules": true,
"statistical": true,
"privacy": true
}
}
Response
{
"success": true,
"data": {
"validation_id": "val_01JXYZ",
"status": "passed",
"checks": [
{
"name": "schema",
"status": "passed"
},
{
"name": "structural_integrity",
"status": "passed"
},
{
"name": "business_rules",
"status": "passed"
},
{
"name": "statistical_profile",
"status": "passed"
},
{
"name": "privacy",
"status": "passed"
}
]
},
"metadata": {
"request_id": "req_01JXYZ"
}
}

## 21. Evaluation API

POST /api/v1/evaluate

Evaluates the quality of an existing generated dataset.

Request
{
"generation_id": "gen_01JXYZ",
"evaluation": {
"statistical_fidelity": true,
"structural_fidelity": true,
"privacy": true,
"utility": false
}
}
Response
{
"success": true,
"data": {
"evaluation_id": "eval_01JXYZ",
"overall_status": "passed",
"results": {
"statistical_fidelity": {
"status": "passed",
"metrics": {}
},
"structural_fidelity": {
"status": "passed",
"metrics": {}
},
"privacy": {
"status": "passed",
"metrics": {}
},
"utility": {
"status": "not_run",
"reason": "No evaluation dataset supplied."
}
}
}
}

## 22. TSTR Utility Evaluation

Where a real evaluation dataset is intentionally supplied and appropriate:

POST /api/v1/evaluate/utility

The endpoint may execute:

Train on Synthetic
↓
Model
↓
Test on Real

The API must return structured utility metrics.

Example:

{
"success": true,
"data": {
"method": "TSTR",
"status": "completed",
"metrics": {
"accuracy": 0.91,
"f1": 0.89
}
}
}

The exact metric set depends on the evaluation task.

## 23. Regeneration API

POST /api/v1/generate/{generation_id}/regenerate

Requests a controlled regeneration after validation/evaluation failure.

Request
{
"reason": "statistical_fidelity_failed",
"adjustments": {
"generator_parameters": {}
},
"random_seed": 43
}
Response

For short operations:

{
"success": true,
"data": {
"generation_id": "gen_01JXYZ2",
"status": "completed"
}
}

For long operations:

{
"success": true,
"data": {
"job_id": "job_01JXYZ2",
"status": "queued"
}
}

Regeneration must be bounded.

## 24. Job Status API

GET /api/v1/jobs/{job_id}

Returns the current state of a long-running generation/evaluation job.

Response
{
"success": true,
"data": {
"job_id": "job_01JXYZ",
"status": "running",
"progress": 65,
"stage": "validating"
}
}

Possible stages:

queued
profiling
generating
validating
evaluating
exporting
completed
failed

## 25. Job Cancellation

POST /api/v1/jobs/{job_id}/cancel

Cancels a queued or running job where cancellation is supported.

Response
{
"success": true,
"data": {
"job_id": "job_01JXYZ",
"status": "cancelled"
}
}

## 26. Export API

POST /api/v1/export

Exports an existing generated dataset.

The export operation should reference an existing generation rather than unnecessarily regenerating the dataset.

Request
{
"generation_id": "gen_01JXYZ",
"format": "csv"
}

Supported formats depend on the generation type.

Possible values:

csv
json
sql
pdf
Response

For small exports:

200 OK
Content-Type: text/csv
Content-Disposition: attachment; filename="synthetic-data.csv"

For larger export operations:

{
"success": true,
"data": {
"job_id": "job_export_01JXYZ",
"status": "queued"
}
}

## 27. Export Rules

The export service must verify that:

The generation exists.
The generation is in an exportable state.
Mandatory validation has passed.
The requested format is compatible with the dataset.
The export does not contain unintended internal metadata or secrets.

Export must not bypass validation.

## 28. AI Service Contract

The frontend must never call Groq directly.

Internal architecture:

Frontend
↓
FastAPI
↓
AI Service
↓
Groq API

The AI service is responsible for:

Model selection
Prompt construction
Structured output
Request caching
Rate limiting
Retry/backoff
Token budgeting
Usage tracking
Error normalization

## 29. AI Service API Boundary

AI functionality should primarily remain an internal backend service rather than being exposed as a generic public chatbot endpoint.

Possible internal operations:

infer_schema_semantics()
infer_relationships()
interpret_generation_query()
generate_semantic_content()
propose_edge_cases()

These operations must return structured data.

## 30. AI Request Optimization

The backend must avoid unnecessary AI calls.

The following rules apply:

Rule 1 — Cache Schema Analysis

Equivalent schema/profile requests should reuse cached results.

Rule 2 — Do Not Send Entire Large Datasets

Only representative samples and required metadata should be sent to the AI provider.

Rule 3 — Do Not Generate Rows Through LLM

Bulk rows must be generated locally.

Rule 4 — Avoid Preview API Loops

Changing a slider or preview configuration must not automatically cause unnecessary external LLM calls.

Rule 5 — Use Structured Outputs

AI responses must be validated against expected schemas.

## 31. Rate Limiting

Application-level rate limiting must exist independently of provider limits.

Rate limits should protect:

AI endpoints
Expensive generation endpoints
File ingestion
Evaluation endpoints

When a limit is exceeded:

429 Too Many Requests

Example:

{
"success": false,
"error": {
"code": "RATE_LIMIT_EXCEEDED",
"message": "Too many requests. Please retry after the specified interval."
},
"metadata": {
"request_id": "req_01JXYZ",
"retry_after_seconds": 10
}
}

## 32. External AI Retry Policy

Retryable failures may include:

Temporary provider failures
Rate-limit responses
Network timeouts
Temporary upstream errors

Retries must use:

bounded retry count

- exponential backoff
- jitter where appropriate

The application must never perform infinite retries.

Authentication/configuration failures must not be retried indefinitely.

## 33. Error Codes

The implementation should maintain a centralized error-code registry.

Examples:

INVALID_REQUEST
INVALID_SCHEMA
INVALID_PROFILE
UNSUPPORTED_FORMAT
UNSUPPORTED_MODALITY
INVALID_GENERATION_CONFIG

PROFILE_NOT_FOUND
GENERATION_NOT_FOUND
JOB_NOT_FOUND

VALIDATION_FAILED
STATISTICAL_VALIDATION_FAILED
STRUCTURAL_VALIDATION_FAILED
BUSINESS_RULE_VALIDATION_FAILED
PRIVACY_VALIDATION_FAILED

GENERATION_FAILED
REGENERATION_LIMIT_REACHED
EXPORT_FAILED

AI_SERVICE_UNAVAILABLE
AI_RATE_LIMITED
AI_TIMEOUT
AI_INVALID_RESPONSE
AI_CONFIGURATION_ERROR

FILE_TOO_LARGE
UNSUPPORTED_FILE_TYPE
PAYLOAD_TOO_LARGE

RATE_LIMIT_EXCEEDED
INTERNAL_ERROR

## 34. Security Requirements

The API must:

Validate all request bodies.
Validate uploaded files.
Enforce configurable file-size limits.
Never expose secrets.
Never return stack traces to clients.
Sanitize error messages.
Keep provider credentials backend-only.
Avoid unnecessary transmission of source data to external services.
Prevent arbitrary filesystem access through user-controlled paths.
Validate generated/exported data before delivery.

## 35. File Upload Contract

Where file uploads are supported, the backend must validate:

filename
extension
MIME type
file size
encoding
content structure

Uploaded files must not be trusted based solely on filename or extension.

Temporary files must be cleaned up according to the implementation's lifecycle policy.

## 36. Performance Contract

The API must distinguish between:

Lightweight operations

Suitable for synchronous responses:

Health checks
Profile retrieval
Small schema inference
Small previews
Small document generation
Heavy operations

Suitable for asynchronous jobs:

Large tabular generation
Large relational generation
Bulk documents
Expensive evaluation
Large exports

The exact threshold should be implementation-configurable rather than hardcoded into the API specification.

## 37. Preview Contract

Preview generation must:

Generate only a small representative sample.
Avoid full dataset generation.
Avoid unnecessary AI calls.
Return validation information where practical.
Remain responsive for normal interactive use.

Preview output must never be mistaken for the full requested dataset.

## 38. Generation State Model

A generation resource should follow:

CREATED
↓
GENERATING
↓
VALIDATING
↓
EVALUATING
↓
PASSED
↓
EXPORTABLE

Failure:

GENERATING
↓
FAILED

or:

VALIDATING
↓
FAILED
↓
REGENERATE

A generation that has failed mandatory validation must not be marked as exportable.

## 39. API Data Integrity Rules

The API must preserve the following invariants.

Relational
Every required FK references an existing PK.
Invoice
line_item_amount
=
quantity × unit_price

# subtotal

Σ(line_item_amount)

# total

subtotal + tax - discount
Bank Statement
current_balance
=
previous_balance + credit - debit
Deterministic Generation
same profile

- same configuration
- same generator version
- # same seed
  reproducible output

where the underlying generator supports deterministic execution.

## 40. API Versioning

The API must be versioned through the URL:

/api/v1/...

Breaking contract changes require a new API version.

Non-breaking additions may be introduced within the existing version when compatible with the OpenAPI contract.

## 41. OpenAPI Requirements

FastAPI must generate an OpenAPI 3.1-compatible specification.

All public endpoints must define:

Request schema
Response schema
Error responses
HTTP status codes
Required/optional fields
Enumerated values where applicable
Examples where useful

Pydantic models should be the canonical source for request/response validation.

## 42. Frontend Integration Rules

The frontend must communicate exclusively through the documented API contract.

The frontend must not:

Directly access the database
Directly call Groq
Contain API provider secrets
Implement backend generation logic
Reimplement validation logic

The backend remains the source of truth for:

Generation
Validation
Evaluation
Privacy processing
Business rules
Export eligibility

## 43. Localhost-First Contract

During MVP:

Browser
↓
Frontend localhost
↓
FastAPI localhost
↓
Generation / Validation Workers
↓
Local compute
↓
Groq only when AI reasoning is required

Optional infrastructure such as Supabase may be used for persistence where required.

The core synthetic-data generation engine must not depend on cloud deployment.

## 44. Deployment Compatibility

Although the MVP is localhost-first, the API must remain suitable for later deployment.

The API must therefore avoid:

Hardcoded local filesystem assumptions
Hardcoded localhost URLs inside business logic
Provider-specific logic inside generation engines
Frontend-to-localhost coupling
Direct process manipulation from route handlers

Environment configuration must control deployment-specific values.

## 45. API Contract Rules for Development

The following rules are mandatory during implementation:

Do not create undocumented public endpoints without updating this contract.
Do not silently change request/response structures.
Use Pydantic models for validation.
Keep generation logic outside route handlers.
Keep AI-provider logic outside generation engines.
Keep validation logic independent from generation logic.
Use structured errors.
Never return internal stack traces.
Never expose API keys.
Use request IDs for tracing.
Use bounded retries.
Use caching where repeated AI requests are avoidable.
Use asynchronous jobs for genuinely long-running operations.
Do not regenerate data unnecessarily during export.
Do not allow failed validation results to become exportable.
Do not use LLM calls for bulk row generation.
Do not send large datasets to external AI services unnecessarily.
Keep the API contract consistent with REQUIREMENTS.md.
Any architecture change affecting this contract must be reflected here before implementation proceeds.

## 46. Canonical End-to-End Workflow

The canonical frontend/backend workflow is:

USER
↓
Provide Schema / Sample / Configuration
↓
POST /schema/infer
↓
DataProfile
↓
POST /generate/\*
↓
Generation
↓
Validation
↓
Evaluation
↓
PASS?
├── YES → Preview / Export
│
└── NO
↓
Regenerate
↓
Validate Again
↓
PASS
↓
Export

For large workloads:

POST /generate/\*/jobs
↓
job_id
↓
GET /jobs/{job_id}
↓
generation completed
↓
validation/evaluation
↓
export

## 47. Final API Architecture

The API must maintain the following logical separation:

                 ┌──────────────────────┐
                 │       FRONTEND       │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │     FASTAPI API      │
                 │  REST / JSON / v1    │
                 └──────────┬───────────┘
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
       Schema Service   Generation     Job Service
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
          Tabular       Relational      Document
           Engine         Engine          Engine
             │              │              │
             └──────────────┼──────────────┘
                            ▼
                     Validation Engine
                            │
                            ▼
                     Evaluation Engine
                            │
                            ▼
                       Export Engine


              ┌─────────────────────────┐
              │       AI SERVICE        │
              │ Cache / Rate Limit /    │
              │ Retry / Token Budget    │
              └────────────┬────────────┘
                           │
                           ▼
                         GROQ

AI remains a cross-cutting intelligence service.

It must not replace the specialized generation engines.

## 48. Contract Completion Criteria

The API contract is considered implementation-ready when:

Every P0 workflow has a documented endpoint.
Request and response schemas are represented through Pydantic models.
Errors use standardized codes.
Long-running operations have job semantics.
Schema inference produces a reusable DataProfile.
Generation produces identifiable generation resources.
Validation is represented as structured data.
Evaluation is represented as structured data.
Export references existing validated generations.
AI calls remain backend-only.
Rate limiting and retry behavior are defined.
Caching behavior is defined.
Security boundaries are defined.
Localhost-first execution is supported.
Future deployment does not require rewriting the API architecture.

## 49. Final API Principle

The HackData V2 API must expose a reliable synthetic-data platform rather than a collection of disconnected generators.

The API's fundamental contract is:

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

The API must optimize for:

Correctness
↓
Reliability
↓
Privacy
↓
Fidelity
↓
Performance
↓
API Efficiency
↓
Extensibility

The API contract must remain consistent with:

REQUIREMENTS.md
ARCHITECTURE.md
TASK-BREAKDOWN.md
TEST-PLAN.md
DEPLOYMENT.md
MASTER-PLAN.md

Any future implementation decision that changes one of these boundaries must be reflected across the relevant documentation before development proceeds.

---

# 50. Part I Differentiator & Enhancement Endpoints (Part I — Akif Complete)

The following endpoints have been added and verified in the backend for Part I to power the frontend differentiator UI components built by Hamza:

### 50.1 Synthetic Columns
- `POST /api/v1/datasets/{dataset_id}/synthetic-columns`
  - **Body:** `SyntheticColumnSpec` (name, data_type, semantic_type, range_min, range_max, categories, weights, date_start, date_end, nullable, etc.)
  - **Response:** `SuccessResponse` with `column_added`, `total_synthetic_columns`, `all_synthetic_columns`.
- `GET /api/v1/datasets/{dataset_id}/synthetic-columns`
  - **Response:** `SuccessResponse` with `count`, `synthetic_columns`.

### 50.2 Real Model Benchmarking
- `POST /api/v1/datasets/{dataset_id}/benchmark`
  - **Body:** `{ "evaluation_sample_size": 50, "seed": 42 }`
  - **Response:** `SuccessResponse` with `selected_model`, `selection_reason`, `best_overall_score`, `candidates`: list of `{ name, available, fit_status, sample_status, fit_time_ms, sample_time_ms, memory_mb, schema_validity, overall_score, distribution_fidelity, novelty_rate, privacy_score, hard_constraint_passed, failure_reason, selection_reason }`.

### 50.3 TSTR (Train on Synthetic, Test on Real)
- `GET /api/v1/datasets/{dataset_id}/tstr/targets`
  - **Response:** `SuccessResponse` with `available_targets_count`, `targets`: list of `{ column, task_type, classes_count, data_type }`.
- `POST /api/v1/datasets/{dataset_id}/tstr`
  - **Body:** `{ "target_column": str, "task_type": "classification"|"regression", "test_size": 0.25, "seed": 42 }`
  - **Response:** `SuccessResponse` with `task_type`, `utility_retention_pct`, `retention_formula`, `real_to_real` metrics, and `synthetic_to_real` metrics.

### 50.4 Controlled Regeneration
- `POST /api/v1/datasets/{dataset_id}/regenerate/diagnose`
  - **Response:** `SuccessResponse` with `diagnostics_count`, `findings`: list of `{ issue_type, severity, message, recommended_strategy }`.
- `POST /api/v1/datasets/{dataset_id}/regenerate`
  - **Body:** `{ "strategy": "rebalance_categories"|"change_model"|"change_seed"|"strengthen_constraints"|"adjust_distribution_fitting", "reason": str, "current_model": str, "seed": int }`
  - **Response:** `SuccessResponse` with `regeneration_id`, `strategy`, `previous_metrics`, `new_metrics`, `improvement_delta`, `improved`: bool, `preferred_run`: "new"|"previous".

### 50.5 Synthia Assistant
- `POST /api/v1/assistant/synthia/session`
  - **Body:** `{ "dataset_id": str | null, "language": "en"|"ur"|"roman_ur" }`
  - **Response:** `SuccessResponse` with `session_id`, `greeting`, `language`.
- `GET /api/v1/assistant/synthia/session/{session_id}`
  - **Response:** `SuccessResponse` with message history.
- `POST /api/v1/assistant/synthia/message`
  - **Body:** `{ "session_id": str, "message": str, "dataset_id": str | null, "language": str | null, "context": dict | null }`
  - **Response:** `SuccessResponse` with `reply`, `language`, `proposal`: structured action proposal (or null).
- `POST /api/v1/assistant/synthia/action`
  - **Body:** `{ "session_id": str, "dataset_id": str, "action_type": str, "proposal": dict, "confirmed": true }`
  - **Response:** `SuccessResponse` confirming applied action and updated dataset/profile state.

