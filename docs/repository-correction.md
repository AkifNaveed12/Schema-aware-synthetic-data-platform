# HACKDATA V2 --- REPOSITORY CORRECTION & DEVELOPMENT RECOVERY

Status: ACTIONABLE CORRECTION BASELINE

Purpose: Stop implementation drift, correct false completion claims,
restore the real product workflow, and divide the remaining work into
two isolated ownership segments.

Primary source: the latest repository audit supplied by the team,
together with the approved MASTER-PLAN.md / TASK-BREAKDOWN.md direction
already established for HackData V2.

This document is a correction and execution-control document. It is not
a replacement for the approved architecture, API contract, UI
requirements, test plan, or deployment strategy. Where this document
identifies a discrepancy, the discrepancy must be verified in code and
then resolved through the existing project decision process.

Critical principle: A feature is NOT considered complete because an
endpoint exists, a component renders, or a test for an isolated function
passes. It is complete only when the intended user workflow works
end-to-end with real input and produces validated synthetic output.

Immediate objective: within the available hackathon window, restore a
credible end-to-end MVP: real input → understanding → profiling →
cleaning/quality handling → configurable schema → model
selection/training → generation → validation → evaluation → regeneration
→ export.

Ownership model for this recovery: Part I = Akif (backend, AI, data
pipeline, models, integration, deployment-related technical
foundations). Part II = Hamza (frontend, security, UI integration,
user-facing access to backend capabilities). No cross-ownership changes
without explicit coordination.

No design polishing is permitted to outrank the missing core data
workflow.

## 0. EXECUTIVE DECISION

The repository is not empty and should NOT be rewritten. The existing
FastAPI foundation, DataProfile model, tabular engine,
relational/document generators, validation/evaluation logic, AI service,
export service, and existing tests are valuable components.

The main failure is architectural execution order and integration
completeness. The current implementation proves isolated generators, but
the user-facing product does not yet prove the core promise: a judge can
provide an arbitrary supported dataset/document and the platform can
understand it and adapt generation to it.

The recovery strategy is therefore additive and corrective, not
destructive:

-   Preserve working backend engines and API contracts unless
    verification proves a contract is wrong.
-   Remove or quarantine misleading hardcoded demo data from the real
    workflow.
-   Expose real input ingestion in the frontend.
-   Make schema inference and DataProfile the actual bridge between
    input and generation.
-   Introduce a model layer for statistical baseline, CTGAN, and TVAE
    candidates, with SDV used as the orchestration/metadata/evaluation
    ecosystem where compatible.
-   Benchmark model candidates on the uploaded dataset instead of
    pretending one model is universally best.
-   Keep LLMs as semantic assistants, not row-by-row generators.
-   Add dataset cleaning/normalization and a user-reviewable
    profile/configuration stage.
-   Allow users to preserve original columns and add synthetic columns
    with explicit name/type/semantic/constraint configuration.
-   Connect validation, quality evaluation, regeneration, and export to
    the same generation artifact.
-   Keep heavy model training behind a worker/job abstraction so large
    datasets do not block the API process.
-   Keep persistence/deployment work downstream of the core MVP unless
    needed for a concrete workflow.
-   Require evidence for every completion claim.

## 0.1 NON-NEGOTIABLE DEFINITION OF DONE

``` text
A real supported input file can be provided by a user.
        ↓
The system identifies the input modality.
        ↓
The system parses and profiles the input.
        ↓
The system reports schema, types, missingness, quality issues and semantic hints.
        ↓
The user can review/correct the inferred schema.
        ↓
The user can configure generation.
        ↓
The user can preserve source columns and optionally add new synthetic columns.
        ↓
The system selects or runs an appropriate generator/model.
        ↓
The generator learns from the supplied data/profile.
        ↓
Synthetic data is generated in the requested quantity.
        ↓
Structural/business/privacy checks run.
        ↓
Statistical quality is compared against the source.
        ↓
If quality fails, the system can regenerate or try another candidate.
        ↓
The user sees the quality evidence.
        ↓
Only the validated artifact is exportable.
```

If this chain cannot be demonstrated with a real uploaded dataset, the
MVP is not complete regardless of how polished the preset screens look.

## 1. CURRENT REPOSITORY TRUTH --- WHAT THE AUDIT ACTUALLY FOUND

The supplied repository audit is explicit. The following findings must
replace optimistic completion language until the corresponding workflow
is verified.

  -----------------------------------------------------------------------
  Area                    Current finding         Interpretation
  ----------------------- ----------------------- -----------------------
  Frontend hardcoding     Client-side fallback    Demo/fallback content
                          generator contains      exists and can make the
                          fixed names/domains,    product appear more
                          seed-42 anchor rows,    complete than it is.
                          invoice catalog,        
                          merchant catalog, and   
                          placeholder React       
                          state.                  

  Live API calls          Workspace views call    The frontend is not
                          tabular, relational,    purely static; live
                          invoice,                integration exists for
                          bank-statement,         preset workflows.
                          evaluation, export and  
                          health endpoints.       

  Row count               Tabular row_count       The 10/50/100/1K/10K
                          reaches the backend and controls are not
                          the backend can         inherently fake, but
                          generate the requested  preview behavior and
                          count; relational       export behavior must be
                          preview intentionally   verified.
                          limits displayed        
                          customers to 25.        

  Schema inference        POST                    Backend capability is
                          /api/v1/schema/infer    disconnected from the
                          exists and is tested,   product entry point.
                          but no frontend control 
                          currently invokes it.   

  DataProfile             Pydantic DataProfile is No persistence and no
                          ephemeral in RAM and    stable session/profile
                          returned by schema      lifecycle currently
                          inference.              exist.

  Real CSV pipeline       API-level flow can      The core backend path
                          infer a profile,        is a strong starting
                          generate tabular data,  point, but the product
                          validate, evaluate and  is not end-to-end.
                          export; frontend cannot 
                          upload or initiate the  
                          flow.                   

  Generated data storage  Backend is stateless;   Refresh loses the
                          frontend keeps data in  current workflow; there
                          React state.            is no artifact/job
                                                  persistence.

  AI                      Groq is used for schema The selective-AI
                          inference, query        architecture is
                          interpretation and      correct, but AI needs
                          semantic pools; zero AI to be integrated into
                          calls occur inside the  the real input
                          row-generation loop.    workflow.

  DataProfile-consuming   TabularEngine consumes  Tabular
  engines                 DataProfile;            arbitrary-dataset
                          RelationalEngine and    support is ahead of
                          DocumentEngine use      relational/document
                          presets/templates.      adaptability.

  Presets                 Relational, invoice,    Presets are acceptable
                          bank statement and      as demos/examples, but
                          client fallback paths   cannot be the only
                          are preset-heavy.       product path.

  Backend output          Tabular sampling,       Existing code should be
                          relational FK           reused rather than
                          propagation, invoice    discarded.
                          arithmetic, bank        
                          balances, quality       
                          calculations and        
                          exports are genuine     
                          backend operations.     
  -----------------------------------------------------------------------

These findings are grounded in the supplied audit, especially the
explicit distinction between API-level support and frontend
availability. fileciteturn14file0L81-L89

The audit also explicitly states that schema inference is currently not
consumed by the frontend and that DataProfile is ephemeral.
fileciteturn14file0L65-L76

The audit confirms that the current AI layer is supporting rather than
row-generating, which is consistent with the intended architecture.
fileciteturn14file0L100-L106

## 2. MODEL STRATEGY --- THE MISSING CORE

### 2.1 Required candidate family

The synthetic-data generation layer must be upgraded from a hand-built
deterministic demo generator into a model-backed generation subsystem.
The candidate family for tabular data is:

-   Statistical generators: strong baseline and fallback. Examples
    include Gaussian-copula/statistical sampling and
    distribution/correlation-aware generators.
-   CTGAN: deep-learning tabular synthesizer candidate for datasets
    where nonlinear categorical/continuous relationships benefit from
    adversarial generation.
-   TVAE: variational autoencoder tabular synthesizer candidate and
    complementary model for benchmark comparison.
-   SDV: use as the synthetic-data ecosystem/orchestration layer where
    compatible with the chosen models, metadata and constraints; do not
    treat SDV as one single model.
-   Existing deterministic NumPy/Faker generator: retain as a controlled
    baseline/fallback for simple schemas, previews, deterministic
    business-rule fields, and situations where model training is
    unnecessary or fails.

The current audit shows that the repository has local statistical
generation but does not currently fit CTGAN/TVAE or benchmark model
candidates on an uploaded dataset. The correction therefore requires a
genuine model layer.

Current SDV documentation describes SDV as a library for tabular
synthetic data, model training on real data, sampling on demand,
metadata, constraints and evaluation. citeturn1search7

The SDV CTGAN project documents CTGAN and TVAE as deep-learning
synthetic-data generators for single-table data.
citeturn1search0turn1search8

