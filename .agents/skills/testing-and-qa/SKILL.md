---
name: testing-and-qa
description: Systematically test, validate, debug, secure, and verify the complete hackathon application across frontend, backend, APIs, database, AI features, integrations, and deployment before demo and submission.
---

# Testing and QA Skill

## 1. Mission

Ensure the hackathon application is:

- functionally correct
- integrated correctly
- visually compliant
- secure
- stable
- testable
- deployable
- demo-ready
- aligned with the official hackathon requirements

Testing is not limited to checking whether the application starts.

The QA process must verify the complete product:

```text
Requirements
    ↓
Frontend
    ↓
API
    ↓
Backend
    ↓
Database
    ↓
AI / External Services
    ↓
Integrated Application
    ↓
Deployment
    ↓
Final Demo
```

## 2. Source of Truth

Before testing, inspect:

AGENTS.md
.agents/rules/security.md
.agents/rules/git.md
.agents/rules/frontend.md
.agents/rules/backend.md
.agents/skills/theme-analysis/SKILL.md
.agents/skills/ui-compliance/SKILL.md
.agents/skills/architecture/SKILL.md
.agents/skills/api-development/SKILL.md
.agents/skills/supabase-development/SKILL.md
docs/theme-source.md
docs/REQUIREMENTS.md
docs/UI-REQUIREMENTS.md
docs/ARCHITECTURE.md
docs/TASK-BREAKDOWN.md
docs/API-CONTRACT.md

Testing must be based on the actual project requirements.

Never test only what developers happened to implement.

## 3. QA Principle

Use this hierarchy:

Official Requirements
↓
Core User Flows
↓
P0 Features
↓
Security
↓
Integration
↓
P1 Features
↓
UI Compliance
↓
Performance
↓
Optional Features

If a P0 requirement is broken, optional features should not receive testing priority.

## 4. Requirement Traceability

Every important requirement should map to at least one verification method.

Create or maintain:

docs/TEST-PLAN.md

Use a structure similar to:

Requirement
↓
Feature
↓
Implementation
↓
Test
↓
Expected Result
↓
Actual Result
↓
Status

Example:

Requirement:
Users must be able to upload a document.

Test:
Upload a valid supported document.

Expected:
Upload succeeds and document appears in the user's workspace.

Status:
PASS

## 5. Test Categories

The QA process should cover:

1. Static checks
2. Unit tests
3. API tests
4. Database tests
5. AI tests
6. Frontend tests
7. Browser tests
8. Integration tests
9. End-to-end tests
10. Security tests
11. Error/failure tests
12. Responsive tests
13. Performance checks
14. Deployment verification
15. Final demo rehearsal

Do not require every project to implement an unnecessarily large automated test suite.

Use the appropriate level of testing for the hackathon.

## 6. Test Priority

Classify tests as:

P0 — Critical

Tests for:

core user journey
mandatory requirements
authentication
authorization
critical API endpoints
core database operations
core AI functionality
mandatory UI requirements
deployment
demo-critical functionality

A P0 failure blocks final completion.

P1 — Important

Tests for:

secondary features
important edge cases
additional integrations
non-critical error states
responsive behavior
P2 — Enhancement

Tests for:

performance optimization
optional features
advanced edge cases
non-critical polish
P3 — Optional

Tests for:

experimental features
nonessential optimizations
future functionality

## 7. Testing Workflow

Always follow:

READ REQUIREMENTS
↓
CREATE TEST PLAN
↓
VERIFY ENVIRONMENT
↓
RUN STATIC CHECKS
↓
TEST BACKEND
↓
TEST DATABASE
↓
TEST AI / EXTERNAL APIs
↓
TEST FRONTEND
↓
TEST BROWSER
↓
RUN INTEGRATION TESTS
↓
RUN END-TO-END FLOWS
↓
RUN SECURITY CHECKS
↓
RUN DEPLOYMENT CHECKS
↓
RETEST FIXES
↓
FINAL REGRESSION
↓
DEMO REHEARSAL

## 8. Initial Environment Check

Before testing:

[ ] Correct repository
[ ] Correct branch
[ ] Dependencies installed
[ ] Environment variables configured
[ ] Required services running
[ ] Database accessible
[ ] Backend starts
[ ] Frontend starts
[ ] Required MCP integrations available
[ ] No obvious build errors

