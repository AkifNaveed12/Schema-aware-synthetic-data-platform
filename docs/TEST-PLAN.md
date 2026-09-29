# HACKDATA V2 — TEST PLAN & VERIFICATION MATRIX

> **Standard:** Quality Assurance & Verification Strategy  
> **Target Subsystems:** Tabular Engine · Relational Engine · Document Engine · AI Layer · Unified Workspace · Exporters  
> **Status:** Baseline Test Strategy  
> **Execution Phase:** Implementation & QA

---

## 1. Testing Philosophy & Quality Gates

HackData V2 treats synthetic-data quality as a correctness problem. The generated output must be structurally valid, statistically meaningful, privacy-aware, and consistent with applicable business rules.

Testing therefore focuses on:

- Data correctness
- Statistical fidelity
- Referential integrity
- Business-rule consistency
- Privacy controls
- API correctness
- AI reliability
- Frontend functionality
- Export correctness
- Security

### 1.1 Quality Gates

| Gate                                | Requirement                                                                                    |
| ----------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Gate 1 — Mathematical Integrity** | Invoice calculations and running balances must reconcile without unexplained monetary variance |
| **Gate 2 — Referential Integrity**  | No invalid/orphaned foreign-key references in generated relational datasets                    |
| **Gate 3 — Structural Integrity**   | Generated data must conform to the requested schema, relationships, and constraints            |
| **Gate 4 — Statistical Quality**    | Generated distributions and relevant relationships must satisfy configured evaluation criteria |
| **Gate 5 — Privacy**                | Configured privacy controls must be applied and validated                                      |
| **Gate 6 — Export Integrity**       | Exported results must parse successfully and represent the validated generation                |

> **Note:** UI responsiveness is tested through measured performance targets. A fixed `<200ms` guarantee is not treated as a universal architectural requirement.

---

## 2. Requirements Traceability Matrix

| Req ID     | Target Feature             | Verification Method                | Expected Outcome                                                           | Status  |
| ---------- | -------------------------- | ---------------------------------- | -------------------------------------------------------------------------- | ------- |
| **FR-010** | Statistical distributions  | Statistical evaluation tests       | Generated distributions remain within configured evaluation thresholds     | Pending |
| **FR-011** | Configurable row count     | Unit test                          | Output contains exactly the requested number of rows                       | Pending |
| **FR-012** | Random seed determinism    | Dual-generation regression test    | Identical inputs and seed produce equivalent deterministic output          | Pending |
| **FR-014** | Privacy controls           | Automated privacy validation       | Configured masking, hashing, or noise rules are correctly applied          | Pending |
| **FR-020** | Referential integrity      | Relational integrity tests         | No generated foreign key references a missing parent record                | Pending |
| **FR-021** | Configurable cardinalities | Relationship/cardinality tests     | Generated relationships conform to configured constraints                  | Pending |
| **FR-022** | Cross-table reconciliation | Automated business-rule assertions | Applicable cross-table calculations reconcile correctly                    | Pending |
| **FR-030** | Invoice totals             | Document arithmetic tests          | Subtotal, tax, discount, and total reconcile according to configured rules | Pending |
| **FR-033** | Bank statement balances    | Running-balance tests              | Every transaction produces the correct resulting balance                   | Pending |
| **FR-050** | Unified workspace          | Playwright functional tests        | Required workspace functionality renders and operates correctly            | Pending |
| **FR-051** | Preview responsiveness     | Browser performance measurement    | Preview responds within the established practical performance target       | Pending |
| **FR-053** | Export functionality       | File parsing/integrity tests       | Generated exports parse successfully in their intended format              | Pending |

---

## 3. Unit Test Suite

**Location:** `tests/unit/`

### 3.1 UT-01 — Seed Reproducibility

**Objective:**  
Verify deterministic generation when the same seed and generation configuration are supplied.

**Input:**

```text
seed = 42
row_count = 100
```

Procedure:

Generate Dataset A.
Generate Dataset B using the same configuration.
Compare normalized outputs.

Expected Result:

Dataset A == Dataset B

