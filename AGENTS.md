# HACKDATA V2 — HACKATHON OPERATING RULES

## 1. Mission

This workspace is the central development environment for an intensive hackathon.

The objective is to transform the official hackathon theme/problem statement into a working, polished, demonstrable product within the available development window.

Agents must prioritize:

1. Correct interpretation of the problem
2. Working MVP functionality
3. Reliable integration
4. Clean and maintainable implementation
5. Security
6. Testing
7. Deployment readiness
8. Demo quality

Avoid unnecessary features, abstractions, dependencies, and infrastructure.

---

## 2. Development Principles

- Prefer simple solutions that can be implemented and verified quickly.
- Do not over-engineer the MVP.
- Do not introduce a technology unless it provides a clear benefit.
- Reuse existing project infrastructure whenever possible.
- Keep the application runnable after every major change.
- Never knowingly leave the repository in a broken state.
- Verify important changes instead of assuming they work.

---

## 3. Agent Responsibilities

Agents operate as specialized members of one engineering team.

Possible responsibilities include:

- Project Lead / Architect
- Requirements Analyst
- UI/UX Designer
- Frontend Engineer
- Backend Engineer
- Database Engineer
- AI/ML Engineer
- API Engineer
- Security Engineer
- QA Engineer
- Integration Engineer
- DevOps / Deployment Engineer
- Documentation Engineer

Agents must stay within their assigned responsibility unless explicitly asked to assist elsewhere.

---

## 4. Project Lead Rules

The Project Lead is responsible for coordination and must:

1. Understand the complete problem statement.
2. Identify the MVP.
3. Establish architecture before major implementation.
4. Break work into independently executable tasks.
5. Track dependencies between tasks.
6. Prevent conflicting implementations.
7. Coordinate integration.
8. Request verification after major milestones.

Do not begin large-scale implementation before requirements and architecture are sufficiently understood.

---

## 5. Theme / Requirement Analysis

When the hackathon theme or problem statement is provided:

1. Read the complete source material.
2. Extract the exact problem.
3. Identify required functionality.
4. Identify constraints.
5. Identify judging criteria if provided.
6. Identify expected users.
7. Identify inputs and outputs.
8. Identify technical requirements.
9. Identify assumptions.
10. Identify ambiguities.

Create structured documentation before implementation.

Never invent requirements that are not supported by the provided material.

---

## 6. Architecture

Before implementation, establish:

- Frontend architecture
- Backend architecture
- API boundaries
- Database schema
- Authentication strategy
- AI/ML components where required
- External services
- Deployment architecture
- Environment variables
- Integration points

Prefer modular architecture without unnecessary complexity.

---

## 7. Git Rules

GitHub is the shared source of truth.

Agents must:

- Inspect the current Git status before significant changes.
- Avoid overwriting unrelated work.
- Make focused changes.
- Use meaningful commit messages when committing.
- Never commit secrets.
- Never commit `.env` files containing credentials.
- Never expose API keys, tokens, passwords, service-role keys, or private credentials.

Before destructive Git operations, obtain human approval.

Never use:

```text
git reset --hard
git clean -fd
git push --force
```

## 8.Database / Supabase Rules

Supabase is the preferred backend platform when the project requires:

- PostgreSQL
- Authentication
- Storage
- Realtime functionality
- Edge Functions

Before modifying the database:

- Understand the existing schema.
- Avoid destructive changes.
- Preserve existing functionality.
- Verify migrations.
  Test important queries.

Never expose Supabase service-role keys to frontend code.

Never place secrets in client-side environment variables.

## 9. API Rules

All APIs must:

- Have clear request/response contracts.
- Validate inputs.
- Handle expected errors.
- Return meaningful status codes.
- Avoid exposing secrets.
- Be testable through Postman or equivalent tooling.

When an API changes, update dependent frontend code and tests.

## 10. Frontend Rules

The frontend must prioritize:

- Responsive design
- Clear navigation
- Accessibility
- Consistent components
- Loading states
- Empty states
- Error states
- Useful feedback
- Mobile compatibility

Do not sacrifice usability for unnecessary visual complexity.

Use the approved design workflow and Stitch when appropriate.

## 11. AI / LLM Rules

When AI functionality is required:

- Clearly define inputs and outputs.
- Use structured responses where possible.
- Validate model output.
- Handle model failures.
- Handle timeouts.
- Never expose API credentials.
- Avoid unnecessary model calls.
- Prefer deterministic behavior where practical.
- Log useful debugging information without logging secrets.

AI-generated output must not be blindly trusted when it affects application logic.

## 12. Security Rules

Treat all external input as untrusted.

Check for:

- Authentication problems
- Authorization problems
- Input validation issues
- SQL injection
- XSS
- CSRF where applicable
- Exposed secrets
- Unsafe file uploads
- Insecure API endpoints
- Excessive permissions
- Sensitive information leakage

Do not weaken security merely to make a feature work.

## 13. Testing Rules

Important functionality must be verified.

Testing may include:

- Unit tests
- API tests
- Integration tests
- Browser tests
- Manual UI verification
- Database verification

At minimum, verify the critical user journey before the final demo.

## 14. Error Handling

When something fails:

- Read the complete error.
- Identify the root cause.
- Make the smallest appropriate fix.
- Re-run the failing operation.
- Verify that the fix did not break related functionality.

Do not repeatedly apply random fixes.

## 15. Dependencies

Before adding a dependency:

- Check whether the functionality already exists.
- Prefer established and maintained packages.
- Avoid unnecessary dependencies.
- Consider installation/deployment impact.

Do not install packages simply because they are popular.

## 16. Environment Variables

Secrets must remain outside source control.

Use:
.env
.env.local
.env.example

where appropriate.

.env.example may contain variable names and safe placeholder values, but never real credentials.

## 17. Deployment

Deployment must be reproducible.

Before deployment:

1. Build the application locally.
2. Run the relevant tests.
3. Verify environment variables.
4. Verify production configuration.
5. Verify API connectivity.
6. Verify database connectivity.
7. Test the deployed application.

Never claim deployment succeeded without verification.

## 18. Communication Between Agents

Agents must communicate through project artifacts rather than assumptions.

Important decisions should be documented.

Use:

docs/

for project documentation.

When an agent completes work, clearly state:

- What changed
- Files changed
- What was verified
- Known limitations
  Any action required from another agent

## 19. Human Approval Gates

Human approval is required before:

- Destructive database operations
- Deleting important files
- Destructive Git operations
- Force pushing
- Exposing credentials
- Changing production infrastructure
- Major architecture changes
- Spending money or enabling paid services

Agents may proceed autonomously with ordinary implementation, testing, debugging, and documentation within the workspace.

## 20. Hackathon Time Management

Prioritize work using:

- P0 — Must Have
  Required for a functioning submission.

- P1 — Important

Significantly improves usability, reliability, or judging criteria.

- P2 — Nice to Have

Only implement if P0 and P1 are stable.

Never allow P2 work to delay P0 functionality.

## 21. Definition of Done

A feature is not complete merely because code was written.

A feature is complete when:

- Implementation exists.
- Dependencies are integrated.
- Errors are handled.
- Relevant tests/checks pass.
- The application still runs.
- Documentation is updated when necessary.
  The feature has been verified.

## 22. Final Demo Requirements

Before the final demo:

- Application must be deployed.
- Critical user journey must work.
- Authentication must work if required.
- Database must work.
- AI functionality must work if required.
- Major errors must be resolved.
- Demo data must be prepared.
- Backup/demo fallback should exist for fragile external services.

The final product should demonstrate the solution to the actual problem rather than merely demonstrating technical complexity.
