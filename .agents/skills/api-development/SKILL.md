---
name: api-development
description: Build, validate, test, secure, integrate, and deploy hackathon APIs across Node.js/Express and Python/FastAPI using Supabase, external APIs, AI services, Postman, Docker, and frontend consumers.
---

# API Development Skill

## 1. Mission

Build production-ready APIs quickly and reliably during the hackathon.

The API layer must:

- implement the requirements extracted from the official theme document
- expose clear and stable contracts
- validate all incoming data
- protect authentication and authorization boundaries
- integrate safely with Supabase
- integrate with AI/LLM services when required
- integrate with third-party APIs when required
- handle file uploads safely when required
- provide useful errors
- be testable through Postman and automated tests
- work correctly with the frontend
- remain deployable within the hackathon time limit
- avoid unnecessary complexity

The API implementation must prioritize:

1. correctness
2. security
3. reliability
4. integration
5. simplicity
6. performance
7. optional optimization

Do not over-engineer the backend.

---

# 2. Source of Truth

Before implementing APIs, inspect:

- `AGENTS.md`
- `.agents/rules/backend.md`
- `.agents/rules/security.md`
- `.agents/rules/git.md`
- `docs/REQUIREMENTS.md`
- `docs/UI-REQUIREMENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/TASK-BREAKDOWN.md`
- `docs/theme-source.md`

The official hackathon requirements have priority over assumptions.

Never invent backend requirements when the source document already defines them.

---

# 3. API Requirement Extraction

Before writing API code, identify:

- required endpoints
- HTTP methods
- request parameters
- request body schemas
- response schemas
- authentication requirements
- authorization requirements
- database operations
- file operations
- AI operations
- external API integrations
- validation rules
- rate limits if required
- error conditions
- success conditions
- frontend consumers
- judging/demo-critical endpoints

Create or update:

`docs/API-CONTRACT.md`

The contract should document:

```text
Endpoint
Method
Purpose
Authentication
Authorization
Request
Validation
Success Response
Error Responses
Database Operations
External Services
Frontend Consumer
Testing Status
```

## 4. Framework Selection

Support the project's selected backend framework.

Node.js

Use:

Node.js
Express when selected
TypeScript when the project architecture requires it

Prefer a clean separation between:

routes
controllers
services
repositories
middleware
validators
utils
config
Python

Use:

Python
FastAPI when selected
Pydantic for request/response validation

Prefer:

routers
schemas
services
repositories
middleware
utils
config

Do not introduce both Node.js and Python unless the architecture explicitly requires a hybrid backend.

## 5. API Architecture

Prefer this request flow:

Client
↓
Route
↓
Middleware
↓
Validation
↓
Controller / Route Handler
↓
Service
↓
Repository / Integration Layer
↓
Database / AI / External API
↓
Service
↓
Response

Keep business logic out of route definitions whenever practical.

Routes should remain thin.

Services should contain business logic.

Repository/database layers should isolate persistence operations.

External API integrations should be isolated behind service functions.

## 6. REST API Design

Use conventional HTTP semantics.

Prefer:

GET /api/resource
GET /api/resource/:id
POST /api/resource
PUT /api/resource/:id
PATCH /api/resource/:id
DELETE /api/resource/:id

Use nested routes only when the relationship is meaningful.

Example:

GET /api/projects/:projectId/tasks
POST /api/projects/:projectId/tasks

Avoid unnecessary endpoint nesting.

## 7. API Versioning

Use API versioning when it is useful for the project.

Preferred format:

/api/v1/...

For a small hackathon MVP, versioning may be omitted if the architecture does not require it.

Do not add versioning solely for theoretical future scalability.

## 8. Request Validation

Every externally supplied input must be validated.

Validate:

body
query parameters
route parameters
headers when relevant
uploaded files
authentication data

Never trust frontend validation alone.

Frontend validation improves UX.

Backend validation provides security and correctness.

Examples of validation requirements:

required fields
data types
string length
numeric ranges
enum values
email format
UUID format
date format
file type
file size
array limits
pagination limits

Reject invalid requests before expensive operations.

## 9. Schema Validation

Use the framework's appropriate validation mechanism.

For Node.js:

Zod
Joi
express-validator
another project-approved validator

For FastAPI:

Pydantic models

Do not introduce multiple validation libraries without a clear reason.

Keep validation schemas reusable.

Example conceptual schema:

CreateItemRequest
UpdateItemRequest
ItemResponse
ErrorResponse

Do not expose internal database structures unnecessarily.

## 10. Response Design

Responses should be predictable.

Success responses should contain only the data needed by the consumer.

Example:

{
"success": true,
"data": {}
}

