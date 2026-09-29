# HACKDATA V2 — REQUIREMENTS SPECIFICATION

> **Project:** HackData V2  
> **Official Theme:** Synthetic Data Platform  
> **Core Objective:** Generate realistic, privacy-safe synthetic tabular, relational, and document/semi-structured data on demand.  
> **Development Strategy:** Localhost-first, evaluation-driven, quality over superficial breadth.  
> **Status:** Finalized Requirements Baseline — Ready for Development

---

## 1. Purpose

HackData V2 is a schema-aware synthetic data platform designed to generate realistic, privacy-safe data without requiring direct use of real production records.

The platform must support three core data modalities:

1. **Tabular Data**
2. **Relational Data**
3. **Document / Semi-Structured Data**

The system must prioritize:

- Synthetic data fidelity
- Structural correctness
- Referential integrity
- Business-rule correctness
- Privacy protection
- Statistical similarity
- Useful AI-assisted schema understanding and semantic synthesis
- Fast generation
- Reliable validation
- Deterministic reproducibility
- Efficient LLM/API usage

The objective is not to use AI merely as a chatbot. AI must be integrated into the actual synthetic-data generation workflow.

---

# 2. Problem Statement

Real-world data is often difficult to obtain for development, testing, analytics, demonstrations, and AI workflows because it may be:

- Sensitive or personally identifiable
- Restricted by privacy/compliance requirements
- Expensive or slow to acquire
- Incomplete or poorly representative
- Missing important edge cases
- Difficult to safely share across teams

HackData V2 addresses this problem by allowing users to provide a schema, sample dataset, or generation configuration and receive realistic synthetic data without exposing or reproducing real production records.

The platform must therefore focus on generating data that is:

- Realistic
- Structurally valid
- Statistically meaningful
- Privacy-safe
- Reproducible
- Suitable for downstream testing and development

---

# 3. Product Scope

## 3.1 Core Modalities

### 3.1.1 Tabular Data

The platform must generate synthetic tabular datasets while preserving important characteristics of the source schema and data profile.

Examples:

- Customer datasets
- Employee datasets
- Transaction datasets
- Analytics datasets
- Generic CSV/JSON-style tables

The engine should preserve:

- Data types
- Value distributions
- Categorical frequencies
- Relationships/correlations where supported
- Missing-value patterns
- Outlier characteristics
- Semantic meaning of columns

---

### 3.1.2 Relational Data

The platform must generate multiple related tables as a coherent dataset rather than generating each table independently.

The system must preserve:

- Primary keys
- Foreign keys
- Referential integrity
- Relationship cardinality
- Parent-child relationships
- Cross-table consistency
- Business calculations

Example:

```text
Customers
    ↓
Orders
    ↓
Order Items
```

For example:

# Order.total_amount

SUM(OrderItem.quantity × OrderItem.unit_price)
3.1.3 Document / Semi-Structured Data

The platform must support realistic document-style synthetic data.

The initial core document types are:

Invoices
Bank statements

Additional document types may be added only if they can be implemented without reducing the quality and reliability of the core modalities.

The document engine must use deterministic business logic for calculations and structured generation, while AI may assist with semantic content.

## 4. Core Product Principle

Quality Over Superficial Breadth

HackData V2 must prioritize the quality and fidelity of generated data over simply increasing the number of supported data types.

A smaller number of highly reliable generators is preferable to a broad collection of generators that produce low-quality or structurally incorrect data.

Therefore:

No new modality should be added if it materially reduces the fidelity, reliability, validation quality, or demo stability of the existing core modalities.

The MVP must demonstrate a complete and reliable synthetic-data pipeline before experimental features are added.

## 5. Priority Classification

Priority Meaning Development Rule
P0 Mandatory MVP Must work end-to-end before the project is considered MVP-complete.
P1 Core Quality Important for fidelity, reliability, evaluation and demonstration quality.
P2 Enhancement Implement only after P0/P1 are stable.
P3 Differentiator Optional competitive feature after core stability.
P4 Experimental Attempt only if all critical functionality is complete and stable.

Priority must never be interpreted as permission to sacrifice correctness for feature count.

