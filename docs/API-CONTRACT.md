# HACKDATA V2 — API CONTRACT SPECIFICATION

> **Protocol:** REST over HTTP / JSON  
> **Backend Framework:** Python / FastAPI  
> **Specification Standard:** OpenAPI 3.1 Compatible  
> **Status:** Baseline Contract for Implementation

---

## 1. Global Conventions & Standard Response Envelopes

### 1.1 Success Response Envelope

All non-binary endpoints return a consistent JSON payload:

```json
{
  "success": true,
  "data": { ... },
  "metadata": {
    "execution_time_ms": 42.5,
    "seed_used": 10231,
    "row_count": 100
  }
}
```

### 1.2 Error Response Envelope

Error responses return structured diagnostic details without exposing internal traces:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_SCHEMA_DEFINITION",
    "message": "Column 'customer_id' declared as foreign key but parent table 'customers' not found.",
    "details": [
      {
        "field": "tables.orders.foreign_keys",
        "issue": "Missing parent table reference"
      }
    ]
  }
}
```

---

## 2. API Endpoints Catalog

### 2.1 System & Health Checks

#### `GET /api/health`

Determines backend availability and service status.

- **Response `200 OK`:**

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "engine_status": {
    "tabular": "ready",
    "relational": "ready",
    "document": "ready",
    "ai_layer": "connected"
  }
}
```

---

### 2.2 Schema Ingestion & AI Inference

#### `POST /api/schema/infer`

Parses raw schema files (SQL DDL, JSON Schema) or sample CSV rows, using the AI layer to infer column semantic types, distributions, and relational cardinalities.

- **Request Body:**

```json
{
  "input_type": "sample_data",
  "raw_content": "id,name,email,signup_date,balance
101,John Doe,john@test.com,2025-01-01,150.00
102,Jane Smith,jane@test.com,2025-01-02,320.50",
  "format": "csv"
}
```

- **Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "table_name": "inferred_table",
    "columns": [
      {
        "name": "id",
        "type": "integer",
        "is_primary_key": true,
        "generator": "sequence"
      },
      {
        "name": "name",
        "type": "string",
        "semantic_type": "full_name",
        "generator": "ai_faker"
      },
      {
        "name": "email",
        "type": "string",
        "semantic_type": "email",
        "generator": "masked_email"
      },
      {
        "name": "signup_date",
        "type": "date",
        "generator": "date_range",
        "params": { "min": "2024-01-01", "max": "2026-12-31" }
      },
      {
        "name": "balance",
        "type": "float",
        "distribution": "log_normal",
        "params": { "mean": 500, "std_dev": 250 }
      }
    ]
  }
}
```

---

### 2.3 Tabular Data Generation

#### `POST /api/generate/tabular`

Generates single-entity tabular data with statistical distributions, configurable row count, seed, and privacy transforms.

- **Request Body:**

```json
{
  "row_count": 50,
  "random_seed": 42,
  "locale": "en_US",
  "columns": [
    {
      "name": "ID",
      "type": "integer",
      "generator": "id_sequence",
      "start": 10231
    },
    { "name": "Name", "type": "name", "generator": "ai_realistic_name" },
    { "name": "Email", "type": "email", "privacy": "mask" },
    { "name": "Signup", "type": "date", "generator": "recent_dates" },
    {
      "name": "Balance",
      "type": "currency",
      "distribution": "normal",
      "mean": 500.0,
      "std_dev": 250.0,
      "privacy": "differential_noise",
      "epsilon": 1.0
    }
  ],
  "null_rate": 0.02,
  "outlier_rate": 0.01,
  "preview_only": true
}
```

- **Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "ID": 10231,
        "Name": "Maria Chen",
        "Email": "m.chen@example.com",
        "Signup": "2025-02-11",
        "Balance": "$482.10"
      },
      {
        "ID": 10232,
        "Name": "Ahmed Raza",
        "Email": "a.raza@example.com",
        "Signup": "2025-03-04",
        "Balance": "$129.55"
      },
      {
        "ID": 10233,
        "Name": "Sofia Ivanova",
        "Email": "s.ivanova@example.com",
        "Signup": "2025-01-27",
        "Balance": "$918.42"
      }
    ],
    "total_rows_generated": 3,
    "seed_applied": 42
  }
}
```