### 2.2 What 'accuracy' means in this project

Do not promise a universal '98% accurate synthetic data' number.
Synthetic-data quality is multi-dimensional and dataset-dependent. The
system must report measured metrics against the supplied source data.

The project's primary differentiator is measured fidelity, integrity,
privacy and utility---not visual similarity.

  --------------------------------------------------------------------------------------
  Quality dimension       Required evidence                      Acceptance principle
  ----------------------- -------------------------------------- -----------------------
  Schema fidelity         Column names/types/semantic            100% for required
                          types/format compatibility             structural fields
                                                                 unless user explicitly
                                                                 changes schema.

  Row-count fidelity      Requested count vs generated count     100% requested count
                                                                 for completed
                                                                 generation.

  Validity                Bounds, categories, formats, null      Hard constraints should
                          rules                                  be 100% valid before
                                                                 export.

  Primary-key integrity   Uniqueness/non-null where required     100% where PK is
                                                                 declared.

  Foreign-key integrity   No orphan references                   100% for generated
                                                                 relational artifacts.

  Business rules          Invoice totals, tax arithmetic,        100% for deterministic
                          running balances, user constraints     rules.

  Distribution fidelity   Column shape/distribution comparisons  Measured and reported;
                                                                 target should be
                                                                 dataset-dependent.

  Pair/trend fidelity     Correlation/association/pairwise trend Measured and reported;
                          metrics                                optimize rather than
                                                                 fabricate a universal
                                                                 guarantee.

  Privacy / memorization  Exact-match/nearest-neighbor/privacy   No unacceptable
                          diagnostics                            direct-record
                                                                 reproduction; threshold
                                                                 must be explicit per
                                                                 privacy policy.

  Downstream utility      Train-on-synthetic/test-on-real or     Report TSTR/utility
                          related utility test where applicable  where feasible.

  Overall quality         Composite SDMetrics/project score      Use as an optimization
                                                                 signal, not as a fake
                                                                 universal accuracy
                                                                 claim.
  --------------------------------------------------------------------------------------

SDMetrics explicitly distinguishes diagnostic metrics from quality
metrics and notes that quality scores are aspirational rather than
universally expected to reach 100%. citeturn1search3turn1search12

Therefore, the system should expose component scores and failure reasons
rather than showing '100% accurate' merely because the generator
completed.

### 2.3 Recommended benchmark loop

``` text
SOURCE DATA
   ↓
CLEAN / NORMALIZE
   ↓
METADATA + DATAPROFILE
   ↓
┌──────────────────────────────────────────┐
│ Candidate A: Statistical baseline        │
│ Candidate B: CTGAN                       │
│ Candidate C: TVAE                        │
│ Candidate D: Existing deterministic     │
│            generator where appropriate   │
└──────────────────────────────────────────┘
   ↓
TRAIN / FIT
   ↓
GENERATE SAME TARGET ROW COUNT
   ↓
DIAGNOSTIC VALIDATION
   ↓
STATISTICAL QUALITY
   ↓
PRIVACY / NOVELTY
   ↓
UTILITY WHERE FEASIBLE
   ↓
MODEL SELECTION
   ↓
BEST VALID CANDIDATE
   ↓
CONTROLLED REGENERATION IF REQUIRED
   ↓
EXPORT
```

The selection mechanism must be deterministic enough to explain why a
candidate was selected. Store model name, version, hyperparameters,
seed, training dataset fingerprint, metrics and generation configuration
with the job artifact.

### 2.4 Do not force CTGAN or TVAE onto every dataset

-   Small or simple datasets may produce more stable results with a
    statistical baseline.
-   CTGAN can be expensive and may require preprocessing and tuning; use
    it where the dataset benefits from its modeling capacity.
-   TVAE is a complementary candidate and may outperform CTGAN on some
    datasets; do not assume otherwise.
-   The benchmark should select based on measured quality and hard
    validity constraints.
-   Document datasets and relational datasets should not be forced
    through single-table CTGAN/TVAE. Use modality-specific
    generators/templates plus semantic AI and deterministic validation.
-   Relational generation should use relationship-aware modeling rather
    than flattening arbitrary tables without preserving
    keys/cardinality.

# PART I --- AKIF: BACKEND, AI, DATA PIPELINE, MODELS, INTEGRATION

Scope: Everything required to make the actual synthetic-data engine work
from real input to validated export. Do not take ownership of Hamza's UI
implementation except where a backend contract or integration bug blocks
his work.

Rule: Work only on the backend/data/AI/integration side. Do not redesign
the frontend. Do not change visual layouts. Do not modify Hamza-owned UI
code unless a minimal compatibility fix is explicitly coordinated.

Rule: Before changing architecture, inspect the existing code and
preserve working functionality. Replace only what is demonstrably
incorrect or insufficient.

## I-A. GAP MATRIX --- AKIF

  --------------------------------------------------------------------------------------------------------------------------------------
  ID          Capability            Current state     Target state                     Priority    Verification
  ----------- --------------------- ----------------- -------------------------------- ----------- -------------------------------------
  A-01        Dataset ingestion API Partial: raw      Robust upload/ingestion contract P0          Real file reaches parser and returns
                                    CSV/text schema   for supported file types with                dataset/session ID.
                                    inference exists. size/type validation.                        

  A-02        Dataset parser        Partial           CSV/JSON/table/schema/document   P0          Representative fixtures parse
                                                      adapters with clear modality                 correctly.
                                                      routing.                                     

  A-03        Dataset analysis      Backend profiling Full profile: columns, types,    P0          Profile matches independently
                                    exists            semantic types, nulls, uniques,              calculated reference metrics.
                                                      distributions, outliers,                     
                                                      correlations, identifiers,                   
                                                      quality warnings.                            

  A-04        Data cleaning         No complete       Deterministic                    P0          Dirty fixture produces cleaned
                                    workflow          cleaning/normalization layer                 profile without silent destructive
                                                      with audit trail and                         changes.
                                                      user-reviewable actions.                     

  A-05        DataProfile           Ephemeral         Job/session-scoped profile       P0          Profile can be referenced by
              persistence/session                     lifecycle; persistence may                   subsequent generation request.
                                                      initially be                                 
                                                      in-process/file-backed if time               
                                                      constrained.                                 

  A-06        Schema configuration  Not exposed as    Profile can be edited/extended   P0          Add/rename/type/semantic/constraint
                                    real product flow through API contract.                        operations round-trip.

  A-07        Synthetic column      Missing           New columns have name, type,     P0          Generated output contains configured
              specification                           semantic,                                    new columns.
                                                      distribution/constraint,                     
                                                      dependency and generation                    
                                                      method.                                      

  A-08        Statistical model     Existing          Formal baseline model interface  P0          Model fit/sample/evaluate pipeline
                                    deterministic     and benchmark metrics.                       works.
                                    statistical                                                    
                                    generator                                                      

  A-09        CTGAN                 Missing as        Integrated candidate behind      P0/P1       Fit/sample on fixture and quality
                                    generation model  model interface.                             report.

  A-10        TVAE                  Missing as        Integrated candidate behind      P0/P1       Fit/sample on fixture and quality
                                    generation model  model interface.                             report.

  A-11        Model registry        Missing           Model adapter registry with      P1          Dataset router chooses compatible
                                                      capability metadata.                         candidates.

  A-12        Model benchmark       Missing           Run candidates and compare       P0          Benchmark report identifies selected
                                                      measured metrics.                            model.

  A-13        AI schema semantics   Backend exists    Connected to actual              P0          Real uploaded columns can receive
                                                      ingestion/profile workflow.                  semantic suggestions.

  A-14        AI semantic content   Backend exists    Generate realistic local/global  P0/P1       No placeholder example.com data in
                                                      names/categories/text pools                  real generated workflow.
                                                      based on profile.                            

  A-15        LLM query config      Exists            Map natural-language request to  P1          User request changes generation
                                                      validated                                    configuration without arbitrary code.
                                                      GenerationSpecification.                     

  A-16        Relational arbitrary  Preset only       Parse supplied multi-table       P1          Fixture with different tables
              schema                                  schema and build dependency                  generates without hardcoded
                                                      graph.                                       customers/orders/items.

  A-17        Document ingestion    Preset document   Classify/extract supported       P1          Representative document fixture
                                    generation        invoice/statement/document                   follows document workflow.
                                                      inputs and construct                         
                                                      profile/template.                            

  A-18        Validation            Substantial       Run against actual custom        P0          Injected invalid fixture fails.
                                                      generated artifacts and block                
                                                      invalid export.                              

  A-19        Evaluation            Substantial       Compare source vs synthetic      P0          Known-quality fixtures produce
                                                      using component metrics.                     meaningful score differences.

  A-20        Regeneration          Needs end-to-end  Change model/config/seed and     P0          Failure path automatically produces a
                                    proof             regenerate failed artifact.                  new candidate.

  A-21        Export                Backend exists    Export exactly the validated     P0          Exported rows equal validated
                                                      selected artifact, not a fresh               artifact fingerprint.
                                                      unrelated generation.                        

  A-22        Job/worker            Missing/limited   Long-running training/generation P1          API remains responsive while job
              architecture                            moves behind job abstraction.                runs.

  A-23        Rate limiting         AI service has    Per-request/user/job AI and      P1          Abuse and runaway training are
                                    controls          model resource limits.                       bounded.

  A-24        Artifact metadata     Missing           Record model, seed, source       P1          Generation is reproducible/auditable.
                                                      fingerprint, profile version,                
                                                      metrics and status.                          

  A-25        Large dataset         Missing           Sampling/chunking/resource       P1          Large fixture does not crash API
              strategy                                limits and worker queue                      process.
                                                      strategy.                                    

  A-26        Integration           Preset APIs       Custom-input workflow integrated P0          Full API E2E test passes.
                                    connected         end-to-end.                                  

  A-27        Deployment foundation Localhost         Keep local MVP stable; cloud     P2          No deployment work blocks core
                                    verified          deployment only after core                   recovery.
                                                      pipeline.                                    
  --------------------------------------------------------------------------------------------------------------------------------------

