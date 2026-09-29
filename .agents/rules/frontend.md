---
trigger: always_on
---

---

trigger: glob
globs:

- "frontend/\*\*"
- "frontend/\*_/_.{js,jsx,ts,tsx}"
- "frontend/\*_/_.{css,scss}"
- "frontend/\*_/_.html"
  description: Frontend engineering rules for the hackathon application.

---

# Frontend Engineering Rules

## Architecture

- Keep frontend code modular and component-based.
- Separate UI components, pages, hooks, utilities, API clients, and state management where appropriate.
- Avoid unnecessary abstractions for simple functionality.
- Reuse existing components before creating duplicates.

## UI/UX

Prioritize:

- Clear visual hierarchy
- Responsive layouts
- Consistent spacing
- Accessible controls
- Clear navigation
- Useful loading states
- Useful empty states
- Useful error states
- Mobile compatibility

The interface should feel like a finished product rather than a technical prototype.

## Design

- Use Stitch for generating or refining UI concepts when appropriate.
- Follow the established project design system once one exists.
- Keep typography, spacing, borders, radius, and component behavior consistent.
- Do not introduce random colors or styles for individual components.
- Avoid unnecessary gradients, animations, or visual effects unless they support the product.

## Components

Components should have a clear responsibility.

Avoid:

- Huge monolithic components
- Repeated UI markup
- Duplicated API logic
- Hard-coded data that should come from the backend

Extract reusable components when repetition becomes meaningful.

## API Integration

- Keep API calls separate from presentation logic where practical.
- Handle loading, success, empty, and error states.
- Validate and safely handle API responses.
- Never expose private API credentials in frontend code.
- Never use server-only secrets in client-side code.

## Forms

Forms must:

- Validate user input.
- Display useful validation errors.
- Prevent accidental duplicate submissions.
- Show loading/submission state.
- Handle server-side validation errors.

## Accessibility

Use semantic HTML where appropriate.

Interactive elements must be keyboard accessible.

Provide:

- Labels for form controls
- Useful button text
- Alternative text for meaningful images
- Visible focus states
- Appropriate headings

Do not rely exclusively on color to communicate important information.

## Responsive Design

Verify the UI at:

- Desktop
- Tablet
- Mobile

Avoid layouts that depend on a single screen resolution.

## Performance

- Avoid unnecessary network requests.
- Avoid unnecessary re-renders where practical.
- Optimize large images and assets.
- Lazy-load expensive resources when appropriate.
- Do not prematurely optimize simple components.

## Error Handling

Frontend errors must provide useful feedback to the user.

Do not expose:

- Stack traces
- Internal server errors
- Credentials
- Database details
- Internal file paths

## Browser Verification

After significant UI changes:

1. Start the application.
2. Open it in the browser.
3. Verify the affected flow.
4. Check browser console errors.
5. Check responsive behavior when relevant.

Use Chrome DevTools MCP when it materially helps with browser debugging or verification.

## Production Readiness

Before considering frontend work complete:

- Application builds successfully.
- No obvious console errors remain.
- Critical flows work.
- Loading and error states work.
- Responsive behavior is acceptable.
- No secrets are present in client-side code.

## Mandatory Hackathon UI/UX Requirements

The official hackathon theme/problem-statement document is the **authoritative source of truth for all mandatory UI/UX requirements**.

The theme document may specify requirements such as:

- Required page or screen structure
- Mandatory layouts
- Required navigation structure
- Specific colors or color combinations
- Typography requirements
- Branding requirements
- Component placement
- Button styles
- Card structures
- Spacing or alignment requirements
- Required visual elements
- Required icons or imagery
- Accessibility requirements
- Responsive behavior
- Restrictions on animations or visual effects
- Restrictions on specific UI patterns
- Any other visual or interaction constraints

### Absolute Compliance

If the official hackathon document specifies a UI/UX requirement, it is **mandatory**.

Agents must NOT:

- Ignore the requirement.
- Replace it with their preferred design.
- "Improve" it by changing the specified structure.
- Substitute specified colors with alternatives.
- Remove required UI elements.
- Add visual elements that violate stated restrictions.
- Treat the requirement as optional.
- Assume that a modern or aesthetically preferable alternative is acceptable.

**Hackathon rules take precedence over agent design preferences.**

### Requirement Extraction

During initial requirement analysis, the Project Lead / Requirements Agent must explicitly extract every UI/UX-related requirement from the official theme document.

Create a dedicated section in the requirements documentation:

```text
UI/UX MANDATORY REQUIREMENTS

Record each requirement clearly, including:

Requirement
Exact constraint
Source/page/section where applicable
Mandatory vs optional status
Implementation implication

Example:
UI-001
Requirement: Primary navigation must use the specified top navigation structure.
Source: Theme PDF, Page 4
Priority: MANDATORY
Implementation: All primary application screens must follow this navigation structure.
```

## Implementation Before Design Freedom

Before designing or implementing a frontend, the frontend agent must check the extracted UI/UX requirements.

The workflow must be:

Read the official theme/problem-statement document.

1. Extract UI/UX constraints.
2. Store them in the project requirements documentation.
3. Convert mandatory constraints into implementation rules.
4. Design the interface around those constraints.
5. Verify the implementation against every mandatory requirement.
6. Only then apply additional design improvements.

Agents may exercise design creativity only within the boundaries permitted by the official requirements.

## Conflict Resolution

If a general frontend best practice conflicts with an explicit hackathon UI requirement:

The explicit hackathon requirement wins.

If an agent is uncertain whether a requirement applies:

- Do not guess.
- Do not silently interpret it in a favorable way.
- Flag the ambiguity to the Project Lead.
- Request human clarification when necessary.

## Requirement Traceability

Every major frontend design decision should be traceable to either:

1. A mandatory requirement from the official hackathon document, or
2. A deliberate design decision that does not conflict with any mandatory requirement.

The implementation should never contradict an explicitly stated hackathon UI requirement.

## Final UI Compliance Audit

Before the final submission/demo, the QA or Project Lead agent must perform a dedicated:

### HACKATHON UI/UX COMPLIANCE AUDIT

Verify every extracted mandatory requirement individually.

The audit must check:

- Layout
- Navigation
- Colors
- Typography
- Components
- Required elements
- Positioning
- Responsive behavior
- Interaction requirements
- Prohibited elements
- Any other UI/UX constraints specified by the official document

The final UI must not be considered complete until all mandatory UI/UX requirements have been verified.

If any mandatory requirement is violated, prioritize fixing it over optional visual improvements or additional features
