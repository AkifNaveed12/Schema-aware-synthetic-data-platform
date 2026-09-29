---
name: deployment
description: Deploy, configure, monitor, debug, verify, and maintain hackathon applications using Vercel CLI for frontend deployments and Render CLI for backend deployments, with Supabase, GitHub, environment variables, deployment logs, health checks, rollback/redeploy workflows, and production smoke testing.
---

# Deployment Skill

## Deployment Environment

Authentication and platform scope are already configured.

Do NOT run login, account creation, workspace discovery, or setup commands unless a deployment command fails specifically because of authentication or scope.

### Vercel

- CLI: `vercel`
- Authentication: already configured
- Active scope/team: `helloakifnaveed-7507-projects`
- Use Vercel CLI for project linking/creation, deployment, environment variables, deployment status, and logs.
- Production deployment: `vercel deploy --prod`
- Project linking: `vercel link`
- Environment variables: `vercel env`
- Deployment inspection/logging: use current `vercel` CLI help/docs when needed.
- Never run `vercel login` unless authentication actually fails.

### Render

- CLI: `render`
- Authentication: already configured
- Active workspace: `My Workspace`
- Workspace ID: `tea-d7mdto1j2pic73cahkqq`
- Use Render CLI for service creation/configuration, deployment, environment variables, logs, status, and restart operations.
- Deploy: `render deploys create <SERVICE_ID> --wait`
- Deploy history: `render deploys list <SERVICE_ID>`
- Logs: `render logs --resources <SERVICE_ID>`
- Live logs: `render logs --resources <SERVICE_ID> --tail`
- Never run `render login` or workspace discovery unless authentication/scope actually fails.

### Deployment Order

1. Inspect repository and identify frontend/backend roots.
2. Configure/deploy Render backend.
3. Capture backend production URL.
4. Configure frontend backend/API URL.
5. Configure/link Vercel project.
6. Deploy frontend to production.
7. Capture frontend production URL.
8. Configure backend CORS / `FRONTEND_URL`.
9. Redeploy backend if required.
10. Verify deployment status and relevant logs.
11. Run frontend ↔ backend production smoke tests.
12. Report final production URLs and deployment status.

### Failure Recovery

If deployment fails:

1. Inspect the actual error/logs.
2. Determine whether the failure is code, build, environment, configuration, platform, or authentication related.
3. Fix the smallest necessary issue.
4. Redeploy.
5. Re-check logs/status.
6. Do not repeat successful setup commands unnecessarily.

Use the current CLI's `--help` output or official platform documentation when a command's syntax has changed. Do not invent CLI flags.

## 1. Mission

Deploy the complete hackathon application reliably and quickly.

The deployment system must be capable of:

- preparing the application for production
- validating the production build
- configuring deployment environments
- deploying the frontend through Vercel CLI
- deploying the backend through Render CLI
- connecting deployments to the correct accounts/projects/workspaces
- configuring environment variables
- monitoring build and runtime logs
- diagnosing deployment failures
- fixing deployment issues
- triggering redeployments
- verifying production health
- testing frontend-to-backend connectivity
- verifying Supabase connectivity
- verifying AI/external API integrations
- performing production smoke tests
- documenting deployment URLs and configuration
- preparing a stable demo environment

The default hackathon deployment architecture is:

```text
                         GitHub
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
        Vercel CLI                 Render CLI
              │                         │
              ▼                         ▼
         FRONTEND                    BACKEND
       React / Next / Vite        Node / Express
                                  Python / FastAPI
              │                         │
              └────────────┬────────────┘
                           │
                           ▼
                       Supabase
                           │
                    Database / Auth
                    Storage / etc.

```

The deployment process must favor:

Reliability
↓
Correctness
↓
Security
↓
Observability
↓
Speed
↓
Optimization

## 2. Deployment Platform Policy

For this hackathon:

### Frontend

Use:

Vercel CLI

The agent must prefer direct Vercel CLI deployment rather than relying on an Antigravity MCP.

Typical workflow:

vercel login
↓
vercel link
↓
vercel env
↓
vercel deploy
↓
inspect deployment
↓
verify logs
↓
vercel deploy --prod