## I-B. REAL INPUT PIPELINE

``` text
POST /api/v1/datasets/ingest
        ↓
Input validation
        ↓
Modality detection
        ↓
Parser / extractor
        ↓
Raw dataset fingerprint
        ↓
Dataset quality scan
        ↓
Cleaning / normalization plan
        ↓
Apply approved transformations
        ↓
Schema inference
        ↓
AI semantic enrichment
        ↓
DataProfile
        ↓
GenerationSpecification
        ↓
Model router
        ↓
Fit / generate
        ↓
Validate
        ↓
Evaluate
        ↓
Select / regenerate
        ↓
Validated artifact
        ↓
Export
```

The exact endpoint names may remain aligned with the existing API
contract if practical. Do not introduce a second incompatible API
surface merely because the current endpoint naming is inconvenient.

### I-B-1. Supported input contract

-   CSV: mandatory first-class MVP input for arbitrary tabular datasets.
-   JSON: supported where the existing parser can safely infer a tabular
    structure.
-   Relational schema/DDL or multiple related tables: route to
    relational ingestion.
-   Invoice/document input: route to document extraction/classification
    when supported by the current architecture.
-   Bank statement/document input: route to statement-specific
    extraction when supported.
-   Unsupported input must return a clear error and guidance rather than
    silently switching to a preset.

### I-B-2. Dataset fingerprint

Every input should receive a deterministic fingerprint based on source
bytes or normalized content. This fingerprint is used for caching,
auditability and reproducibility.

-   source_fingerprint
-   input_filename
-   input_modality
-   row_count
-   column_count
-   schema_hash
-   profile_version
-   created_at
-   privacy_mode
-   processing_status

## I-C. DATA QUALITY AND CLEANING

The current system profiles data but does not expose a complete cleaning
workflow. This must be implemented as a controlled transformation stage.

  -----------------------------------------------------------------------------
  Issue             Detection              Default handling   User visibility
  ----------------- ---------------------- ------------------ -----------------
  Missing numeric   Null-rate scan         Do not silently    Show rate and
  values                                   invent source      selected
                                           truth; choose      strategy.
                                           imputation         
                                           strategy per       
                                           column/model or    
                                           preserve           
                                           missingness.       

  Missing           Null-rate scan         Preserve           Show rate.
  categorical                              missingness or     
  values                                   explicit unknown   
                                           category depending 
                                           on configuration.  

  Duplicate rows    Row hash/group         Report; remove     Show count
                    detection              only if user       removed.
                                           enables            
                                           deduplication.     

  Invalid numeric   Parser/type coercion   Attempt safe       Show
  strings                                  coercion;          examples/count.
                                           unresolved values  
                                           become flagged     
                                           errors.            

  Invalid dates     Date parser            Normalize          Show
                                           recognized         examples/count.
                                           formats; flag      
                                           unresolved rows.   

  Invalid emails    Semantic validator     Mask/replace for   Show count.
                                           synthetic          
                                           generation; do not 
                                           leak raw PII.      

  Inconsistent      Normalization/fuzzy    Suggest            Show proposed
  categories        grouping               normalization,     mapping.
                                           require explicit   
                                           rule for ambiguous 
                                           values.            

  Outliers          Robust statistics/IQR  Do not             Show warning.
                    or model-based scan    automatically      
                                           delete; treat as   
                                           potentially        
                                           meaningful edge    
                                           cases.             

  Constant columns  Unique count           Preserve as        Show warning.
                                           constant if        
                                           semantically       
                                           meaningful;        
                                           otherwise mark     
                                           low-information.   

  Identifier        Uniqueness/high        Treat as           Show semantic
  columns           cardinality/patterns   identifiers, not   classification.
                                           ordinary numeric   
                                           distributions.     
  -----------------------------------------------------------------------------

The cleaning layer must be auditable. Never silently alter the source
data and then claim that the model learned from the original dataset.

## I-D. DATAPROFILE --- MAKE IT THE CENTRAL CONTRACT

``` text
DataProfile
├── dataset identity
├── modality
├── source fingerprint
├── tables
│   ├── table identity
│   ├── columns
│   │   ├── name
│   │   ├── original_name
│   │   ├── data_type
│   │   ├── semantic_type
│   │   ├── nullable
│   │   ├── unique_count
│   │   ├── null_rate
│   │   ├── distribution
│   │   ├── categories
│   │   ├── min/max/mean/median
│   │   ├── privacy rules
│   │   └── generation strategy
│   ├── primary keys
│   ├── foreign keys
│   ├── cardinalities
│   └── constraints
├── correlations / associations
├── quality findings
├── cleaning actions
├── user overrides
├── synthetic column specifications
└── generation defaults
```

The profile is not merely documentation. It is the machine-readable
contract passed from understanding to generation.

## I-E. USER-DEFINED SYNTHETIC COLUMNS

This capability is a central missing requirement from the current UI and
backend workflow. It must be implemented as a first-class
GenerationSpecification, not as ad-hoc frontend fields.

  ---------------------------------------------------------------------------------
  Field                   Purpose                 Example
  ----------------------- ----------------------- ---------------------------------
  name                    Output column name      churn_probability

  data_type               Storage type            float

  semantic_type           Meaning                 probability

  description             Human intent            Probability that customer churns
                                                  in next 90 days.

  range                   Hard/soft bounds        0.0--1.0

  distribution            Shape                   beta/skewed

  source_dependencies     Columns used            status, last_purchase_date,
                                                  support_tickets

  correlation_targets     Desired relationship    negative with recency

  generation_method       How produced            derived/statistical/AI-assisted

  privacy                 Privacy rule            synthetic replacement

  nullable                Missingness             false

  required                Whether generation must true
                          succeed                 
  ---------------------------------------------------------------------------------

The generator must distinguish between a new column that is purely
derived from deterministic business logic and a new column that requires
learned statistical/semantic modeling.

## I-F. MODEL ADAPTER ARCHITECTURE

``` text
ModelAdapter
├── fit(clean_data, metadata, config)
├── sample(num_rows, seed, conditions?)
├── supports(profile)
├── capabilities()
├── resource_estimate()
├── evaluate(real, synthetic, metadata)
└── diagnostics()

Implementations:
├── StatisticalBaselineAdapter
├── CTGANAdapter
├── TVAEAdapter
└── DeterministicFallbackAdapter
```

Do not couple the API directly to CTGAN or TVAE. The adapter boundary
allows model selection, fallback, testing and future model replacement.

### I-F-1. Statistical baseline

-   Use as the fastest benchmark and fallback.
-   Capture univariate distributions.
-   Capture categorical frequencies.
-   Capture numeric relationships/correlations where supported.
-   Preserve missingness patterns.
-   Use deterministic seed controls.
-   Use it as the comparison baseline for CTGAN and TVAE.

### I-F-2. CTGAN

-   Fit on cleaned single-table data with appropriate metadata.
-   Explicitly identify discrete/categorical fields.
-   Respect supported preprocessing constraints.
-   Store epochs, batch size, seed and model version.
-   Do not fit on raw dirty data without preprocessing.
-   Do not use CTGAN for deterministic arithmetic such as invoice
    totals.

The CTGAN project notes that raw standalone CTGAN usage requires
preprocessing and that categorical/discrete columns must be identified;
SDV wrappers provide preprocessing and constraint support.
citeturn1search0

### I-F-3. TVAE

-   Fit on the same cleaned/profiled dataset where compatible.
-   Use as an independent candidate rather than a guaranteed winner.
-   Store training configuration and model version.
-   Evaluate against the same holdout/benchmark protocol as CTGAN.

