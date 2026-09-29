# HACKDATA V2 — TEST PLAN & VERIFICATION MATRIX

> **Standard:** Exhaustive Quality Assurance & Compliance Verification  
> **Target Subsystems:** Tabular Engine · Relational Engine · Document Engine · AI Layer · 3-Pane UI · Exporters  
> **Status:** Baseline Test Strategy

---

## 1. Testing Philosophy & Quality Gates

In HackData V2, synthetic data generation is fundamentally an exercise in **mathematical and referential truth**. An attractive UI is worthless if foreign keys orphan child records or invoice totals fail to reconcile.

### Three Non-Negotiable Quality Gates:
1. **Gate 1 — Mathematical Integrity:** 100% precision on running balances and document totals ($0.00 discrepancy).
2. **Gate 2 — Referential Integrity:** 0 orphaned foreign keys across relational datasets.
3. **Gate 3 — UI Compliance:** Strict adherence to the official Slide 10 3-pane layout with instant reactive preview (<200ms).

---

## 2. Requirements Traceability Matrix

| Req ID | Target Feature | Verification Method | Expected Outcome | Status |
| :--- | :--- | :--- | :--- | :---: |
| **FR-010** | Statistical Distributions | Automated statistical test (`scipy.stats.kstest`) | Generated column matches requested distribution (Normal/Uniform) within alpha=0.05 | Pending |
| **FR-011** | Configurable Row Count | Unit test on output array length | Output row count exactly equals requested integer (e.g. 50, 1000) | Pending |
| **FR-012** | Random Seed Determinism | Automated regression test running dual passes | Runs with identical seed yield byte-for-byte identical data frames | Pending |
| **FR-014** | Privacy Controls | Regex and cryptographic hash validation | PII matches masking regex (e.g. `.*\*+.*`); hashes are valid 64-char hex strings | Pending |
| **FR-020** | Referential Integrity | Relational integrity assert script | Every `order.customer_id` exists in `customers.customer_id`; 0 orphaned keys | Pending |
| **FR-021** | Configurable Cardinalities | Cardinality frequency count test | Number of child records per parent conforms to specified min/max bounds | Pending |
| **FR-022** | Cross-Table Math Reconcile | Automated sum assertion across orders & items | `order.total_amount == sum(item.qty * item.price)` for all generated orders | Pending |
| **FR-030** | Invoice Reconciled Totals | Document arithmetic test | `invoice.total == invoice.subtotal + invoice.tax - invoice.discount` ($0.00 variance) | Pending |
| **FR-033** | Bank Statement Balances | Running balance ledger test | `balance[t] == balance[t-1] + credit[t] - debit[t]` for 100% of transaction rows | Pending |
| **FR-050** | 3-Pane Layout Rendering | Playwright visual viewport audit | Left Sidebar, Center Canvas, and Right Config render simultaneously | Pending |
| **FR-051** | Instant Live Preview | Browser performance timing trace | Canvas re-renders in `< 200ms` following slider input change | Pending |
| **FR-053** | Export Functionality | Binary file download & parse test | Exported CSV, JSON, and SQL dumps parse successfully into SQLite/Postgres | Pending |

---

## 3. Specific Test Suites

### 3.1 Unit Test Suite (`tests/unit/`)

#### Test Case UT-01: Seed Reproducibility
- **Objective:** Verify that providing an identical `random_seed` produces identical tabular and relational datasets.
- **Input:** `seed = 42`, `row_count = 100`.
- **Validation:** Generate Dataset A and Dataset B; assert `hash(Dataset A) == hash(Dataset B)`.

#### Test Case UT-02: Referential Integrity (DAG Check)
- **Objective:** Ensure no child records reference non-existent parent primary keys.
- **Input:** Relational schema: `Customers` (10 rows) -> `Orders` (30 rows) -> `Order Items` (100 rows).
- **Validation:** 
  ```python
  customer_ids = set(c["customer_id"] for c in customers)
  for order in orders:
      assert order["customer_id"] in customer_ids
  order_ids = set(o["order_id"] for o in orders)
  for item in order_items:
      assert item["order_id"] in order_ids
  ```

#### Test Case UT-03: Invoice Mathematical Reconciliation
- **Objective:** Guarantee that invoice line items sum exactly to the subtotal, taxes apply correctly, and total is balanced.
- **Validation:**
  ```python
  computed_subtotal = sum(item["qty"] * item["price"] for item in invoice["line_items"])
  assert abs(computed_subtotal - invoice["subtotal"]) < 0.001
  assert abs((invoice["subtotal"] + invoice["tax"]) - invoice["total"]) < 0.001
  ```

#### Test Case UT-04: Bank Statement Running Balance Integrity
- **Objective:** Guarantee unbroken ledger consistency across the entire statement period.
- **Validation:**
  ```python
  running_balance = statement["starting_balance"]
  for txn in statement["transactions"]:
      credit = txn["credit"] or 0.0
      debit = txn["debit"] or 0.0
      running_balance = round(running_balance + credit - debit, 2)
      assert abs(running_balance - txn["balance"]) < 0.001
  assert abs(running_balance - statement["ending_balance"]) < 0.001
  ```

---

### 3.2 API Integration Test Suite (`tests/integration/`)

- **Health Endpoint:** `GET /api/health` returns `HTTP 200` with engine status `ready`.
- **Tabular Preview:** `POST /api/generate/tabular` with valid payload returns HTTP 200 in `< 150ms`.
- **Invalid Payload Handling:** Requesting `row_count: -5` or invalid schema returns structured HTTP 422 with diagnostic error envelope.
- **Export Packaging:** `POST /api/export` returns valid MIME types (`text/csv`, `application/json`, `application/zip`).

---

### 3.3 UI Compliance & Browser Test Suite (Playwright)

- **Three-Pane Architecture Audit:**
  - Verify `#workspace-sidebar` exists and has dark background (`#0F172A`).
  - Verify `#preview-canvas` exists and displays active data type.
  - Verify `#configuration-drawer` exists on the right with Row count, Seed, Locale, Privacy rules, and Export CTA.
- **Live Preview Reactivity Audit:**
  - Change slider `#row-count-input` from `10` to `50`.
  - Measure elapsed time until canvas table displays 50 rows.
  - Must complete in `< 200ms`.
- **Document View Toggle Audit:**
  - Click `Documents` in sidebar -> Select `Invoices`.
  - Verify `#invoice-card` renders with `#INV-10432` layout matching Theme Slide 7.
  - Click `Bank Statements`.
  - Verify financial ledger table renders with debit/credit columns matching Theme Slide 8.

---

### 3.4 Security & Privacy Verification

- **PII Leakage Prevention:** Verify that all synthesized names and emails use synthetic domain extensions (`@example.com`, `@demo.test`) and do not reproduce real personal identities.
- **Differential Noise Verification:** Measure variance on numeric balances with differential privacy enabled; confirm noise injection adheres to Laplace distribution.
- **CORS & Input Sanitization:** Prevent path traversal in export file name generators and SQL injection in relational export strings.