Never begin detailed QA against a broken environment.

## 9. Static Checks

Run available static checks before manual testing.

Depending on the stack:

lint
typecheck
format check
build
dependency validation

Examples:

npm run lint
npm run typecheck
npm run build

or equivalent project commands.

For Python:

pytest
ruff
mypy
python -m compileall

Only run commands that actually exist in the project.

Do not invent scripts.

## 10. Build Verification

The application must build successfully.

Verify:

frontend build
backend startup
production configuration
asset generation
environment handling

A development server working does not guarantee production build success.

Fix build failures before final QA.

## 11. Unit Testing

Use unit tests for important isolated logic.

Good candidates:

utility functions
validation
parsing
calculations
transformations
business rules
data formatting
AI response parsing
helper functions

Avoid writing large numbers of low-value tests for trivial framework code.

Example:

Input
↓
Function
↓
Expected Output

Test both valid and invalid inputs.

## 12. Backend Testing

Test:

server startup
routes
validation
authentication
authorization
services
database operations
external integrations
AI services
error handling

For each critical endpoint test:

[ ] Valid request
[ ] Missing required field
[ ] Invalid data type
[ ] Invalid value
[ ] Unauthenticated request
[ ] Unauthorized request
[ ] Missing resource
[ ] Dependency failure

## 13. API Testing

Use Postman MCP when useful.

For every P0 endpoint verify:

HTTP method
URL
headers
authentication
request body
validation
status code
response body
error behavior

The response must match:

docs/API-CONTRACT.md

If the API contract and implementation disagree:

determine the intended behavior
update the contract if appropriate
update consumers
retest

Never silently ignore the mismatch.

## 14. API Test Matrix

Maintain a concise matrix:

Endpoint Method Valid Invalid Auth Authz Error Status
/health GET ✓ — — — ✓
Core endpoint POST ✓ ✓ ✓ ✓ ✓
Resource GET ✓ ✓ ✓ ✓ ✓

Only include endpoints that exist in the project.

## 15. Database Testing

Verify:

[ ] Tables exist
[ ] Relationships work
[ ] Required constraints work
[ ] Inserts work
[ ] Updates work
[ ] Reads work
[ ] Deletes work where required
[ ] Indexes exist where needed
[ ] RLS is enabled where required
[ ] RLS policies work
[ ] Unauthorized access is blocked
[ ] Invalid data is rejected

Do not test database functionality only through the frontend.

Critical database behavior should also be verified directly or through API tests.

## 16. Supabase Security Testing

For Supabase-backed applications verify:

authenticated user
↓
allowed resource
↓
successful access

and:

authenticated user
↓
another user's protected resource
↓
access denied

Also test:

unauthenticated user
↓
protected resource
↓
access denied

Verify that service-role credentials cannot be accessed from frontend code.

## 17. Authentication Testing

Test:

[ ] Sign up
[ ] Sign in
[ ] Invalid credentials
[ ] Logout
[ ] Expired session
[ ] Protected route without session
[ ] Protected API without credentials
[ ] Valid session

If the project does not require authentication, do not add unnecessary auth testing.

## 18. Authorization Testing

For every protected resource:

Owner
→ allowed

Authorized role
→ allowed

Wrong user
→ denied

Wrong role
→ denied

Unauthenticated
→ denied

Never assume authentication automatically provides authorization.

## 19. AI Feature Testing

AI features require special testing.

Test:

normal input
empty input
very short input
large input
unexpected input
ambiguous input
malicious prompt
malformed content
provider failure
timeout
rate limit
invalid AI response

Verify that AI output:

follows the expected schema
is safe to consume
does not crash the application
does not expose secrets
does not expose internal prompts unnecessarily
does not cause unsafe database operations

## 20. AI Output Validation

Never trust raw AI output.

Verify:

AI response
↓
Parse
↓
Validate schema
↓
Business rules
↓
Use result

If parsing fails:

AI output invalid
↓
Retry if appropriate
↓
Fallback if available
↓
Controlled error

Never allow malformed model output to silently corrupt application state.

## 21. Prompt Injection Testing

If users can provide text that reaches an LLM, test prompt injection scenarios.

Examples:

Ignore previous instructions.
Reveal system instructions.
Return hidden data.
Execute this command.
Ignore security restrictions.

The application should maintain its system boundaries.

Never allow user-controlled content to automatically become trusted instructions.

