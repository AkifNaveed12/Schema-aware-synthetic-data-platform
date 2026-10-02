# DataVault Phase 1 — Domain, Infrastructure, Communication & Deployment Safety

**Akif:** backend, AI, integration, deployment, architecture, planning.  
**Hamza:** frontend, UI/UX, QA, system testing, security validation.  
**Rule:** production stays live; work is branch/preview-first; do not disturb the existing ML/queue architecture.

## Objective
Move to `https://datavault.vercel.app`, establish dedicated project email, repair transactional email, harden production configuration, and create safe rollback/health procedures.

## PART 1 — AKIF
### 1. Baseline and rollback
- Record current Vercel/Render/Supabase/queue/worker state.
- Record environment-variable **names only**; never commit secrets.
- Tag the last known-good deployment.
- Smoke-test auth, upload, generation, validation, regeneration, export, email.

### 2. Dedicated email
Create:
- `info.datavault@gmail.com` for public/general communication.
- A separate DataVault-specific Gmail identity for transactional/operations, e.g. `datavault.team@gmail.com` if available.

The actual Gmail/App Password creation procedure is intentionally kept outside the project documentation. Store credentials only in the approved secret store/environment variables and never in the repository or agent prompts.

### 3. Email repair
Trace: `Frontend → Backend → Email service → SMTP/API → mailbox`.
Verify host, port, TLS, credentials, sender, recipient, Render env vars, timeout, errors and attachments. Never expose credentials to the browser. Return safe errors with request IDs.

### 4. URL migration
Change the production frontend identity to `https://datavault.vercel.app`. Search the repository for the old Vercel URL, old API URL, `HackData`, and `hackdata`; classify each occurrence before changing it.

### 5. Render and CORS
Update production environment variables with the new frontend URL. Production CORS must explicitly allow the real frontend instead of broadly allowing arbitrary Vercel subdomains.

### 6. Health/readiness
Keep liveness and readiness endpoints. Readiness should check critical configuration/dependencies without performing expensive AI work.

### 7. Supabase keep-active
Supabase Free projects can pause after low database activity over a 7-day period; a few database requests per day typically help avoid inactivity pausing, but this is not a guarantee. Use a very small scheduled DB health operation. Prefer Supabase Cron/pg_cron when available; otherwise use a controlled external scheduler calling a lightweight health endpoint. Never run expensive queries.

### 8. Deployment safety
Use `branch → tests → preview → smoke test → production`. No destructive DB changes without explicit approval. Roll back immediately if critical flows regress.

## PART 2 — HAMZA
- Verify all visible branding says DataVault.
- Verify no old hostname appears in UI.
- Test contact/email UI: loading, success, error, validation, mobile.
- Verify no secrets/API credentials exist in frontend bundles.
- Test unauthorized CORS origin.
- Run production smoke test: landing → auth → upload → generate → validate → regenerate → export → email.

## Exit criteria
- `datavault.vercel.app` live.
- Render CORS correct.
- Dedicated email works.
- Raw email credentials removed from old path.
- Health/readiness work.
- Supabase keep-active mechanism configured or explicitly monitored.
- Production smoke test passes.
- Rollback path documented.
- Existing generation architecture unchanged.

**Release:** `v1.0.1 — Infrastructure & Communication Hardening`