Vercel officially supports CLI project linking, deployment, deployment inspection, build logs, and runtime logs.

### Backend

Use:

Render CLI

The agent must prefer direct Render CLI deployment for the backend.

Typical workflow:

render login
↓
select workspace
↓
identify/create service
↓
configure environment
↓
trigger deployment
↓
stream deployment logs
↓
inspect service logs
↓
verify health endpoint

Render CLI supports service creation, service management, deploy triggering, deployment waiting, and live log streaming.

## 3. MCP vs CLI

Vercel and Render do not need to be connected to Antigravity through MCP for deployment.

The deployment agent should treat:

Antigravity Agent
↓
Terminal
↓
Vercel CLI / Render CLI
↓
Cloud Platform

as the primary deployment mechanism.

MCP is appropriate when a platform provides useful structured context or actions.

CLI is appropriate when the platform's official CLI provides the required deployment workflow.

Do not waste hackathon time attempting to force an MCP-based deployment workflow when the official CLI already provides the required capabilities.

## 4. Authentication Principle

The agent must NEVER ask the user to provide:

Vercel password
Render password
Vercel authentication token in chat
Render API key in chat
Supabase service-role key in chat
GitHub PAT in chat
any other secret

Authentication should occur through the appropriate CLI or environment configuration.

Preferred pattern:

Human
↓
CLI authentication
↓
Local authenticated session
↓
Agent executes CLI commands

The agent may ask the user to perform an interactive browser authorization when required.

## 5. Vercel Authentication

Before deploying the frontend, verify whether the Vercel CLI is authenticated.

Check:

vercel whoami

If authentication is missing, instruct the user to run:

vercel login

The browser-based authentication should be completed by the user.

After authentication:

vercel whoami

must return the authenticated Vercel identity.

Do not continue deployment if the CLI is authenticated to the wrong account/team.

## 6. Vercel Project Linking

The frontend directory must be associated with the correct Vercel project.

Use:

vercel link

The CLI can link the local directory to an existing Vercel project or create/link a project. Vercel stores the project association in the local .vercel directory.

After linking, verify:

.vercel/
project.json

Do not manually fabricate .vercel/project.json.

If the project already exists, link to the existing project.

If it does not exist, create it through the Vercel CLI.

## 7. Vercel Project Identity

Before production deployment verify:

Vercel account
Vercel team/scope
Vercel project
Frontend directory
Git repository

Do not accidentally deploy the hackathon project to:

a personal test project
an unrelated team
an old project
another hackathon project

When non-interactive operation is required, Vercel supports project IDs and organization IDs through CLI options/environment variables.

## 8. Vercel Framework Detection

Before deployment identify the frontend framework.

Examples:

Next.js
React + Vite
React
Vue
Svelte
static frontend

Inspect:

package.json
vite.config._
next.config._
framework configuration

Use the framework's correct production build.

Do not blindly override Vercel's detected settings.

Vercel automatically detects frameworks and proposes appropriate project settings when creating/linking projects.

## 9. Frontend Production Build

Before deploying:

npm install
npm run build

or the project's equivalent.

The agent must inspect package.json before assuming the build command.

Verify:

build succeeds
no blocking TypeScript errors
no blocking lint errors
no missing imports
no missing environment variables
no production-only failures

Do not deploy a known broken production build.

## 10. Frontend Environment Variables

Identify frontend environment variables.

Typical examples:

VITE_API_URL
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY

Only variables genuinely required by the project should be configured.

Never expose:

SUPABASE_SERVICE_ROLE_KEY
DATABASE_PASSWORD
PRIVATE_API_KEY
SECRET_KEY

through frontend environment variables.

Remember:

# Frontend environment variable

Potentially public

Treat browser-exposed variables as public information.

## 11. Vercel Environment Separation

Understand:

Development
Preview
Production

Configure environment variables for the correct deployment environment.

Do not accidentally point production frontend code at a development backend.

Production should normally use:

Production Frontend
↓
Production Backend
↓
Production Supabase Project

