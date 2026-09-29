---
trigger: always_on
---

---

trigger: always_on
description: Security rules for the hackathon project. Protect secrets, authentication, authorization, databases, APIs, and external services.

---

# Hackathon Security Rules

## Secrets

- Never expose API keys, access tokens, passwords, private keys, or service-role credentials in source code.
- Never commit `.env`, `.env.local`, or files containing real secrets.
- Never print secrets in terminal output, logs, responses, screenshots, or documentation.
- Use environment variables for secrets.
- Frontend code must never contain server-only credentials.
- Supabase service-role keys must never be exposed to the browser.

## Authentication & Authorization

- Never assume authentication means authorization.
- Verify that users are permitted to access the requested resource.
- Do not expose another user's private data.
- Protect privileged operations on the server.

## Database

- Treat all external input as untrusted.
- Use parameterized queries or the database client's safe query mechanisms.
- Do not perform destructive schema changes without human approval.
- Do not drop production tables or data during debugging.

## APIs

- Validate incoming data.
- Reject malformed or unexpected input.
- Return safe error messages.
- Do not expose stack traces, credentials, internal paths, or database details to clients.
- Apply appropriate authentication and authorization to protected endpoints.

## File Uploads

If file uploads are implemented:

- Validate file type and size.
- Do not trust client-provided MIME types alone.
- Prevent path traversal.
- Store uploaded files safely.
- Do not execute uploaded files.

## AI / LLM Features

- Never send secrets to an LLM.
- Validate structured model output before using it in application logic.
- Treat model-generated text as untrusted input.
- Do not allow model output to directly execute arbitrary system commands.

## Dependencies

- Avoid unnecessary dependencies.
- Prefer maintained packages.
- Investigate security warnings before ignoring them.

## Destructive Operations

Require human approval before:

- Deleting production data
- Dropping database tables
- Revoking credentials
- Changing production authentication
- Removing critical infrastructure
- Force-pushing Git history
- Deleting major project directories

When uncertain whether an operation is destructive, stop and ask.