The comparison should use a deterministic serialization or normalized data representation rather than relying blindly on raw object memory representation.

3.2 UT-02 — Referential Integrity

Objective:
Ensure child records reference existing parent records.

Input:

Customers → 10 rows
Orders → 30 rows
Order Items → 100 rows

Validation:

customer_ids = {c["customer_id"] for c in customers}

for order in orders:
assert order["customer_id"] in customer_ids

order_ids = {o["order_id"] for o in orders}

for item in order_items:
assert item["order_id"] in order_ids

Expected Result:

0 orphaned foreign keys
3.3 UT-03 — Invoice Reconciliation

Objective:
Verify that invoice line items and financial calculations reconcile according to the configured invoice rules.

Validation:

computed_subtotal = sum(
item["qty"] \* item["price"]
for item in invoice["line_items"]
)

assert computed_subtotal == invoice["subtotal"]

For a configuration without discounts:

assert invoice["subtotal"] + invoice["tax"] == invoice["total"]

If discounts or additional charges are supported, the test must use the configured calculation formula.

Expected Result:

No unexplained monetary variance
3.4 UT-04 — Bank Statement Running Balance

Objective:
Verify ledger consistency across all transactions.

Validation:

running_balance = statement["starting_balance"]

for txn in statement["transactions"]:
credit = txn["credit"] or 0
debit = txn["debit"] or 0

    running_balance = round(
        running_balance + credit - debit,
        2
    )

    assert running_balance == txn["balance"]

assert running_balance == statement["ending_balance"]

Expected Result:

Every transaction produces the expected balance.

3.5 UT-05 — Row Count

Objective:
Verify that the generator respects the requested row count.

result = generate_data(row_count=1000)

assert len(result) == 1000

Expected Result:

Generated rows == Requested rows
3.6 UT-06 — Schema Validation

Objective:
Verify that generated output conforms to the resolved DataProfile.

Checks should include:

Required columns.
Data types.
Nullable/non-nullable fields.
Primary-key requirements.
Foreign-key requirements.
Configured constraints.

Expected Result:

Generated output conforms to DataProfile

## 4. Statistical Quality Test Suite

4.1 Distribution Testing

The statistical evaluation layer should compare generated data with the requested or inferred distribution.

Possible checks include:

Numeric distribution similarity.
Categorical frequency similarity.
Missingness rate.
Outlier rate.
Correlation preservation.

Example:

evaluation = evaluate_distribution(
real_profile,
synthetic_data
)

assert evaluation.passed
4.2 Thresholds

Statistical thresholds should be configurable according to:

Dataset size.
Column type.
Evaluation metric.
Generation method.
Expected distribution.

The implementation should not hard-code one universal statistical threshold for every dataset.

## 5. Relational Test Suite

5.1 Primary-Key Validation

Verify:

Primary keys exist.
Primary keys are unique.
Primary-key values are valid for their declared type.
5.2 Foreign-Key Validation

For every foreign-key relationship:

child.foreign_key ∈ parent.primary_key

Expected result:

Invalid references = 0
5.3 Cardinality Validation

Verify configured relationships such as:

1:1
1:N
N:N

For N:N relationships, join-table integrity must also be verified.

5.4 Cross-Table Business Rules

Example:

# Order Total

Σ(Order Item Quantity × Order Item Price)

Every applicable generated order must satisfy the rule.

## 6. Document Test Suite

6.1 Invoice Tests

Verify:

Invoice identifier.
Line items.
Quantities.
Unit prices.
Subtotal.
Tax.
Discounts where configured.
Final total.
Currency.
Date formatting.
Regional configuration.
6.2 Bank Statement Tests

Verify:

Account information.
Transaction dates.
Credits.
Debits.
Starting balance.
Running balances.
Ending balance.
Requested date range.
Query constraints where supported.
6.3 Rendering Tests

Verify that generated document output:

Contains required fields.
Uses the selected locale/currency configuration.
Does not omit calculated values.
Can be exported successfully.

## 7. API Integration Test Suite

Location: tests/integration/

