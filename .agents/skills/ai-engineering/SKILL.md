---
name: ai-engineering
description: Design, implement, integrate, evaluate, secure, optimize, and productionize AI features including LLM applications, RAG, vision, structured generation, tool calling, agentic workflows, multi-agent systems, embeddings, vector search, AI APIs, local models, and AI-powered product features.
---

# AI Engineering Skill

## 1. Mission

Build reliable, useful, secure, and production-ready AI functionality for hackathon applications.

The AI system must solve an actual product requirement rather than exist merely as a demonstration of an AI model.

The AI Engineering Skill covers:

- LLM applications
- AI APIs
- prompt engineering
- structured outputs
- function/tool calling
- RAG
- embeddings
- vector search
- document processing
- vision AI
- multimodal AI
- agentic AI
- multi-agent systems
- AI workflows
- model selection
- model evaluation
- AI safety
- prompt injection defense
- hallucination mitigation
- AI fallbacks
- streaming
- latency optimization
- token/cost optimization
- AI observability
- production integration

The AI implementation must prioritize:

```text
Product Requirement
        ↓
Correctness
        ↓
Reliability
        ↓
Security
        ↓
User Experience
        ↓
Latency
        ↓
Cost
        ↓
Optimization
```

Do not add AI simply because an AI model is available.

## 2. Source of Truth

Before implementing any AI feature, inspect:

- AGENTS.md
- .agents/rules/security.md
- .agents/rules/backend.md
- .agents/rules/git.md
- docs/theme-source.md
- docs/REQUIREMENTS.md
- docs/ARCHITECTURE.md
- docs/TASK-BREAKDOWN.md
- docs/API-CONTRACT.md
- docs/UI-REQUIREMENTS.md
- docs/MASTER-PLAN.md
- .agents/skills/api-development/SKILL.md
- .agents/skills/supabase-development/SKILL.md
- .agents/skills/testing-and-qa/SKILL.md

The official hackathon requirements always have priority.

AI technology must adapt to the product.

The product must not be redesigned merely to justify an AI technique.

## 3. AI Requirement Analysis

Before selecting a model or framework, determine:

What problem does AI solve?
Who uses it?
What input does it receive?
What output is required?
How accurate must it be?
How fast must it respond?
What happens if AI fails?
What data does it need?
Does the feature require persistent memory?
Does it require retrieval?
Does it require tools?
Does it require vision?
Does it require multiple agents?

Classify the AI feature:

P0 — Mandatory AI functionality
P1 — Important enhancement
P2 — Bonus AI capability
P3 — Experimental / optional

Do not build P2/P3 AI functionality while P0 functionality is incomplete.

## 4. AI Architecture Decision

Choose the simplest architecture that satisfies the requirement.

Possible architectures:

Simple LLM
↓
LLM + Structured Output
↓
LLM + RAG
↓
LLM + Tools
↓
Agent
↓
Multi-Agent System

Do not jump directly to multi-agent architecture.

Use multi-agent systems only when different responsibilities genuinely benefit from separation.

## 5. AI Decision Hierarchy

When choosing an AI architecture, use:

Official Requirements
↓
User Value
↓
Required Capability
↓
Reliability
↓
Security
↓
Latency
↓
Cost
↓
Implementation Complexity

Do not select a model because it is popular.

Do not select a framework because it is trendy.

Do not introduce LangChain, LangGraph, CrewAI, AutoGen, or another orchestration framework unless it provides meaningful value to the actual project.

## 6. Model Selection

Select models based on:

required modality
reasoning requirements
context requirements
latency
structured output support
tool calling support
vision capability
embedding requirements
provider availability
rate limits
cost
deployment environment
reliability
hackathon time constraints

Potential model sources may include:

Hosted AI APIs
Groq
Gemini
OpenAI-compatible providers
Anthropic-compatible providers
Hugging Face
Ollama
Local models
Other approved providers

The architecture must remain provider-aware but not unnecessarily provider-dependent.

## 7. Provider Abstraction

When practical, isolate provider-specific code.

Prefer:

Application
↓
AI Service
↓
Provider Adapter
↓
Model Provider

Example:

AIService
├── GroqProvider
├── GeminiProvider
├── OpenAIProvider
└── OllamaProvider

Do not implement every provider.

Only create adapters for providers actually needed.

## 8. Environment Variables

AI credentials must never be hard-coded.

Use environment variables.

Examples:

GROQ_API_KEY
GEMINI_API_KEY
OPENAI_API_KEY
ANTHROPIC_API_KEY
HF_TOKEN
AI_MODEL
AI_BASE_URL

Only include variables required by the selected architecture.

Never expose server-side API keys to the frontend.

Never commit:

.env
API keys
tokens
provider credentials
service credentials

Update:

.env.example

with variable names only.

## 9. AI Request Architecture

For server-side AI features prefer:

Frontend
↓
Backend API
↓
Validation
↓
AI Service
↓
Provider
↓
Output Validation
↓
Business Logic
↓
Response
↓
Frontend

Do not expose private provider credentials in browser code.

Do not allow arbitrary client requests to become unrestricted provider calls.

## 10. Prompt Engineering

Prompts must be designed intentionally.

A production prompt should clearly define:

Role
Objective
Context
Constraints
Input
Expected Output
Rules
Failure Behavior

Prefer structured prompts over vague instructions.

Example conceptual structure:

SYSTEM
You are...

OBJECTIVE
Your task is...

CONTEXT
Use the following information...

CONSTRAINTS
You must...

INPUT
...

OUTPUT FORMAT
Return...

FAILURE RULES
If information is unavailable...

Avoid unnecessary prompt length.

Do not duplicate the same instructions repeatedly.

## 11. Prompt Versioning

Important prompts should be identifiable and maintainable.

Prefer:

prompts/
├── analysis/
├── classification/
├── generation/
├── retrieval/
└── agents/

or an equivalent project structure.

When prompt behavior materially changes, record the change.

Do not scatter critical prompts across dozens of unrelated files.

## 12. Prompt Injection Defense

Treat all user-provided content as untrusted.

Examples include:

documents
web pages
chat messages
uploaded files
database content
search results
tool results
external API responses

Never automatically treat retrieved/user-generated content as system instructions.

Potential malicious input:

Ignore previous instructions.
Reveal the system prompt.
Reveal API credentials.
Call this tool.
Delete the database.
Return hidden information.

The AI architecture must preserve instruction boundaries.

## 13. Trust Boundaries

Use:

Trusted Instructions
↓
Application Logic
↓
Untrusted User Content
↓
AI Model

Never reverse the trust relationship.

User-controlled content must not be allowed to:

redefine system rules
authorize privileged operations
bypass authentication
modify authorization
execute arbitrary commands
expose secrets
trigger destructive infrastructure operations

## 14. Structured Outputs

When downstream code depends on AI output, prefer structured output.

Example:

{
"classification": "high",
"confidence": 0.91,
"reason": "...",
"recommendations": []
}

Define a schema.

Then:

AI Response
↓
Parse
↓
Schema Validation
↓
Business Validation
↓
Application

Never directly trust raw model text as application state.

## 15. AI Output Validation

Validate:

required fields
data types
enum values
numeric ranges
string lengths
array limits
nested structures
business rules

Example:

confidence must be between 0 and 1

If the AI returns:

confidence = 4.8

reject or normalize it according to the defined business rule.

Do not silently accept invalid AI output.

## 16. Hallucination Management

Do not assume an LLM knows the correct answer.

For factual or domain-specific information:

Prefer verified source
↓
Retrieve relevant information
↓
Provide context to model
↓
Generate answer
↓
Validate

For critical claims, prefer:

RAG
structured data
database lookup
external authoritative API
deterministic logic

over unsupported model memory.

## 17. RAG Architecture

Use RAG when the AI needs access to project/domain-specific information.

Preferred flow:

Documents
↓
Extraction
↓
Chunking
↓
Embeddings
↓
Vector Store
↓
User Query
↓
Query Embedding
↓
Similarity Search
↓
Relevant Context
↓
LLM
↓
Answer