## 12. Vercel Preview Deployment

Before production deployment, use a preview deployment where practical:

vercel deploy

The CLI outputs the deployment URL.

Use the preview environment to verify:

page loads
assets load
API URL works
authentication works
core UI works

Do not immediately promote an untested build to production when a preview deployment is practical.

## 13. Vercel Deployment Inspection

After deploying:

vercel inspect <deployment-url> --wait

For build logs:

vercel inspect <deployment-url> --logs --wait

Vercel supports waiting for deployment completion and retrieving build logs through vercel inspect.

The deployment agent must inspect deployment status before declaring success.

## 14. Vercel Runtime Logs

After deployment, inspect runtime logs:

vercel logs

For live logs:

vercel logs --follow

For errors:

vercel logs --level error

For production errors:

vercel logs --environment production --level error

Vercel supports filtering runtime logs by environment, level, status code, deployment, branch, and time range.

The agent should use logs when debugging production issues rather than guessing.

## 15. Vercel Production Deployment

Only after preview verification:

vercel deploy --prod

Vercel's --prod option creates a production deployment for the project's production domain.

After production deployment:

deployment status
↓
production URL
↓
runtime logs
↓
browser smoke test

## 16. Vercel Production Verification

Verify:

[ ] Production URL opens
[ ] HTTPS works
[ ] Frontend assets load
[ ] No major console errors
[ ] API requests reach backend
[ ] Authentication works
[ ] Core user journey works
[ ] AI features work where applicable
[ ] Supabase interactions work

Use Chrome DevTools MCP for browser verification when available.

## 17. Render Authentication

Before deploying the backend:

render

Verify the CLI is installed.

Then authenticate:

render login

Render opens a browser authorization flow and then allows selection of the active workspace.

Verify workspaces:

render workspaces

Then select the intended workspace:

render workspace set

Do not deploy until the correct Render workspace is confirmed.

## 18. Render Account/Workspace Safety

Render CLI commands operate against the active workspace.

Therefore always verify:

Render account
↓
Render workspace
↓
Render service

before making deployment changes.

Never assume the currently active workspace is correct.

This is especially important when the user belongs to:

personal workspace
organization workspace
hackathon workspace
client workspace

## 19. Render Backend Service

Determine whether a Render backend service already exists.

Inspect:

render services

If the service exists:

identify service
verify repository
verify branch
verify runtime
verify build command
verify start command
verify environment

If the service does not exist, create it using Render CLI.

Render CLI supports creating services with repository, branch, build command, environment variables, health-check path, and related configuration.

## 20. Render Backend Runtime

Determine:

Node.js
Python
Docker

Examples:

Node.js

Build:

npm install
npm run build

Start:

npm start

or the project's actual production command.

FastAPI

Use a production server such as:

uvicorn main:app --host 0.0.0.0 --port $PORT

or the project's configured production server.

Docker

Use the project's:

Dockerfile

and ensure the container exposes/listens on the expected port.

Never assume the local development command is automatically suitable for production.

## 21. Render PORT Handling

The backend must listen on the port supplied by Render.

For Node.js:

const port = process.env.PORT || 3000;

For FastAPI:

uvicorn main:app --host 0.0.0.0 --port $PORT

Do not hard-code a production port.

## 22. Render Environment Variables

Configure backend secrets through Render environment variables.

Examples:

SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
GROQ_API_KEY
GEMINI_API_KEY
DATABASE_URL
JWT_SECRET

Only configure variables actually required by the application.

Never commit these values to Git.

Render supports service environment variables and can use them at build/runtime as appropriate.

## 23. Render Environment Safety

Never copy a local .env into Git.

Never print secret values into deployment logs.

Never place private credentials into:

frontend code
README
API documentation
GitHub issues
commit messages
agent prompts

When debugging environment configuration, inspect variable names and presence, not secret values.

## 24. Render Service Configuration

Verify:

service name
repository
branch
root directory
runtime
build command
start command
health check path
environment variables
plan
region
auto-deploy behavior

The configuration must match the repository architecture.

## 25. Render Deployment

To trigger a deployment:

render deploys create <SERVICE_ID> --wait

The CLI can wait for deployment completion and exits non-zero when the deployment fails. Render also supports streaming deployment logs.

Do not assume that a successful command invocation means the service is healthy.

Wait for the deployment to reach a successful state.

## 26. Render Deployment Logs

During deployment, inspect:

build logs
install logs
startup logs
runtime logs
health check

Use:

render logs

or service-specific log commands/options supported by the installed CLI.

Render CLI supports filtering logs and streaming them in real time.

When deployment fails:

READ LOGS
↓
IDENTIFY FIRST REAL ERROR
↓
TRACE ROOT CAUSE
↓
FIX
↓
COMMIT
↓
REDEPLOY

Do not fix only the final cascading error.

## 27. Render Deploy History

Inspect deployment history:

render deploys list <SERVICE_ID>

Use this to determine:

latest deployment
previous successful deployment
failed deployment
commit associated with deployment

Render maintains deploy history and supports deployment inspection through the CLI/dashboard.

## 28. Render Runtime Logs

After deployment, inspect service logs.

Look for:

startup errors
database errors
authentication errors
AI provider errors
CORS errors
404 errors
500 errors
timeouts
memory issues
dependency errors

Use filtered logs when possible.

Do not treat a clean build as proof of a healthy runtime.

## 29. Render Health Check

Configure a lightweight health endpoint when practical:

GET /health

Expected:

{
"status": "ok"
}

The health endpoint should:

be fast
not call an expensive AI model
not require unnecessary external dependencies
accurately indicate whether the service is running

Use the health endpoint for deployment verification.

## 30. Backend Production Smoke Test

After Render deployment:

GET /health
↓
200 OK
↓
Core API request
↓
Expected response

Then verify:

Supabase
AI provider
external APIs
authentication
file processing

where applicable.

## 31. Frontend ↔ Backend Connection

After both deployments:

Vercel Frontend
↓
Production API URL
↓
Render Backend
↓
Supabase / AI / APIs

Verify the actual production flow.

Do not rely on local development success.

Common failure:

Frontend works locally
↓
Frontend deployed
↓
Frontend still points to localhost

Check for:

localhost
127.0.0.1
local ports
development API URLs

inside production configuration.

## 32. CORS Verification

The Render backend must allow the production Vercel origin.

Example:

https://your-frontend.vercel.app

Do not leave production CORS unnecessarily open.

Test:

Vercel frontend
↓
Render API
↓
successful browser request

Use Chrome DevTools network inspection to verify.

## 33. Production Environment Variables

Verify the complete production configuration:

Frontend
↓
Vercel environment variables

Backend
↓
Render environment variables

Database
↓
Supabase

AI
↓
Provider credentials

Never assume environment variables from local .env automatically exist in production.

## 34. Supabase Production Connection

Verify:

Render backend
↓
Supabase project
↓
Database

Confirm that the backend points to the intended hackathon Supabase project.

Do not accidentally connect the deployed backend to:

an old personal project
a previous semester project
a client project
a test database

Verify project identity before deployment.

## 35. GitHub Deployment Relationship

GitHub remains the source of truth.

Preferred flow:

Developer
↓
Git
↓
GitHub
↓
Vercel / Render

Before production deployment:

git status
git branch
git log -1

Verify the intended commit is being deployed.

Do not deploy uncommitted changes unless the deployment method explicitly requires it and the human approves.

## 36. Commit Verification

Before deployment:

[ ] Correct branch
[ ] Correct commit
[ ] Changes committed
[ ] Changes pushed
[ ] GitHub contains expected code
[ ] No accidental files
[ ] No secrets

Record the deployed commit SHA when possible.

## 37. Render Auto-Deploy Consideration

Render services can automatically deploy when changes reach their configured branch.

Therefore determine whether:

auto-deploy = enabled

before manually triggering a deployment.

Avoid accidentally causing:

push
↓
automatic deploy
↓
manual deploy
↓
duplicate deployment

During hackathon development, automatic deployment may be useful.

During controlled production releases, manual deployment may be preferable.

Follow the project's deployment strategy.

