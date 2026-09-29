# HackData V2 --- Differentiator Add-ons & MVP Polish Specification

**Status:** Post-MVP enhancement specification\
**Scope:** MVP polish + five differentiators + Supabase foundation\
**Part I:** Akif --- Backend / AI / ML / Data / Integration / Supabase /
Deployment\
**Part II:** Hamza --- Frontend / UI / UX / Browser QA / Integration

## 0. Purpose and non-regression rule

HackData V2 has reached the MVP stage. This iteration must be additive.
Do not rewrite or destabilize the verified pipeline:

`Upload → Ingest → Profile → Clean → DataProfile → Configure → Generate → Validate → Evaluate → Preview → Export`

### First-priority corrections

1.  Add real synthetic-column creation/configuration after dataset
    analysis.
2.  Remove fake `example.com` and hardcoded showcase rows from the real
    tabular workspace.
3.  Replace those rows with real uploaded/generated backend data or an
    intentional empty state.
4.  Fix relational table sizing so 10--15 rows are readable at once and
    the data region can scroll.
5.  Remove all visible `Theme Slide 1...10` / internal design-reference
    labels.
6.  Rename `Showcase & Bento` to `Home`.
7.  Rename `3-Pane Workspace` to `Workspace`.
8.  Configure Supabase as the durable application-record/tracking layer
    without exposing secrets or making core generation dependent on a
    database round trip.

### Five differentiators

1.  Better Model Benchmarking
2.  TSTR Utility Evaluation
3.  Controlled Regeneration & Optimization
4.  Better Semantic Generation
5.  Synthia --- Voice AI Guide Assistant

------------------------------------------------------------------------

# PART I --- AKIF

# Backend / AI / ML / Data / Integration / Supabase / Deployment

## A0. Engineering rules

-   Preserve all verified MVP capabilities.
-   Do not replace real generation with mocks.
-   Do not add dataset-specific branches.
-   Do not use an LLM row-by-row for bulk generation.
-   Do not expose Groq or Supabase service-role secrets to the browser.
-   Do not store raw source PII in Supabase by default.
-   Do not claim a metric unless it is actually calculated.
-   Do not invent a universal accuracy score.
-   Keep localhost generation functional if Supabase is unavailable,
    except where durable persistence is explicitly required.
-   Preserve deterministic seed behavior.
-   Add automated tests for every backend feature.
-   Run the complete existing regression suite after changes.
-   Follow the repository Git rules and use focused commits.

## A1. Synthetic-column backend verification and completion

The frontend currently lacks the ability to add synthetic columns after
dataset analysis. Verify the existing backend
`SyntheticColumnSpec`/DataProfile support before changing it.

Required flow:

`Uploaded dataset → Profile → Add Synthetic Column → name/type/semantic config → updated DataProfile → generation → validation → evaluation → export`

Support, where applicable:

-   column name
-   primitive data type
-   semantic type
-   nullable/required
-   categorical values/probabilities
-   numeric range/distribution
-   date range/format
-   string pattern/locale
-   relationship/reference configuration
-   deterministic seed
-   description

Reject duplicate names, invalid names, unsupported types, and collisions
with source columns unless explicitly supported. The generated column
must actually appear in validation, evaluation, preview, and export.

Tests: string, integer, float, categorical, date, duplicate-name
rejection, invalid configuration, generated-column presence, export
presence, deterministic seed.

## A2. Better model benchmarking

Benchmark real candidates:

-   Statistical Baseline
-   CTGAN
-   TVAE
-   Deterministic fallback where applicable

For every candidate record:

`model, availability, fit status, sample status, training time, generation time, resource usage, schema validity, diagnostics, quality metrics, privacy/novelty if available, utility if available, failure reason`

Pipeline:

`DataProfile → candidate discovery → compatibility → fit → fixed evaluation sample → validation → diagnostic/quality metrics → privacy/utility where supported → resource measurement → benchmark report → transparent selection`

Apply hard constraints before softer comparisons. Expose why a model was
selected. Never call one model globally "best"; report the selected
model for the measured dataset/run.

Provide a structured benchmark API response, not only a score.

## A3. TSTR utility evaluation

Implement Train on Synthetic, Test on Real.

Only run when a valid supervised target exists. Never invent a target.

Flow:

`source dataset → target/task selection → synthetic training data → model training → held-out real test → compare with Real→Real baseline`