### I-F-4. Model selection

``` text
for candidate in compatible_models:
    fit(candidate, training_data)
    synthetic = sample(candidate, target_rows)
    diagnostics = validate(synthetic)
    quality = evaluate(real_reference, synthetic)
    privacy = evaluate_privacy(real_reference, synthetic)
    utility = evaluate_utility(real_reference, synthetic)
    score = rank(candidate, diagnostics, quality, privacy, utility)

select highest-scoring VALID candidate
store full benchmark evidence
```

The ranking function must not hide hard failures. A candidate that
violates a required primary key, produces invalid dates, breaks a
foreign key, or fails a mandatory business rule must be rejected even if
its statistical score is high.

## I-G. AI / LLM RESPONSIBILITY

The LLM is a semantic control layer. It is not the bulk synthetic row
generator.

  ---------------------------------------------------------------------------------------------
  AI task            Input                 Output                    Must be
                                                                     deterministic/validated?
  ------------------ --------------------- ------------------------- --------------------------
  Semantic column    Column names/sample   semantic_type             Yes; validate against
  classification     values/profile                                  supported types.

  Schema             CSV/DDL/document      structured schema         Yes.
  interpretation     profile               suggestions               

  Natural-language   User instruction      GenerationSpecification   Yes; validate JSON/schema.
  generation                                                         
  configuration                                                      

  Semantic content   Locale/semantic       names, labels,            Yes; filter/validate.
  pools              type/context          categories, descriptions  

  Edge-case          Profile/constraints   edge-case plan            Yes; deterministic
  suggestions                                                        application validates.

  Document semantic  OCR/text/layout       structured fields         Yes; confidence and
  extraction         features                                        validation.

  Row generation     One row at a time     synthetic row             PROHIBITED as default
                                                                     architecture.
  ---------------------------------------------------------------------------------------------

The current audit confirms that AI is presently used for schema
inference, query interpretation and semantic pools, while core row
generation uses local deterministic/statistical logic.
fileciteturn14file0L100-L106

### I-G-1. Local realism

Remove generic placeholder identities from the actual synthetic-data
workflow. `example.com`, `John Doe`, obviously fabricated boilerplate
and repeated tiny name pools are unacceptable as the primary
demonstration of high-fidelity synthesis.

-   Use locale-aware Faker/provider data where appropriate.
-   For Pakistani locale: use realistic Pakistani names, cities, phone
    formats, postal patterns, banks/merchants and currencies where the
    source/domain calls for them.
-   For international datasets: preserve the source locale distribution
    rather than arbitrarily converting everything to US-style data.
-   Use source-derived category vocabularies where safe and
    privacy-preserving.
-   Do not copy real PII records directly.
-   Do not make every synthetic row look culturally identical.
-   Measure category frequency and semantic distribution rather than
    judging realism by a handful of examples.

## I-H. RELATIONAL GENERATION CORRECTION

The current relational engine is genuine but preset-driven. The audit
explicitly says it does not dynamically parse arbitrary DataProfile
schemas and instead uses the e-commerce customers → orders → order_items
topology.

Therefore the next relational task is not 'make the existing graph
prettier'. It is to convert the relationship engine into a schema-driven
generator.

``` text
INPUT:
customers.csv
orders.csv
products.csv
order_items.csv

ANALYZE:
PK candidates
FK candidates
1:1 / 1:N / N:N
required/optional relationships
date consistency
amount dependencies

BUILD:
dependency DAG

GENERATE:
parent tables first
then dependent tables
then join tables

VALIDATE:
PK uniqueness
FK existence
cardinality
cross-table business rules
aggregate consistency
```

-   No hardcoded customers/orders/order_items names in the generic
    relational path.
-   Keep the current preset as a demo fixture/test fixture only.
-   Allow the model router to identify compatible table-level
    synthesizers.
-   Generate parent keys before children.
-   Use deterministic joins and constraints for relationships.
-   Validate every FK before export.

## I-I. DOCUMENT / INVOICE / BANK STATEMENT CORRECTION

The current document engines are mathematically real but
template-driven. Preserve the deterministic calculation logic; replace
the assumption that every input is the same SaaS invoice or the same
merchant list.

-   Invoice: detect or accept fields such as vendor, customer, invoice
    number, date, due date, line items, quantity, price, tax, discount,
    total, currency.
-   Bank statement: detect account identity fields, dates, descriptions,
    debit/credit, balance, merchant/category and period.
-   Use document templates as rendering strategies, not as the source of
    truth for the user's input schema.
-   Allow user overrides for regional format, currency and document
    style where applicable.
-   Use deterministic arithmetic for totals and balances.
-   Use AI only for semantic extraction, classification, realistic
    content suggestions and edge cases.
-   Validate extracted values before generation.

## I-J. WORKER / QUEUE / STORAGE ARCHITECTURE

The project was intended to consider heavy workloads and rate limits.
The current stateless HTTP-only design is not sufficient for model
training once CTGAN/TVAE are introduced.

``` text
API PROCESS
    │
    ├── quick profile request → immediate response
    │
    └── heavy generation request
             ↓
          JOB RECORD
             ↓
           QUEUE
             ↓
        ML WORKER
        ├── preprocess
        ├── fit model
        ├── sample
        ├── validate
        ├── evaluate
        └── persist artifact/metrics
             ↓
          JOB RESULT
             ↓
        API / FRONTEND
```

For the immediate MVP, the queue can be implemented with a lightweight
local job abstraction if a production queue is too expensive. The
architectural boundary must exist even if the first worker runs
in-process/background.

-   Job states: queued, preprocessing, training, generating, validating,
    evaluating, completed, failed, cancelled.
-   Persist logs and metrics for the job.
-   Never keep a large model training operation inside a synchronous
    request if it can block the server.
-   Set dataset size limits and resource estimates.
-   Allow cancellation where safe.
-   Return job IDs for heavy operations.
-   Frontend polls/subscribes to job state rather than freezing the
    page.

## I-K. RATE LIMITING AND RESOURCE CONTROL

-   Limit Groq calls per job and per session.
-   Cache repeated schema semantic requests using source/profile
    fingerprint.
-   Deduplicate identical AI prompts.
-   Use structured output and small context windows.
-   Retry transient AI failures with exponential backoff.
-   Set model-training concurrency to protect the laptop/server.
-   Cap maximum rows for interactive preview.
-   Separate preview generation from export-scale generation.
-   Do not train CTGAN/TVAE repeatedly when the profile/configuration
    has not changed.
-   Store trained-model/job fingerprints when possible.

## I-L. VALIDATION AND QUALITY EVALUATION

Validation answers: 'Is this output valid?' Evaluation answers: 'How
similar/useful/private is this output compared with the source?' They
must remain separate.

  -----------------------------------------------------------------------
  Layer                   Examples                Gate
  ----------------------- ----------------------- -----------------------
  Schema validation       columns, types,         Hard gate
                          required fields         

  Value validation        range, regex, enum,     Hard gate
                          date format             

  Structural validation   PK/FK/cardinality       Hard gate

  Business validation     invoice totals,         Hard gate
                          balances                

  Statistical quality     distributions, pair     Optimization/quality
                          trends                  gate

  Privacy                 memorization, exact     Hard/threshold gate
                          match, masking          

  Utility                 TSTR/TRTS where         Reported quality signal
                          meaningful              

  Novelty                 new-row synthesis /     Privacy/quality signal
                          duplicate rate          
  -----------------------------------------------------------------------

SDMetrics provides diagnostic metrics such as data validity, structure,
key uniqueness and referential integrity, and quality metrics for
statistical similarity. citeturn1search3turn1search12

### I-L-1. Authenticity benchmark protocol

``` text
REAL DATA
   ↓
train/fit split where appropriate
   ↓
model fit
   ↓
synthetic sample
   ↓
COMPARE:
- column distributions
- category proportions
- pairwise trends
- correlations
- missingness
- bounds
- uniqueness
- referential integrity
- privacy/novelty
- downstream utility
   ↓
REPORT:
metric-by-metric results
   ↓
select model/configuration
```

For ML utility, a useful experiment is Train-on-Synthetic-Test-on-Real
(TSTR) when the dataset and target task make it meaningful. The score
must be reported as evidence, not as a universal claim that synthetic
data is always equivalent to real data.

## I-M. CONTROLLED REGENERATION

``` text
Generation Attempt #1
        ↓
Validation/Evaluation
        ↓
FAIL
        ↓
Failure diagnosis
        ├── invalid constraint
        ├── poor distribution
        ├── poor pair relationship
        ├── privacy concern
        └── utility concern
        ↓
Change:
model / hyperparameter / seed / conditioning / preprocessing
        ↓
Generation Attempt #2
        ↓
Validate + Evaluate
        ↓
PASS → selected artifact
FAIL → bounded retry / report
```

