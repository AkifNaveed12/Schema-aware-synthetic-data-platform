---
name: supabase-development
description: Develops and manages Supabase-backed applications including PostgreSQL schema, migrations, Row Level Security, authentication, storage, realtime, Edge Functions, seed data, and Supabase MCP operations. Use whenever the project requires Supabase database, authentication, storage, realtime, Edge Functions, or Supabase MCP access.
---

# Supabase Development

## Mission

Use Supabase as a reliable, secure, and rapidly deployable backend platform for the hackathon when the project architecture selects it.

Prioritize:

1. Correct database design
2. Secure access control
3. Reliable authentication
4. Safe migrations
5. Clear integration with the application
6. Fast development
7. Easy testing
8. Deployment readiness

Do not introduce unnecessary Supabase features.

---

# 1. Source of Truth

Before modifying Supabase, inspect:

```text
docs/REQUIREMENTS.md
docs/ARCHITECTURE.md
```

Also inspect the current Supabase project before making changes.

Never assume the database schema, authentication model, storage structure, or existing policies.

## 2. Supabase Organization

The dedicated hackathon organization is:

Hackathon-projects

Use this organization for the hackathon project when the architecture requires Supabase.

Do not modify unrelated projects or organizations.

The following existing organizations/projects are outside the hackathon scope unless explicitly authorized:

AkifNaveed12's Org
Semester4-Projects

Never assume access to unrelated projects is required.

## 3. Project Scope

The preferred architecture is:

Hackathon-projects
└── Hackathon Supabase Project

Keep the hackathon backend isolated from unrelated projects.

If multiple Supabase projects become necessary, document why.

Do not create additional projects merely for experimentation.

## 4. Supabase MCP

When Supabase MCP is available:

Use it for appropriate operations such as:

Inspecting project structure
Inspecting database schema
Inspecting tables
Inspecting functions
Inspecting storage
Inspecting project configuration
Performing approved development operations

Prefer project-scoped access whenever possible.

Do not use broad organization-level access when a project-specific scope is sufficient.

## 5. MCP Safety

Before a destructive or potentially irreversible operation:

Identify the target project.
Identify the target resource.
Explain the operation.
Verify that it is part of the current hackathon project.
Request human approval when required.

Do not blindly execute:

DROP TABLE
DROP SCHEMA
DELETE large datasets
RESET database
destructive migrations
credential revocation

Never modify an unrelated Supabase project.

## 6. Project Identification

Before performing database operations, verify the active project.

Record:

Project:
Project Reference:
Organization:
Environment:

If the target project is unclear:

STOP.

Do not guess.

## 7. Database Design

Design the schema from actual application requirements.

For each table determine:

Purpose
Primary key
Foreign keys
Required fields
Nullable fields
Unique constraints
Default values
Indexes
Relationships
Ownership
Access policy

Prefer normalized relational design unless denormalization has a clear benefit.

## 8. Naming Conventions

Use consistent naming.

Preferred:

snake_case

Examples:

user_profiles
project_members
chat_messages
created_at
updated_at

Use clear names.

Avoid:

table1
data
temp
stuff
new_table

## 9. Primary Keys

Prefer stable primary keys.

For distributed applications, UUIDs are generally preferred when appropriate.

Example:

id uuid primary key default gen_random_uuid()

Do not introduce custom ID systems unless required.

## 10. Timestamps

For important entities, prefer:

created_at
updated_at

Use database-generated timestamps where appropriate.

Store timestamps consistently.

Prefer UTC storage semantics unless the application requirements require another strategy.

## 11. Relationships

Explicitly define relationships using foreign keys where appropriate.

Example:

users
│
├── projects
│ │
│ └── tasks
│
└── profiles

Do not duplicate relational data unnecessarily.

## 12. Indexing

Add indexes when justified by:

Frequent filtering
Foreign keys
Sorting
Search patterns
Unique constraints
Expected query volume

Do not create indexes on every column.

Optimize based on actual access patterns.

## 13. Row Level Security

RLS is a critical security layer.

For user-owned data:

User
↓
Authenticated request
↓
RLS policy
↓
Authorized rows

Enable RLS for sensitive application tables where appropriate.