## 6. High-Level Functional Pipeline

The platform must follow the following conceptual pipeline:

USER INPUT
↓
INPUT / SCHEMA UNDERSTANDING
↓
DATA PROFILE
↓
MODALITY-SPECIFIC GENERATION ENGINE
├── Tabular Engine
├── Relational Engine
└── Document Engine
↓
CONSTRAINT & BUSINESS-RULE VALIDATION
↓
QUALITY EVALUATION
├── Statistical Fidelity
├── Structural Fidelity
├── Privacy Evaluation
├── Utility Evaluation
└── Business-Rule Validation
↓
PASS / FAIL
├── PASS → Export
└── FAIL → Regenerate / Adjust

The pipeline must be designed so that generation and validation are separate concerns.

## 7. DataProfile

A central internal representation named DataProfile must bridge schema understanding and generation.

Conceptually:

DataProfile
├── modality
├── schema
├── columns
├── semantic types
├── data types
├── formats
├── distributions
├── correlations
├── relationships
├── constraints
├── privacy configuration
├── generation configuration
└── evaluation configuration

The DataProfile must be serializable and reusable where practical.

It should allow:

Generation engines to consume normalized information
Validation engines to compare generated data against expected characteristics
Cached schema analysis to avoid repeated LLM calls
Deterministic regeneration
Cross-component interoperability

## 8. Functional Requirements

8.1 Input & Schema Understanding
FR-001 — Schema Input

Priority: P0

The system must accept schema information sufficient to configure synthetic-data generation.

Supported input mechanisms may include:

Structured schema definitions
CSV/JSON samples
Database-style schemas
SQL DDL where practical
User-defined configuration

The exact supported formats must be documented by the API contract.

FR-002 — Sample Dataset Input

Priority: P0

The system must accept small representative datasets where available.

The system should use samples to infer:

Column types
Value ranges
Formats
Categorical values
Missingness
Statistical characteristics
Semantic hints
Relationship hints
FR-003 — Schema Understanding

Priority: P0

The system must automatically analyze available schema/sample information and produce a structured DataProfile.

Schema understanding should identify:

Data types
Semantic types
Formats
Candidate identifiers
Primary-key candidates
Foreign-key candidates
Potential relationships
Constraints
Sensitive columns
Distribution characteristics
FR-004 — AI-Assisted Semantic Understanding

Priority: P1

The AI layer may assist in identifying semantic meaning such as:

Person names
Email addresses
Phone numbers
Addresses
Currency
Dates
Timestamps
Company names
Product descriptions
Free text

AI output must be converted into structured information before being consumed by generation engines.

FR-005 — Business Rule Configuration

Priority: P1

The system should support user-defined or inferred business rules such as:

Minimum/maximum values
Date ranges
Balance constraints
Tax rules
Arithmetic relationships
Allowed categories
Relationship constraints

## 9. Tabular Generation Requirements

FR-010 — Statistical Fidelity

Priority: P0

The tabular engine must attempt to preserve important statistical properties of the source dataset or configured profile.

Relevant characteristics include:

Numeric distributions
Categorical frequencies
Missing-value rates
Range characteristics
Correlations where supported
Outlier characteristics

The generation method must be selected based on the dataset characteristics rather than blindly applying one model to every dataset.

FR-011 — Configurable Row Count

Priority: P0

Users must be able to specify the requested number of generated rows within supported resource limits.

The system must distinguish between:

Preview generation
Full generation

Preview generation should remain lightweight.

FR-012 — Deterministic Random Seed

Priority: P0

The system must support a configurable random seed.

Given identical:

Input/profile
Configuration
Generator version
Random seed

the system should produce reproducible results where deterministic generation is supported.

FR-013 — Missing Values

Priority: P1

The system should support configurable missing/null-value rates.

Missingness should be applied in a controlled manner and should not violate mandatory constraints such as:

Primary keys
Required fields
Foreign keys
Required document fields
FR-014 — Outlier / Edge-Case Injection

Priority: P1

The system should support controlled injection of:

Statistical outliers
Boundary values
Rare categories
Missing values
Unusual but valid records

The objective is to produce useful testing data rather than random corruption.