## 38. Specific Commit Deployment

If deploying a specific commit through Render CLI:

render deploys create <SERVICE_ID> --commit <COMMIT_SHA> --wait

Be aware that Render documents different auto-deploy behavior when deploying a specific commit through different mechanisms.

Do not assume the manually selected commit will remain deployed if automatic deployment is still enabled and a newer branch commit is pushed.

## 39. Vercel Deployment Strategy

Use:

Preview
↓
Verification
↓
Production

Preferred commands:

vercel deploy

then:

vercel deploy --prod

Do not deploy directly to production before validating the build when time permits.

## 40. Deployment Failure Classification

Classify failures.

BLOCKER
deployment cannot start
production unavailable
frontend cannot load
backend cannot start
required API unavailable
CRITICAL
core user journey broken
database unavailable
authentication broken
AI core feature broken
frontend/backend integration broken
HIGH
important feature broken
significant runtime errors
major responsive issue
MEDIUM
secondary feature broken
non-critical API issue
LOW
minor UI issue
nonessential warning

Always fix:

BLOCKER
↓
CRITICAL
↓
HIGH

before polishing LOW issues.

## 41. Deployment Debugging Workflow

When deployment fails:

DEPLOYMENT FAILED
↓
READ BUILD LOGS
↓
IDENTIFY FIRST ERROR
↓
CLASSIFY ERROR
↓
CHECK LOCAL REPRODUCTION
↓
FIX ROOT CAUSE
↓
RUN LOCAL BUILD
↓
COMMIT FIX
↓
PUSH
↓
REDEPLOY
↓
VERIFY LOGS
↓
SMOKE TEST

Do not repeatedly redeploy the same broken commit.

## 42. Common Frontend Deployment Failures

Check:

missing dependency
incorrect build command
wrong root directory
wrong output directory
missing environment variable
incorrect API URL
case-sensitive import
TypeScript error
Node version mismatch
framework configuration

For Vercel, use:

vercel inspect <deployment-url> --logs --wait

to inspect build output.

## 43. Common Backend Deployment Failures

Check:

incorrect start command
PORT handling
missing dependency
missing environment variable
incorrect Python entry point
incorrect Node entry point
Docker build failure
database connection
CORS
health check
runtime exception

Inspect Render deployment and runtime logs before modifying code.

## 44. Docker Deployment

Use Docker for Render when the architecture benefits from it.

Verify:

Dockerfile
.dockerignore
build context
base image
dependencies
PORT
CMD / ENTRYPOINT
environment variables

Build locally before deployment:

docker build .

Run locally when practical:

docker run ...

Do not add Docker solely because the project can use Docker.

## 45. Docker + Render

If Render uses Docker:

GitHub
↓
Render
↓
Docker build
↓
Container
↓
Health check

Inspect:

Docker build logs
container startup logs
runtime logs
health check

Ensure the application listens on the correct Render-provided port.

## 46. Deployment Monitoring

The deployment agent must actively monitor deployments.

Never execute:

deploy

and immediately declare:

success

Instead:

deploy
↓
wait
↓
inspect build
↓
inspect runtime
↓
health check
↓
production smoke test

For Vercel:

vercel inspect <deployment-url> --wait
vercel inspect <deployment-url> --logs --wait

For Render:

render deploys create <SERVICE_ID> --wait
render logs ...

## 47. Log Analysis Rules

When reading logs:

Find the earliest meaningful error.
Ignore downstream cascading errors until the root cause is understood.
Identify whether the issue is:
code
dependency
environment
configuration
infrastructure
external provider
Reproduce locally where possible.
Fix the root cause.
Redeploy.
Verify that the original error disappeared.

Never blindly modify code based on the last line of a log.

## 48. Production Smoke Test

After both deployments:

1. Open Vercel URL.
2. Verify page loads.
3. Open browser console.
4. Check network requests.
5. Verify Render API URL.
6. Call backend health endpoint.
7. Test authentication.
8. Test core API.
9. Test database operation.
10. Test AI feature.
11. Test required external integration.
12. Complete the main user journey.

The entire flow must work as a real user would experience it.

