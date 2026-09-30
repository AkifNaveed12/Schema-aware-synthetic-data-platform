# HackData V2 — Comprehensive Architecture & Flow Diagrams

This document contains authoritative High-Level (HLD) and Low-Level (LLD) architectural diagrams for the **HackData V2 — Schema-Aware Synthetic Data Platform**. All diagrams are authored in standard Mermaid code for instant rendering and documentation compliance.

---

## 1. High-Level System Architecture (HLD)

```mermaid
flowchart TB
    subgraph ClientLayer ["Client & Edge Layer (Vercel)"]
        UI["React 19 + TypeScript SPA"]
        Landing["Interactive Landing & Showcase"]
        Workspace["Multi-Modality Workspace"]
        SynthiaUI["Synthia Voice/Text Assistant"]
        NLGenUI["Natural-Language Control Plane"]
    end

    subgraph APILayer ["API & Control Plane (Render Web Service)"]
        FastAPI["FastAPI Orchestrator (:8000)"]
        RouterNL["NL Generation Engine"]
        RouterSynthia["Synthia Assistant Engine"]
        RouterIngest["Dataset Profiler & Ingestion"]
        RouterExport["Export & Email Dispatcher (SMTP/HTTPS)"]
    end

    subgraph AsyncLayer ["Distributed Message Broker (Render Valkey)"]
        Queue[("Valkey / Redis FIFO Queue")]
    end

    subgraph WorkerLayer ["Compute & ML Synthesis (Render ML Worker)"]
        MLWorker["Standalone ML Worker Process"]
        CTGAN["CTGAN Synthesizer (SDV)"]
        TVAE["TVAE Deep Generative Synthesizer"]
        StatEngine["Statistical Baseline Generator"]
        RelEngine["Relational Referential Engine"]
        DocEngine["Document Engine (Invoices / Statements)"]
        PrivacyEngine["Differential Privacy & Masking Engine"]
    end

    subgraph StorageLayer ["Persistence & Cloud Storage (Supabase)"]
        Postgres[("Supabase PostgreSQL (Jobs & State)")]
        Storage[("Supabase Object Storage (Raw & Synthetic CSV)")]
    end

    subgraph ExternalServices ["External AI & Mail APIs"]
        Groq["Groq Cloud (Qwen 3.8 27B / Llama 3.3 70B)"]
        SMTP["Gmail SMTP / Resend HTTPS Relay"]
    end

    %% Client to API
    UI -->|HTTPS / REST| FastAPI
    SynthiaUI -->|Contextual Clarifications| RouterSynthia
    NLGenUI -->|Natural English & Urdu Specs| RouterNL

    %% API to External & Queue
    RouterNL -->|Schema & Constraint Inference| Groq
    RouterSynthia -->|Speech & Action Reasoning| Groq
    RouterExport -->|Attachment Delivery| SMTP
    FastAPI -->|Enqueue Heavy Synthesis Jobs| Queue
    RouterIngest -->|Raw Upload| Storage

    %% Worker Execution
    Queue -->|Dequeue Job Payload| MLWorker
    MLWorker -->|Download Input Dataset| Storage
    MLWorker -->|Execute Auto-Routing| StatEngine
    MLWorker -->|Fit & Sample Tabular| CTGAN
    MLWorker -->|Fit & Sample Deep| TVAE
    MLWorker -->|Preserve Foreign Keys| RelEngine
    MLWorker -->|Synthesize Business Docs| DocEngine
    MLWorker -->|Apply Epsilon Noise| PrivacyEngine
    MLWorker -->|Persist Final Artifact| Storage
    MLWorker -->|Update State & Telemetry| Postgres
```

---

## 2. Low-Level Component Architecture (LLD)

```mermaid
flowchart LR
    subgraph IngestionPipeline ["Ingestion & Profiling Engine"]
        A1["Raw Bytes (CSV/JSON)"] --> A2["Magic Bytes & Modality Sniffer"]
        A2 --> A3["Pandas Ingestion + Type Inference"]
        A3 --> A4["Statistical Profiler (Distributions, Cardinality)"]
        A4 --> A5["AI Semantic Enrichment (Groq)"]
        A5 --> A6["DataProfile Schema Object"]
    end

    subgraph ModelSelectionRouter ["Smart Model Routing & Safety Guard"]
        B1["Job Config & DataProfile"] --> B2{"Safety Guard"}
        B2 -->|Rows > 2000 OR Max Unique > 100| B3["StatisticalBaselineAdapter (OOM Safe)"]
        B2 -->|Small Tabular Data| B4{"User Strategy"}
        B4 -->|Auto / CTGAN| B5["CTGAN Synthesizer (SDV)"]
        B4 -->|Auto / TVAE| B6["TVAE Synthesizer"]
        B4 -->|Relational Schema| B7["RelationalEngine (Topological FK Sort)"]
        B4 -->|Document Template| B8["DocumentEngine (Mathematical Balance)"]
    end

    subgraph PostProcessing ["Validation, Evaluation & Privacy"]
        C1["Raw Generated Rows"] --> C2["Constraint Enforcement (Min/Max, RegEx)"]
        C2 --> C3["Privacy Module (DP Noise / HMAC / Masking)"]
        C3 --> C4["Validation Dashboard (Rule & Type Audits)"]
        C4 --> C5["TSTR Evaluation (Train on Synthetic, Test on Real)"]
    end

    IngestionPipeline --> ModelSelectionRouter
    ModelSelectionRouter --> PostProcessing
```