7.1 Health Endpoint

Verify:

GET /api/v1/health

Expected:

HTTP 200

The response must conform to the documented health-response schema.

7.2 Schema Inference

Submit a valid sample/schema and verify:

HTTP success.
Valid DataProfile.
Correctly identified columns/types where inferable.
Structured error response for invalid input.
7.3 Tabular Generation

Submit a valid tabular generation request and verify:

Request validation.
Generation result.
Generation identifier/job state where applicable.
Validation status.
Returned metadata.
7.4 Relational Generation

Verify:

Multiple tables are generated.
Relationships are preserved.
Foreign keys are valid.
Cross-table rules are validated.
7.5 Document Generation

Verify:

Invoice generation.
Bank statement generation.
Business-rule validation.
Document metadata.
Export compatibility.
7.6 Invalid Payload Handling

Examples:

{
"row_count": -5
}

Expected:

HTTP 422

with a structured diagnostic error response.

7.7 Export

Verify that export:

References the intended generation.
Does not silently regenerate data.
Produces the requested format.
Preserves validated content.
Returns appropriate MIME metadata.

## 8. AI Layer Test Suite

8.1 Schema Understanding

Verify that AI-assisted schema interpretation:

Produces structured output.
Identifies semantic column information where possible.
Does not bypass deterministic schema validation.
Handles ambiguous inputs safely.
8.2 Semantic Content Synthesis

Test generated:

Names.
Addresses.
Company names.
Descriptions.
Invoice line-item descriptions.
Other free-text fields.
8.3 Edge-Case Generation

Verify configured edge cases such as:

Null values.
Rare categories.
Boundary values.
Outliers.
Unusual but valid combinations.
8.4 AI Failure Handling

Simulate:

Timeout.
Invalid model response.
Rate-limit response.
Malformed structured output.
Provider failure.

Expected behavior:

AI Failure
↓
Controlled Error / Retry / Fallback
↓
Validation Still Required
↓
No Invalid Export

## 9. AI Service Reliability Tests

Verify:

Capability Test
Caching Repeated identical schema requests avoid unnecessary duplicate calls
Rate limiting Requests above configured limits are controlled
Retry Transient failures trigger bounded retry behavior
Backoff Retry intervals increase appropriately
Token budget Requests remain within configured limits
Structured output Invalid model output is rejected
Usage tracking AI requests can be measured/logged
Provider abstraction Generation logic does not depend directly on provider-specific implementation

## 10. UI & Browser Test Suite

Tool: Playwright

10.1 Workspace Functional Audit

Verify that the unified workspace provides access to:

Tabular generation.
Relational generation.
Document generation.
Configuration.
Preview.
Validation/evaluation results.
Export.
10.2 Configuration Controls

Verify applicable controls such as:

Row count.
Random seed.
Locale.
Currency.
Privacy configuration.
Generation settings.
10.3 Live Preview

Test:

Change a generation parameter.
Trigger preview/update.
Verify the displayed result reflects the new configuration.
Measure practical response time.

The test should record actual timing rather than assume a universal <200ms requirement.

10.4 Document Views

Verify:

Invoice view.
Bank statement view.
Required calculated fields.
Correct document configuration.
Valid rendering.

## 11. Export Verification

11.1 CSV

Verify:

Valid CSV structure.
Correct headers.
Correct row count.
Correct data types after parsing.
No unintended truncation.
11.2 JSON

Verify:

Valid JSON syntax.
Expected schema.
Correct records.
Correct nested relationships where applicable.
11.3 SQL

Verify:

Valid SQL syntax.
Table creation.
Primary keys.
Foreign keys where supported.
Data insertion.
Successful import into the supported database target.
11.4 PDF / Document Export

Verify:

File opens successfully.
Required content exists.
Calculated values match validated source data.
Selected locale/currency configuration is preserved.

## 12. Security & Privacy Verification

12.1 Sensitive Data Handling

Verify that:

API credentials are not exposed to the frontend.
Uploaded files are validated.
Input size limits are enforced.
Temporary/generated files are handled safely.
Logs do not unnecessarily expose sensitive input data.
12.2 Synthetic Identity Validation

