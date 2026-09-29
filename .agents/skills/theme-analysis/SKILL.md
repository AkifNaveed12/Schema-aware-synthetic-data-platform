---
name: theme-analysis
description: Analyzes the official hackathon theme/problem-statement PDF or document from end to end. Converts the source to Markdown with Microsoft MarkItDown, extracts mandatory requirements, problem definition, users, constraints, judging criteria, UI/UX rules, backend/API/AI requirements, bonus features, differentiators, technical restrictions, deliverables, and implementation opportunities, then produces structured project documentation. Use when the official hackathon theme document is first provided or when requirements need to be re-analyzed.
---

# Hackathon Theme Analysis

## Mission

Transform the official hackathon theme/problem-statement document into a complete, structured, implementation-ready understanding of the challenge.

The output of this skill becomes the primary source of truth for subsequent architecture, frontend, backend, AI, QA, and deployment work.

The goal is not merely to summarize the document.

The goal is to answer:

> "What exactly must we build, what are we allowed or required to build it with, what will be judged, what is mandatory, what is optional, what can differentiate our solution, and how should the final product behave?"

---

# 1. Source-of-Truth Principle

The original hackathon PDF/DOCX is the authoritative source.

Never silently invent requirements.

Clearly distinguish between:

### MANDATORY

Explicitly required by the official document.

### OPTIONAL / BONUS

Explicitly mentioned as optional, bonus, extra credit, enhancement, or additional functionality.

### OPPORTUNITY

Not explicitly required, but reasonably derived from the documented problem and potentially valuable as an additional implementation.

### ASSUMPTION

Information required for implementation but not explicitly specified.

Assumptions must be clearly labeled and must not be presented as official requirements.

---

# 2. Input Handling

The skill may receive:

- PDF
- DOCX
- PPTX
- TXT
- Markdown
- Other supported document formats

If the user provides a document, first identify:

- File name
- File type
- File location
- Number of pages/slides where available
- Whether the document appears text-based or image/scanned

Do not begin substantive requirement extraction until the source has been processed sufficiently.

---

# 3. Convert Source to Markdown

For PDF, DOCX, PPTX, or other supported document formats, use Microsoft's MarkItDown as the preferred first-pass conversion tool.

If MarkItDown is not installed, verify before installing.

Preferred installation:

```powershell
python -m pip install "markitdown[pdf,docx,pptx]"
```

If broader format support is required:

```powershell
python -m pip install "markitdown[all]"
```

Convert the source:

```powershell
markitdown "PATH_TO_SOURCE" -o "docs/theme-source.md"
```

For example:

```powershell
markitdown "docs/theme.pdf" -o "docs/theme-source.md"
```

Do not overwrite the original source document.

## 4. Verify Conversion

After conversion:

1. Confirm theme-source.md exists.
2. Inspect its beginning.
3. Inspect its end.
4. Check headings.
5. Check tables.
6. Check numbered requirements.
7. Check lists.
8. Check unusual formatting.
9. Compare document page count with extracted
10. structure where possible.
11. Look for signs of missing content.

If important information appears missing:

1. Inspect the original document.
2. Inspect relevant pages visually if available.
3. Re-run conversion with appropriate options.
4. Use OCR when necessary.
5. Do not continue as though the missing information does not exist.

MarkItDown is an extraction aid, not the authority itself.

## 5. Visual Content Verification

Pay special attention to:

- UI screenshots
- Architecture diagrams
- Flowcharts
- Tables embedded as images
- Color palettes
- Wireframes
- Logos
- Layout examples
- Screens containing required UI structures
- Scanned pages
- Image-based text

If a visual contains requirements that are not represented accurately in Markdown, inspect the original source and document those requirements separately.

Never assume that text extraction captured every visual requirement.

## 6. Read the ENTIRE Document

Analyze the complete source.

Do not stop after discovering the main idea.

Do not analyze only the first few pages.

Do not ignore appendices, tables, footnotes, diagrams, evaluation criteria, or final pages.

The analysis must cover:

1. Introduction
2. Problem statement
3. Context
4. Objectives
5. Requirements
6. User/persona information
7. Constraints
8. Technical requirements
9. UI/UX requirements
10. Backend requirements
11. API requirements
12. AI/ML requirements
13. Security requirements
14. Data requirements
15. Bonus features
16. Evaluation criteria
17. Judging criteria
18. Submission requirements
19. Deliverables
20. Restrictions
21. Appendices
22. Any examples provided

## 7. Extract the Core Problem

Determine:

1. What real-world problem is being solved?
2. Who experiences the problem?
3. Why does the problem matter?
4. What is the current pain point?
5. What is the expected solution?
6. What is the expected outcome?

Write a concise problem statement without changing its meaning.

## 8. Identify Target Users

Extract all explicitly mentioned users.

For each user type identify:

- Who they are
- Their goals
- Their pain points
- Their expected interactions
- Their permissions if specified

Do not invent user roles unless clearly marked as assumptions.

## 9. Extract Functional Requirements

Create a complete list of functionality explicitly required by the document.

Use IDs:

FR-001
FR-002
FR-003
...

For each requirement record:

- ID
- Requirement
- Description
- Source location
- Priority
- Mandatory/Optional status

Do not merge distinct requirements merely to make the list shorter.

## 10. Extract Non-Functional Requirements

Look specifically for:

- Performance
- Reliability
- Security
- Accessibility
- Scalability
- Availability
- Privacy
- Response time
- Device compatibility
- Browser compatibility
- Localization
- Language support
- Data retention
- Compliance

Use IDs:

NFR-001
NFR-002
...

## 11. Extract UI/UX Requirements

This is a CRITICAL section.

Search the entire document for anything related to:

- Layout
- Page structure
- Navigation
- Screen structure
- Components
- Colors
- Typography
- Branding
- Spacing
- Buttons
- Cards
- Forms
- Tables
- Dashboards
- Icons
- Images
- Animations
- Responsive behavior
- Accessibility
- Required visual elements
- Prohibited visual elements
- Design examples
- Screenshots
- Wireframes
- Design systems

Every explicit UI requirement must be recorded.

Use IDs:

UI-001
UI-002
UI-003
...

Each requirement must contain:

- ID
- Requirement
- Exact constraint
- Mandatory/Optional
- Source
- Implementation implication
- Verification method

Never treat an explicit UI restriction as a suggestion.

## 12. Extract Backend Requirements

Search specifically for:

- Required backend framework
- Required database
- Required authentication
- Required authorization
- Required storage
- Required server-side processing
- Required APIs
- Required integrations
- Required architecture
- Required deployment environment
- Required infrastructure
- Required data processing

Use:

BE-001
BE-002
...

If no backend technology is explicitly required, record:

No explicit backend technology specified.

Do not falsely claim that a framework is mandatory.

## 13. Extract API Requirements

Identify:

- Required external APIs
- Required internal API behavior
- API providers
- Authentication requirements
- Request/response expectations
- Rate limits
- Webhooks
- Integration constraints
- Required endpoints
- API-related security requirements

Use:

API-001
API-002
...

## 14. Extract AI / ML Requirements

Look specifically for:

- LLM requirements
- Computer vision
- NLP
- Speech
- Classification
- Recommendation systems
- Prediction
- RAG
- Embeddings
- Agents
- Chatbots
- Multimodal processing
- Required models
- Required providers
- AI evaluation requirements

Separate:

Explicit AI requirements

Required by the document.

Optional AI enhancements

Mentioned as optional.

Potential AI opportunities

Not required but logically useful.

Do not add AI merely for the sake of claiming that the project uses AI.

## 15. Extract Bonus Features

This is a CRITICAL section.

Search the complete document for phrases such as:

- Bonus
- Extra credit
- Optional
- Additional
- Enhancement
- Advanced
- Can also
- Recommended
- Future
- Stretch goal

Create:

BONUS-001
BONUS-002
...

For each:

- Feature
- Source
- Explicit status
- Expected value if stated
- Implementation complexity estimate
- Dependencies
- Suggested phase

Never confuse an explicitly listed bonus with a mandatory requirement.

## 16. Identify Differentiation Opportunities

Identify features or capabilities that could make the implementation more distinctive.

Examples may include:

- Multilingual chatbot
- Voice interface
- Personalized recommendations
- Explainable AI
- Advanced analytics
- Offline support
- Accessibility enhancements
- Smart notifications
- Agentic workflows
- Multimodal interaction
- Intelligent search
- Human-in-the-loop workflows

These must be labeled:

OPPORTUNITY

unless the official document explicitly requires them.

Do not present inferred ideas as hackathon requirements.

## 17. Progressive Feature Strategy

Categorize implementation into:

P0 — Mandatory MVP

Required to satisfy the challenge.

P1 — Mandatory Quality

Required for a polished and reliable submission.

P2 — Explicit Bonus

Officially mentioned bonus/optional features.

P3 — Differentiators

Potential enhancements that can be added if P0/P1 are stable.

P4 — Experimental

Ideas that should only be attempted if significant time remains.

This prevents bonus features from consuming time needed for the mandatory MVP.

## 18. Extract Restrictions

Create a dedicated restrictions section.

Look for:

- Technology restrictions
- Framework restrictions
- API restrictions
- Dataset restrictions
- Model restrictions
- Deployment restrictions
- UI restrictions
- Branding restrictions
- Time restrictions
- Team restrictions
- Submission restrictions
- Prohibited technologies
- Prohibited functionality
- Intellectual-property requirements

Use:

CONSTRAINT-001
CONSTRAINT-002
...

Explicit restrictions override our normal engineering preferences.