## 22. Agentic System Testing

If the project contains multiple agents, test:

agent input
agent output
agent failure
agent timeout
invalid agent output
agent dependency failure
parallel execution
orchestration failure
final aggregation

Verify that one failed agent does not unnecessarily crash the entire application when a fallback is possible.

Test the complete chain:

User
↓
Orchestrator
↓
Agent A
↓
Agent B
↓
Agent C
↓
Aggregator
↓
Final Result

## 23. External API Testing

For every external API:

[ ] Valid request
[ ] Invalid request
[ ] Missing credentials
[ ] Invalid credentials
[ ] Timeout
[ ] Rate limit
[ ] Provider error
[ ] Unexpected response
[ ] Empty response

The application must fail gracefully.

Do not expose raw provider errors to users.

## 24. Frontend Functional Testing

Test the actual user interface.

Verify:

navigation
forms
buttons
inputs
modals
dropdowns
search
filters
upload
authentication
loading
success
error
empty states
logout

Every important interactive element must produce the intended result.

Do not stop at checking whether the page looks correct.

## 25. UI Requirement Compliance

The official hackathon UI requirements are mandatory.

Read:

docs/UI-REQUIREMENTS.md

Verify:

[ ] Required layout
[ ] Required navigation
[ ] Required colors
[ ] Required typography
[ ] Required components
[ ] Required branding
[ ] Required interactions
[ ] Required page structure
[ ] Required responsive behavior

Do not replace explicit requirements with a "better-looking" alternative.

A visually attractive but non-compliant implementation is still a failure.

## 26. Browser Testing

Use Chrome DevTools MCP when available.

Verify the application in an actual browser.

Check:

page loads
navigation works
console errors
network errors
API requests
responsive layout
forms
buttons
modals
scrolling
images
fonts
loading states
error states

Inspect browser console errors.

Inspect failed network requests.

Do not declare the frontend complete based only on source-code inspection.

## 27. Visual Testing

Compare the implementation against:

docs/UI-REQUIREMENTS.md
approved Stitch output
official theme screenshots/wireframes
project design specifications

Verify:

spacing
alignment
hierarchy
colors
typography
component placement
navigation
responsive behavior

Do not change mandatory UI details during QA merely to make them easier to implement.

Report violations.

## 28. Responsive Testing

At minimum check:

desktop
tablet
mobile

Verify:

navigation
cards
tables
forms
buttons
images
modals
text wrapping
overflow

No horizontal overflow should exist unless explicitly required.

## 29. Accessibility Checks

Check:

keyboard navigation
focus visibility
form labels
button labels
alt text
color contrast
semantic HTML
heading hierarchy
error messages

Prioritize accessibility for core user flows.

Do not sacrifice mandatory design requirements, but implement them accessibly wherever possible.

## 30. Loading States

Every potentially slow operation should have an appropriate loading state.

Examples:

API request
AI generation
file upload
database operation
search
authentication

Verify that:

loading
↓
success

and:

loading
↓
error

both produce appropriate UI behavior.

Prevent accidental duplicate submissions where relevant.

## 31. Error-State Testing

Intentionally trigger failures.

Examples:

backend unavailable
invalid API response
database unavailable
AI provider unavailable
network disconnected
invalid form
expired authentication
missing resource
file too large
unsupported file

Verify the user sees a useful message.

Do not show:

Internal Server Error

without context when a better user-facing message is possible.

## 32. Empty-State Testing

Test scenarios where there is no data.

Examples:

no projects
no documents
no search results
no notifications
no recommendations
no history

Verify the UI remains usable and explains what the user can do next.

## 33. File Upload Testing

If uploads are supported:

Test:

valid file
unsupported file
oversized file
empty file
corrupted file
multiple files
duplicate file
malicious filename

Verify:

validation
storage
processing
error handling
cleanup

Never trust client-side file validation.

## 34. Security Testing

Perform a practical security review.

Check:

[ ] No secrets in Git
[ ] No secrets in frontend bundle
[ ] Authentication enforced
[ ] Authorization enforced
[ ] RLS reviewed
[ ] Input validation
[ ] Output validation
[ ] Safe file uploads
[ ] CORS
[ ] Rate limiting where needed
[ ] Safe error messages
[ ] Safe logging
[ ] Dependency risks reviewed
[ ] AI prompt injection considered
[ ] API keys protected