Generated identities should be synthetic and should not intentionally reproduce source records.

Test representative outputs for:

Names.
Emails.
Addresses.
Phone numbers.
Other configurable PII-like fields.
12.3 Privacy Controls

Verify configured:

Masking.
Hashing.
Controlled noise.
Synthetic replacement.

Privacy mechanisms must be tested according to their actual implementation rather than assuming a specific mathematical mechanism.

12.4 Input Security

Test for:

Path traversal.
Malformed files.
Invalid schemas.
Injection attempts.
Unsafe export names.
SQL injection against any dynamically constructed SQL.
Oversized payloads.

## 13. Failure & Recovery Testing

The system should be tested against:

Failure Expected Behavior
Invalid schema Structured validation error
Invalid generation configuration Request rejected
AI timeout Retry/error handling
AI malformed output Reject/repair/retry
Generation failure Job marked failed
Validation failure Generation not exported
Evaluation failure Generation not treated as validated
Export failure Clear error without corrupting generation
Database failure Controlled error
Frontend/API disconnect Recoverable UI error

## 14. Performance Testing

Performance testing should focus on realistic workloads.

14.1 Areas
Schema inference.
Small preview generation.
Full dataset generation.
Relational generation.
Document rendering.
Validation.
Statistical evaluation.
Export.
AI response latency.
14.2 Performance Principle

Do not define arbitrary performance guarantees before measurement.

Instead:

Measure
↓
Identify Bottleneck
↓
Optimize
↓
Measure Again
14.3 Preview

Preview should use appropriately limited/sample data rather than unnecessarily generating the entire requested dataset for every interaction.

## 15. End-to-End Verification

15.1 Complete Workflow

The primary E2E test should verify:

User
↓
Input / Sample
↓
Schema Understanding
↓
DataProfile
↓
Configuration
↓
Generation
↓
Validation
↓
Evaluation
↓
PASS
↓
Preview
↓
Export
15.2 Failure Workflow

A second E2E test should intentionally produce a validation failure:

Generation
↓
Validation
↓
FAIL
↓
Controlled Regeneration
↓
Validation
↓
PASS
↓
Export

The system must not export a failed generation.

## 16. QA Severity Classification

Critical

Issues that invalidate generated data or break a core workflow.

Examples:

Orphaned foreign keys.
Incorrect financial calculations.
Invalid generated schema.
Exporting unvalidated data.
Severe privacy failure.
High

Major functionality failure.

Examples:

Tabular engine failure.
Relational engine failure.
Document engine failure.
Broken AI integration.
Broken frontend/backend integration.
Medium

Important but recoverable issue.

Examples:

Preview inconsistency.
Non-critical export issue.
Configuration UI issue.
Low

Minor usability or visual issue that does not affect correctness.

## 17. Test Execution Status

Test Area Status
Unit Tests Pending Implementation
Statistical Evaluation Pending Implementation
Relational Integrity Pending Implementation
Document Validation Pending Implementation
API Integration Pending Implementation
AI Layer Pending Implementation
Frontend / Browser Pending Implementation
Export Verification Pending Implementation
Security Pending Implementation
Performance Pending Implementation
End-to-End Pending Implementation

## 18. QA Exit Criteria

QA can be considered complete when:

All mandatory unit tests pass.
Statistical evaluation passes configured thresholds.
Relational integrity is verified.
Business-rule calculations reconcile.
Privacy controls are verified.
AI failure paths are tested.
API integration tests pass.
Critical frontend workflows pass.
Exported files are validated.
Security checks pass.
No unresolved critical defects remain.
No high-severity issue blocks the core demo.
End-to-end workflow passes.
Failed generations cannot bypass validation and reach export.

## 19. Final QA Principle

HackData V2 should not be considered successful merely because it generates data. It should be considered successful when the generated data can be demonstrated as valid, consistent, privacy-aware, and useful through measurable verification.

Document Status: BASELINE TEST STRATEGY — READY FOR IMPLEMENTATION