49. Browser Verification

Use Chrome DevTools MCP where available.

Inspect:

Console
Network
Application
Storage
Performance

Look specifically for:

CORS errors
404s
500s
failed API requests
mixed-content errors
missing assets
authentication failures
JavaScript exceptions

## 50. Final Deployment URLs

Maintain:

docs/DEPLOYMENT.md

Example:

# Deployment

## Frontend

Platform:
Vercel

URL:
<production-url>

## Backend

Platform:
Render

URL:
<backend-url>

Health:
<backend-url>/health

## Database

Platform:
Supabase

Project:
<hackathon-project>

## Deployment Commit

Commit:
<sha>

## Status

Production Ready

Never put secret values in this document.

## 51. Deployment Documentation

Document:

frontend platform
frontend URL
backend platform
backend URL
health endpoint
deployment branch
deployment commit
required environment variable names
build command
start command
known limitations

Do not document actual secret values.

## 52. Deployment Rollback / Recovery

If the latest deployment breaks production:

Identify last known good deployment
↓
Stop further changes
↓
Restore/redeploy known good version
↓
Verify production
↓
Diagnose broken deployment
↓
Fix
↓
Redeploy

Never continue stacking experimental fixes onto a broken production deployment during the final hackathon window.

## 53. Deployment Freeze

Before final demo:

DEPLOYMENT FREEZE

After freeze:

Only allow:

BLOCKER FIXES
CRITICAL FIXES
DEMO RELIABILITY FIXES

Avoid:

new architecture
new framework
new database
new deployment platform
major refactor
unnecessary dependency

## 54. Multi-Agent Deployment Safety

Only one designated agent should control production deployment at a time.

Recommended responsibility:

Project Lead / Deployment Agent
↓
Production deployment

Other agents may:

prepare code
fix bugs
prepare configs
inspect logs
suggest changes

but should not simultaneously deploy production.

This prevents:

Agent A deploys
Agent B deploys
Agent C changes env
Agent A redeploys

and creates an unpredictable production state.

## 55. Human Approval Gates

Require human approval before:

creating a new paid cloud resource
changing billing/plan
deleting a cloud resource
deleting a deployment/service
changing production database
rotating critical production credentials
making destructive infrastructure changes
switching deployment providers

Routine deployment of an already-approved project may proceed automatically when the user has explicitly authorized the deployment workflow.

## 56. No Secret Exfiltration

The deployment agent must never:

print secret values
copy secrets into chat
commit secrets
include secrets in logs
expose server secrets to frontend
place secrets in screenshots
place secrets in documentation
echo environment variable values unnecessarily

When debugging:

GOOD:
SUPABASE_URL is configured.

BAD:
SUPABASE_SERVICE_ROLE_KEY=eyJ...

## 57. Deployment Time Strategy

During an 18-hour hackathon:

### Phase 1

Prepare deployment configuration early.

frontend build
backend build
health endpoint
environment variable list

### Phase 2

Deploy when P0 functionality is stable.

Vercel preview
Render deployment

### Phase 3

Integrate.

Vercel
↓
Render
↓
Supabase

### Phase 4

Production deployment.

Vercel --prod
Render production

### Phase 5

Final QA.

smoke test
logs
browser
core flow

### Phase 6

Deployment freeze.

## 58. Deployment Checklist

Before deployment:

[ ] Git clean
[ ] Correct branch
[ ] Correct commit
[ ] Frontend build passes
[ ] Backend starts locally
[ ] Environment variables documented
[ ] Secrets protected
[ ] Health endpoint exists
[ ] API contract verified
[ ] Supabase connection verified
[ ] AI provider verified

## 59. Vercel Checklist

[ ] Vercel CLI installed
[ ] Vercel authenticated
[ ] Correct account
[ ] Correct team/scope
[ ] Correct project linked
[ ] Correct frontend directory
[ ] Build passes
[ ] Environment variables configured
[ ] Preview deployed
[ ] Preview tested
[ ] Build logs reviewed
[ ] Production deployed
[ ] Production logs reviewed
[ ] Production URL tested