-   Set a maximum regeneration count.
-   Do not loop forever.
-   Record every attempt.
-   Keep the best valid candidate, not merely the last candidate.
-   Expose failure reasons to the user.
-   If no candidate passes hard constraints, stop and explain the
    blocking issue.

## I-N. EXPORT INTEGRITY

Export must reference a completed generation artifact. It must never
silently rerun generation with a new random seed.

-   generation_id
-   artifact fingerprint
-   selected model
-   seed
-   row count
-   profile version
-   validation status
-   evaluation metrics
-   export format
-   created_at

Before export, recompute or verify the artifact fingerprint and ensure
the file represents the exact validated generation.

# PART II --- HAMZA: FRONTEND, SECURITY, UI INTEGRATION

Scope: Make the actual product accessible from the browser. This
includes frontend ingestion, analysis, configuration, generation
controls, progress/job state, validation/evaluation display, export UX,
and security checks.

Rule: Do not redesign the backend model architecture. Consume the API
contracts supplied by Part I.

Rule: Do not alter backend generation algorithms simply to make the
frontend easier. If the API is insufficient, report the contract gap to
Akif.

Rule: No visual redesign for its own sake. The goal is functional
completion of the unified workspace.

## II-A. GAP MATRIX --- HAMZA

  ------------------------------------------------------------------------------------------------------------------------------------
  ID          UI capability   Current state     Required                                             Priority    Verification
  ----------- --------------- ----------------- ---------------------------------------------------- ----------- ---------------------
  H-01        Dataset upload  Missing           Drag/drop + file picker for supported formats.       P0          Upload real CSV and
                                                                                                                 see analysis.

  H-02        Schema          Missing           Optional schema/DDL input where supported.           P1          Paste schema and
              paste/import                                                                                       profile.

  H-03        Input type      Preset-driven     Allow automatic detection with optional manual       P0          Unexpected supported
              selection                         override.                                                        input routes
                                                                                                                 correctly.

  H-04        Dataset         Missing           Show rows, columns, types, nulls, uniques,           P0          Values match backend
              analysis screen                   distributions, warnings.                                         profile.

  H-05        Cleaning review Missing           Show quality findings and selected transformations.  P0          User can review
                                                                                                                 before generation.

  H-06        Schema editor   Missing           Edit column names/types/semantic types/constraints.  P0          Edits reach
                                                                                                                 generation request.

  H-07        Add synthetic   Missing           Add column with name/type/meaning/config.            P0          Generated output
              column                                                                                             contains it.

  H-08        Column          Missing           Select source columns/relationships for derived      P1          Dependency config
              dependencies                      fields.                                                          reaches backend.

  H-09        Model selection Missing           Auto-select or show candidate models when            P0/P1       Selected model shown
                                                applicable.                                                      in job result.

  H-10        Quality         Missing/limited   Show model scores and why one was selected.          P1          Benchmark result
              comparison                                                                                         visible.

  H-11        Generation job  Missing           Queued/training/generating/validating/evaluating     P1          Long job remains
              progress                          states.                                                          usable.

  H-12        Real preview    Preset-driven     Preview selected validated/generated artifact.       P0          Preview changes after
                                                                                                                 real upload.

  H-13        10K/1K          Partially         Clearly distinguish preview rows from full generated P0          Export contains
              semantics       implemented       rows.                                                            requested count.

  H-14        Validation      Backend exists    Show hard failures and passes.                       P0          Invalid fixture
              report                                                                                             blocks export.

  H-15        Quality report  Backend exists    Show statistical/privacy/utility metrics.            P0          Metrics correspond to
                                                                                                                 backend.

  H-16        Regenerate      Missing/limited   Retry with changed seed/model/config.                P0          New generation_id
                                                                                                                 produced.

  H-17        Export          Exists            Export selected validated artifact.                  P0          Downloaded file
                                                                                                                 matches displayed
                                                                                                                 result.

  H-18        Preset/demo     Exists            Clearly label as demo/sample and keep separate from  P1          No preset mistaken
              mode                              custom workflow.                                                 for uploaded data.

  H-19        Errors          Basic             Actionable errors for unsupported/invalid inputs.    P0          Malformed input
                                                                                                                 produces useful
                                                                                                                 message.

  H-20        Security        Partial           Validate file types, size, names, content and output P0          Security test suite
                                                handling.                                                        passes.

  H-21        No frontend     Required          Never expose Groq key or server credentials.         P0          Build inspection
              secrets                                                                                            verifies absence.

  H-22        State           React state only  At minimum preserve active job/profile IDs during    P1          Refresh behavior
              persistence                       workflow.                                                        defined/documented.

  H-23        Responsive      Existing          Functional desktop demo without broken panels.       P1          Demo viewport
              behavior                                                                                           verified.

  H-24        Accessibility   Partial           Labels, keyboard access, visible states.             P1          Smoke test.
              basics                                                                                             

  H-25        Integration     Limited           Automate                                             P0          E2E passes.
              tests                             upload→profile→configure→generate→validate→export.               
  ------------------------------------------------------------------------------------------------------------------------------------

## II-B. REQUIRED FRONTEND WORKFLOW

``` text
LANDING / WORKSPACE
        ↓
CREATE / UPLOAD DATASET
        ↓
ANALYZING
        ↓
DATASET ANALYSIS
        ├── overview
        ├── schema
        ├── quality
        ├── distributions
        └── semantic hints
        ↓
CLEAN / REVIEW
        ↓
SCHEMA + GENERATION CONFIGURATION
        ├── preserve columns
        ├── edit columns
        ├── add synthetic columns
        ├── row count
        ├── seed
        ├── privacy
        └── model strategy
        ↓
GENERATE
        ↓
JOB / PROGRESS
        ↓
PREVIEW
        ↓
VALIDATION + QUALITY
        ↓
REGENERATE OR ACCEPT
        ↓
EXPORT
```

### II-B-1. Upload screen

-   Drop zone.
-   Supported format list.
-   Maximum file size displayed.
-   File name displayed after selection.
-   Upload progress.
-   Cancel action.
-   Unsupported type error.
-   Malformed file error.
-   No automatic fallback to a preset.

### II-B-2. Analysis screen

-   Dataset name.
-   Modality.
-   Rows and columns.
-   Column table.
-   Detected data type.
-   Semantic type.
-   Null percentage.
-   Unique count.
-   Distribution summary.
-   Potential key indicator.
-   Potential relationship indicator.
-   Quality warnings.
-   Cleaning recommendations.
-   AI confidence/semantic suggestion where available.

### II-B-3. Schema configuration

-   Original columns remain visible.
-   User can rename output columns.
-   User can override data type.
-   User can override semantic type.
-   User can configure null behavior.
-   User can configure privacy behavior.
-   User can add synthetic columns.
-   User can specify description/meaning.
-   User can select source dependencies.
-   User can configure ranges/categories where appropriate.
-   User can remove an optional column from the synthetic output without
    modifying the original source.

### II-B-4. Model configuration

-   Auto mode: system benchmarks compatible candidates.
-   Manual mode: user can choose a candidate where allowed.
-   Show why a model is unavailable for a dataset.
-   Show training status.
-   Show model/version after generation.
-   Do not expose unnecessary hyperparameters in the first MVP screen.
-   Advanced settings can remain collapsed.

## II-C. SECURITY REQUIREMENTS

-   Reject path traversal filenames.
-   Never use the original filename directly as a server path.
-   Enforce maximum upload size.
-   Validate MIME/type and actual content.
-   Protect against malformed CSV/JSON parser abuse.
-   Never execute uploaded code.
-   Never pass raw uploaded PII to the frontend unnecessarily.
-   Never expose GROQ_API_KEY to the browser.
-   Sanitize generated export filenames.
-   Prevent arbitrary filesystem access through export parameters.
-   Validate SQL export identifiers and values.
-   Do not trust user-provided schema types without validation.
-   Rate-limit heavy generation requests.
-   Avoid storing source PII beyond the declared lifecycle.
-   Use synthetic replacements before semantic AI calls where possible.
-   Test prompt injection if uploaded document text is sent to an LLM.
-   Separate user data from system instructions in AI prompts.
-   Do not allow uploaded text to override system generation rules.
-   Log security failures without logging raw sensitive records.