Classification metrics may include accuracy, precision, recall, F1,
ROC-AUC when valid. Regression may include MAE, RMSE, R².

Show:

-   Real→Real
-   Synthetic→Real
-   utility retention, with a documented formula

Prevent leakage. Reject too-small or unsuitable datasets gracefully. Run
expensive TSTR work as a job, not inside preview requests.

## A4. Controlled regeneration and optimization

Regeneration must be a diagnostic loop, not a blind second generation.

`Generate → Validate → Evaluate → diagnose → explain issue → choose strategy → regenerate → validate → evaluate → compare`

Possible reasons:

-   distribution drift
-   weak numeric fidelity
-   weak categorical fidelity
-   relationship/correlation weakness
-   missingness mismatch
-   structural violation
-   privacy/novelty concern
-   business-rule failure
-   insufficient utility

Possible strategies only when actually implemented:

-   change seed
-   change model
-   change model parameters
-   strengthen constraints
-   preserve relationships
-   adjust distribution fitting
-   semantic regeneration
-   category rebalancing

Persist:

`parent_generation_id, reason, diagnostics, strategy, changed_parameters, previous_metrics, new_metrics, delta, status`

If the new result is worse, preserve/report the previous preferred
result rather than claiming success.

## A5. Better semantic generation

Maintain:

`Dataset → DataProfile → AI semantic reasoning → structured generation specification → specialized local generator → bulk synthetic data`

Groq may assist with semantic classification, relationship
interpretation, generation specifications, domain/category suggestions,
edge cases, and document semantics.

Groq must not calculate deterministic totals, FK assignments, balances,
or generate every row.

Improve:

-   names
-   job titles
-   departments
-   cities/addresses
-   merchant categories
-   product categories
-   locale-aware formats
-   domain-specific pools
-   relationships between semantic fields

Reuse existing schema-fingerprint caching and structured output
validation.

## A6. Synthia --- Voice AI Guide Assistant

### Product identity

Use the name **Synthia --- Synthetic Intelligence Assistant**.

Synthia is a floating assistant, not a chatbot page.

Opening greeting:

> "Hi, I'm Synthia. How can I help you with your synthetic-data
> workflow?"

### Technology

Use browser-native/free capabilities where available:

-   Web Speech API / SpeechRecognition for input
-   browser SpeechSynthesis for output
-   Groq for reasoning
-   backend-only assistant API key

Do not add a paid speech provider unless explicitly approved.

### Languages

Support:

-   English
-   Urdu
-   Roman Urdu / English-Urdu mix

Browser speech support varies, so provide a text-input fallback when
speech recognition is unavailable. Do not promise universal browser
speech recognition.

### Responsibilities

Synthia can:

-   understand the user's use case
-   explain dataset choices
-   recommend useful synthetic columns
-   explain model choices
-   explain validation/evaluation
-   explain regeneration findings
-   guide the workflow

It may propose configuration but must never silently mutate the dataset
or generation settings.

Example structured proposal:

``` json
{
  "type": "configuration_proposal",
  "action": "add_synthetic_columns",
  "requires_confirmation": true,
  "columns": [
    {
      "name": "salary_band",
      "data_type": "categorical",
      "semantic_type": "salary_band",
      "suggested_values": ["low", "medium", "high"]
    }
  ]
}
```

The UI shows the proposal; the user confirms; the backend validates;
only then is it applied.

### Context

Send only structured context needed for reasoning:

-   dataset ID
-   modality
-   DataProfile summary
-   current model
-   row count
-   validation findings
-   evaluation summary
-   current generation ID

Do not send the full raw dataset unnecessarily.

### Dedicated assistant key

Use:

``` env
GROQ_API_KEY=...
GROQ_ASSISTANT_API_KEY=...
```

Both are backend-only.

Recommended endpoints:

``` text
POST /api/v1/assistant/synthia/session
POST /api/v1/assistant/synthia/message
POST /api/v1/assistant/synthia/action
```

Actions must be allowlisted structured actions. Never execute arbitrary
code or SQL from assistant output.

### Conversation persistence

Store assistant session metadata/messages in Supabase if enabled. Do not
store microphone audio by default.

## A7. Supabase foundation

Supabase is now part of the durable tracking/persistence layer.

Do not unnecessarily migrate raw files or the entire generation engine
into Supabase.

