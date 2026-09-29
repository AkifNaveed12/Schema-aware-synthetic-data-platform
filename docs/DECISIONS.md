# HACKDATA V2 — ARCHITECTURE DECISIONS & LOG (ADR)

> **Document Purpose:** Track foundational technical decisions, trade-offs, engineering assumptions, and items explicitly submitted for human review.  
> **Status:** Baseline Decisions Log (Pre-Development Freeze)

---

## 1. Decision Classification Framework

1. **AUTHORITATIVE (THEME-MANDATED):** Decisions dictated directly by `theme.pdf`. Immutable.
2. **ENGINEERING SELECTION:** Architectural choices made by the Project Lead to satisfy official requirements.
3. **SUBMITTED FOR HUMAN REVIEW:** Items requiring team confirmation before implementation commences.

---

## 2. Architecture Decision Records (ADR)

### ADR-01: Backend Technology Selection — Python / FastAPI
- **Category:** Engineering Selection
- **Status:** APPROVED
- **Context:** The platform requires statistical distribution modeling (normal, log-normal, bimodal), differential noise mechanisms, Faker synthetic data generation, and LLM orchestration.
- **Decision:** Use Python 3.11+ with FastAPI.
- **Rationale:** 
  - Python is the undisputed industry standard for statistical computation (`numpy`, `scipy`) and synthetic generation (`faker`, `sdv`).
  - FastAPI provides asynchronous concurrency, OpenAPI documentation, and sub-millisecond serialization speeds.
  - Aligns with the project guidelines in `.agents/skills/theme-analysis/SKILL.md` (prioritize Python backend).
- **Alternative Considered:** Node.js/Express. Rejected due to inferior native statistical distribution libraries and awkward Python subprocess bridges.

---

### ADR-02: Frontend Technology Selection — Next.js 15 / React 19 + Tailwind
- **Category:** Engineering Selection
- **Status:** APPROVED
- **Context:** The UI must render a unified 3-pane workspace with real-time reactive canvas updates (<200ms) as sliders move.
- **Decision:** Use Next.js 15 with React 19, TypeScript, Tailwind CSS, and Lucide icons.
- **Rationale:**
  - Component modularity enables clean separation of Sidebar, Live Canvas, and Configuration Drawer.
  - Native client-side state management (Zustand) allows instant debounced preview updates without page reloads.
  - Effortless deployment to Vercel.

---

### ADR-03: UI Architecture — Strict Adoption of Official 3-Pane Workspace
- **Category:** Authoritative (Theme-Mandated)
- **Status:** LOCKED
- **Context:** Theme Slide 10 explicitly diagrams the user experience: Left Sidebar (`WORKSPACE`), Center Canvas (`Live preview canvas`), Right Drawer (`CONFIGURATION`).
- **Decision:** The application will strictly implement this 3-pane split screen. No generic dashboards, multi-page routing mazes, or code-only consoles.
- **Rationale:** Theme UI compliance is a non-negotiable hackathon scoring gate.

---

### ADR-04: Hybrid AI Generation Engine (LLM + Local Scientific Core)
- **Category:** Engineering Selection
- **Status:** APPROVED
- **Context:** AI is required across all three engines (Slide 4 & 9) for schema inference, realistic synthesis, and edge-case injection, but must generate up to 10,000 rows without massive latency or API cost blowout.
- **Decision:** Implement a **Hybrid Engine**:
  1. **AI Layer (LLM / Gemini):** Analyzes schemas, classifies semantic intents, synthesizes realistic text entity pools (names, companies, descriptions), and proposes edge-case rules.
  2. **Scientific Core (Local Python):** Executes fast vectorized row synthesis, statistical distributions, random seed PRNG, and privacy transformations.
- **Rationale:** Delivers sub-200ms live preview performance, 100% deterministic reproducibility, zero latency bottlenecks, and rich natural AI outputs.

---

### ADR-05: Relational Dependency Resolution via Topological DAG Order
- **Category:** Engineering Selection
- **Status:** APPROVED
- **Context:** Relational data structures must guarantee 100% referential integrity with zero orphaned foreign keys (Slide 6).
- **Decision:** Represent table schemas as a Directed Acyclic Graph (DAG) and generate tables in topological order:
  `Customers (Root)` -> `Orders (Parent)` -> `Order Items (Child)`.
- **Rationale:** Guarantees that parent primary keys are already materialized in memory before child foreign keys are sampled.

---

### ADR-06: Mathematical Reconciliation as a Generation Gate
- **Category:** Authoritative (Theme-Mandated)
- **Status:** LOCKED
- **Context:** Theme Slides 6, 7, and 8 explicitly require invoice totals to reconcile with line items, order totals to match child items, and bank statement running balances to balance accurately.
- **Decision:** Build a dedicated `ReconciliationValidator` inside the generation pipeline. Datasets with even a \$0.01 calculation variance are rejected and regenerated before presentation to the user.

---

### ADR-07: Column-Level Privacy Strategy
- **Category:** Authoritative (Theme-Mandated)
- **Status:** LOCKED
- **Context:** Slide 5 explicitly mandates column-level privacy controls: masking, hashing, and differential noise.
- **Decision:** Implement three independent column-level transformers:
  1. *Masking:* Preserves format with redacted characters (e.g. `m.***@example.com`).
  2. *Hashing:* Cryptographic SHA-256 for deterministic pseudonymization.
  3. *Differential Noise:* Laplace mechanism adding calibrated noise based on user-defined epsilon parameter.

---

## 3. Items Submitted for Human Review (Akif, Haroon, Hamza)

The following items represent design choices that require human team sign-off before Phase 1 development begins:

1. **HR-01: Primary LLM Provider**
   - *Recommendation:* Google Gemini API (`gemini-2.5-flash`) for primary synthesis, with an offline mock dictionary fallback for network-isolated judging environments.
   - *Action for Team:* Confirm or specify alternative provider (e.g. OpenAI / Anthropic).

2. **HR-02: SQL Export Dialect**
   - *Recommendation:* Generate standard PostgreSQL DDL and INSERT statements as the default SQL dump format, with ANSI SQL compatibility.
   - *Action for Team:* Confirm PostgreSQL default or request multi-dialect selector (MySQL, SQLite).

3. **HR-03: Max Row Limits for Live Preview vs Export**
   - *Recommendation:* Cap live preview rendering at 50 rows (to guarantee <200ms preview reload), while allowing full export up to 10,000 rows.
   - *Action for Team:* Confirm limits or adjust thresholds.