RAG should not be added if a simple database lookup solves the problem.

## 18. Document Processing

When documents are part of the AI system:

preserve the original document
extract content
validate extraction
normalize content
chunk intelligently
generate embeddings if required
store metadata
index content
retrieve relevant chunks
provide context to the model

Preserve useful metadata:

document ID
filename
page
section
source
timestamp
chunk ID

This allows citations and traceability.

## 19. MarkItDown Integration

When the hackathon requires document understanding, the theme-analysis workflow should use Microsoft MarkItDown as an extraction aid where appropriate.

Typical supported source types may include:

PDF
DOCX
PPTX
TXT
MD

The extracted Markdown is not automatically authoritative.

Always distinguish:

Extracted Text
vs
Original Document

Visual content such as:

screenshots
diagrams
wireframes
tables
color specifications
images

may require visual inspection.

## 20. Retrieval Quality

For RAG systems evaluate:

retrieval relevance
chunk quality
context completeness
duplicate context
irrelevant context
citation correctness
answer grounding

Poor retrieval produces poor answers even when the LLM is excellent.

Do not immediately change the model when the actual problem is retrieval.

## 21. Embeddings

When using embeddings:

consider:

embedding model
dimensionality
language support
semantic quality
storage
indexing
query performance

Keep document and query embeddings compatible.

Do not mix incompatible embedding spaces.

## 22. Vector Database

Potential storage options include:

Supabase / pgvector
Pinecone
other approved vector database

Use the database selected by the architecture.

For hackathons, prefer the simplest infrastructure that satisfies the requirement.

If Supabase is already being used, evaluate pgvector before introducing another database.

## 23. RAG Citations

When factual answers are generated from documents, citations are strongly preferred.

Example:

{
"answer": "...",
"sources": [
{
"document": "policy.pdf",
"page": 4
}
]
}

Do not fabricate citations.

Only cite sources actually retrieved or verified.

## 24. Vision AI

For image-based features:

Image
↓
Validation
↓
Preprocessing if required
↓
Vision Model
↓
Structured Output
↓
Validation
↓
Application

Validate:

file type
file size
image dimensions
corruption
content requirements

Never trust a vision model to correctly identify something merely because it produced an answer.

## 25. Vision Confidence

If the model provides confidence:

validate the range
define application thresholds
handle low-confidence outputs
avoid presenting uncertain results as facts

Example:

High confidence
↓
Normal flow

Low confidence
↓
Ask user for confirmation
or
Request another image
or
Use fallback

The threshold must be defined by the application.

## 26. Multimodal Inputs

When combining:

text

- image
- document
- metadata

define the input contract explicitly.

Do not blindly concatenate everything into one prompt.

Prefer structured context:

USER INPUT
IMAGE
DOCUMENT CONTEXT
SYSTEM CONSTRAINTS
TASK

## 27. Tool Calling

When the AI needs to access tools:

LLM
↓
Tool Selection
↓
Tool Validation
↓
Tool Execution
↓
Tool Result
↓
LLM

Tool definitions must clearly specify:

name
purpose
parameters
required fields
allowed values
side effects
authorization

## 28. Tool Authorization

Never allow the model to decide its own permissions.

The application must enforce:

User permissions
↓
Application authorization
↓
Tool availability
↓
Tool execution

An AI model must not be able to bypass application authorization by requesting a privileged tool.

## 29. Destructive Tools

Treat these as high risk:

delete
update production
send message
modify permissions
create infrastructure
deploy
database migration
credential rotation
financial transaction

Require explicit application-level authorization and, where appropriate, human approval.

Never expose unrestricted shell execution to an LLM.

## 30. Agentic AI

Use an agent when the task requires:

planning
tool use
iteration
state
decision-making
multi-step execution

A simple chain is preferable when the workflow is deterministic.

Example:

Simple:
Input → Model → Output

rather than:

Input
↓
Planner Agent
↓
Research Agent
↓
Critic Agent
↓
Writer Agent
↓
Reviewer Agent