For collections:

{
"success": true,
"data": [],
"pagination": {
"page": 1,
"limit": 20,
"total": 100
}
}

The exact response format may follow the project's existing architecture.

Do not force a wrapper structure onto an already established project without reason.

## 11. Error Handling

Never expose:

stack traces
database credentials
API keys
service-role credentials
internal file paths
sensitive database details
provider secrets

Use meaningful HTTP status codes.

Typical mapping:

200 OK
201 Created
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity
429 Too Many Requests
500 Internal Server Error
502 Bad Gateway
503 Service Unavailable

Return safe, actionable error messages.

Example:

{
"success": false,
"error": {
"code": "VALIDATION_ERROR",
"message": "Invalid request data."
}
}

Detailed internal errors should go to server logs, not the client.

## 12. Authentication

If authentication is required:

use the project's selected authentication system
prefer Supabase Auth when Supabase is already part of the architecture
validate authentication server-side
never trust a user ID supplied by the frontend
derive authenticated identity from verified credentials/session
protect sensitive endpoints
verify token/session expiration
handle invalid and expired sessions safely

Never implement custom authentication unnecessarily.

Never store plaintext passwords.

## 13. Authorization

Authentication answers:

Who are you?

Authorization answers:

What are you allowed to do?

Implement authorization separately.

Check:

ownership
role
permissions
resource access
administrative privileges

Example:

Authenticated user
↓
User owns resource?
↓
Allowed

Do not rely only on frontend route restrictions.

## 14. Supabase Integration

When Supabase is selected:

use the dedicated hackathon Supabase project
follow supabase-development skill
follow RLS requirements
avoid bypassing RLS unnecessarily
use service-role credentials only in trusted server environments
never expose service-role keys to frontend code

Prefer:

Frontend
↓
Backend API
↓
Supabase

or direct Supabase client access only when the architecture explicitly permits it.

Keep database operations isolated from business logic.

## 15. Database Access

Do not expose raw database access patterns throughout the application.

Prefer:

Service
↓
Repository
↓
Supabase

Repository functions should have clear responsibilities.

Example:

createUserProfile()
getUserProfile()
updateUserProfile()
getProjectById()
createTask()
listTasks()

Avoid generic repositories that hide important business logic.

## 16. AI / LLM APIs

When the project uses AI:

isolate AI provider calls
keep provider credentials server-side
validate user input before sending it
validate AI output before returning it
implement timeout handling
implement fallback behavior where practical
avoid unnecessarily large prompts
avoid sending sensitive data unless required
log useful metadata without exposing secrets

Preferred flow:

Frontend
↓
Backend API
↓
Validation
↓
AI Service
↓
Provider API
↓
Output Validation
↓
Backend
↓
Frontend

Never assume an LLM response is valid merely because the provider returned HTTP 200.

## 17. Structured AI Output

When AI output is consumed programmatically:

prefer structured output.

Example:

{
"result": "...",
"confidence": 0.91,
"recommendations": []
}

Validate the response before using it.

If parsing fails:

log the failure safely
retry only when appropriate
use a fallback
return a controlled error if necessary

Never allow malformed AI output to crash the API.

## 18. Agentic AI / Multi-Agent APIs

If the hackathon solution uses multiple agents:

Keep orchestration server-side.

Preferred architecture:

Frontend
↓
Orchestrator API
↓
Agent A
Agent B
Agent C
Agent D
↓
Aggregator / Evaluator
↓
Final Response

Define:

agent responsibilities
input schema
output schema
timeout
retry behavior
failure behavior
execution order
parallel execution where useful

Do not create agents merely because "multi-agent AI" sounds impressive.

Each agent must have a clear responsibility.

## 19. External APIs

For third-party APIs:

isolate provider-specific code
store credentials in environment variables
validate provider responses
implement timeouts
handle rate limits
handle unavailable providers
avoid leaking provider errors
document the dependency in docs/API-CONTRACT.md

Use:

Backend
↓
Integration Service
↓
External Provider

Do not call sensitive third-party APIs directly from the browser.

## 20. Postman Integration

Use Postman MCP when it provides meaningful value.

Postman should be used for:

endpoint testing
request validation
authentication testing
response verification
regression testing
documenting important API flows

After implementing a major endpoint:

start backend
verify health endpoint
send valid request
verify response
test invalid input
test authentication
test authorization
test relevant edge cases

Do not create dozens of unnecessary Postman collections during the hackathon.

Prioritize demo-critical APIs.

## 21. API Testing

Every critical endpoint should have at least:

happy path
invalid input
unauthenticated request
unauthorized request
not found case
provider/database failure where relevant

Testing priority:

P0 endpoints
↓
P1 endpoints
↓
important edge cases
↓
optional endpoints

If automated testing infrastructure already exists, extend it.

Do not spend excessive hackathon time building a sophisticated test framework from scratch.

## 22. Health Endpoint

Provide a simple health endpoint when practical:

GET /health

Expected behavior:

{
"status": "ok"
}

For systems with important dependencies, a deeper health check may be added:

GET /health
GET /health/ready

Do not make health checks depend on expensive AI calls.

## 23. CORS

Configure CORS intentionally.

Development may allow the local frontend origin.

Production should allow only required origins.

Never use:

Access-Control-Allow-Origin: \*

for sensitive authenticated APIs unless the architecture explicitly requires it and the security implications are understood.

## 24. Rate Limiting

Add rate limiting when appropriate for:

authentication endpoints
expensive AI endpoints
file-processing endpoints
public endpoints
endpoints vulnerable to abuse

Do not introduce complex distributed rate limiting for a simple hackathon MVP unless required.

A simple implementation is preferable.

## 25. File Uploads

If file uploads are required:

validate:

file size
MIME type
extension
filename
content where possible

Never trust the extension alone.

Avoid arbitrary executable file uploads.

Use Supabase Storage when appropriate.

Prefer generated or sanitized filenames.

Do not expose private storage objects publicly unless explicitly required.

## 26. Logging

Logs should help debugging without exposing secrets.

Log:

request method
route
status
duration
safe identifiers
important integration failures
unexpected exceptions

Do not log:

passwords
access tokens
API keys
service-role keys
sensitive user data
full authentication headers

Use structured logging when practical.

## 27. Environment Variables

Secrets must come from environment variables.

Typical examples:

SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
GROQ_API_KEY
GEMINI_API_KEY
DATABASE_URL
JWT_SECRET

Only include variables actually required by the project.

Create:

.env.example

Never commit:

.env

Never hard-code credentials.

## 28. Environment Separation

Maintain clear distinction between:

development
testing
production

Do not accidentally connect local development to an unrelated production database.

Verify environment variables before deployment.

## 29. Dependency Management

Before installing a dependency:

verify it is necessary
check whether an existing dependency already solves the problem
consider installation size
consider deployment compatibility
consider security
consider hackathon time

Avoid dependency sprawl.

After adding dependencies:

install
run
test
build
verify

## 30. Docker

Docker should improve reproducibility, not add unnecessary complexity.

Use Docker when:

backend deployment requires it
the environment has system-level dependencies
a local service requires reproducible setup
the team needs identical runtime environments

Do not automatically containerize:

Vercel frontend
Supabase hosted infrastructure
external APIs
services already managed by a platform

If Docker is used, provide:

Dockerfile
.dockerignore

and optionally:

docker-compose.yml

only when multiple local services are genuinely required.

## 31. API Startup Verification

After backend implementation, verify:

dependencies installed
environment configured
server starts
health endpoint works
database connection works
AI provider works
external APIs work
CORS works
frontend can connect

Fix startup errors before continuing with advanced features.

## 32. Frontend Integration

The frontend must consume the documented API contract.

Before declaring integration complete, verify:

frontend request
→ backend route
→ validation
→ business logic
→ database/provider
→ backend response
→ frontend rendering

Check:

loading states
success states
validation errors
authentication errors
server errors
timeout behavior
empty states

Never make the frontend depend on undocumented response structures.

## 33. API Contract Changes

If an API contract changes:

update the backend
update docs/API-CONTRACT.md
update frontend consumers
update tests
update Postman requests
verify integration

Do not silently change response structures.

## 34. Performance

Prioritize obvious bottlenecks.

Use:

pagination
indexed database queries
limited result sizes
caching when genuinely useful
async processing for expensive operations
parallel API calls when independent
request timeouts

Avoid premature optimization.

During the hackathon, reliability matters more than theoretical scalability.

## 35. Timeout Strategy

External operations must not hang indefinitely.

Apply reasonable timeouts to:

AI requests
external APIs
file processing
long database operations

When a timeout occurs:

catch
→ log safely
→ return controlled response
→ use fallback if available

## 36. Retry Strategy

Retry only operations that are safe to retry.

Good candidates:

transient external API failures
temporary network failures
rate-limited requests with provider guidance

Avoid blindly retrying:

database writes
payment-like operations
non-idempotent operations
expensive AI requests

Use bounded retries.

Never create infinite retry loops.

## 37. Fallback Strategy

Every demo-critical external dependency should be evaluated for failure risk.

If practical, provide:

Primary service
↓
Fallback
↓
Graceful degraded behavior

Examples:

AI unavailable
→ cached/demo-safe result

External API unavailable
→ fallback dataset

Database unavailable
→ controlled error

Fallbacks must not violate the actual product requirements.

Do not fake successful operations that did not happen.

## 38. Security Review

Before declaring the API complete, verify:

[ ] No secrets committed
[ ] Authentication enforced
[ ] Authorization enforced
[ ] Input validation enabled
[ ] SQL/database access protected
[ ] Supabase RLS reviewed
[ ] Service-role key server-only
[ ] CORS configured
[ ] File uploads validated
[ ] Error messages sanitized
[ ] Rate limiting considered
[ ] External API credentials protected
[ ] AI inputs reviewed
[ ] AI outputs validated
[ ] Logs contain no secrets

Security requirements from .agents/rules/security.md are mandatory.

## 39. API Documentation

Maintain:

docs/API-CONTRACT.md

At minimum document:

endpoint
method
authentication
request
response
validation
errors
dependencies
frontend consumer

If OpenAPI/Swagger is already supported by the framework, use it when useful.

Do not spend excessive time manually documenting endpoints that are already self-documented by the framework.

## 40. API Implementation Priority

Implement in this order:

P0
health endpoint
authentication
core business endpoint
core database operations
core AI operation if required
frontend integration
P1
secondary features
additional integrations
improved validation
error handling improvements
important edge cases
P2
performance improvements
advanced filtering
caching
enhanced analytics
P3
optional integrations
advanced optimizations
nonessential developer tooling

Never implement P2/P3 features while a P0 API is broken.

## 41. Hackathon Time Strategy

When time is limited:

First

Make this work:

Frontend
↓
API
↓
Database / AI
↓
Response
↓
UI
Then

Add:

validation
authentication
authorization
error handling
testing
Then

Add:

bonus features
performance
polish

Do not spend the majority of the hackathon building backend abstractions.

## 42. Team Parallelization

Suggested ownership:

Backend/API Agent

Responsible for:

routes
controllers
services
validation
integrations
API contracts
backend testing
Database/Supabase Agent

Responsible for:

schema
migrations
RLS
storage
database testing
Frontend Agent

Responsible for:

API consumption
UI states
forms
authentication UI
error handling
QA Agent

Responsible for:

endpoint testing
integration testing
regression testing
security checks

Agents must coordinate through documented contracts.

## 43. Git Safety

Before modifying backend code:

git status

Check the current branch.

Do not overwrite another agent's work.

Do not reset or force-push shared branches without explicit human approval.

Keep commits focused.

Example:

feat(api): add document analysis endpoint
fix(api): handle AI timeout
test(api): add validation tests

Follow .agents/rules/git.md.

## 44. Integration Checkpoint

After API implementation:

[ ] Server starts
[ ] Health endpoint works
[ ] Required endpoints exist
[ ] Request validation works
[ ] Responses match contract
[ ] Authentication works
[ ] Authorization works
[ ] Supabase works
[ ] AI integration works
[ ] External APIs work
[ ] Postman tests pass
[ ] Frontend integration works
[ ] Errors are handled
[ ] No secrets are committed
[ ] Deployment build succeeds

Only then mark the API work complete.

## 45. Definition of Done

API development is complete only when:

all P0 endpoints work
API contracts are documented
validation is implemented
authentication/authorization are implemented where required
database operations work
AI integrations work where required
external integrations work where required
errors are handled safely
Postman testing has verified critical endpoints
frontend integration has been verified
environment variables are documented
secrets are protected
deployment succeeds
the demo-critical API flow works end-to-end

## 46. Final API Workflow

Always follow:

READ REQUIREMENTS
↓
EXTRACT API REQUIREMENTS
↓
DEFINE API CONTRACT
↓
CHOOSE BACKEND FRAMEWORK
↓
DESIGN ROUTES
↓
DEFINE VALIDATION
↓
IMPLEMENT SERVICES
↓
IMPLEMENT DATABASE / AI / EXTERNAL INTEGRATIONS
↓
IMPLEMENT AUTH + AUTHORIZATION
↓
IMPLEMENT ERROR HANDLING
↓
TEST WITH POSTMAN
↓
TEST FRONTEND INTEGRATION
↓
SECURITY REVIEW
↓
DEPLOYMENT TEST
↓
END-TO-END VERIFICATION
↓
MARK COMPLETE

## 47. Critical Rule

The API exists to serve the product requirements.

Do not build APIs merely because a particular technology makes them possible.

Every endpoint should answer:

Why does the product need this?
Who consumes it?
What requirement does it satisfy?
What happens if it fails?

If an endpoint cannot answer these questions, reconsider whether it belongs in the MVP.