FR-015 — Column-Level Privacy Controls

Priority: P0

Sensitive columns must support configurable privacy transformations where appropriate.

Supported mechanisms may include:

Masking
Hashing
Controlled noise
Synthetic replacement
Other documented privacy transformations

Privacy transformations must not silently break structural or business constraints.

## 10. Relational Generation Requirements

FR-020 — Referential Integrity

Priority: P0

Every generated foreign-key value must reference a valid parent record where the relationship requires it.

The generated dataset must contain:

0 invalid foreign-key references
0 unintended orphaned child records
FR-021 — Relationship Cardinality

Priority: P0

The relational engine must support relationship patterns including:

1:1
1:N
N:N

The generated relationship counts should follow the configured or inferred cardinality profile.

FR-022 — Primary-Key Integrity

Priority: P0

Generated primary keys must be unique within their respective tables and must satisfy the configured data type/format.

FR-023 — Cross-Table Consistency

Priority: P0

Related tables must remain logically consistent.

Example:

# Orders.total_amount

SUM(OrderItems.quantity × OrderItems.unit_price)

Other cross-table calculations must follow the corresponding business rules.

FR-024 — Relational Schema Presets

Priority: P1

The platform should provide at least one demonstrable multi-table schema preset such as:

Customers
↓
Orders
↓
Order Items

The preset must demonstrate:

PK/FK relationships
Cardinality
Realistic values
Cross-table calculations
Validation

## 11. Document Generation Requirements

FR-030 — Invoice Generation

Priority: P0

The platform must generate realistic synthetic invoices containing appropriate structured information such as:

Invoice number
Seller information
Buyer information
Dates
Line items
Quantity
Unit price
Subtotal
Taxes
Total
FR-031 — Invoice Arithmetic Integrity

Priority: P0

Invoice calculations must be deterministic and mathematically correct.

For example:

subtotal = Σ(quantity × unit_price)

total = subtotal + taxes - discounts

The exact formula must follow the selected invoice configuration.

FR-032 — Regional Invoice Configuration

Priority: P1

The invoice engine should support configurable:

Currency
Date format
Tax labels
Regional formatting
Layout/template variations
FR-033 — Bulk Document Generation

Priority: P1

The system should support generation of multiple documents efficiently.

Bulk generation must not require an LLM call for every document unless a specific semantic requirement makes it necessary.

FR-034 — Bank Statement Generation

Priority: P0

The platform must generate synthetic bank statements containing:

Dates
Transaction descriptions
Merchant names
Debit/credit amounts
Running balances
Appropriate account metadata
FR-035 — Running Balance Integrity

Priority: P0

Every generated bank statement must satisfy:

# current_balance

previous_balance

- credits

* debits

No arithmetic discrepancy is acceptable in a successfully validated output.

FR-036 — Query-Based Generation

Priority: P1

The system should support natural-language or structured requests such as:

Generate transactions for the last 90 days
with balances above a specified threshold.

Where natural language is used, the AI layer should convert the request into a structured generation configuration.

The generation engine itself must remain deterministic and rule-driven.

## 12. AI / LLM Requirements

FR-040 — AI as a Cross-Cutting Intelligence Layer

Priority: P0

AI must operate as an intelligence layer across the synthetic-data pipeline.

It must not be implemented merely as a standalone chatbot.

AI may assist with:

Schema understanding
Semantic type inference
Relationship interpretation
Natural-language configuration
Realistic semantic content
Edge-case proposals
Document semantics
Query interpretation
FR-041 — No Row-by-Row LLM Bulk Generation

Priority: P0

The system must NOT depend on an LLM call for every generated row or document.

Bulk generation must primarily be performed by specialized deterministic/statistical/local generation engines.

The LLM should produce structured generation instructions, semantic information, templates, or small batches of semantic content where appropriate.

FR-042 — Structured AI Output

Priority: P0

AI responses must be converted into structured machine-readable representations before entering the generation pipeline.

Where supported, structured JSON/schema-constrained responses should be used.

Free-form LLM output must not directly control critical business calculations.

FR-043 — LLM Provider

Priority: P0

