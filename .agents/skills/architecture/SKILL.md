---
name: architecture
description: Designs the implementation architecture for the hackathon product after requirements are extracted. Selects the appropriate frontend, backend, database, AI/ML, API, Docker, testing, and deployment architecture based on explicit requirements, team capabilities, available time, and deployment constraints. Use before major implementation begins or when architecture decisions need to be reviewed.
---

# Hackathon Architecture

## Mission

Design the simplest reliable architecture capable of satisfying the official hackathon requirements within the available development window.

The architecture must optimize for:

1. Requirement compliance
2. Working MVP
3. Development speed
4. Team parallelization
5. Reliability
6. Security
7. Integration simplicity
8. Deployment readiness
9. Maintainability
10. Demonstration quality

Do not choose technologies merely because they are technically impressive.

A simpler architecture that reliably works is preferable to a sophisticated architecture that increases failure risk.

---

# 1. Inputs

Before designing architecture, inspect:

```text
docs/REQUIREMENTS.md
docs/UI-REQUIREMENTS.md
docs/TASK-BREAKDOWN.md
```

Also inspect the original theme source and:

```
docs/theme-source.md
```

when necessary.

Review:

Functional requirements
Non-functional requirements
UI requirements
Backend requirements
API requirements
AI/ML requirements
Database requirements
Security requirements
Deployment requirements
Restrictions
Judging criteria
Bonus features
Time constraints

Never design architecture from assumptions when the requirements are already available.

## 2. Architecture Decision Hierarchy

Use this decision order:

Official Hackathon Requirements
↓
Explicit Technology Restrictions
↓
Required Integrations
↓
Core MVP Requirements
↓
Team Capabilities
↓
Development Time
↓
Deployment Constraints
↓
Performance / Scalability Requirements
↓
Optional Enhancements

An explicit hackathon requirement always takes precedence over our normal technology preferences.

## 3. Mandatory vs Optional Architecture

Separate architecture into:

P0 — Mandatory Architecture

Infrastructure required for the MVP.

P1 — Required Quality

Infrastructure needed for reliability, security, testing, or judging quality.

P2 — Bonus Architecture

Infrastructure required only for explicit bonus features.

P3 — Optional Enhancements

Infrastructure that may improve the product but is not required.

Never allow P2/P3 infrastructure to delay P0 implementation.

## 4. Architecture Before Implementation

Do not begin large-scale implementation until the following are sufficiently defined:

Frontend technology
Backend technology
Database
Authentication
API boundaries
AI/ML architecture if applicable
External services
File/storage strategy
Environment variables
Docker strategy
Testing strategy
Deployment targets
Major integration points

The architecture does not need to be perfect.

It must be clear enough for parallel implementation.

## 5. Frontend Selection

Choose the frontend stack based on:

Explicit hackathon requirements
Existing team expertise
Stitch output compatibility
Development speed
Component ecosystem
Deployment compatibility
AI integration needs

Preferred options may include:

React
Next.js
Vite + React
Other frameworks only when justified

If the hackathon explicitly specifies a framework, use it.

If no framework is specified, choose the simplest appropriate stack.

Do not introduce Next.js merely because it is popular.

Do not introduce additional frontend frameworks.

## 6. Stitch Integration

Google Stitch is the preferred UI design workflow when appropriate.

The architecture process should be:

Theme Analysis
↓
UI-REQUIREMENTS.md
↓
Stitch Design Specification
↓
Stitch
↓
Approved Screens
↓
Frontend Implementation

Stitch output is a design/implementation aid.

It does not override the official hackathon UI requirements.

If Stitch generates HTML/CSS:

Preserve the approved visual design.
Adapt it to the selected frontend framework.
Convert components appropriately.
Avoid blindly copying incompatible code.
Preserve mandatory layout and styling requirements.

## 7. Backend Selection

Possible backend architectures include:

Node.js / Express

Prefer when:

Application is primarily web/API driven.
Team is strongest in JavaScript/TypeScript.
AI processing can be handled through APIs.
Fast API development is the priority.
Python / FastAPI

Prefer when:

AI/ML processing is central.
Python libraries materially simplify implementation.
Computer vision, NLP, data processing, or ML pipelines are required.
Supabase-first

Prefer when:

PostgreSQL is sufficient.
Authentication is required.
Storage is required.
Realtime features are useful.
Server-side custom logic is limited.
Hybrid

Use:

Frontend
↓
Backend API
↓
Supabase
↓
External AI/API Services

only when the project genuinely requires a custom backend.

Do not create a custom backend merely because Supabase exists.