Do not assume that hiding data in the frontend is security.

## 14. RLS Policy Design

For each protected table determine:

Who can SELECT?
Who can INSERT?
Who can UPDATE?
Who can DELETE?

Example ownership model:

auth.uid() = user_id

Policies must reflect actual application authorization requirements.

Do not create overly broad policies such as:

authenticated users can access everything

unless the requirements genuinely require it.

## 15. Public Data

If a table contains intentionally public information:

Clearly document that it is public.
Limit the exposed fields.
Avoid storing secrets or private information in public tables.

Do not make a table public simply to make frontend development easier.

## 16. Service Role Key

The Supabase service-role key is server-only.

NEVER expose it in:

React code
Browser JavaScript
HTML
Public repositories
Client-side environment variables
Screenshots
Documentation
Logs

It must only be used in trusted server-side environments where required.

## 17. Supabase Client Keys

Use the appropriate Supabase client configuration.

Frontend applications may use the public/anonymous key where appropriate and where RLS protects the data.

Do not confuse:

SUPABASE_ANON_KEY

with:

SUPABASE_SERVICE_ROLE_KEY

The service-role key must remain private.

## 18. Authentication

When Supabase Auth is used:

Determine:

Sign-up requirements
Login requirements
Logout
Password recovery
Email verification
Social providers if required
Session handling
Protected routes
User roles

Do not implement a second authentication system unless required.

## 19. Authorization

Authentication does not equal authorization.

For privileged actions verify:

Authenticated?
↓
Correct user?
↓
Correct role?
↓
Allowed resource?
↓
Perform operation

Use database policies and server-side authorization where appropriate.

Never trust role information supplied only by the browser.

## 20. User Profiles

If additional user information is required, prefer a profile table linked to the authenticated user.

Example:

auth.users
│
└── public.profiles

Use the authenticated user's stable identifier as the relationship where appropriate.

## 21. Storage

Use Supabase Storage when the application requires:

Images
Documents
Audio
Video
User uploads

Before creating a bucket determine:

Public or private
Allowed file types
Maximum file size
Ownership
Access policy
Naming strategy

## 22. File Upload Security

Never trust:

File extension
Client MIME type
Filename

Validate files server-side or through appropriate trusted mechanisms.

Prevent:

Oversized uploads
Path traversal
Dangerous file types
Unauthorized file access

If files contain sensitive data, use private buckets and controlled access.

## 23. Realtime

Use Supabase Realtime only when the application actually requires live updates.

Examples:

Chat
Collaboration
Live dashboards
Notifications
Presence

Do not enable realtime for every table by default.

## 24. Edge Functions

Use Edge Functions when they provide a clear benefit for:

Server-side logic
Webhooks
Secure API integrations
Lightweight processing
Operations that should not run in the browser

Do not move all backend logic into Edge Functions automatically.

If a full backend service is already present, avoid unnecessary duplication.

## 25. AI Integration

When Supabase interacts with AI functionality:

Frontend
↓
Backend / Edge Function
↓
AI Provider
↓
Validated result
↓
Supabase

Never put private AI credentials in frontend code.

Validate AI-generated data before storing it.

## 26. Migrations

Database changes should be reproducible.

Prefer migrations over manually changing production schema without documentation.

Each meaningful schema change should be represented clearly.

Example:

create_profiles.sql
add_chat_messages.sql
add_user_roles.sql

Migration names should describe the change.

## 27. Migration Safety

Before applying a migration:

Inspect the existing schema.
Determine dependencies.
Identify destructive operations.
Check affected application code.
Apply the migration.
Verify the resulting schema.
Test affected functionality.

Destructive migrations require human approval.

## 28. Destructive Operations

Require explicit human approval before:

DROP TABLE
DROP SCHEMA
TRUNCATE
DROP COLUMN
mass DELETE
mass UPDATE

Also require approval for operations that could cause data loss even if they are technically reversible.

Never use destructive operations simply to solve a development error.

## 29. Seed Data

For development/demo data:

Make it deterministic where possible.
Keep it clearly separate from production data.
Do not include real personal information.
Do not include real credentials.
Make it easy to recreate.

Example:

supabase/seed.sql