unless the additional complexity creates measurable value.

## 31. Agent Responsibilities

Every AI agent must have:

clear role
clear objective
allowed tools
input contract
output contract
success criteria
failure behavior
timeout
retry policy

Avoid agents with vague instructions such as:

"Do everything necessary."

## 32. Multi-Agent Architecture

When multiple AI agents are genuinely required:

                Orchestrator
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
       Agent A    Agent B    Agent C
          │          │          │
          └──────────┼──────────┘
                     ▼
                  Evaluator
                     │
                     ▼
                  Final Result

The orchestrator should control:

execution order
parallelization
timeouts
retries
state
aggregation
failure handling

## 33. Parallel Agent Execution

Agents may execute in parallel when tasks are independent.

Good:

Research A ─┐
Research B ─┼→ Aggregator
Research C ─┘

Bad:

Agent A modifies same files as Agent B
Agent B modifies same files as Agent C

Parallelism must not create data corruption or Git conflicts.

## 34. AI State

Define state explicitly.

Possible state:

conversation
task
user preferences
retrieved context
tool results
agent state
workflow state

Do not store unlimited conversation history.

Use summaries or relevant state when context becomes large.

## 35. Memory

Differentiate:

Short-term context
Long-term application data
User preferences
Conversation history
Retrieved knowledge
Workflow state

Do not treat all of them as "AI memory."

Persist only information the product actually requires.

## 36. Streaming

Use streaming when:

responses are long
user experience benefits from incremental output
provider supports it
frontend can consume it reliably

Typical flow:

Frontend
↓
Backend
↓
AI Provider
↓
Stream
↓
Backend
↓
Frontend

Do not add streaming if it creates unnecessary complexity for a short response.

## 37. Latency Optimization

Measure before optimizing.

Potential optimizations:

smaller prompts
smaller context
parallel independent requests
caching
streaming
smaller models
fewer agents
fewer retrieval calls
fewer tool calls

Do not optimize by reducing answer quality below the product requirement.

## 38. Token / Context Management

Control:

prompt size
retrieved context
conversation history
tool results
document chunks
agent messages

Avoid sending:

entire database
entire document collection
entire conversation
unrelated tool output

to every model call.

Use targeted context.

## 39. AI Cost Management

For each AI feature identify:

model
approximate request frequency
input size
output size
number of model calls
number of agents

Prefer:

cheap/fast model

for simple tasks and:

stronger model

for difficult reasoning tasks when appropriate.

Do not use the most expensive model for every operation.

## 40. Rate Limits

AI providers may impose rate limits.

Handle:

429
timeout
5xx
provider unavailable
quota exceeded

Use:

bounded retry
exponential backoff where appropriate
fallback provider
cached result
graceful failure

Do not create infinite retries.

## 41. AI Fallbacks

Every demo-critical AI feature should have a failure strategy.

Possible strategies:

Primary Model
↓
Retry
↓
Fallback Model
↓
Cached / deterministic fallback
↓
Graceful error

Only implement fallback complexity when it materially improves demo reliability.

Never fabricate a successful AI result when the AI operation actually failed.

## 42. Deterministic Logic vs AI

Use deterministic code for:

validation
calculations
permissions
authorization
database constraints
business-critical rules
security decisions

Use AI for:

generation
classification
summarization
semantic reasoning
natural language
vision interpretation
recommendations
unstructured content analysis

Never allow AI to replace deterministic security controls.

## 43. AI Security

Follow .agents/rules/security.md.

Verify:

[ ] API keys protected
[ ] User data protected
[ ] Prompt injection considered
[ ] Tool authorization enforced
[ ] Output validated
[ ] Sensitive context minimized
[ ] Logs sanitized
[ ] Model-generated commands restricted
[ ] File uploads validated
[ ] External content treated as untrusted

## 44. Sensitive Data

Do not send sensitive information to an AI provider unless required by the product and permitted by the architecture.

Before sending data externally ask:

Is this data necessary?
Can it be minimized?
Can it be anonymized?
Can it be processed locally?