The initial AI integration must use the configured Groq API through a dedicated AI service abstraction.

The application must not tightly couple business logic to a specific model implementation.

Model selection must be configurable through environment/configuration settings.

Changing the configured model must not require rewriting generation engines.

FR-044 — LLM Call Minimization

Priority: P0

LLM calls must be minimized.

The system should:

Analyze a schema once and reuse the result
Cache equivalent schema-analysis requests
Avoid duplicate semantic requests
Batch compatible semantic tasks
Use deterministic local generation for bulk data
Reuse generated semantic profiles
Avoid unnecessary calls during preview updates
FR-045 — LLM Response Caching

Priority: P1

The AI service should cache reusable responses based on a canonicalized request representation.

Equivalent requests should not repeatedly consume API quota unless the caller explicitly requests regeneration.

FR-046 — Rate Limiting

Priority: P0

The AI service must implement application-level rate limiting to prevent excessive API usage.

The system must gracefully handle provider rate limits rather than repeatedly sending uncontrolled requests.

FR-047 — Retry & Exponential Backoff

Priority: P0

Transient AI/API failures must use bounded retries with exponential backoff.

The system must distinguish between:

Retryable errors
Rate-limit errors
Authentication/configuration errors
Invalid requests
Permanent failures

Infinite retry loops are prohibited.

FR-048 — Token Budgeting

Priority: P1

AI requests must use controlled prompts and bounded output sizes.

The system should avoid sending:

Entire large datasets
Unnecessary repeated schema information
Redundant context
Generated rows that can be produced locally

Only the minimum information necessary for the AI task should be sent.

FR-049 — AI Failure Resilience

Priority: P1

The platform must degrade gracefully when the LLM service is unavailable.

Core deterministic generation and validation functionality should continue to work wherever possible without unnecessary dependency on live LLM calls.

## 13. Generation Engine Requirements

FR-050 — Specialized Generation Engines

Priority: P0

The platform must maintain separate generation engines for:

Tabular
Relational
Document

Each engine must expose a consistent internal interface to the orchestration layer.

FR-051 — Generator Selection

Priority: P1

The platform should select an appropriate generation strategy based on:

Dataset characteristics
Data modality
Schema
Statistical profile
Relationships
Constraints
Requested scale

The implementation must not assume that a single synthetic-data algorithm is optimal for every dataset.

FR-052 — Local Generation

Priority: P0

Bulk generation should run locally during the MVP wherever practical.

The system should leverage local compute for:

Statistical modeling
Synthetic row generation
Relationship generation
Validation
Evaluation
Document generation
Rendering

This reduces dependence on external APIs and provides greater control during the hackathon.

## 14. Validation Requirements

FR-060 — Pre-Export Validation

Priority: P0

Generated data must pass validation before being presented as a successfully generated final dataset.

Validation must include applicable checks for:

Schema validity
Data types
Null constraints
Primary keys
Foreign keys
Relationship integrity
Business rules
Arithmetic correctness
Document consistency
FR-061 — Statistical Validation

Priority: P0

The platform must compare generated data against the target profile where source data/profile information is available.

Possible measurements include:

Distribution similarity
Categorical frequency similarity
Correlation similarity
Missingness similarity
Range similarity
Outlier behavior

The exact statistical metrics should be selected based on the data type.

FR-062 — Privacy Evaluation

Priority: P0

The platform must evaluate whether generated data introduces obvious privacy risks.

Checks should include, where applicable:

Exact record overlap
Suspicious memorization
Sensitive-field exposure
Identifier leakage
Unsafe copying of source values

Privacy evaluation must be treated separately from ordinary statistical similarity.

FR-063 — Utility Evaluation

Priority: P1

Where feasible, the platform should evaluate whether synthetic data remains useful for downstream analytical or machine-learning tasks.

One supported evaluation approach should be:

TSTR
Train on Synthetic
Test on Real

Utility metrics should be appropriate to the task.

FR-064 — Business-Rule Evaluation

Priority: P0

Business-specific constraints must be validated explicitly.

Examples:

Invoice totals reconcile
Bank balances reconcile
Foreign keys are valid
Order totals match line items
Dates follow configured constraints
FR-065 — Validation Result