## 60. Render Checklist

[ ] Render CLI installed
[ ] Render authenticated
[ ] Correct workspace
[ ] Correct service
[ ] Correct repository
[ ] Correct branch
[ ] Correct root directory
[ ] Correct runtime
[ ] Correct build command
[ ] Correct start command
[ ] PORT handled
[ ] Environment variables configured
[ ] Health check configured
[ ] Deployment triggered
[ ] Deployment logs reviewed
[ ] Runtime logs reviewed
[ ] Health endpoint verified
[ ] Production API verified

## 61. Full Production Checklist

### FRONTEND

[ ] Vercel deployment successful
[ ] Production URL works
[ ] Assets load
[ ] Browser console clean
[ ] API URL correct

### BACKEND

[ ] Render deployment successful
[ ] Service healthy
[ ] Health endpoint works
[ ] Runtime logs clean
[ ] API endpoints work

### DATABASE

[ ] Supabase connection works
[ ] Correct project
[ ] RLS works
[ ] Required tables exist

### AI

[ ] AI provider reachable
[ ] Credentials configured
[ ] Core AI request works
[ ] AI response handled correctly

### INTEGRATIONS

[ ] External APIs work
[ ] Authentication works
[ ] File uploads work if required

### SECURITY

[ ] No secrets exposed
[ ] CORS configured
[ ] Auth enforced
[ ] Authz enforced

### DEMO

[ ] Core user journey works
[ ] Demo account/data ready
[ ] Production URLs recorded
[ ] Backup/recovery plan ready

## 62. Final End-to-End Verification

The final deployment test must simulate the judge.

Perform:

Open Vercel URL
↓
Load application
↓
Authenticate
↓
Perform core action
↓
Frontend calls Render
↓
Render validates request
↓
Render calls Supabase / AI / external API
↓
Backend returns response
↓
Frontend renders result
↓
User completes core workflow

If this complete chain works, the production system has passed the primary deployment verification.

## 63. Definition of Done

Deployment is complete only when:

frontend is successfully deployed to Vercel
backend is successfully deployed to Render
correct accounts/projects/workspaces are confirmed
production environment variables are configured
build logs are reviewed
runtime logs are reviewed
backend health endpoint works
frontend can communicate with backend
backend can communicate with Supabase
AI/external integrations work
authentication/authorization work
production smoke test passes
core user journey passes
deployment URLs are documented
deployed commit is known
no secrets are exposed
the application is ready for the final demo

## 64. Final Deployment Workflow

Always follow this sequence:

READ ARCHITECTURE
↓
READ REQUIREMENTS
↓
VERIFY GIT STATE
↓
VERIFY LOCAL BUILD
↓
VERIFY ENVIRONMENT VARIABLES
↓
VERIFY VERCEL CLI
↓
VERIFY RENDER CLI
↓
VERIFY VERCEL ACCOUNT
↓
VERIFY RENDER WORKSPACE
↓
VERIFY PROJECT/SERVICE
↓
DEPLOY FRONTEND PREVIEW
↓
INSPECT VERCEL BUILD LOGS
↓
TEST FRONTEND
↓
DEPLOY BACKEND
↓
STREAM RENDER DEPLOYMENT LOGS
↓
VERIFY HEALTH ENDPOINT
↓
VERIFY BACKEND LOGS
↓
CONNECT FRONTEND → BACKEND
↓
RUN END-TO-END TEST
↓
DEPLOY FRONTEND TO PRODUCTION
↓
VERIFY PRODUCTION LOGS
↓
VERIFY PRODUCTION URL
↓
RUN PRODUCTION SMOKE TEST
↓
RECORD DEPLOYMENT DETAILS
↓
DEPLOYMENT FREEZE
↓
FINAL DEMO READY

## 65. Critical Deployment Rule

Never declare:

"Deployment successful"

merely because the CLI returned a deployment URL.

Deployment success means:

Build

- Deployment
- Runtime
- Health
- Integration
- Production Smoke Test
- Core User Journey

all work successfully.

The deployment agent must verify the actual running product, not merely the cloud platform's deployment status.
