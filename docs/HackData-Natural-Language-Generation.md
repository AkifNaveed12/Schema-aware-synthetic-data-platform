# HackData V2 --- Natural-Language Synthetic Data Generation

**Status:** Post-MVP feature specification\
**Primary owner:** Akif --- Backend / AI / ML / Integration / Supabase /
Deployment\
**Frontend:** Akif-led for this feature\
**Rule:** Preserve the verified MVP and make this the primary
natural-language entry path.

## 1. Product Goal

The current MVP already supports:

`Upload → Profile → Clean → DataProfile → Configure → Generate → Validate → Evaluate → Preview → Export`

The new requirement adds a second, easier entry path:

`User text/voice → Intent understanding → Structured Generation Specification → DataProfile/schema → Existing generation engines → Validation → Evaluation → Regeneration → Preview → Export`

A user should be able to say:

> Generate 10,000 realistic Pakistani retail customers with names,
> gender, age, city, membership tier and spending behavior.

or:

> I need relational billing data with customers, invoices, invoice
> items, products and payments. Give me 10,000 invoices and SQL/CSV/JSON
> output.

The system should understand the request, ask only necessary follow-up
questions, build a structured specification, and then use HackData's
existing specialized generators.

**The LLM is the intent/planning layer, not the bulk row generator.**

------------------------------------------------------------------------

# 2. Two Entry Paths

The existing upload workflow remains.

### A --- Generate from description

`Text/Voice → Conversation → Structured Spec → Generation → Validation → Evaluation → Export`

### B --- Generate from existing dataset

`Upload → Profile → Configure → Generation → Validation → Evaluation → Export`

Both converge on the same DataProfile, generation, validation,
evaluation, regeneration and export architecture.

The upload path must not be removed.

------------------------------------------------------------------------

# 3. Dedicated Natural-Language Generation Screen

Create a first-class **Create Synthetic Data** / **Generate with AI**
page.

It should not look like a generic ChatGPT clone.

Suggested structure:

``` text
Create Synthetic Data

Describe what you need

┌──────────────────────────────────────────────┐
│ I need billing invoice data for a Pakistani  │
│ retail company...                            │
│                                      🎙     │
└──────────────────────────────────────────────┘

[ Continue ]

Conversation / Clarifications

Generation Plan
Domain: ...
Modality: ...
Rows: ...
Schema: ...
Constraints: ...
Outputs: ...

[ Edit Plan ] [ Generate ]
```

Examples can be shown below the composer:

-   Customer data for an e-commerce platform
-   Relational billing/invoice data
-   Employee HR data
-   Financial transactions
-   Product/catalog data

------------------------------------------------------------------------

# 4. Text and Voice

Text and voice must enter the same backend intent pipeline.

``` text
Text → Intent parser
Voice → Browser Speech Recognition → Transcript → Intent parser
```

Use browser-native speech where supported:

-   Web Speech API / SpeechRecognition
-   SpeechSynthesis

No paid speech provider is required.

If speech recognition is unavailable, provide a text fallback.

------------------------------------------------------------------------

# 5. Conversation / Clarification Logic

The LLM must determine whether enough information exists to build a
reliable specification.

Potential information:

-   domain
-   purpose/use case
-   modality
-   requested row count
-   entities/tables/documents
-   important columns
-   semantic requirements
-   locale/country/currency
-   explicit demographic constraints
-   relationships
-   business constraints
-   desired output formats

Not every request needs every field.

Use safe defaults where appropriate.

### Example

User:

> Generate billing invoices.

Assistant:

> How many invoices do you need, and should this be a simple invoice
> table or a relational dataset with customers, invoices, invoice items
> and payments?

User:

> 10,000 invoices, relational, Pakistani retail.

Assistant can proceed to a plan.

Do not ask unnecessary questions. The goal is to obtain enough
information, not to conduct a long interview.

------------------------------------------------------------------------

# 6. Structured Generation Specification

After clarification, the LLM must output a strict structured object.

Use Pydantic/JSON Schema validation.

Conceptual structure:

``` json
{
  "intent": {
    "domain": "ecommerce",
    "purpose": "dashboard_testing"
  },
  "modality": "relational",
  "row_requirements": {
    "total": 10000
  },
  "locale": {
    "country": "Pakistan",
    "language": "en",
    "currency": "PKR"
  },
  "entities": [
    {"name": "customers", "row_count": 5000},
    {"name": "orders", "row_count": 15000},
    {"name": "order_items", "row_count": 30000}
  ],
  "columns": [],
  "relationships": [],
  "constraints": [],
  "semantic_requirements": [],
  "output_formats": ["csv", "json", "sql"]
}
```

The exact implementation must align with the existing DataProfile and
API contracts.

Pipeline:

`LLM output → JSON parse → schema validation → normalization → business-rule validation → generation specification`

Never blindly trust LLM JSON.

------------------------------------------------------------------------

# 7. Modality Detection

Recognize supported requests as:

### Tabular

Customers, employees, products, transactions, etc.

### Relational

Customers + orders + items, invoices + items + payments, etc.

### Document

Invoices, bank statements, business documents, etc.

If unsupported, explain the limitation and offer the closest supported
path. Never pretend unsupported generation exists.

------------------------------------------------------------------------

# 8. Schema Planning

The user can explicitly provide columns:

> Create customers with name, age, gender, city and income.

Or provide only a domain:

> Generate realistic employee data.

For the latter, the semantic layer can propose a schema such as:

``` text
employee_id
name
gender
date_of_birth
department
job_title
employment_type
joining_date
salary
city
```

The user must be able to review and modify the proposal.

This must connect to the existing synthetic-column capability.

------------------------------------------------------------------------

# 9. Synthetic Columns

Natural-language requests can add columns:

> Also add salary_band and seniority_level.

Convert this to structured specifications:

``` text
salary_band
type: categorical
semantic role: salary_band

seniority_level
type: categorical
semantic role: seniority_level
```

The LLM interprets the meaning. The existing generator creates the
actual values.

------------------------------------------------------------------------

# 10. Natural-Language Constraints

Translate explicit user constraints into structured constraints.

Examples:

> Gender should be roughly balanced.

> Lahore and Karachi should be more common than other cities.

> Orders must reference an existing customer.

> Invoice total must equal subtotal plus tax.

> Salary should increase with seniority.

Deterministic rules remain deterministic. For example:

`subtotal + tax = total`

must be enforced by the deterministic business-rule layer, not
calculated row-by-row by the LLM.

Do not infer sensitive demographic attributes that the user did not
request.

------------------------------------------------------------------------

# 11. Semantic Seed / Blueprint

The LLM may create a small structured semantic blueprint:

``` text
Domain: Pakistani retail

Cities:
Karachi
Lahore
Islamabad
Rawalpindi

Categories:
Grocery
Electronics
Apparel
Household

Customer tiers:
Standard
Premium
Enterprise
```

This is configuration/semantic guidance, not the final dataset.

Never send thousands of rows through the LLM.

------------------------------------------------------------------------

# 12. Existing Generation Models Remain the Generator

After intent parsing:

### Tabular

-   Statistical Baseline
-   CTGAN
-   TVAE

### Relational

-   DataProfile
-   relationship/DAG logic
-   specialized relational generation

### Documents

-   DocumentEngine

### Deterministic logic

-   FK assignment
-   totals
-   tax
-   balances
-   business rules

The LLM must not replace these systems.

------------------------------------------------------------------------

# 13. Model Benchmarking

Use the existing benchmark system.

The natural-language layer can help choose an initial strategy, but
final selection must use measured backend evidence:

`Specification → Candidate models → Benchmark → Validation → Quality evaluation → Selection`

Never fabricate quality scores or claim a model is universally best.

------------------------------------------------------------------------

# 14. Generation Lifecycle

Once the user approves the plan:

``` text
Generation Specification
↓
DataProfile / Schema
↓
Model Benchmark
↓
Generation
↓
Validation
↓
Quality Evaluation
↓
TSTR where applicable
↓
Regeneration if required
↓
Final result
```

Show progress such as:

``` text
Understanding request       ✓
Planning schema             ✓
Preparing generation        ✓
Generating synthetic data   ...
Validating                  ...
Evaluating quality          ...
Preparing exports           ...
```

Do not return a result merely because model sampling completed.

------------------------------------------------------------------------

# 15. Quality Gate

Verify:

-   schema validity
-   requested row count
-   data types
-   null/invalid values
-   constraints
-   PK/FK integrity
-   deterministic business rules
-   quality metrics
-   privacy/novelty where available

If quality is weak:

`Issue → explanation → supported regeneration strategy → regenerate → evaluate again`

Reuse the existing controlled regeneration implementation.

------------------------------------------------------------------------

# 16. Generation Plan Review

For larger requests, show a compact review before expensive generation:

``` text
YOUR GENERATION PLAN

Domain: Pakistani retail
Type: Relational

Customers — 5,000
Invoices — 10,000
Invoice Items — ...

Constraints:
• PK/FK integrity
• PKR currency
• Pakistani locations
• Consistent invoice totals

Outputs:
CSV / JSON / SQL

Model strategy:
Automatic benchmarking

[ Edit Plan ] [ Generate Data ]
```

Simple requests may skip this review and proceed directly.

------------------------------------------------------------------------

# 17. Exports

After successful generation provide supported formats:

-   CSV
-   JSON
-   SQL / DDL + data where supported
-   PDF for document-oriented outputs where supported

Exports must come from actual generated results, never from LLM prose.

------------------------------------------------------------------------

# 18. Supabase Persistence

Persist the natural-language workflow.

Recommended records:

-   `generation_requests`
-   `generation_specifications`
-   `generation_runs`
-   `evaluation_results`
-   `regeneration_runs`
-   `generation_results`

Track:

-   request ID
-   user prompt/transcript
-   normalized specification
-   modality
-   requested rows
-   status
-   selected model
-   metrics
-   output metadata
-   timestamps
-   errors
-   final generation ID

Do not store unnecessary raw sensitive data.

Do not store microphone audio by default.

Architecture remains:

`Frontend → Backend → Supabase`

The Supabase service-role key is backend-only.

------------------------------------------------------------------------

# 19. Conversation Persistence

The user can continue:

> Make it 20,000 instead.

The system should modify the existing structured specification instead
of starting from zero.

Maintain:

`previous specification + user change → new validated specification`

------------------------------------------------------------------------

# 20. LLM Provider Strategy

Keep the existing provider abstraction.

General AI:

``` env
GROQ_API_KEY=...
```

Synthia remains separate:

``` env
GROQ_ASSISTANT_API_KEY=...
```

The natural-language generation workflow can use `GROQ_API_KEY`.

Do not expose either key to the browser.

------------------------------------------------------------------------

# 21. Optional Jev Provider

If the additional Jev model/API is actually available, integrate it only
behind the existing LLM provider abstraction.

Do not make Jev mandatory.

The user has limited promotional credit, so:

-   do not call it on every request
-   do not use it for bulk row generation
-   do not use it for deterministic validation
-   do not use it for every conversational turn
-   cache repeated requests
-   use strict token/request budgets
-   prefer Groq for normal operation
-   use Jev only where it provides useful additional reasoning
-   fall back to Groq if Jev is unavailable

Do not invent a Jev API contract. First inspect its actual API
documentation/credentials.

Architecture:

``` text
LLMProvider
├── GroqProvider
└── JevProvider (optional)
```

The product must work with Jev disabled.

------------------------------------------------------------------------

# 22. Cost / Rate-Limit Protection

Use:

-   structured prompts
-   concise context
-   caching
-   request hashing
-   token limits
-   conversation-turn limits
-   retry/backoff
-   rate limiting
-   provider fallback

Do not call an LLM once per column when a single structured schema
request can handle the task.

Never call an LLM once per generated row.

------------------------------------------------------------------------

# 23. Example Conversation

User:

> I want synthetic billing data for a Pakistani retail company.

Assistant:

> Should I create a simple invoice table, or a relational dataset with
> customers, invoices, invoice items, products and payments?

User:

> Relational. Around 10,000 invoices.

Assistant:

> Should I use Pakistani cities and PKR currency? And do you need CSV,
> SQL, JSON, or all three?

User:

> Yes, all three.

Assistant:

> Generation plan: - Customers - Invoices - Invoice Items - Products -
> Payments - PKR amounts - Pakistani locations - Consistent
> relationships - Automatic model benchmarking - Validation and quality
> evaluation
>
> \[Review Plan\] \[Generate\]

Then the real HackData engines run.

------------------------------------------------------------------------

# 24. Frontend Requirements

The dedicated screen should contain:

1.  Natural-language composer
2.  Microphone control
3.  Conversation/clarification area
4.  Generation-plan card
5.  Schema/column review
6.  Constraint review
7.  Output-format selection
8.  Generate action
9.  Progress
10. Results
11. Evaluation
12. Export

It should visually belong to HackData, not look like an unrelated
chatbot.

Advanced configuration should be progressively revealed rather than
showing the full technical DataProfile immediately.

------------------------------------------------------------------------

# 25. Relationship to Synthia

Synthia remains the floating contextual assistant throughout the
Workspace.

This new screen is the **full conversational generation workflow**.

They share the same backend AI/provider architecture.

### Create Synthetic Data

Primary natural-language generation experience.

### Synthia

Contextual assistant that can guide the user and direct them into the
generation workflow.

Do not create two independent generation engines.

------------------------------------------------------------------------

# 26. Security

The LLM must never directly execute:

-   SQL
-   Python
-   shell commands
-   filesystem operations
-   arbitrary database queries

The LLM produces structured intent only.

Backend validation converts approved intent into known application
operations.

All generated SQL must pass the existing safe identifier/value handling.

------------------------------------------------------------------------

# 27. Testing

Add automated tests for:

### Intent parsing

-   complete request
-   incomplete request
-   clarification
-   malformed LLM JSON
-   unsupported modality

### Specification

-   schema validation
-   row-count validation
-   column validation
-   relationship validation
-   constraint normalization

### Generation

-   tabular request
-   relational request
-   document request
-   synthetic columns
-   deterministic constraints

### Quality

-   validation
-   evaluation
-   regeneration

### Conversation

-   follow-up modification
-   state persistence

### Providers

-   Groq
-   optional Jev adapter
-   fallback behavior
-   rate-limit behavior
-   caching

### Security

-   no arbitrary action execution
-   no secret exposure
-   SQL safety
-   malicious prompt/structured-output rejection

------------------------------------------------------------------------

# 28. Definition of Done

A new user must be able to:

1.  Open Create Synthetic Data.
2.  Type a natural-language request.
3.  Or speak it.
4.  Receive clarification only when needed.
5.  Answer the clarification.
6.  Receive a structured generation plan.
7.  Review/edit it.
8.  Generate through the real HackData engines.
9.  See progress.
10. See validation.
11. See quality evaluation.
12. Trigger controlled regeneration if needed.
13. View real generated records.
14. Export supported formats.
15. Continue the conversation and modify the request.
16. Generate a revised result.

The existing upload workflow must still work.

------------------------------------------------------------------------

# 29. Final Architecture

``` text
                 User Text / Voice
                        ↓
             Conversation / LLM Layer
                        ↓
              Structured Generation Spec
                        ↓
             JSON/Pydantic Validation
                        ↓
                DataProfile / Schema
                        ↓
          ┌─────────────┼─────────────┐
          ↓             ↓             ↓
       Tabular       Relational     Documents
     CTGAN/TVAE       DAG/Rules    DocumentEngine
     Statistical
          └─────────────┼─────────────┘
                        ↓
                 Validation
                        ↓
                 Evaluation
                        ↓
              TSTR where applicable
                        ↓
                Regeneration
                        ↓
                 Preview / Export
                        ↓
                    Supabase
                    History
```

## Core product statement

> **Describe the data you need.\
> HackData understands the intent.\
> Specialized models generate it.\
> Deterministic engines keep it consistent.\
> Evaluation proves quality.\
> Regeneration improves weak results.\
> You choose the output format.**

The LLM is the interface and intelligence layer.

HackData remains the actual synthetic-data generation system.