---

### 2.4 Relational Data Generation

#### `POST /api/generate/relational`

Generates multi-table relational datasets with strictly maintained foreign key integrity and cross-table arithmetic reconciliation.

- **Request Body:**

```json
{
  "random_seed": 42,
  "locale": "en_US",
  "schema": "ecommerce_default",
  "table_configs": {
    "customers": { "row_count": 10 },
    "orders": { "cardinality_per_parent": { "min": 1, "max": 4 } },
    "order_items": { "cardinality_per_parent": { "min": 1, "max": 5 } }
  },
  "reconcile_totals": true,
  "preview_only": true
}
```

- **Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "customers": [
      {
        "customer_id": 1,
        "name": "Alice Johnson",
        "email": "alice@example.com"
      }
    ],
    "orders": [
      {
        "order_id": 101,
        "customer_id": 1,
        "order_date": "2025-05-14",
        "total_amount": 250.0
      }
    ],
    "order_items": [
      {
        "item_id": 501,
        "order_id": 101,
        "sku": "SKU-9921",
        "qty": 2,
        "unit_price": 75.0,
        "amount": 150.0
      },
      {
        "item_id": 502,
        "order_id": 101,
        "sku": "SKU-3142",
        "qty": 1,
        "unit_price": 100.0,
        "amount": 100.0
      }
    ],
    "verification": {
      "referential_integrity": "100% Valid (0 orphaned keys)",
      "arithmetic_reconciliation": "100% Balanced ($250.00 == $150.00 + $100.00)"
    }
  }
}
```

---

### 2.5 Document Data Generation

#### `POST /api/generate/documents/invoice`

Generates structured and rendered invoice documents with line items, tax rates, and mathematically reconciled totals.

- **Request Body:**

```json
{
  "count": 1,
  "locale": "en_US",
  "currency": "USD",
  "random_seed": 10432,
  "business_type": "saas",
  "line_items_count": { "min": 2, "max": 4 }
}
```

- **Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "invoices": [
      {
        "invoice_number": "INV-10432",
        "date": "2025-09-15",
        "due_date": "2025-10-15",
        "billed_to": "Northwind Supplies Ltd.",
        "from": "Synth Data Co.",
        "line_items": [
          {
            "item": "API access — Pro tier",
            "qty": 1,
            "price": 1100.0,
            "amount": 1100.0
          },
          {
            "item": "Onboarding support",
            "qty": 1,
            "price": 140.0,
            "amount": 140.0
          }
        ],
        "subtotal": 1240.0,
        "tax": 0.0,
        "total": 1240.0
      }
    ]
  }
}
```

#### `POST /api/generate/documents/bank-statement`

Generates running-balance bank statements with realistic merchant names and query parameters.

- **Request Body:**

```json
{
  "account_holder": "Sofia Ivanova",
  "starting_balance": 1246.4,
  "transaction_count": 15,
  "query_filter": "last 90 days, balance over $500",
  "random_seed": 777
}
```

- **Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "account_number": "****-****-8819",
    "starting_balance": 1246.4,
    "ending_balance": 3257.9,
    "transactions": [
      {
        "date": "08-14",
        "description": "Greenleaf Market",
        "debit": 42.1,
        "credit": null,
        "balance": 1204.3
      },
      {
        "date": "08-15",
        "description": "Payroll deposit",
        "debit": null,
        "credit": 2150.0,
        "balance": 3354.3
      },
      {
        "date": "08-17",
        "description": "Riverside Utilities",
        "debit": 96.4,
        "credit": null,
        "balance": 3257.9
      }
    ],
    "balance_audit": "PASSED (all running balances verified)"
  }
}
```

---

### 2.6 Export Service

#### `POST /api/export`

Packages the current dataset into a downloadable format.

- **Request Body:**

```json
{
  "format": "csv | json | sql | pdf",
  "dataset_type": "tabular | relational | document",
  "generation_params": { ... }
}
```

- **Response Headers:** `Content-Type: application/zip`, `text/csv`, `application/json`, or `application/pdf`.
- **Response Body:** Binary stream with download attachment disposition.