## 3. STRICT OWNERSHIP BOUNDARY

  -----------------------------------------------------------------------
  Area                    Akif                    Hamza
  ----------------------- ----------------------- -----------------------
  Backend architecture    OWNER                   Do not modify

  FastAPI APIs            OWNER                   Consume/report gaps

  Data ingestion/parser   OWNER                   Test from UI

  Data cleaning           OWNER                   Expose controls/report
                                                  UX gaps

  DataProfile             OWNER                   Consume

  Statistical model       OWNER                   Do not alter

  CTGAN/TVAE adapters     OWNER                   Do not alter

  Model benchmark         OWNER                   Display results

  Groq/LLM service        OWNER                   Consume

  Relational generation   OWNER                   Do not alter

  Document generation     OWNER                   Do not alter

  Validation/evaluation   OWNER                   Display and test

  Regeneration logic      OWNER                   Trigger through API

  Export backend          OWNER                   Consume

  Frontend                Do not redesign         OWNER
  pages/components                                

  Frontend state          API contract only       OWNER

  Upload UX               API contract only       OWNER

  Security tests          Support backend fixes   OWNER

  E2E browser tests       Support API stability   OWNER

  Deployment              OWNER                   Verify frontend/backend
                                                  behavior

  Git merge               Coordinate according to Coordinate according to
                          Git.md                  Git.md
  -----------------------------------------------------------------------

If one side needs a change owned by the other side, create a clearly
scoped integration request. Do not silently edit the other side's core
implementation.

## 4. DEVELOPMENT EXECUTION ORDER

The two workstreams should proceed in parallel only where their
contracts are stable.

``` text
PHASE A — FREEZE & VERIFY
Akif: backend/data/AI audit
Hamza: frontend/security audit

        ↓

PHASE B — CORE INPUT CONTRACT
Akif: ingestion/profile/configuration APIs
Hamza: upload/analysis/configuration UI

        ↓

PHASE C — MODEL LAYER
Akif: statistical + CTGAN + TVAE adapters/benchmark
Hamza: model/job status UI

        ↓

PHASE D — REAL E2E FLOW
Both: upload → profile → configure → generate → validate → evaluate → export

        ↓

PHASE E — FAILURE / SECURITY
Akif: backend failure paths
Hamza: security + malformed input + browser E2E

        ↓

PHASE F — STABILIZATION
Both: regression + demo dataset + final evidence

        ↓

PHASE G — OPTIONAL PERSISTENCE / DEPLOYMENT
Only after core MVP passes.
```

### 4.1 Branch rules

-   Never work directly on main.
-   Each owner uses the branch naming rules already defined in the
    repository Git rules.
-   Push completed work to the owner's branch.
-   Run local tests before handoff.
-   Integration branch/merge process follows Git.md.
-   No force-push or overwrite of another owner's branch.
-   Do not merge code merely because it compiles; merge after functional
    verification.

## 5. EVIDENCE-BASED COMPLETION RULE

Every checkbox in MASTER-PLAN.md should correspond to evidence. The
following evidence levels should be used.

  -----------------------------------------------------------------------
  Level                               Meaning
  ----------------------------------- -----------------------------------
  0 --- Not started                   No implementation exists.

  1 --- Stub                          Names/types/routes exist but
                                      workflow is not functional.

  2 --- Isolated                      Component works in isolation with
                                      fixtures or direct API calls.

  3 --- Integrated                    Component is connected to the real
                                      upstream/downstream workflow.

  4 --- Tested                        Automated/manual tests cover
                                      success and failure paths.

  5 --- Demo-ready                    Real arbitrary supported input
                                      works end-to-end and evidence is
                                      recorded.
  -----------------------------------------------------------------------

A backend endpoint passing a unit test is Level 2--4 depending on
coverage. It is not Level 5 until a real user workflow reaches it.

# 6. MASTER FINAL VERIFICATION MATRIX

  -------------------------------------------------------------------------------------------------------------------------------------
  Capability        Was missing?      Current evidence        Required final state             Owner      Verified?   Evidence to
                                                                                                                      attach
  ----------------- ----------------- ----------------------- -------------------------------- ---------- ----------- -----------------
  Arbitrary dataset YES               No frontend upload      Real supported files enter       Hamza +    □           E2E
  upload                                                      pipeline                         Akif                   recording/test

  Dataset modality  YES               Preset routing          Input automatically classified   Akif       □           API test
  detection                                                                                                           

  Schema inference  PARTIAL           Backend endpoint exists Frontend consumes it             Akif +     □           Profile response
                                                                                               Hamza                  

  Column data types PARTIAL           Backend profiling       Visible/editable in UI           Akif +     □           Screenshot + test
                                                                                               Hamza                  

  Missing-value     PARTIAL           Profile capability      Visible and configurable         Akif +     □           Profile test
  analysis                                                                                     Hamza                  

  Data cleaning     MISSING           No complete workflow    Controlled cleaning with audit   Akif       □           Dirty fixture
                                                                                                                      report

  DataProfile       PARTIAL           Ephemeral               Session/job-linked profile       Akif       □           API/job test
  lifecycle                                                                                                           

  Schema editor     MISSING           No UI                   Edit                             Hamza      □           Browser E2E
                                                              type/name/semantic/constraints                          

  Synthetic column  MISSING           No UI                   Add/configure output columns     Akif +     □           Generated schema
  addition                                                                                     Hamza                  

  Statistical       PARTIAL           Existing local          Formal baseline adapter +        Akif       □           Benchmark report
  generator                           generator               evaluation                                              

  CTGAN             MISSING           Not fitted              Integrated candidate             Akif       □           Training/sample
                                                                                                                      test

  TVAE              MISSING           Not fitted              Integrated candidate             Akif       □           Training/sample
                                                                                                                      test

  Model selection   MISSING           No benchmark router     Measured candidate selection     Akif       □           Model report

  LLM schema        PARTIAL           Backend exists          Connected to real input          Akif       □           AI test
  semantics                                                                                                           

  Realistic         PARTIAL           Static pools exist      Locale/source-aware generation   Akif       □           Locale fixture
  semantic pools                                                                                                      

  Relational        MISSING           Preset only             Schema-driven generation         Akif       □           Multi-table
  arbitrary schema                                                                                                    fixture

  Invoice           PARTIAL           Fixed template          Input-aware configuration        Akif       □           Invoice fixture
  adaptability                                                                                                        

  Bank statement    PARTIAL           Fixed merchant catalog  Input/domain-aware generation    Akif       □           Statement fixture
  adaptability                                                                                                        

  Validation        PARTIAL/STRONG    Backend exists          Runs on custom artifact          Akif +     □           Invalid fixture
                                                                                               Hamza                  

  Quality           PARTIAL/STRONG    Backend exists          Source-vs-synthetic metrics      Akif +     □           Quality report
  evaluation                                                                                   Hamza                  

  Privacy/novelty   PARTIAL           Mask/hash/noise         Memorization/novelty checks      Akif       □           Privacy report

  Regeneration      PARTIAL           Needs E2E proof         Bounded retry with diagnosis     Akif +     □           Failure test
                                                                                               Hamza                  

  Preview           PARTIAL           Preset preview          Selected real artifact preview   Hamza      □           Browser test

  10K semantics     PARTIAL           Backend supports count  Preview/full generation clearly  Akif +     □           Count test
                                                              separated                        Hamza                  

  Export            STRONG            Backend exists          Exact validated artifact export  Akif +     □           Fingerprint test
                                                                                               Hamza                  

  Worker/job        MISSING/LIMITED   Synchronous/stateless   Heavy jobs async                 Akif       □           Job test
  architecture                                                                                                        

  Rate limiting     PARTIAL           AI controls             AI + generation resource limits  Akif       □           Abuse test

  Security          PARTIAL           Some controls           File/AI/export/path/payload      Hamza      □           Security suite
                                                              checks                                                  

  Persistent        DEFERRED          No persistence          Add after core MVP if time       Akif       □           Later milestone
  storage                                                     allows                                                  

  Cloud deployment  DEFERRED          Localhost               Optional after MVP               Akif       □           Later milestone
  -------------------------------------------------------------------------------------------------------------------------------------

# 7. 60--90 MINUTE RECOVERY PLAN

This is a triage plan, not a promise that every advanced model can be
trained, tuned and productionized in 90 minutes. The goal is to produce
a real working MVP path first, then deepen model benchmarking where time
permits.

  ------------------------------------------------------------------------------------
  Time                    Akif                                 Hamza
  ----------------------- ------------------------------------ -----------------------
  0--10 min               Freeze current code; inspect         Freeze UI changes;
                          model/data/API folders; identify     identify hardcoded
                          exact integration points.            fallback paths and
                                                               missing
                                                               upload/configuration
                                                               surfaces.

  10--25 min              Implement/repair ingestion → profile Build/repair upload →
                          → generation contract; make          analysis state flow
                          DataProfile reusable across          against the existing
                          requests/jobs.                       API contract.

  25--45 min              Wire statistical baseline to         Build
                          DataProfile; create model adapter    schema/configuration
                          interface; begin CTGAN/TVAE adapters panel including add
                          or verify dependency compatibility.  synthetic column
                                                               fields.

  45--60 min              Connect                              Connect generation
                          validation/evaluation/regeneration   controls, job/progress
                          to generated custom dataset; remove  state,
                          preset dependency from tabular path. validation/evaluation
                                                               and real preview.

  60--75 min              Run real CSV fixture, compare        Run browser E2E with
                          metrics, fix failures, expose        real CSV; fix
                          model/metrics in API.                state/errors/export UX.

  75--90 min              Stabilize, test, document exact      Security smoke tests,
                          remaining model/worker limitations.  malformed input tests,
                                                               export verification,
                                                               final E2E.
  ------------------------------------------------------------------------------------