Priority: P0

Validation must produce a structured result indicating:

PASS / FAIL

along with relevant diagnostics.

The result should identify:

Failed checks
Severity
Affected data
Relevant constraint
Suggested regeneration/adjustment where possible

## 15. Regeneration Requirements

FR-070 — Generate → Validate → Regenerate

Priority: P0

The platform must support a controlled regeneration loop:

Generate
↓
Validate
↓
Evaluate
↓
PASS ─────────→ Export
│
FAIL
↓
Adjust / Regenerate

Regeneration must be bounded and must not create infinite loops.

FR-071 — Failure-Aware Regeneration

Priority: P1

When generation fails validation, the system should identify the relevant generation parameter or constraint before attempting regeneration where practical.

The goal is to fix the cause rather than blindly regenerate the same output.

## 16. Workspace Requirements

FR-080 — Unified Workspace

Priority: P0

The application must provide a unified workspace where users can:

Select/configure a generation modality
Provide schema/sample/configuration
Configure generation parameters
Preview generated data
Review validation/evaluation results
Export the final result
FR-081 — Three Data Types

Priority: P0

The workspace must make the three core modalities easily accessible:

Tabular
Relational
Documents
FR-082 — Live Preview

Priority: P1

The interface should provide a lightweight preview of generated output.

Preview generation should use a small sample rather than regenerating the entire requested dataset after every UI interaction.

FR-083 — Generation Configuration

Priority: P0

The user should be able to configure applicable parameters including:

Row count
Random seed
Locale
Currency
Privacy rules
Missingness
Outlier settings
Relationship configuration
Document configuration
Export format

Only relevant controls should appear for each modality.

FR-084 — Zero-Code Workflow

Priority: P0

The primary user workflow must be executable from the web interface without requiring the user to write code or manually execute backend commands.

## 17. Export Requirements

FR-090 — Tabular Export

Priority: P0

The platform must support appropriate structured exports such as:

CSV
JSON
FR-091 — Relational Export

Priority: P0

The platform must support relational exports suitable for downstream database use.

The exact SQL dialect must be defined by the implementation and API contract.

FR-092 — Document Export

Priority: P0

The platform must support export of generated documents in appropriate downloadable formats.

For the MVP this may include:

PDF
Structured JSON/CSV where applicable
FR-093 — Export Validation

Priority: P0

Exported files must be validated for:

Correct structure
Encoding
Required fields
Data completeness
Referential integrity where applicable
Mathematical consistency where applicable

## 18. Performance Requirements

NFR-001 — Responsive Preview

Priority: P1

Preview generation must be optimized for interactive use.

The system should generate a small preview sample quickly rather than performing full-scale generation for every configuration change.

A practical target is sub-second response for lightweight previews, subject to hardware and dataset complexity.

NFR-002 — Efficient Bulk Generation

Priority: P0

Bulk generation must use local/vectorized/batched processing where practical.

The system must avoid unnecessary:

Network calls
LLM calls
Repeated schema analysis
Row-by-row remote processing
NFR-003 — Deterministic Reproducibility

Priority: P0

Identical generation inputs and configuration must produce reproducible results where the selected generation algorithm supports deterministic operation.

NFR-004 — Resource Awareness

Priority: P1

The system must avoid exhausting local CPU, RAM, GPU, disk, or API resources.

Large jobs should be processed through controlled workers/batches where necessary.

## 19. Reliability Requirements

NFR-010 — Graceful Failure

The system must return meaningful errors instead of silently producing invalid synthetic data.

NFR-011 — Bounded Retries

External API retries must be bounded.

NFR-012 — Job Isolation

Long-running generation jobs should not block the entire web application.

Where necessary, generation must execute through a worker/background-job mechanism.

NFR-013 — Validation Before Success

A generation request must not be reported as successfully completed if mandatory validation has failed.

NFR-014 — No Silent Data Corruption

Transformation, generation, validation and export stages must preserve explicit error states.

## 20. Privacy & Security Requirements

NFR-020 — No Production Data Requirement

The platform must not require access to real production databases.

Users should be able to provide:

Schemas
Small samples
Configuration
Synthetic examples
NFR-021 — Sensitive Input Handling

Sensitive input data must be minimized and processed only when necessary for schema/profile extraction.

NFR-022 — No Unnecessary External Transmission

Large source datasets must not be sent to external LLM APIs merely for convenience.

Only the minimum information required for an AI task may be transmitted.

NFR-023 — API Secret Protection

API keys and secrets must:

Never be hardcoded
Never be committed to Git
Be loaded from environment/configuration
Never be exposed to the frontend
NFR-024 — Backend-Only External API Access

Groq and other secret-bearing services must be accessed through the backend/service layer.

Frontend code must never contain provider secrets.

NFR-025 — Input Validation

All user-provided:

Files
JSON
Schema definitions
Configuration
Query parameters

must be validated before processing.

NFR-026 — File Safety

Uploaded files must be subject to:

Type validation
Size limits
Safe parsing
Controlled temporary storage
Cleanup after processing where appropriate
NFR-027 — Privacy Evaluation

Synthetic output must be evaluated for obvious memorization or direct leakage before final export where source data is available.

## 21. Localhost-First Deployment Requirement

NFR-030 — MVP Runs Locally

Priority: P0

The primary MVP environment is localhost.

The core application must be capable of running locally as:

Frontend
↓
Backend API
↓
Generation / Validation Workers
↓
Local Storage / Supabase where required
↓
Groq only for required AI tasks
NFR-031 — Deployment Is Not an MVP Dependency

The MVP must not depend on successful cloud deployment.

Deployment to services such as Vercel or Render is optional after the local MVP is stable.

NFR-032 — Deployment Compatibility

Although localhost-first, the architecture must maintain clean service boundaries so that deployment can be performed later without rewriting the core generation engines.

## 22. API & Service Reliability Requirements

NFR-040 — API Timeout Handling

External calls must have explicit timeouts.

NFR-041 — Provider Rate-Limit Handling

The application must gracefully handle provider rate-limit responses.

### The system must:

Detect rate-limit errors
Respect retry timing where available
Apply exponential backoff
Limit retry attempts
Surface a meaningful error when recovery fails
NFR-042 — Request Deduplication

Equivalent AI requests should be deduplicated or served from cache where practical.

NFR-043 — AI Usage Tracking

The application should track relevant AI usage information such as:

Request count
Cached requests
Failed requests
Approximate token usage where available
Retry count
Latency

This allows the team to detect API waste during the hackathon.

## 23. Evaluation Requirements

HackData V2 must evaluate synthetic data from multiple dimensions.

### 23.1 Statistical Fidelity

### Evaluate:

Numeric distributions
Categorical distributions
Correlations
Missingness
Ranges
Outliers

### 23.2 Structural Fidelity

### Evaluate:

Schema compliance
Primary keys
Foreign keys
Cardinality
Relationships
Required fields
23.3 Business Fidelity

### Evaluate:

Invoice calculations
Bank balances
Cross-table calculations
Configured constraints
Domain-specific rules

### 23.4 Privacy

### Evaluate:

Exact record overlap
Sensitive value leakage
Memorization indicators
Identifier leakage

### 23.5 Utility

Where feasible, evaluate downstream usefulness through methods such as:

### TSTR

Train on Synthetic → Test on Real

The utility evaluation must be interpreted together with privacy and fidelity rather than treated as the sole quality metric.

## 24. Architecture Boundaries

The requirements imply the following logical components:

Frontend
↓
API Layer
↓
Orchestrator
↓
Schema Understanding
↓
DataProfile
↓
Generation Engines
├── Tabular
├── Relational
└── Document
↓
Validation
↓
Evaluation
↓
Regeneration / Export

AI operates across the relevant stages:

AI Service
├── Schema Understanding
├── Semantic Synthesis
├── Query Interpretation
├── Edge-Case Proposal
└── Document Semantics

The AI service must remain separate from the core deterministic generation engines.

## 25. Data Generation Principles

The following principles are mandatory:

### Principle 1 — AI Does Not Generate Everything

LLMs must not be used as a replacement for statistical generators, relational engines, arithmetic logic, or document calculation logic.