Never perform destructive security testing against external systems.

Only test systems the team owns or is authorized to test.

## 35. Dependency Security

Review newly added dependencies.

Check for:

unnecessary packages
obvious known vulnerabilities
abandoned packages where relevant
duplicated dependencies

Use available package-manager security tooling when practical.

Do not spend excessive time chasing low-impact warnings during the final hackathon hours.

Prioritize vulnerabilities that affect the actual application.

## 36. Performance Testing

Perform lightweight performance checks.

Measure:

page load
API response time
AI response time
database query time
file processing time

Look for obvious problems:

huge payloads
unbounded database queries
repeated API calls
unnecessary re-renders
blocking operations
large frontend assets

Do not optimize theoretical bottlenecks while core functionality is incomplete.

## 37. Network Testing

Test important flows with:

normal connection
slow connection
temporary failure
backend unavailable

Verify the application does not become permanently stuck.

Loading indicators must eventually transition to success or error.

## 38. Integration Testing

Test complete subsystem interactions.

Examples:

Frontend
↓
API
↓
Supabase

or:

Frontend
↓
API
↓
AI Provider
↓
Database

or:

Frontend
↓
API
↓
External Service
↓
Database

Integration tests should verify that real interfaces match their contracts.

## 39. End-to-End Testing

Identify the most important user journey.

Example:

Open application
↓
Sign in
↓
Create item
↓
Upload data
↓
Run AI analysis
↓
Store result
↓
View result
↓
Complete workflow

Execute this journey exactly as a judge/user would.

The complete P0 user journey must work before final submission.

## 40. Regression Testing

Whenever a bug is fixed:

Reproduce
↓
Fix
↓
Test original bug
↓
Test related feature
↓
Run relevant P0 flows

Do not assume a local fix cannot affect another feature.

Before final submission, rerun all P0 tests.

## 41. Bug Classification

Classify discovered issues:

BLOCKER

Application cannot:

start
build
deploy
execute core flow
satisfy a mandatory requirement
CRITICAL

Major P0 functionality is broken.

HIGH

Important functionality is broken but a workaround exists.

MEDIUM

Non-critical feature or edge case is broken.

LOW

Minor UI or nonessential issue.

Prioritize fixes accordingly.

## 42. Bug Report Format

Use concise bug reports:

Bug:
Short description

Severity:
BLOCKER / CRITICAL / HIGH / MEDIUM / LOW

Steps:

1.
2.
3.

Expected:
...

Actual:
...

Affected:
...

Likely Cause:
...

Status:
OPEN / IN PROGRESS / FIXED / VERIFIED

Do not create unnecessary documentation overhead during the hackathon.

## 43. Debugging Workflow

When a test fails:

REPRODUCE
↓
ISOLATE
↓
IDENTIFY LAYER
↓
CHECK LOGS
↓
CHECK NETWORK
↓
CHECK DATABASE
↓
CHECK INPUT/OUTPUT
↓
FIX ROOT CAUSE
↓
RETEST

Determine whether the problem is in:

Frontend
API
Backend
Database
AI
External Service
Environment
Deployment

Do not randomly modify multiple layers at once.

## 44. MCP-Assisted QA

Use available MCPs when they provide direct value.

Postman MCP

Use for:

API testing
request validation
regression testing
Chrome DevTools MCP

Use for:

browser testing
console inspection
network inspection
visual verification
Supabase MCP

Use for:

schema verification
database inspection
RLS verification
controlled test data
GitHub MCP

Use for:

issue/PR awareness
repository state
collaboration where needed
Stitch MCP

Use when verifying the implementation against the approved UI/design output.

MCPs are tools, not substitutes for reasoning.

## 45. Test Data

Use safe test data.

Create predictable datasets for:

normal case
edge case
empty case
invalid case
large case

Never use real sensitive personal data unnecessarily.

Do not commit secrets or sensitive test data.

## 46. Production Smoke Test

After deployment, test the deployed application.

Verify:

[ ] Website opens
[ ] Frontend loads
[ ] Backend is reachable
[ ] API calls succeed
[ ] Authentication works
[ ] Database works
[ ] AI functionality works
[ ] External APIs work
[ ] File uploads work
[ ] Core user journey works
[ ] No major console errors

A local success is not sufficient.

## 47. Deployment Verification

Check:

frontend deployment
backend deployment
environment variables
CORS
API URLs
database connection
AI credentials
storage
HTTPS
production build

Verify that development URLs have not accidentally been hard-coded.

## 48. Demo Environment

Create a stable demo environment.

Prefer:

Production/Staging
↓
Stable test account/data
↓
Known successful workflow

Avoid depending on:

random external data
untested accounts
local-only services
unstable experimental features

## 49. Demo Data

Prepare deterministic demo data where appropriate.

Demo data should:

demonstrate the core value
load quickly
avoid sensitive information
produce reliable results
represent the intended product

Do not falsely represent unavailable functionality as completed.

## 50. Demo Rehearsal

Before submission, perform the demo exactly as it will happen.

Test:

Laptop
↓
Internet
↓
Browser
↓
Application
↓
Authentication
↓
Core flow
↓
AI / API
↓
Result

Time the demo.

Identify:

slow steps
uncertain steps
manual workarounds
potential failure points

Simplify the demo path where possible without misrepresenting the product.

## 51. Failure Recovery Plan

For every demo-critical dependency identify:

Primary
Fallback
Recovery

Example:

AI Provider
↓
Provider unavailable
↓
Retry
↓
Fallback behavior

The team should know what to do if:

internet fails
API fails
AI fails
database fails
deployment fails
authentication fails

Do not improvise critical recovery procedures during the final demo.

## 52. Final QA Checklist

Before declaring the project ready:

### REQUIREMENTS

[ ] All mandatory requirements implemented
[ ] Mandatory requirements tested
[ ] Bonus features clearly distinguished

### FRONTEND

[ ] UI requirements verified
[ ] Navigation works
[ ] Forms work
[ ] Loading states work
[ ] Error states work
[ ] Responsive layout verified
[ ] Browser console reviewed

### BACKEND

[ ] Server starts
[ ] P0 APIs work
[ ] Validation works
[ ] Authentication works
[ ] Authorization works
[ ] Errors handled

### DATABASE

[ ] Schema verified
[ ] Queries work
[ ] RLS verified
[ ] Protected data inaccessible to unauthorized users

### AI

[ ] Core AI flow works
[ ] Output validation works
[ ] Failure handling works
[ ] Prompt injection risks considered

### INTEGRATIONS

[ ] External APIs work
[ ] Postman tests pass
[ ] MCP-dependent workflows verified

### SECURITY

[ ] No secrets committed
[ ] No credentials exposed
[ ] CORS reviewed
[ ] Upload security reviewed
[ ] Error leakage reviewed

### DEPLOYMENT

[ ] Frontend deployed
[ ] Backend deployed
[ ] Environment variables configured
[ ] Production API works
[ ] Production database works
[ ] Production AI works

### DEMO

[ ] Core flow rehearsed
[ ] Demo data prepared
[ ] Backup plan prepared
[ ] Team responsibilities clear

## 53. Final Regression Gate

Immediately before submission:

1. Pull latest approved code.
2. Verify repository status.
3. Install/update dependencies only if required.
4. Run build.
5. Run critical tests.
6. Start application.
7. Run P0 end-to-end flow.
8. Verify production deployment.
9. Verify mandatory UI requirements.
10. Check browser console.
11. Check API failures.
12. Verify no secrets are exposed.
13. Verify final README/submission requirements.
14. Perform final demo rehearsal.

Do not introduce major architectural changes after this checkpoint unless a blocker requires it.

## 54. QA Completion Report

When QA finishes, create or update:

docs/QA-REPORT.md

Use:

# QA Report

## Build Status

PASS / FAIL

## P0 Features

PASS / FAIL

## P1 Features

PASS / FAIL

## UI Compliance

PASS / FAIL

## API Testing

PASS / FAIL

## Database

PASS / FAIL

## AI

PASS / FAIL

## Security

PASS / FAIL

## Deployment

PASS / FAIL

## Known Issues

- ...

## Blockers

- ...

## Final Demo Status

READY / NOT READY

Only mark:

READY

when all blockers are resolved.

## 55. Critical Rule

QA must never become a checkbox exercise.

The goal is not:

"We ran tests."

The goal is:

"We have evidence that the application works."

Test the application from the perspective of:

Developer
User
Judge
Attacker
Browser
API Consumer
Deployment Environment

A feature is not complete until it works reliably in the environment where it will actually be demonstrated.