## 19. Extract Judging Criteria

Identify exactly how the project will be evaluated.

Extract:

- Criteria
- Weight
- Scoring method
- Required demonstration
- Technical expectations
- Innovation criteria
- UI/UX criteria
- Impact criteria
- Presentation criteria

If weights are provided, preserve them exactly.

Do not invent scoring weights.

## 20. Extract Submission Requirements

Identify:

- Required repository
- Required deployment
- Required documentation
- Required demo
- Required presentation
- Required video
- Required screenshots
- Required forms
- Required links
- Required technologies
- Deadline
- Submission format

Create a submission checklist.

## 21. Architecture Implications

Based strictly on the extracted requirements, identify:

- Frontend requirements
- Backend requirements
- Database requirements
- AI requirements
- API requirements
- Authentication
- Storage
- External services
- Deployment requirements

Do not choose technologies prematurely if the document does not constrain them.

Instead write:

REQUIRED
PREFERRED
OPTIONAL
UNSPECIFIED

## 22. Generate Required Documentation

After analysis, create/update:

docs/
├── theme-source.md
├── REQUIREMENTS.md
├── UI-REQUIREMENTS.md
├── ARCHITECTURE.md
└── TASK-BREAKDOWN.md
REQUIREMENTS.md

Must contain:

- Problem
- Users
- Objectives
- Functional requirements
- Non-functional requirements
- AI requirements
- API requirements
- Backend requirements
- Constraints
- Bonus features
- Judging criteria
- Submission requirements
- Assumptions
- Open questions

## UI-REQUIREMENTS.md

Must contain:

- Every mandatory UI requirement
- Every optional UI requirement
- Layout constraints
- Color constraints
- Typography constraints
- Component requirements
- Navigation requirements
- Responsive requirements
- Prohibited UI patterns
- Source references
- Verification checklist

## ARCHITECTURE.md

Must contain:

- Proposed architecture
- Technology decisions
- Frontend
- Backend
- Database
- APIs
- AI/ML
- Authentication
- External services
- Deployment
- Environment variables
- Major tradeoffs

Architecture decisions must be derived from the requirements.

## TASK-BREAKDOWN.md

Break implementation into:

P0 tasks
P1 tasks
P2 bonus tasks
P3 differentiator tasks

Include dependencies and suggested ownership.

## 23. Stitch Handoff Preparation

After UI requirements have been extracted, prepare a Stitch-ready design specification.

Do not immediately redesign the product freely.

Instead create a structured design prompt containing:

- Product purpose
- Target users
- Required screens
- Required navigation
- Mandatory layout
- Mandatory colors
- Typography
- Components
- Content requirements
- Responsive requirements
- Accessibility requirements
- Restrictions
- Design references
- Required states
- Error states
- Loading states
- Empty states

## Clearly mark:

- MANDATORY

versus:

- DESIGN FREEDOM

The Stitch MCP may then be used to generate/refine the required screens.

If Stitch returns HTML or another implementation format, treat it as a design implementation artifact.

Adapt the result into the project's actual frontend framework rather than blindly copying incompatible code.

If the theme explicitly specifies a framework, use that framework.

If no framework is specified, the Project Lead chooses the stack based on (proritize python based backedn and react frontend if no stack is mentioned):

- Team expertise
- Development speed
- Deployment compatibility
- AI integration requirements
- Hackathon time constraints

## 24. Stitch Compliance Check

Before accepting Stitch-generated screens:

Verify against UI-REQUIREMENTS.md.

Check:

- Required layout
- Required colors
- Required navigation
- Required screens
- Required components
- Branding
- Typography
- Responsive behavior
- Prohibited elements

If Stitch produces a visually attractive design that violates a mandatory hackathon requirement, reject or revise the design.

Hackathon requirements take precedence over Stitch's design suggestions.

## 25. Open Questions

Create an explicit list:

OPEN-001
OPEN-002
...

Include anything ambiguous or requiring human clarification.

Never silently resolve a critical ambiguity.

## 26. Final Analysis Checklist

Before declaring analysis complete, verify:

- Entire document analyzed
- Original source preserved
- Markdown conversion created
- Conversion checked
- Visual content checked where necessary
- Problem identified
- Users identified
- Functional requirements extracted
- Non-functional requirements extracted
- UI requirements extracted
- Backend requirements extracted
- API requirements extracted
- AI requirements extracted
- Security requirements extracted
- Constraints extracted
- Bonus features extracted
- Differentiation opportunities identified
- Judging criteria extracted
- Submission requirements extracted
- Mandatory vs optional clearly separated
- Assumptions clearly separated
- Open questions documented
- REQUIREMENTS.md created
- UI-REQUIREMENTS.md created
- ARCHITECTURE.md created
- TASK-BREAKDOWN.md created
- Stitch-ready design specification prepared

Do not declare the analysis complete if a major section remains unchecked.