### Principle 2 — Deterministic Logic Handles Critical Mathematics

Examples:

Invoice totals
Running balances
Foreign keys
Primary keys
Order totals
Tax calculations

must be generated/validated through deterministic logic.

### Principle 3 — Statistical Engines Handle Bulk Data

Bulk records should be generated using appropriate local/statistical generation methods.

### Principle 4 — AI Handles Semantic Intelligence

AI is best used for:

Understanding
Interpretation
Semantic realism
Natural-language configuration
Edge-case reasoning
Content suggestions

#### Principle 5 — Validation Is Mandatory

Generated data is not considered complete until required validation succeeds.

### Principle 6 — Regeneration Must Be Controlled

Failed outputs should be corrected through bounded regeneration rather than infinite retry loops.

## 26. MVP Definition of Done

HackData V2 MVP is considered complete when the following end-to-end workflow works locally:

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
PASS
↓
Preview
↓
Export

And, where validation fails:

Generation
↓
Validation
↓
FAIL
↓
Adjustment / Regeneration
↓
Validation
↓
PASS

At minimum, the MVP must demonstrate:

Tabular synthetic generation
Relational synthetic generation
Invoice generation
Bank statement generation
Schema-aware processing
AI-assisted semantic understanding
Referential integrity
Business-rule validation
Statistical evaluation
Privacy-aware processing
Deterministic seeds
Configurable generation
Export
Localhost execution
Reliable Groq integration
API rate-limit handling
LLM caching/usage optimization
No row-by-row LLM generation

## 27. Scope Control

The following rules apply throughout development:

Do not add a feature merely because it is technically interesting.
Do not add a modality if it reduces core fidelity.
Do not replace deterministic generation with unnecessary LLM calls.
Do not make deployment a blocker for the local MVP.
Do not introduce architecture complexity without a clear benefit.
Do not bypass validation for the sake of demo speed.
Do not expose secrets to the frontend.
Do not send large sensitive datasets to external AI services unnecessarily.
Do not allow repeated API calls caused by avoidable UI refreshes.
Do not claim a dataset is successful before mandatory validation passes.

## 28. Optional / Future Features

The following may be considered only after the MVP is stable:

Additional document types
More advanced privacy mechanisms
Advanced differential privacy calibration
More sophisticated natural-language generation workflows
Advanced automatic generator selection
More advanced utility evaluation
Advanced visualization
Additional export formats
Cloud deployment
Distributed generation
Advanced autonomous regeneration
Additional AI-powered data curation

These features must never compromise the core MVP.

## 29. Requirements Traceability

Area Core Requirement
Problem Privacy-safe synthetic data
Input Schema/sample/configuration
Intelligence Schema-aware AI layer
Core Modality 1 Tabular
Core Modality 2 Relational
Core Modality 3 Documents
Generation Specialized engines
AI Selective semantic intelligence
Validation Structural + business + statistical
Privacy Leakage-aware generation/evaluation
Utility TSTR where feasible
Reliability Bounded retries + graceful failures
API Rate limiting + caching + backoff
Performance Local/batched generation
Reproducibility Configurable random seed
UX Unified configure → preview → validate → export workflow
Deployment Localhost-first
Cloud Optional after MVP
Scope Fidelity over superficial breadth

## 30. Final Requirement Statement

HackData V2 is not merely a random-data generator and not merely an AI chatbot.

It must be implemented as a:

Schema-aware, AI-assisted, multi-modal synthetic data generation and evaluation platform.

### The core engineering objective is:

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
REGENERATE IF NECESSARY
↓
EXPORT

### The platform must prioritize:

Accuracy

> Structural Integrity
>
> Privacy
>
> Business Correctness
>
> Utility
>
> Speed
>
> Breadth

Breadth must never be increased at the expense of the quality of the generated data.

### The MVP must remain:

Localhost-first
Fast
Reliable
Secure
Privacy-aware
API-efficient
Deterministic where applicable
Evaluation-driven
Modular
Extensible
Demonstrably useful

All downstream architecture, API, task breakdown, testing, deployment and implementation decisions must remain consistent with this requirements specification.