If CTGAN/TVAE installation or training cannot be made reliable inside
the short window, do not fake completion. The correct fallback is a
working statistical baseline with the model adapter boundary and a
clearly marked pending CTGAN/TVAE benchmark, while continuing the model
work immediately afterward.

# 8. REQUIRED TEST CASES

## 8.1 Real tabular dataset

-   Upload a non-demo CSV.
-   Verify row/column counts.
-   Verify inferred types.
-   Verify semantic hints.
-   Verify null rates.
-   Verify category counts.
-   Verify numeric ranges.
-   Verify source fingerprint.
-   Configure output row count.
-   Add one synthetic column.
-   Generate.
-   Validate.
-   Evaluate.
-   Export.
-   Re-import exported CSV.
-   Verify schema and row count.
-   Verify generated column exists.
-   Verify no raw source row was copied exactly beyond permitted policy.

## 8.2 Dirty dataset

-   Missing numeric values.
-   Missing categorical values.
-   Duplicate rows.
-   Malformed date.
-   Malformed email.
-   Outlier.
-   Inconsistent category spelling.
-   Identifier-like numeric column.
-   Verify warnings.
-   Verify cleaning actions are visible.
-   Verify generation does not silently use uncleaned invalid state.

## 8.3 Model benchmark

-   Fit statistical baseline.
-   Fit CTGAN if compatible.
-   Fit TVAE if compatible.
-   Generate equal row counts.
-   Run diagnostics.
-   Run quality metrics.
-   Run privacy/novelty checks.
-   Run utility evaluation where applicable.
-   Reject hard constraint failures.
-   Record model winner and reasons.
-   Store seed and configuration.

## 8.4 Security

-   Oversized file.
-   Wrong extension/content mismatch.
-   Path traversal filename.
-   Malformed CSV.
-   Formula-like spreadsheet payload if spreadsheet output is supported.
-   Prompt injection inside uploaded text/document.
-   SQL injection-like identifiers/values in schema/export requests.
-   Huge row count request.
-   Excessive repeated AI requests.
-   Export path manipulation.
-   Secret exposure in frontend bundle.

# 9. MASTER-PLAN / TASK-BREAKDOWN CORRECTION RULES

Until the recovery matrix is verified, do not mark a capability complete
merely because a related endpoint exists.

  -----------------------------------------------------------------------
  Incorrect completion statement      Correct interpretation
  ----------------------------------- -----------------------------------
  'Schema inference complete'         Backend inference exists; frontend
                                      workflow and profile lifecycle must
                                      also be verified.

  'AI complete'                       AI service exists; real
                                      uploaded-data semantics must be
                                      integrated and tested.

  'Generation complete'               At least one compatible model must
                                      learn from real input and generate
                                      validated output.

  'Frontend complete'                 The user must be able to complete
                                      the real input-to-export journey,
                                      not just navigate preset screens.

  'Integration complete'              A real arbitrary supported fixture
                                      must pass through the complete
                                      workflow.

  'Quality complete'                  Quality metrics must compare source
                                      and synthetic data and influence
                                      selection/regeneration.

  'Export complete'                   Export must serialize the validated
                                      selected artifact, not an unrelated
                                      regeneration.

  'Deployment complete'               Cloud deployment is not required
                                      for the core MVP; localhost
                                      stability comes first.
  -----------------------------------------------------------------------

The existing audit explicitly states that frontend UI currently has no
file upload and that the UI remains locked to four preconfigured slide
presets. fileciteturn14file0L81-L89

The audit also confirms that the relational and document engines are
still preset/template driven. fileciteturn14file0L110-L123

# 10. EVIDENCE LEDGER

Agents must update this section only with evidence after implementation.
Do not convert a planned item to \[x\] because code was written.

  -------------------------------------------------------------------------------
  ID                Evidence          Status            Required proof
  ----------------- ----------------- ----------------- -------------------------
  E-01              Real CSV uploaded □                 Screenshot + E2E log
                    from browser                        

  E-02              DataProfile       □                 API response + browser
                    displayed                           

  E-03              Cleaning report   □                 Dirty fixture
                    displayed                           

  E-04              User schema edit  □                 Request/response capture
                    reaches backend                     

  E-05              Synthetic column  □                 Output schema
                    generated                           

  E-06              Statistical       □                 Metrics JSON/report
                    baseline                            
                    benchmark                           

  E-07              CTGAN benchmark   □                 Training/sample/metrics

  E-08              TVAE benchmark    □                 Training/sample/metrics

  E-09              Model selection   □                 Selection report

  E-10              Validation blocks □                 Negative test
                    invalid output                      

  E-11              Quality metrics   □                 Quality report
                    shown                               

  E-12              Regeneration      □                 Failure/retry log
                    works                               

  E-13              Export matches    □                 Fingerprint
                    validated                           
                    artifact                            

  E-14              Security suite    □                 Test report

  E-15              Full browser E2E  □                 Test recording/log
  -------------------------------------------------------------------------------

# 11. AKIF AGENT INSTRUCTION BOUNDARY

``` text
You own Part I only.

READ:
- this repository-correction.md Part I
- MASTER-PLAN.md
- TASK-BREAKDOWN.md
- ARCHITECTURE.md
- API-CONTRACT.md
- TEST-PLAN.md
- DECISIONS.md
- Git.md
- your assigned agent/skill rules

DO:
- inspect existing backend before editing
- preserve working engines
- implement real input ingestion
- implement/repair profiling and DataProfile lifecycle
- implement cleaning/normalization
- implement GenerationSpecification
- integrate statistical baseline
- integrate CTGAN candidate
- integrate TVAE candidate
- benchmark candidates
- connect AI semantics to real input
- make relational/document paths more data-driven
- validate/evaluate/regenerate
- add worker/job boundaries
- enforce rate/resource limits
- provide exact API contracts to Hamza
- write tests

DO NOT:
- redesign frontend
- change visual layouts
- replace Hamza's UI implementation
- claim completion without evidence
- remove working generators just to introduce ML
- use LLM row-by-row as the bulk generator
- make cloud deployment block the local MVP
- add Supabase solely to make the project appear dynamic

STOP CONDITION:
The Part I work is complete only when a real supported input can travel from ingestion to a validated synthetic artifact through the API, with model/evaluation evidence.
```

Agent must report a gap rather than invent a capability if a dependency,
model installation or input modality cannot be safely implemented in the
available time.

# 12. HAMZA AGENT INSTRUCTION BOUNDARY

``` text
You own Part II only.

READ:
- this repository-correction.md Part II
- MASTER-PLAN.md
- TASK-BREAKDOWN.md
- UI-REQUIREMENTS.md
- DESIGN.md
- API-CONTRACT.md
- TEST-PLAN.md
- DECISIONS.md
- Git.md
- your assigned agent/skill rules

DO:
- implement upload/input UI
- implement analysis/profile display
- implement cleaning review UI
- implement schema configuration
- implement synthetic-column configuration
- implement generation controls
- implement model/job status
- implement preview of real generated artifacts
- display validation/evaluation
- implement regeneration trigger
- implement validated export flow
- implement frontend security checks
- add browser E2E tests

DO NOT:
- redesign backend generation algorithms
- edit CTGAN/TVAE implementation
- modify DataProfile semantics without coordination
- replace backend validation with frontend-only validation
- change the architecture silently
- remove API calls and replace them with hardcoded demo data
- add more preset demo content instead of real input support

STOP CONDITION:
The Part II work is complete only when a user can upload a real supported dataset, see its analysis, configure the schema, generate, inspect validation/evaluation, regenerate if necessary, and export the selected artifact.
```

If an API needed by the UI is missing, file/communicate the exact
contract gap to Akif. Do not create a parallel incompatible mock
endpoint.

# 13. FINAL PRODUCT DEFINITION --- WHAT THE DEMO MUST PROVE