Do not log sensitive prompts or responses unnecessarily.

## 45. AI Logging

Useful metadata may include:

request ID
model
latency
token usage if available
success/failure
tool count
retrieval count

Avoid logging:

API keys
passwords
authentication tokens
private user data
full sensitive documents
secret prompts

## 46. AI Observability

For important AI workflows track:

request
model
latency
failure
retry
fallback
output validation
tool execution
retrieval

This helps diagnose:

slow AI
bad retrieval
provider failure
invalid outputs
tool failure

## 47. AI Evaluation

Do not evaluate an AI feature only by asking:

"Does the answer look good?"

Define measurable criteria where practical.

Examples:

accuracy
relevance
groundedness
format correctness
classification correctness
citation correctness
latency
failure rate

Create a small representative evaluation set.

For a hackathon, even:

10–20 representative cases

can reveal major failures.

## 48. Evaluation Dataset

Create:

tests/ai/

when useful.

Include:

normal inputs
edge cases
empty input
ambiguous input
malicious input
large input
expected structure
expected behavior

Do not hard-code fragile exact wording when semantic equivalence is acceptable.

## 49. AI Regression Testing

Whenever prompts/models change:

Run representative evaluation set
↓
Compare results
↓
Check failures
↓
Approve change

Do not change the model immediately before the demo without testing it.

## 50. Model Switching

If changing models:

verify:

context limits
input format
output format
structured output support
tool calling
vision support
latency
rate limits
cost

Never assume two providers behave identically.

## 51. Provider Failure

When an AI provider fails:

Detect
↓
Log safely
↓
Retry if appropriate
↓
Fallback if available
↓
Return controlled response

Never return raw provider errors to the user.

## 52. AI + Supabase

When AI interacts with Supabase:

AI
↓
Backend Service
↓
Authorization
↓
Supabase

Do not give an LLM unrestricted database credentials.

The model should request an approved operation.

The application performs the operation after authorization.

## 53. AI + APIs

When AI consumes external APIs:

User
↓
Backend
↓
External API
↓
Validated Data
↓
AI

Prefer verified structured API data over arbitrary model knowledge.

## 54. AI + RAG + Supabase

If using Supabase/pgvector:

Documents
↓
Chunking
↓
Embedding
↓
pgvector
↓
Query
↓
Similarity Search
↓
Context
↓
LLM
↓
Validated Answer

Ensure:

tenant/user isolation
RLS
metadata filtering

when the application contains user-specific information.

## 55. AI File Processing

For uploaded documents/images:

Upload
↓
File Validation
↓
Storage
↓
Extraction
↓
Processing
↓
AI
↓
Validation
↓
Database

Never let arbitrary uploads directly become executable code or unrestricted AI instructions.

## 56. AI API Contract

Every production AI feature should have a documented contract.

Maintain:

docs/API-CONTRACT.md

or another appropriate AI documentation file.

Document:

Input
Output
Model
Provider
Authentication
Timeout
Failure
Fallback
Validation
Frontend consumer

## 57. AI Testing

Follow:

.agents/skills/testing-and-qa/SKILL.md

Test:

normal input
empty input
invalid input
large input
ambiguous input
malicious input
provider failure
timeout
rate limit
invalid model output
tool failure
retrieval failure

For AI agents also test:

wrong tool selection
agent timeout
agent failure
invalid intermediate result
aggregation failure

## 58. AI Browser Integration

When AI output appears in the frontend, verify:

loading
streaming
partial output
success
error
retry
empty state
long response
special characters
markdown
citations

AI output must not break the UI.

## 59. AI UX

The frontend should communicate AI behavior honestly.

Prefer:

Analyzing...
Generating...
Searching...
Reviewing...

rather than misleading claims.

When results are uncertain:

AI-generated
Low confidence
Needs verification

may be appropriate depending on the product.

Do not claim certainty the model does not have.

## 60. Demo Reliability

AI demos are inherently less deterministic than ordinary CRUD flows.

For demo-critical features:

Test exact demo input
↓
Verify output
↓
Measure latency
↓
Prepare fallback
↓
Repeat