Recommended initial tables:

### datasets

`id, name, modality, source_fingerprint, row_count, column_count, created_at, status`

### dataset_profiles

`id, dataset_id, profile_json, created_at, updated_at`

### generation_runs

`id, dataset_id, model, requested_rows, seed, status, started_at, completed_at, metrics_json, error_message`

### generation_results

`id, generation_run_id, row_count, schema_json, preview_json, export_metadata_json, created_at`

### evaluation_results

`id, generation_run_id, evaluation_type, metrics_json, created_at`

### regeneration_runs

`id, parent_generation_id, reason, strategy_json, previous_metrics_json, new_metrics_json, status, created_at`

### assistant_sessions

`id, dataset_id, language, created_at, updated_at`

### assistant_messages

`id, session_id, role, content, structured_action_json, created_at`

Security:

-   service-role key backend-only
-   RLS where appropriate
-   no raw PII by default
-   no source-file upload to Storage unless required
-   store metadata/profiles/results rather than unnecessary raw source
    data

Use:

``` env
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Keep active job execution in memory if useful, while persisting durable
status/results to Supabase. Supabase outage must not unnecessarily break
local generation.

## A8. Remove fake demo data from the real backend path

The real workspace must not silently fall back to:

-   `example.com`
-   fixed names
-   fixed showcase rows
-   seed-42 demo records

Before upload, show an intentional empty/ready state or clearly labeled
demo fixture.

After upload, show actual source/profile/generated state.

After generation, show actual generation results.

If a demo fixture remains on Home, label it explicitly as demo content.

## A9. Deployment preparation

After these changes:

1.  backend tests
2.  frontend build
3.  browser E2E
4.  real dataset regression
5.  Supabase persistence verification
6.  Synthia security/secret verification
7.  CTGAN/TVAE regression
8.  relational/document regression
9.  export regression
10. failure-path regression
11. only then deployment preparation

------------------------------------------------------------------------

# PART II --- HAMZA

# Frontend / UI / UX / Browser QA / Integration

## B0. UI rules

-   Preserve the current visual language.
-   Do not redesign the entire product.
-   No separate chatbot page for Synthia.
-   No fake `example.com` records in the real workspace.
-   No internal theme-slide labels.
-   No decorative control that is not connected to backend behavior.
-   New screens consume real API data.
-   Preserve the three-pane workspace.
-   Keep the product professional and demo-ready.
-   Test desktop and narrower layouts.
-   Never expose secrets.
-   Coordinate API changes with Akif.

## B1. Synthetic-column UI --- first priority

After dataset analysis, add:

``` text
Existing columns
...
[ + Add Synthetic Column ]

Synthetic Columns
...
[ Apply Configuration ]
```

Add-column dialog:

-   name
-   data type
-   semantic type
-   description
-   type-specific generation settings

Numeric: integer/float, min/max, distribution where supported.

Categorical: values/probabilities where supported.

Date: range/format.

String: semantic role, pattern/locale where supported.

Show only controls relevant to the selected type.

Reject empty/duplicate/invalid names and unsupported types.

After applying:

`Source columns: X | Synthetic columns: Y | Final schema: Z`

The configuration must be sent to the real backend and reflected in
generated output.

## B2. Remove fake tabular data

The current table visibly contains fake records such as:

`example.com`, `Maria Chen`, `Ahmed Raza`, `Sofia Ivanova`.

Remove them from the real workspace.

Before upload: intentional empty/ready state.

After upload: real backend/profile data.

After generation: real synthetic records.

Do not hardcode rows in React state.

Do not blindly display raw PII merely because it came from a test
dataset; use sanitized previews/generated records where appropriate.

## B3. Remove internal theme labels

Remove all visible:

`Theme Slide 1` through `Theme Slide 10`

and similar design-reference text.

Keep meaningful product status such as:

`Referential Integrity: 100% Valid`.

## B4. Navigation naming

Change:

`Showcase & Bento` → `Home`

`3-Pane Workspace` → `Workspace`

Do not unnecessarily change routing.

## B5. Relational layout

The current lower relational data table is too compressed.

Make the relational workspace/data region scrollable and use available
width.

Requirements:

-   approximately 10--15 rows visible at once
-   readable row height
-   readable typography
-   wider columns
-   horizontal scroll for wide schemas
-   vertical scroll inside the data region
-   sticky header where appropriate
-   do not force the entire browser viewport into awkward scrolling

Preserve the existing topology section.

## B6. Model benchmarking screen

Create a real benchmark section using backend values.

Suggested structure:

``` text
MODEL BENCHMARK
Dataset: ...