## 8. Database Selection

Supabase PostgreSQL is the preferred database when appropriate.

Use Supabase for:

PostgreSQL
Authentication
Storage
Realtime
Row Level Security
Edge Functions when useful

Do not introduce another database unless the requirements justify it.

Avoid running:

Supabase + MongoDB + Redis + Firebase

without a strong architectural reason.

Every additional service increases:

Configuration
Failure points
Deployment complexity
Debugging time
Agent complexity

## 9. Supabase Architecture

When Supabase is selected:

Frontend
│
├── Supabase Auth
│
├── Supabase Client
│
└── Backend API when required
│
▼
Supabase PostgreSQL
│
┌─────┴─────┐
↓ ↓
Storage Realtime

Use Row Level Security where appropriate.

Never expose:

SUPABASE_SERVICE_ROLE_KEY

to the frontend.

Server-only credentials remain server-side.

## 10. API Architecture

Define clear boundaries between:

Frontend
↓
API
↓
Business Logic
↓
Database / External Services

Avoid putting complex business logic directly inside UI components.

Use consistent API conventions.

Document important endpoints.

Example:

/api/auth
/api/users
/api/dashboard
/api/resource
/api/ai

The actual routes must reflect the project requirements.

## 11. AI / LLM Architecture

When AI is required, determine:

Model/provider
Input format
Output format
Prompt strategy
Structured output requirements
Validation
Error handling
Rate limits
Timeout behavior
Fallback behavior
Cost considerations
Security considerations

Prefer:

Frontend
↓
Backend
↓
AI Provider

instead of exposing AI provider credentials to the browser.

## 12. Agentic AI Architecture

If the product requires agents:

Do not create multi-agent systems simply for appearance.

Use multiple agents only when separate responsibilities provide a meaningful benefit.

Possible architecture:

User
↓
Orchestrator
├── Research Agent
├── Analysis Agent
├── Generation Agent
└── Validation Agent

Clearly define:

Agent responsibilities
Inputs
Outputs
Communication
Failure handling
Human approval where required

Avoid unnecessary agent loops.

## 13. RAG Architecture

If RAG is required:

Documents
↓
Parsing
↓
Chunking
↓
Embeddings
↓
Vector Store
↓
Retriever
↓
LLM
↓
Validated Response

Use a vector database only when retrieval actually requires it.

Do not introduce a vector database for a simple CRUD application.

## 14. External APIs

For every external service identify:

Service
Purpose
Authentication
Required credentials
Rate limits
Failure behavior
Development availability
Production availability

Create a dependency table in ARCHITECTURE.md.

Example:

Service Purpose Required Credential
Supabase Database/Auth Yes Environment variable
AI Provider AI generation Yes Server-side secret
External API Data Optional Environment variable

## 15. Docker Strategy

Docker should be available as a reproducible local runtime.

Do not Dockerize external services unnecessarily.

Typical structure:

Docker
│
├── Backend
├── Worker if required
└── Additional local services if required

External services remain external:

Supabase
GitHub
Stitch
AI Providers
Vercel
Render

Use Docker when it improves:

Reproducibility
Team consistency
Local service management
Deployment consistency
Environment isolation

Do not add Docker complexity where native execution is simpler.

## 16. Docker Compose

Use Docker Compose when multiple local services are required.

Example:

services:
backend:
build: ./backend
ports: - "8000:8000"

worker:
build: ./worker

Only include services that the actual project needs.

Do not create placeholder containers.

## 17. Team Parallelization

The architecture must allow three people to work simultaneously.

Example:

                Project Lead
                     │
          ┌──────────┼──────────┐
          ↓          ↓          ↓
      Frontend    Backend     Research/
       Agent       Agent       QA Agent
          │          │          │
          └──────────┼──────────┘
                     ↓
                 Integration
                     ↓
                    QA

Clearly define ownership.

Avoid having multiple people modify the same files unnecessarily.

## 18. Suggested Team Ownership

Default ownership:

Technical Lead
Architecture
AI integration
MCP/tooling
Integration
Deployment
Critical debugging
Frontend/Product Developer
Stitch
UI implementation
Responsive design
Frontend interactions
UI compliance
Research/QA Developer
Requirement verification
Research
API testing
Security testing
Browser testing
Documentation
Demo preparation

Ownership may change based on the actual team.

## 19. Repository Structure

Use a structure similar to:

hackdata-v2/
│
├── .agents/
│ ├── rules/
│ ├── skills/
│ └── mcp_config.json
│
├── docs/
│ ├── theme-source.md
│ ├── REQUIREMENTS.md
│ ├── UI-REQUIREMENTS.md
│ ├── ARCHITECTURE.md
│ └── TASK-BREAKDOWN.md
│
├── frontend/
│
├── backend/
│
├── tests/
│
├── scripts/
│
├── docker-compose.yml
├── .env.example
├── .gitignore
├── AGENTS.md
└── README.md

Only create directories that the selected architecture actually requires.

## 20. Environment Configuration

Document required environment variables.

Example:

DATABASE_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
AI_API_KEY=
EXTERNAL_API_KEY=

Never place real values in:

Git
Documentation
Source code
Dockerfiles
Frontend bundles

## 21. Development vs Production

Clearly distinguish:

Development
Production

For each environment identify:

URLs
Database
API keys
Debug settings
CORS
Logging
Storage
AI provider configuration

Do not accidentally use production credentials locally or development configuration in production.

## 22. Deployment Architecture

The preferred deployment model is:

Frontend
↓
Vercel
↓
Backend API
↓
Render / appropriate backend platform
↓
Supabase
↓
External AI/API services

This is a default option, not a mandatory architecture.

If the hackathon specifies another deployment platform, follow the official requirement.

If the backend can be deployed directly through another appropriate platform, choose the simplest reliable option.

## 23. Deployment Decision Rules

Choose deployment based on:

Official requirements
Existing team familiarity
Build/deployment speed
Free-tier suitability
Runtime compatibility
Environment variable support
Reliability during the demo

Do not change deployment platforms late in the hackathon unless the current platform is blocked.

use Vercel cli for deployement for the frontend/ client, adn render cli commands for backend deployement/ server deployement

## 24. Security Architecture

Identify:

Authentication
Authorization
Secret management
Database security
API security
File upload security
AI security
CORS
Rate limiting where needed
Input validation

Use least privilege.

Do not grant broad permissions merely because they make development easier.

## 25. Failure and Fallback Planning

Every external dependency that is critical to the demo should have a fallback strategy when practical.

### Examples:

AI provider unavailable
↓
Fallback response/demo data

External API unavailable
↓
Cached/sample data

Network failure
↓
Prepared demo environment

Do not fake functionality in production.

Fallbacks must be clearly designed and tested.

## 26. 18-Hour Hackathon Optimization

Architecture must account for the limited development window.

### Prioritize:

Hour 0–2
Requirements + architecture

Hour 2–6
Core backend + database + frontend foundation

Hour 6–11
Parallel feature implementation

Hour 11–14
Integration

Hour 14–16
Testing + security + bug fixing

Hour 16–18
Deployment + demo preparation + final verification

This schedule is approximate and may change based on the actual event.

The architecture should allow implementation to begin quickly.

### Avoid:

Microservices without need
Complex distributed systems
Custom infrastructure
Unnecessary databases
Unnecessary message queues
Unnecessary orchestration layers
Large dependency chains

## 27. Technology Decision Record

For every major technology choice, record:

Technology:
Purpose:
Why selected:
Alternatives considered:
Reason alternatives were rejected:
Risk:
Fallback:

Example:

Technology: FastAPI
Purpose: AI/backend API
Why selected: Python AI ecosystem and rapid API development
Alternative: Express
Reason rejected: Python libraries simplify required AI processing
Risk: Team familiarity
Fallback: Simplify API surface

Keep decisions concise.

## 28. Architecture Review

Before implementation begins, review:

Requirements mapped to architecture
UI requirements mapped to frontend
Backend requirements mapped to backend
API requirements mapped to endpoints
AI requirements mapped to AI architecture
Database requirements mapped to schema
Security requirements addressed
External dependencies identified
Docker requirements identified
Deployment identified
Team ownership defined
Environment variables identified
Fallbacks identified
P0 implementation path is clear
Architecture fits the hackathon time limit

## 29. Architecture Output

### Update:

```
docs/ARCHITECTURE.md
```

The final document should contain:

Architecture overview
Technology stack
Frontend architecture
Backend architecture
Database architecture
API architecture
AI/ML architecture
External services
Authentication
Security
Docker strategy
Deployment
Environment variables
Team ownership
Data flow
Major decisions
Risks
Fallbacks
P0/P1/P2/P3 architecture
Implementation order

## 30. Final Rule

The architecture exists to serve the hackathon requirements.

Never optimize for technical complexity, novelty, or the number of technologies used.

Optimize for:

Correct

- Secure
- Fast to build
- Easy to integrate
- Easy to test
- Easy to deploy
- Easy to demonstrate

A working simple architecture beats an impressive broken architecture.
