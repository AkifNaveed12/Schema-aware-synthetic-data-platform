---
name: ui-compliance
description: Enforces and audits mandatory hackathon UI/UX requirements extracted from the official theme document. Use before designing, implementing, modifying, reviewing, or approving frontend interfaces, and during the final UI compliance audit.
---

# Hackathon UI Compliance

## Mission

Ensure that every frontend implementation complies with the mandatory UI/UX requirements extracted from the official hackathon theme document.

The official hackathon requirements take precedence over:

- Agent preferences
- Developer preferences
- Generic design trends
- Aesthetic opinions
- Framework defaults
- Stitch suggestions
- Existing templates
- "Better looking" alternatives

A visually attractive interface that violates a mandatory requirement is considered incorrect.

---

# 1. Source of Truth

The primary source is:

```text
docs/UI-REQUIREMENTS.md
```

The original theme document remains the ultimate authority.

If UI-REQUIREMENTS.md conflicts with the original document:

Inspect the original source.
Determine the correct interpretation.
Update UI-REQUIREMENTS.md.
Do not continue using the conflicting requirement.

Never silently choose an interpretation.

## 2. Before Frontend Implementation

Before implementing or substantially modifying a frontend:

Read docs/UI-REQUIREMENTS.md.
Identify all applicable mandatory requirements.
Identify optional requirements.
Identify prohibited UI patterns.
Identify required screens.
Identify required navigation.
Identify required visual language.
Identify responsive requirements.
Identify accessibility requirements.

Create a mental or written checklist before implementation.

## 3. Requirement Categories

Check all applicable categories.

### Layout

Verify:

Page structure
Section ordering
Required containers
Required positioning
Required alignment
Required spacing
Required grid/list structures
Navigation

Verify:

Navigation type
Navigation location
Required links
Required hierarchy
Required navigation behavior
Colors

Verify:

Required primary colors
Secondary colors
Background colors
Text colors
Accent colors
Required color combinations
Prohibited colors

Do not substitute specified colors merely because another palette looks better.

If exact color values are provided, use them accurately.

### Typography

Verify:

Font family
Font hierarchy
Font sizes
Font weights
Text casing
Required typography rules
Components

Verify:

Required buttons
Cards
Forms
Tables
Charts
Navigation components
Modals
Alerts
Other specified components
Branding

Verify:

Logo
Brand name
Required visual identity
Required imagery
Required placement
Interaction

Verify:

Hover behavior
Click behavior
Form behavior
Navigation behavior
Feedback states
Required animations
Prohibited animations
Responsive Behavior

Verify all explicitly required breakpoints/devices.

At minimum, check:

Desktop
Tablet
Mobile

when responsive requirements are applicable.

### Accessibility

Verify:

Semantic structure
Keyboard accessibility
Labels
Focus states
Contrast
Alternative text
Screen-reader considerations

Only apply additional accessibility constraints when they do not conflict with explicit hackathon requirements.

## 4. Mandatory vs Optional

Every extracted requirement must have a status.

Use:

MANDATORY
OPTIONAL
BONUS
OPPORTUNITY

Mandatory requirements must be implemented.

Optional/bonus requirements must not be allowed to delay mandatory functionality.

## 5. Stitch Workflow

When Google Stitch is used:

Before Stitch

Prepare a structured design prompt containing:

Product purpose
Target users
Required screens
Required navigation
Mandatory layout
Mandatory colors
Typography
Required components
Required states
Responsive requirements
Accessibility requirements
Prohibited patterns

Explicitly mark requirements as:

MANDATORY — MUST FOLLOW

and design freedom as:

DESIGN FREEDOM
After Stitch

Do not automatically accept Stitch output.

Review the generated screens against:

docs/UI-REQUIREMENTS.md

Check every mandatory requirement.

If Stitch violates a mandatory requirement:

Identify the violation.
Revise the Stitch prompt.
Regenerate/refine the design.
Re-check compliance.

Do not implement a known non-compliant design.

## 6. Frontend Implementation

During implementation:

Keep mandatory requirements visible to the frontend agent.
Do not replace specified layouts without approval.
Do not replace specified colors without approval.
Do not remove mandatory elements.
Do not add prohibited elements.
Preserve required navigation.
Preserve required component structure.

If implementation constraints make a requirement difficult:

Identify the conflict.
Do not silently change the requirement.
Propose an implementation solution.
Escalate to the Project Lead if necessary.

## 7. Design Freedom

When the official document does not specify a particular design decision, agents may choose an appropriate solution.

Design freedom may include:

Component styling
Spacing details
Micro-interactions
Animation
Icon selection
Visual hierarchy
Component composition

provided these choices do not conflict with explicit requirements.

The goal is:

Mandatory requirements +
Good UX +
Professional visual design

not:

Good visual design >
Hackathon requirements

## 8. Compliance Matrix

Maintain a compliance matrix when practical.

Example:

ID Requirement Status Implemented Verified
UI-001 Required navigation Mandatory Yes Yes
UI-002 Required primary color Mandatory Yes Yes
UI-003 Mobile layout Mandatory Yes No
UI-004 Optional animation Optional No N/A

Use the actual IDs from UI-REQUIREMENTS.md.

Never mark a requirement as verified merely because code appears to implement it.

Verification should involve actual inspection or testing where practical.

## 9. Browser Verification

Use browser tooling when appropriate.

After implementing major UI changes:

Start the application.
Open the relevant page.
Inspect the rendered UI.
Check console errors.
Check layout.
Check navigation.
Check responsive behavior.
Verify required components.
Compare against mandatory requirements.

Chrome DevTools MCP may be used for:

DOM inspection
Console inspection
Network inspection
Screenshots
Responsive verification
Performance inspection

## 10. Visual Verification

When visual compliance matters:

Compare the actual rendered interface against:

UI-REQUIREMENTS.md
Approved Stitch screens
Official theme examples
Required colors
Required layout

Do not rely exclusively on source code.

A CSS declaration existing in the code does not prove that the rendered interface satisfies the requirement.

## 11. Violations

Classify violations as:

### CRITICAL

Examples:

Mandatory layout violated
Required screen missing
Required navigation missing
Required branding missing
Explicitly prohibited UI used
Mandatory color scheme ignored
HIGH

Examples:

Important component incorrectly implemented
Required responsive behavior missing
Major accessibility requirement violated
MEDIUM

Examples:

Inconsistent spacing
Minor typography mismatch
Small component inconsistency
LOW

Examples:

Minor visual polish issue
Non-critical spacing inconsistency

Critical and High violations must be fixed before final submission.

## 12. Final UI Audit

Before final demo/submission perform:

### HACKATHON UI/UX COMPLIANCE AUDIT

Check every mandatory requirement individually.

### For each requirement record:

ID
Requirement
Implementation
Verification
Result
Evidence/Location

### Possible results:

PASS
FAIL
BLOCKED
NOT APPLICABLE

### Do not use vague results such as:

Looks good
Probably fine
Seems compliant

## 13. Final Compliance Gate

The frontend must not be considered final while any mandatory requirement is:

FAIL
BLOCKED
Unverified when verification is required

If a mandatory requirement cannot be implemented:

Stop final approval.
Explain the blocker.
Identify the affected component.
Escalate to the Project Lead.
Do not hide or silently ignore the violation.

## 14. Conflict Resolution

If two official requirements appear to conflict:

Do not decide arbitrarily.

### Document:

CONFLICT
Requirement A
Requirement B
Source A
Source B
Potential interpretations

Then escalate for human clarification if the conflict cannot be resolved from the document.

## 15. Final Checklist

Before declaring UI compliance complete:

UI requirements file reviewed
All mandatory screens implemented
Required layout implemented
Required navigation implemented
Required colors verified
Required typography verified
Required components implemented
Required branding implemented
Required interactions verified
Responsive requirements verified
Accessibility requirements verified
Prohibited elements checked
Stitch output checked where applicable
Browser verification performed
Compliance matrix updated
No Critical violations
No High violations
Final UI audit completed