┌────────────────┬──────────────┬──────────────┬─────────────┐
│ Metric         │ Statistical  │ CTGAN        │ TVAE        │
├────────────────┼──────────────┼──────────────┼─────────────┤
│ Validity       │ ...          │ ...          │ ...         │
│ Quality        │ ...          │ ...          │ ...         │
│ Relationship   │ ...          │ ...          │ ...         │
│ Train time     │ ...          │ ...          │ ...         │
│ Status         │ ...          │ ...          │ ...         │
└────────────────┴──────────────┴──────────────┴─────────────┘

Selected model: ...
Why: ...
```

No hardcoded example values.

## B7. TSTR UI

Create a dedicated utility-evaluation view.

Use two main side-by-side sections:

### Train on Synthetic

-   synthetic dataset
-   target
-   task
-   model
-   training status
-   metrics

### Test on Real

-   held-out real dataset
-   predictions
-   evaluation metrics

Below:

-   Real→Real baseline
-   Synthetic→Real
-   utility retention

Do not call every result "accuracy."

## B8. Regeneration UI

Display real backend diagnostics.

Example:

``` text
QUALITY ISSUE DETECTED

Categorical distribution drift
Severity: Medium

Recommended strategy:
Rebalance categorical distributions.

[ Regenerate with Recommended Strategy ]

Other strategies:
[ Change Model ]
[ Change Seed ]
[ Strengthen Constraints ]
```

After regeneration show previous vs new metrics.

If quality worsens, say so and retain the previous preferred run.

## B9. Semantic generation UI

Show:

``` text
SEMANTIC UNDERSTANDING

Column            Meaning
Education Level   Education category
Job Title         Occupation
Department        Organizational unit
Salary (USD)      Compensation amount