## 30. Database Testing

Test:

Table creation
Relationships
Constraints
RLS policies
Authentication
CRUD operations
Unauthorized access
Invalid input
Important queries

A successful database connection does not prove that authorization is correct.

## 31. API Integration

When the backend uses Supabase:

Document:

Frontend
↓
Backend/API
↓
Supabase

or:

Frontend
↓
Supabase Client
↓
Supabase

depending on the architecture.

Do not create an unnecessary API layer.

## 32. Environment Variables

Typical variables may include:

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

Only define variables actually required by the application.

The service-role key must only exist in trusted server environments.

Never commit real values.

## 33. Local Development

If local Supabase development is used:

Prefer the official Supabase CLI/local development workflow.

Docker may be used because the Supabase local stack depends on containers.

However:

Do not run the local Supabase stack unnecessarily.
Do not consume system resources without a reason.
Do not confuse local Supabase with the hosted hackathon project.

Clearly distinguish:

LOCAL SUPABASE
vs
HOSTED HACKATHON SUPABASE

## 34. Docker

When Supabase local development requires Docker:

Verify Docker is available before starting the local stack.

Do not install another PostgreSQL container if the Supabase local stack already provides the required database.

Avoid duplicate database infrastructure.

## 35. Production Data Protection

Before production deployment:

Verify RLS.
Verify authentication.
Verify authorization.
Verify storage policies.
Verify environment variables.
Verify CORS where applicable.
Verify no service-role key reaches the frontend.
Verify test data is not accidentally exposed.

## 36. Supabase MCP Workflow

When using Supabase MCP:

Inspect

First inspect the current project.

Plan

Determine the required change.

Execute

Perform the smallest safe operation.

Verify

Inspect the result.

Test

Run the affected application flow.

The workflow is:

Inspect
↓
Plan
↓
Approve if destructive
↓
Execute
↓
Verify
↓
Test

Never:

Guess
↓
Modify
↓
Hope

## 37. Common MCP Operations

MCP may be used to:

Inspect schemas
Inspect tables
Inspect database objects
Inspect project configuration
Inspect functions
Inspect storage
Execute approved development operations
Debug database issues

Use the smallest required operation.

Do not call broad operations when a targeted operation is sufficient.

## 38. Debugging Database Problems

When a database operation fails:

Read the complete error.
Identify whether the issue is:
Schema
Permission
RLS
Authentication
Query
Connection
Migration
Data validation
Inspect the relevant object.
Make the smallest fix.
Re-run the failing operation.
Verify related application flows.

Do not disable RLS simply because it causes an error.

## 39. Performance

For important queries inspect:

Selected columns
Filters
Joins
Indexes
Returned row count
Pagination

Avoid:

SELECT \*

when a smaller projection is sufficient.

Avoid loading large datasets into the frontend unnecessarily.

## 40. Pagination

For potentially large datasets use pagination.

Examples:

limit
offset
cursor
range

Choose the simplest approach appropriate for the application.

Do not load thousands of rows simply because the current dataset is small.

## 41. Demo Reliability

Before the final hackathon demo verify:

Authentication
Database connectivity
Required tables
RLS
Storage
AI integrations
Seed/demo data
Critical queries
Frontend integration
Production environment variables

The demo should not depend on manually fixing the database immediately before presenting.

## 42. Final Supabase Checklist

Before declaring Supabase integration complete:

Correct organization verified
Correct project verified
Schema documented
Relationships verified
RLS reviewed
Authentication verified
Authorization verified
Storage verified if used
Realtime verified if used
Edge Functions verified if used
Migrations documented
Seed data prepared if needed
Environment variables documented
Secrets protected
Service-role key protected
Database tests passed
Frontend integration tested
Backend integration tested
Production configuration verified
Supabase MCP target verified
No unrelated projects modified

## 43. Final Rule

Supabase should make the hackathon faster, not more complicated.

Prefer:

Simple schema

- Secure RLS
- Clear authentication
- Minimal backend
- Reliable integration

over unnecessary:

Complex database architecture

- Multiple databases
- Unnecessary Edge Functions
- Unnecessary realtime
- Unnecessary infrastructure

Always protect data first, then optimize for development speed.