Know:

expected behavior
acceptable variations
failure recovery

Do not depend on an untested prompt during the final demo.

## 61. Hackathon AI Strategy

During the hackathon:

First

Make the simplest working AI feature.

Input
↓
AI
↓
Validated Output
↓
UI
Then

Add:

RAG
tools
structured output
streaming

only if required.

Then

Add:

agentic workflow
multi-agent
fallbacks
optimization

only when useful.

Do not spend hours building an elaborate AI orchestration system before the core product works.

## 62. AI Agent Coordination

The AI Engineer works with:

Backend Agent

For:

API integration
authentication
database
server infrastructure
Integration Agent

For:

frontend integration
API contracts
end-to-end flows
QA Agent

For:

AI evaluation
prompt injection
failure testing
regression
Deployment Agent

For:

provider credentials
production environment
runtime verification
logs

The AI Engineer owns AI behavior.

Other agents own their respective infrastructure domains.

## 63. AI Agent File Ownership

Preferred ownership:

ai/
prompts/
ai-services/
retrieval/
evaluation/
agent orchestration

Backend remains responsible for:

routes
middleware
auth
database infrastructure
general API infrastructure

Frontend remains responsible for:

AI UI
loading states
streaming UI
result rendering

Integration owns:

connections between these systems

## 64. AI Architecture Decision Record

For major AI decisions, record:

Decision
Reason
Alternatives considered
Model/provider
Trade-offs
Fallback

Example:

Decision:
Use hosted vision model.

Reason:
Hackathon requires image analysis and local model latency is unsuitable.

Alternative:
Ollama local vision model.

Trade-off:
Hosted API requires network/API key but provides simpler deployment.

Keep decisions concise.

## 65. AI Anti-Patterns

Avoid:

"AI everywhere"

Avoid:

multi-agent for a one-step task

Avoid:

LLM deciding authorization

Avoid:

raw AI output directly written to database

Avoid:

API keys in frontend

Avoid:

unbounded tool access

Avoid:

entire database in prompt

Avoid:

entire document collection in prompt

Avoid:

blind trust in model output

Avoid:

changing models immediately before demo

Avoid:

adding AI features that do not satisfy requirements

## 66. Definition of Done

An AI feature is complete only when:

[ ] Requirement identified
[ ] AI architecture selected
[ ] Model selected
[ ] Provider configured
[ ] Credentials protected
[ ] Prompt implemented
[ ] Input validated
[ ] Output schema defined
[ ] Output validated
[ ] Error handling implemented
[ ] Timeout configured
[ ] Failure behavior defined
[ ] Security reviewed
[ ] AI tests created
[ ] Representative evaluation performed
[ ] Frontend integration verified
[ ] Production environment verified
[ ] Demo flow tested

## 67. Final AI Workflow

Always follow:

READ REQUIREMENTS
↓
IDENTIFY AI PROBLEM
↓
DECIDE WHETHER AI IS ACTUALLY NECESSARY
↓
SELECT SIMPLEST SUITABLE ARCHITECTURE
↓
SELECT MODEL / PROVIDER
↓
DEFINE INPUT CONTRACT
↓
DESIGN PROMPT / WORKFLOW
↓
IMPLEMENT AI SERVICE
↓
VALIDATE OUTPUT
↓
INTEGRATE WITH BACKEND
↓
INTEGRATE WITH FRONTEND
↓
TEST NORMAL CASES
↓
TEST EDGE CASES
↓
TEST SECURITY
↓
TEST PROVIDER FAILURE
↓
EVALUATE QUALITY
↓
OPTIMIZE LATENCY / COST
↓
VERIFY PRODUCTION
↓
RUN DEMO FLOW
↓
MARK COMPLETE

## 68. Critical Rule

AI is a component of the product, not the product by itself.

The AI Engineer must always ask:

What user problem does this solve?

before asking:

Which model should we use?

The final implementation must be:

Useful
Reliable
Secure
Testable
Observable
Deployable

rather than merely:

Technically impressive