AI suggestions
✓ Locale-aware names
✓ Preserve job/department relationships
✓ Preserve salary ranges
```

Clearly distinguish AI-assisted semantic interpretation from bulk
synthetic row generation.

## B10. Synthia floating assistant

No chatbot page.

Use a compact floating icon consistent with the existing UI.

On open:

> "Hi, I'm Synthia. How can I help you with your synthetic-data
> workflow?"

Surface:

-   microphone/listening state
-   transcript
-   assistant response
-   speaker/TTS state
-   stop control
-   text-input fallback

Support English, Urdu, and Roman Urdu / English-Urdu mixed conversation
where browser capabilities permit.

If speech recognition is unavailable, gracefully switch to text.

When Synthia proposes configuration, show a review/confirmation UI
before applying it.

Do not let Synthia silently change generation settings.

## B11. Supabase-backed UI state

Use normal API state for active operations.

Use durable Supabase-backed records through the backend for:

-   dataset history
-   generation history
-   evaluation history
-   regeneration history
-   assistant sessions

Do not make every UI repaint depend on a database round trip.

## B12. Final frontend QA

Functional:

-   upload
-   analysis
-   synthetic columns
-   generation
-   benchmark
-   TSTR
-   regeneration
-   semantic configuration
-   Synthia
-   export
-   relational
-   documents

Visual:

-   no fake `example.com`
-   no theme-slide labels
-   Home/Workspace naming
-   readable relational table
-   10--15 rows visible
-   responsive behavior
-   Synthia integrated with the visual language

Security:

-   no Groq secrets
-   no Supabase service-role key
-   no sensitive backend data leakage

Run the complete MVP browser flow again.

------------------------------------------------------------------------

# PART III --- OWNERSHIP

## Akif

-   synthetic-column backend
-   DataProfile/model configuration
-   benchmarking
-   TSTR
-   regeneration engine
-   semantic generation
-   Synthia backend
-   Groq assistant integration
-   Supabase schema/migrations
-   Supabase backend integration
-   persistence APIs
-   resource/security controls
-   deployment preparation
-   backend tests

## Hamza

-   synthetic-column UI
-   removal of fake tabular rows
-   theme-label cleanup
-   Home/Workspace naming
-   relational layout
-   benchmark UI
-   TSTR UI
-   regeneration UI
-   semantic-generation UI
-   Synthia UI
-   responsive behavior
-   browser E2E
-   frontend security verification

## Shared

-   API contract coordination
-   integration testing
-   real dataset verification
-   Supabase verification
-   final regression
-   deployment verification

No silent ownership crossover.

------------------------------------------------------------------------

# PART IV --- EXECUTION ORDER

## Phase 1 --- Pre-differentiator corrections

Akif:

1.  verify synthetic-column backend
2.  verify API contract
3.  configure Supabase foundation
4.  remove backend dependency on fake demo records
5.  add persistence models
6.  add tests

Hamza:

1.  synthetic-column UI
2.  remove fake tabular rows
3.  remove theme-slide labels
4.  rename Home/Workspace
5.  fix relational table layout
6.  browser-test these corrections

Do not begin differentiator UI before these corrections are stable.

## Phase 2 --- Model benchmarking

Akif: benchmark engine, metrics, model selection, API.

Hamza: benchmark screen, comparison, selection explanation,
loading/error states.

## Phase 3 --- TSTR

Akif: TSTR backend, target/task validation, training, metrics, job/API.

Hamza: side-by-side Train Synthetic / Test Real UI, controls, results.

## Phase 4 --- Regeneration

Akif: diagnostics, strategies, execution, comparison, persistence.

Hamza: issue display, strategy selection, regeneration, before/after
metrics, run history.

## Phase 5 --- Semantic generation

Akif: semantic enrichment, structured generation specs, locale/domain
rules, caching, provider integration.

Hamza: semantic interpretation, suggestions, explanations, confirmation
flow.

## Phase 6 --- Synthia

Akif: assistant API, dedicated Groq key, conversation orchestration,
structured actions, Supabase sessions, limits.

Hamza: floating icon, compact panel, microphone, transcript, text
fallback, TTS state, confirmation UI, multilingual controls.

## Phase 7 --- Final integration

1.  Akif pushes backend branch.
2.  Hamza integrates frontend according to Git rules.
3.  Run backend tests.
4.  Run frontend build.
5.  Run browser E2E.
6.  Test all five differentiators.
7.  Test Supabase persistence.
8.  Test real Kaggle datasets.
9.  Test relational generation.
10. Test documents.
11. Test export.
12. Test failure paths.
13. Verify no fake demo data remains in the real workflow.
14. Verify no secrets are exposed.

------------------------------------------------------------------------

# PART V --- MVP NON-REGRESSION GATE

All of these must remain true:

`REAL DATASET → INGEST → PROFILE → CLEAN → CONFIGURE → GENERATE → VALIDATE → EVALUATE → PREVIEW → EXPORT`

And still support:

-   statistical baseline
-   CTGAN
-   TVAE
-   relational generation
-   document generation
-   deterministic seeds
-   validation
-   quality evaluation
-   privacy controls
-   resource limits
-   cancellation
-   AI fallback
-   export

If any enhancement breaks an MVP capability, stop the enhancement and
fix the regression first.

------------------------------------------------------------------------

# PART VI --- COMPLETION GATE

This iteration is complete only when:

### Product polish

-   no fake `example.com` records in the real workspace
-   no internal theme-slide labels
-   professional Home/Workspace navigation
-   readable relational table
-   functional synthetic-column configuration

### Differentiators

-   real model benchmarking
-   real TSTR
-   diagnostic/measurable regeneration
-   AI-assisted but locally executed semantic generation
-   Synthia voice/text guide with multilingual support where browser
    capabilities allow

### Persistence

-   Supabase configured
-   execution records persist
-   generation/evaluation/regeneration history persists
-   assistant sessions can persist
-   secrets remain backend-only

### Reliability

-   existing MVP tests pass
-   new backend tests pass
-   frontend build passes
-   browser E2E passes
-   real datasets pass
-   no hardcoded demo data contaminates the real workflow

Only after this gate should final deployment preparation begin.

------------------------------------------------------------------------

# PART VII --- ENVIRONMENT VARIABLES

Backend:

``` env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

GROQ_API_KEY=
GROQ_ASSISTANT_API_KEY=
```

Never expose:

-   `SUPABASE_SERVICE_ROLE_KEY`
-   `GROQ_API_KEY`
-   `GROQ_ASSISTANT_API_KEY`

to the browser.
