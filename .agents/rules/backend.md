---
trigger: glob
---

---

trigger: glob
globs:

- "backend/\*\*"
- "backend/\*_/_.{js,jsx,ts,tsx}"
- "backend/\*_/_.{py}"
  description: Backend engineering rules for Node.js/Express and Python/FastAPI services.

---

# Backend Engineering Rules

## Core Principle

The backend must prioritize:

1. Correctness
2. Security
3. Reliability
4. Clear API contracts
5. Simple architecture
6. Fast integration
7. Deployment readiness

Do not over-engineer the backend during the hackathon.

---

## Technology Choice

The backend may use:

- Node.js / Express
- Python / FastAPI
- Another framework only when the project requirements justify it.

Do not introduce multiple backend frameworks unnecessarily.

Choose the stack based on:

- Theme requirements
- AI/ML requirements
- Team expertise
- Required libraries
- Deployment constraints
- Development speed

If AI/ML processing is central to the product, Python/FastAPI may be preferred when it materially simplifies implementation.

If the application is primarily web/API-oriented, Node.js/Express may be preferred when it materially simplifies implementation.

The Project Lead should make the final architecture decision.

---

## API Design

Every API endpoint should have:

- Clear purpose
- Clear HTTP method
- Clear request structure
- Clear response structure
- Input validation
- Appropriate status codes
- Error handling

Prefer predictable REST-style APIs unless the project requires another approach.

Example:

```text
GET    /api/resource
GET    /api/resource/:id
POST   /api/resource
PUT    /api/resource/:id
DELETE /api/resource/:id
```

Do not create arbitrary endpoint structures without a reason.

## Input Validation

Treat every external input as untrusted.

Validate:

- Request body
- Query parameters
- URL parameters
- Uploaded files
- Authentication data
- External API responses

Reject malformed input early.

Use appropriate validation libraries where they provide meaningful value.

## Error Handling

Every important endpoint must handle expected failures.

Return structured errors where practical.

Example:

{
"error": "Invalid request",
"message": "The required field is missing."
}

Do not expose:

- Stack traces
- Internal database errors
- File paths
- API keys
- Tokens
- Internal implementation details
  to the client.

Log useful debugging information server-side without exposing secrets.

## Authentication

If authentication is required:

- Use the selected authentication provider consistently.
- Validate authentication server-side.
- Never trust user identity supplied only by the client.
- Distinguish authentication from authorization.
- Protect privileged endpoints.

If Supabase Auth is used, follow the project's established Supabase authentication architecture rather than implementing a second authentication system unnecessarily.

## Authorization

Authentication alone is not sufficient.

For protected resources verify:

- Who the user is.
- What the user is allowed to access.
- Whether the requested resource belongs to or is accessible by that user.

Never rely solely on frontend checks for authorization.

## Supabase

When Supabase is selected as the backend platform:

Prefer Supabase for:

- PostgreSQL
- Authentication
- Storage
- Realtime
- Edge Functions where appropriate

Before changing the schema:

- Inspect the current schema.
- Understand existing relationships.
- Avoid destructive changes.
- Use migrations where appropriate.
- Test affected queries.

Never expose the Supabase service-role key to frontend code.

Use the appropriate client credentials for server-side and client-side contexts.

## Database

Database operations must be:

- Explicit
- Validated
- Safe
- Efficient enough for the expected workload

Avoid:

- Unnecessary queries
- N+1 query patterns
- Unbounded data retrieval
- Destructive queries during development

Use indexes where clearly justified.

Do not prematurely optimize small datasets

## AI / ML APIs

When the backend communicates with an AI/ML service:

- Keep provider credentials server-side.
- Validate inputs before sending them.
- Validate model responses.
- Handle provider failures.
- Handle timeouts.
- Handle rate limits.
- Provide useful fallback behavior when practical.

Do not assume an AI service will always be available.

## File Processing

If the application processes files:

- Validate file type.
- Validate file size.
- Avoid trusting client-provided filenames.
- Prevent path traversal.
- Store files safely.
- Avoid executing uploaded content.
- Clean up temporary files where appropriate.

For image/video/audio processing, consider resource usage and request timeouts.

## External APIs

For third-party APIs:

- Store credentials in environment variables.
- Handle timeouts.
- Handle rate limits.
- Handle non-success responses.
- Validate external responses.
- Avoid unnecessary repeated requests.

Use caching only when it provides a clear benefit.

## Environment Variables

Use environment variables for:

- API keys
- Database URLs
- Authentication secrets
- Service credentials
- Provider configuration
- Deployment-specific configuration

Maintain a safe .env.example.

Never commit real credentials.

## Logging

Logs should help diagnose problems without leaking sensitive information.

Do not log:

- Passwords
- Access tokens
- API keys
- Session secrets
- Full authentication credentials
- Sensitive personal data

Use appropriate log levels.

Avoid excessive logging in production.

## Performance

Prioritize obvious performance problems:

- Unnecessary database queries
- Large unnecessary responses
- Blocking operations
- Repeated external API calls
- Missing pagination for potentially large datasets

Do not introduce complex caching or distributed infrastructure unless required.

## CORS

- Configure CORS deliberately.

- Do not use unrestricted origins in production unless there is a clear reason.

- Prefer explicitly configured frontend origins.

## API Testing

Every critical API flow should be tested using Postman or automated tests.

Verify:

- Successful requests
- Invalid requests
- Unauthorized requests
- Forbidden requests
- Not-found cases
- Server failures
- Edge cases

When an endpoint changes, update relevant tests.

## Health Checks

Where appropriate, provide a simple health endpoint such as:

- GET /health

It should allow deployment infrastructure and developers to determine whether the service is running.

Do not expose sensitive infrastructure information through health checks.

## Docker

When Docker is used:

- Keep the Dockerfile minimal.
- Use an appropriate base image.
- Avoid unnecessary packages.
- Do not place secrets inside Dockerfiles.
- Use environment variables or runtime configuration.
- Ensure the container can run reproducibly.
- Prefer non-root execution where practical.
- Keep .dockerignore updated.

Example structure:

backend/
├── Dockerfile
├── .dockerignore
├── package.json
└── src/

or:

backend/
├── Dockerfile
├── .dockerignore
├── requirements.txt
└── app/

Do not create Docker infrastructure that the project does not actually need.

## Deployment

Before declaring the backend deployable:

- Install dependencies successfully.
- Run tests.
- Build successfully if applicable.
- Verify environment variables.
- Verify database connectivity.
- Verify external API connectivity.
- Verify health endpoint.
- Test critical API endpoints.
- Test the deployed service from the frontend.

Never claim deployment succeeded without verification.

## Integration

When changing an API:

- Identify frontend consumers.
- Identify other backend consumers.
- Update the API contract.
- Update affected clients.
- Run relevant tests.
- Verify the complete user flow.

Do not silently break existing consumers.

## Hackathon Time Constraint

During the hackathon:

- Build the smallest reliable backend that satisfies the requirements.
- Prefer working endpoints over elaborate architecture.
- Avoid unnecessary microservices.
- Avoid unnecessary queues.
- Avoid unnecessary infrastructure.
- Avoid introducing technologies solely to appear technically sophisticated.

A stable monolithic backend is preferable to an unstable distributed architecture unless the requirements genuinely justify otherwise.