---

## 3. Natural-Language to Synthetic Data Pipeline Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Data Engineer / User
    participant Frontend as React NL Interface
    participant API as FastAPI Control Plane
    participant LLM as Groq AI Orchestrator
    participant Worker as ML Synthesis Worker
    participant Storage as Supabase Storage

    User->>Frontend: Enter prompt (e.g., "10 rows of shopping customer data")
    Frontend->>API: POST /api/v1/generation-requests {user_prompt}
    API->>LLM: Ingest prompt, detect domain, extract columns, types, and constraints
    LLM-->>API: Structured GenerationSpec (Columns, Types, Ranges, Nullability)
    API-->>Frontend: Return interactive Schema Plan & Clarifications
    
    User->>Frontend: Review / approve plan & click "Execute Generation"
    Frontend->>API: POST /api/v1/generation-requests/{id}/generate
    API->>Worker: Enqueue generation task (spec, rows=10, modality=tabular)
    Worker->>Worker: Execute Domain Generators (names, emails, prices, dates)
    Worker->>Worker: Run Deterministic Validation & Audit Checks
    Worker->>Storage: Store synthesized CSV / JSON / SQL artifacts
    Worker->>API: Mark request completed with validation metrics
    API-->>Frontend: Live generation results with preview grid & fidelity metrics
    Frontend-->>User: Render preview, allow Download or Email dispatch
```

---

## 4. Dataset Upload & Distributed Synthesis Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant Browser as Frontend App
    participant API as Backend API
    participant Supabase as Supabase Storage / DB
    participant Valkey as Valkey Queue
    participant Worker as ML Worker

    User->>Browser: Upload `products.csv` (10,000 rows)
    Browser->>API: POST /api/v1/datasets/ingest (multipart/form-data)
    API->>API: Compute SHA-256 fingerprint & generate DataProfile
    API->>Supabase: Upload raw file to `datasets/raw/{id}.csv`
    API-->>Browser: Return dataset_id, inferred schema, column types
    
    User->>Browser: Select "CTGAN / Auto", 5,000 rows -> Click "Generate"
    Browser->>API: POST /api/v1/datasets/{id}/generate {row_count: 5000}
    API->>Valkey: Push job payload to `jobs:default`
    API-->>Browser: Return job_id (Polling begins)
    
    Valkey->>Worker: Dequeue job payload
    Worker->>Supabase: Download raw dataset from `datasets/raw/{id}.csv`
    Worker->>Worker: Check memory guard (rows > 2000 -> StatisticalBaseline)
    Worker->>Worker: Train generator & synthesize 5,000 realistic rows
    Worker->>Supabase: Upload generated artifact to `datasets/generated/{id}.csv`
    Worker->>Supabase: Update job state = "completed", progress = 100%
    
    Browser->>API: GET /api/v1/jobs/{job_id} (Poll interval)
    API->>Supabase: Fetch updated job status
    API-->>Browser: Job status = "completed"
    Browser-->>User: Display synthetic dataset, validation graphs & export actions
```

---

## 5. Synthia Real-Time Multimodal Voice & Chat Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as User (Voice / Text)
    participant UI as Synthia Floating Widget
    participant API as Synthia API Controller
    participant LLM as Groq Llama/Qwen Assistant
    participant Actions as Platform Action Dispatcher

    User->>UI: Speaks: "Add an annual income column between 40k and 150k"
    UI->>UI: Web Speech API transcribes audio to text in real time
    UI->>API: POST /api/v1/assistant/synthia/message {session_id, message}
    API->>LLM: Evaluate user intent against active dataset schema
    LLM-->>API: Return response text + Action Proposal (ADD_COLUMN)
    API-->>UI: Synthia message + action confirmation button
    UI-->>User: Synthesizes speech response (TTS) + renders Action Card
    
    User->>UI: Clicks "Apply Column"
    UI->>API: POST /api/v1/assistant/synthia/action {type: "ADD_COLUMN", params}
    API->>Actions: Update active dataset profile with synthetic column spec
    Actions-->>UI: Action completed successfully
    UI-->>User: Preview canvas refreshes with new synthetic income data
```