``` text
JUDGE PROVIDES DATA
       │
       ├── CSV
       ├── JSON / table-like input
       ├── relational schema / multiple tables
       ├── invoice/document
       └── bank statement/document
       │
       ▼
HACKDATA INGESTS
       │
       ▼
UNDERSTANDS
       │
       ├── modality
       ├── columns/fields
       ├── types
       ├── semantics
       ├── missingness
       ├── distributions
       ├── relationships
       └── quality problems
       │
       ▼
CLEAN / NORMALIZE / REVIEW
       │
       ▼
DATAPROFILE
       │
       ▼
USER CONFIGURES
       │
       ├── output row count
       ├── seed
       ├── privacy
       ├── preserved columns
       ├── added synthetic columns
       ├── semantics
       ├── constraints
       └── model strategy
       │
       ▼
AI SUPPORT
       │
       ├── semantic understanding
       ├── configuration interpretation
       └── realistic content suggestions
       │
       ▼
MODEL / ENGINE SELECTION
       │
       ├── statistical baseline
       ├── CTGAN
       ├── TVAE
       ├── relational engine
       └── document engine
       │
       ▼
GENERATE
       │
       ▼
VALIDATE
       │
       ▼
EVALUATE
       │
       ├── fidelity
       ├── integrity
       ├── privacy
       ├── novelty
       └── utility
       │
       ▼
PASS? ───────────── NO ─────→ CONTROLLED REGENERATION
  │
 YES
  │
  ▼
PREVIEW
  │
  ▼
EXPORT
  │
  ▼
AUDITABLE SYNTHETIC DATA
```

## 13.1 Final quality philosophy

Synthetic data should look realistic because it learned the statistical,
structural and semantic patterns of the supplied source---not because a
developer hardcoded attractive example rows.

Do not optimize for a screenshot that looks impressive. Optimize for a
judge changing the input and the system still working.

Do not claim that synthetic data is 'the same as real data.' The goal is
high measured fidelity while preserving privacy and respecting the
intended use case.

Do not claim a universal accuracy percentage. Report the metrics that
matter for the supplied dataset and explain failures.

A model that generates perfect-looking rows but fails schema,
relational, privacy or utility checks is not a successful generator.

# 14. RELEASE GATE

  -----------------------------------------------------------------------
  Gate                                Required result
  ----------------------------------- -----------------------------------
  G1 Input                            Real supported dataset/document
                                      enters through UI.

  G2 Understanding                    Profile is generated and visible.

  G3 Cleaning                         Quality issues are surfaced and
                                      transformations are controlled.

  G4 Configuration                    User can change schema/generation
                                      configuration and add synthetic
                                      columns.

  G5 Model                            At least one real data-learning
                                      generator works; candidate model
                                      benchmarking is integrated where
                                      feasible.

  G6 Generation                       Requested row count/artifact is
                                      produced.

  G7 Validation                       Hard constraints pass.

  G8 Evaluation                       Quality metrics compare source and
                                      synthetic output.

  G9 Regeneration                     Failure can trigger bounded
                                      corrective regeneration.

  G10 Export                          Exact validated artifact exports.

  G11 Security                        Malformed/oversized/unsafe input
                                      paths are handled.

  G12 E2E                             Browser test completes the whole
                                      workflow.

  G13 Evidence                        Completion claims are backed by
                                      logs/tests/screenshots.

  G14 Demo                            A judge can provide an unfamiliar
                                      supported dataset without code
                                      changes.
  -----------------------------------------------------------------------

Do not proceed to optional deployment/persistence polish as a substitute
for any failed G1--G14 gate.

# 15. APPENDIX --- CURRENT AUDIT FACTS TO PRESERVE

The following facts from the supplied audit are important because they
prevent unnecessary rewrites:

-   The frontend does call live backend endpoints for preset workflows.
-   Tabular row_count reaches the backend and the backend can generate
    the requested count.
-   The relational preview intentionally limits displayed customers to
    25 for DOM safety; this is separate from the full generation count.
-   Schema inference exists in the backend.
-   DataProfile exists as a Pydantic model.
-   A real CSV can already travel through the backend API path: infer →
    profile → tabular generate → validate → evaluate → export.
-   The frontend currently cannot start that path because it lacks the
    upload/schema input UI.
-   The backend is currently stateless and generated data is not
    persistently stored.
-   Core row generation intentionally does not call the LLM.
-   TabularEngine consumes DataProfile.
-   RelationalEngine and DocumentEngine remain preset/template driven.
-   Existing validation/evaluation/export functionality should be reused
    and connected to the custom-input workflow.

These facts are directly supported by the latest audit, including the
explicit real-CSV API path and frontend gap.
fileciteturn14file0L81-L89

The audit's summary checklist is also the authoritative snapshot for
these twelve diagnostic questions until code verification changes one of
them. fileciteturn14file0L141-L156

# 16. CHANGE LOG / HUMAN REVIEW

  ----------------------------------------------------------------------------
  Date           Reviewer       Change           Evidence       Approved?
  -------------- -------------- ---------------- -------------- --------------
  2026-09-29     Akif           Created          Current        □
                                repository       repository     
                                correction       audit +        
                                baseline after   approved       
                                implementation   project docs.  
                                drift review.                   

                                                                □

                                                                □

                                                                □

                                                                □
  ----------------------------------------------------------------------------

# 17. OPERATIONAL CHECKLIST --- DO NOT SKIP

-   [ ] 001. Inspect existing code before deleting or replacing
    anything.
-   [ ] 002. Identify every hardcoded preset path.
-   [ ] 003. Identify every live API path.
-   [ ] 004. Identify every frontend fallback path.
-   [ ] 005. Identify every API that accepts DataProfile.
-   [ ] 006. Identify every API that discards DataProfile after
    response.
-   [ ] 007. Identify where uploaded bytes are parsed.
-   [ ] 008. Identify where cleaned data is produced.
-   [ ] 009. Identify where model fitting begins.
-   [ ] 010. Identify where model sampling begins.
-   [ ] 011. Identify where validation begins.
-   [ ] 012. Identify where evaluation begins.
-   [ ] 013. Identify where regeneration begins.
-   [ ] 014. Identify where export reads its source artifact.
-   [ ] 015. Identify every place row_count is capped.
-   [ ] 016. Distinguish preview count from generation count.
-   [ ] 017. Distinguish demo presets from real user data.
-   [ ] 018. Distinguish LLM semantic work from generator work.
-   [ ] 019. Distinguish model training from inference/sampling.
-   [ ] 020. Record model version and seed.
-   [ ] 021. Record source fingerprint.
-   [ ] 022. Record DataProfile version.
-   [ ] 023. Record GenerationSpecification version.
-   [ ] 024. Record evaluation metrics.
-   [ ] 025. Record validation status.
-   [ ] 026. Block export on hard validation failure.
-   [ ] 027. Block unsafe input.
-   [ ] 028. Block runaway AI calls.
-   [ ] 029. Block runaway training jobs.
-   [ ] 030. Test malformed input.
-   [ ] 031. Test empty input.
-   [ ] 032. Test very small input.
-   [ ] 033. Test categorical-heavy input.
-   [ ] 034. Test numeric-heavy input.
-   [ ] 035. Test mixed-type input.
-   [ ] 036. Test missing values.
-   [ ] 037. Test outliers.
-   [ ] 038. Test duplicate rows.
-   [ ] 039. Test high-cardinality columns.
-   [ ] 040. Test identifier columns.
-   [ ] 041. Test dates.
-   [ ] 042. Test local Pakistani-style data.
-   [ ] 043. Test an international dataset.
-   [ ] 044. Test an unfamiliar dataset not designed by the team.
-   [ ] 045. Test adding a synthetic column.
-   [ ] 046. Test renaming a synthetic column.
-   [ ] 047. Test changing a semantic type.
-   [ ] 048. Test changing row count.
-   [ ] 049. Test changing seed.
-   [ ] 050. Test regeneration.
-   [ ] 051. Test export/re-import.
-   [ ] 052. Test refresh/session behavior.
-   [ ] 053. Test frontend/backend mismatch errors.
-   [ ] 054. Test model failure fallback.
-   [ ] 055. Test AI failure fallback.
-   [ ] 056. Test worker failure.
-   [ ] 057. Test cancellation if implemented.
-   [ ] 058. Test security boundaries.
-   [ ] 059. Record evidence before marking complete.

# 18. FINAL DIRECTIVE

STOP BUILDING A PRESET-DRIVEN SHOWCASE AS IF IT WERE THE FINAL PRODUCT.

RESTORE THE REAL DATA PIPELINE.

PRESERVE WHAT IS WORKING.

IMPLEMENT WHAT IS MISSING.

MEASURE SYNTHETIC QUALITY.

USE LLMs AS SUPPORTING INTELLIGENCE.

USE STATISTICAL / CTGAN / TVAE CANDIDATES WHERE APPROPRIATE.

DO NOT FABRICATE COMPLETION.

DO NOT LET UI POLISH HIDE BACKEND GAPS.

DO NOT LET BACKEND CAPABILITY REMAIN INACCESSIBLE FROM THE USER
WORKFLOW.

THE DEMO MUST ACCEPT DATA IT HAS NEVER SEEN BEFORE.

THE SYNTHETIC OUTPUT MUST BE VALIDATED, EVALUATED, EXPLAINABLE, AND
EXPORTABLE.

This document is the recovery worklist. Once Part I and Part II are
implemented and evidence is collected, create the next execution prompt
from the verified matrix rather than from optimistic completion
percentages.
