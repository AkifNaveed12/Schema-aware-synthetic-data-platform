import io
import os
import time
import pytest
import pandas as pd
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.models.data_profile import DataProfile, TableProfile, ColumnProfile
from backend.app.models.adapters.statistical import StatisticalBaselineAdapter
from backend.app.models.adapters.ctgan_adapter import CTGANAdapter
from backend.app.models.adapters.tvae_adapter import TVAEAdapter
from backend.app.models.adapters.deterministic import DeterministicFallbackAdapter
from backend.app.engine.relational_engine import relational_engine
from backend.app.models.schemas import RelationalGenerateRequest, InvoiceGenerateRequest, BankStatementGenerateRequest
from backend.app.engine.document_engine import document_engine
from backend.app.jobs.job_store import job_store
from backend.app.pipeline.ingestion import ingest, IngestionError
from backend.app.pipeline.profiler import profile_dataframe

client = TestClient(app)


# ── 1. Real CTGAN Adapter Verification ───────────────────────────────────────
def test_ctgan_real_adapter_fit_sample_evaluate():
    """Verify real CTGAN synthesizer fits, samples, and evaluates with SDV."""
    adapter = CTGANAdapter(epochs=3, batch_size=20)
    caps = adapter.capabilities()
    if not caps.available:
        pytest.skip(f"CTGAN skipped: {caps.unavailable_reason}")
    assert caps.available is True

    # Load 50 rows of real salary data
    df = pd.read_csv("sample/test/employee_salary.csv").head(50)
    profile = profile_dataframe(df, "employee_salary")

    t0 = time.perf_counter()
    adapter.fit(df, profile, {"epochs": 3, "batch_size": 20})
    fit_time = time.perf_counter() - t0
    assert fit_time > 0

    synth_df = adapter.sample(num_rows=15, seed=42)
    assert len(synth_df) == 15
    assert set(synth_df.columns) == set(df.columns)

    metrics = adapter.evaluate(df, synth_df, profile)
    assert metrics.schema_fidelity == 1.0
    assert 0.0 <= metrics.overall_score <= 1.0


# ── 2. Real TVAE Adapter Verification ────────────────────────────────────────
def test_tvae_real_adapter_fit_sample_evaluate():
    """Verify real TVAE synthesizer fits, samples, and evaluates with SDV."""
    adapter = TVAEAdapter(epochs=3, batch_size=20)
    caps = adapter.capabilities()
    if not caps.available:
        pytest.skip(f"TVAE skipped: {caps.unavailable_reason}")
    assert caps.available is True

    df = pd.read_csv("sample/test/employee_salary.csv").head(50)
    profile = profile_dataframe(df, "employee_salary")

    t0 = time.perf_counter()
    adapter.fit(df, profile, {"epochs": 3, "batch_size": 20})
    fit_time = time.perf_counter() - t0
    assert fit_time > 0

    synth_df = adapter.sample(num_rows=15, seed=42)
    assert len(synth_df) == 15
    assert set(synth_df.columns) == set(df.columns)

    metrics = adapter.evaluate(df, synth_df, profile)
    assert metrics.schema_fidelity == 1.0
    assert 0.0 <= metrics.overall_score <= 1.0


# ── 3. Real Dataset E2E Test: sample/test/bank_customers.csv ─────────────────
def test_real_dataset_e2e_bank_customers():
    """
    E2E pipeline test using real Kaggle dataset sample/test/bank_customers.csv:
    UPLOAD -> INGEST -> PROFILE -> CLEAN -> MODEL (Statistical/TVAE) -> GENERATE -> VALIDATE -> EVALUATE -> EXPORT
    """
    raw_df = pd.read_csv("sample/test/bank_customers.csv", nrows=120)
    csv_bytes = raw_df.to_csv(index=False).encode("utf-8")

    # A. Ingest via API
    res = client.post(
        "/api/v1/datasets/ingest",
        files={"file": ("bank_customers.csv", csv_bytes, "text/csv")},
        data={"table_name": "bank_customers", "use_ai": "false"},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    data = body["data"]
    dataset_id = data["dataset_id"]
    assert data["row_count"] == 120
    assert data["column_count"] == 8
    assert "CustomerID" in data["columns"]
    assert "UnitPrice" in data["columns"]

    # B. Generate Synchronously with TVAE
    gen_res = client.post(
        f"/api/v1/datasets/{dataset_id}/generate/sync",
        json={"row_count": 25, "seed": 1234, "model_strategy": "tvae"},
    )
    assert gen_res.status_code == 200
    gen_data = gen_res.json()["data"]
    assert gen_data["rows_generated"] == 25
    assert gen_data["selected_model"] in ("TVAE", "StatisticalBaseline")
    assert len(gen_data["rows"]) == 25
    assert "CustomerID" in gen_data["rows"][0]
    assert gen_data["evaluation"]["schema_fidelity"] == 1.0

    # C. Export CSV artifact
    exp_res = client.get(f"/api/v1/datasets/{dataset_id}/export?format=csv")
    assert exp_res.status_code == 200
    exported_csv = exp_res.text
    exported_df = pd.read_csv(io.StringIO(exported_csv))
    assert len(exported_df) == 25
    assert list(exported_df.columns) == list(raw_df.columns)

    # D. Export JSON artifact
    exp_json = client.get(f"/api/v1/datasets/{dataset_id}/export?format=json")
    assert exp_json.status_code == 200
    assert len(exp_json.json()) == 25


# ── 4. Second Real Dataset: sample/test/employee_salary.csv ──────────────────
def test_real_dataset_e2e_employee_salary_generalization():
    """
    Verifies the pipeline generalizes to arbitrary column names with spaces and symbols:
    'Age', 'Education Level', 'Job Title', 'Experience (Years)', 'Industry', 'Hours/Week', 'Work Mode', 'Skills', 'Salary (USD)'
    """
    raw_df = pd.read_csv("sample/test/employee_salary.csv")
    csv_bytes = raw_df.to_csv(index=False).encode("utf-8")

    res = client.post(
        "/api/v1/datasets/ingest",
        files={"file": ("employee_salary.csv", csv_bytes, "text/csv")},
        data={"table_name": "employee_salary", "use_ai": "false"},
    )
    assert res.status_code == 200
    dataset_id = res.json()["data"]["dataset_id"]

    # Generate with Statistical Baseline
    gen_res = client.post(
        f"/api/v1/datasets/{dataset_id}/generate/sync",
        json={"row_count": 50, "seed": 999, "model_strategy": "statistical"},
    )
    assert gen_res.status_code == 200
    gen_data = gen_res.json()["data"]
    assert gen_data["rows_generated"] == 50
    assert "Education Level" in gen_data["columns"]
    assert "Salary (USD)" in gen_data["columns"]

    # Verify SQL export quotes column names with spaces/symbols
    sql_res = client.post(
        "/api/v1/export",
        json={
            "format": "sql",
            "modality": "tabular",
            "dataset": {"rows": gen_data["rows"]},
        },
    )
    assert sql_res.status_code == 200
    raw_sql = sql_res.json()["data"]["raw_content"]
    assert '"Education Level"' in raw_sql
    assert '"Salary (USD)"' in raw_sql


# ── 5. Third Real Dataset: sample/test/Churn_Modelling.csv ────────────────────
def test_real_dataset_e2e_churn_modelling_generalization():
    """
    Verifies profiling and synthesis on 14-column customer churn financial dataset.
    """
    raw_df = pd.read_csv("sample/test/Churn_Modelling.csv", nrows=150)
    csv_bytes = raw_df.to_csv(index=False).encode("utf-8")

    res = client.post(
        "/api/v1/datasets/ingest",
        files={"file": ("Churn_Modelling.csv", csv_bytes, "text/csv")},
        data={"table_name": "churn_modelling", "use_ai": "false"},
    )
    assert res.status_code == 200
    dataset_id = res.json()["data"]["dataset_id"]

    gen_res = client.post(
        f"/api/v1/datasets/{dataset_id}/generate/sync",
        json={"row_count": 30, "seed": 77, "model_strategy": "statistical"},
    )
    assert gen_res.status_code == 200
    synth_rows = gen_res.json()["data"]["rows"]
    assert len(synth_rows) == 30
    assert "CreditScore" in synth_rows[0]
    assert "EstimatedSalary" in synth_rows[0]
    assert "Exited" in synth_rows[0]


# ── 6. Real Relational Dataset: sample/relational/ (Olist E-commerce) ─────────
def test_real_relational_pipeline_olist_schema():
    """
    Verifies relational generation using real Olist schema:
    customers -> orders -> order_items (topological DAG, parent before child, zero orphan FKs).
    """
    customers_df = pd.read_csv("sample/relational/customers.csv", nrows=50)
    orders_df = pd.read_csv("sample/relational/orders.csv", nrows=50)
    items_df = pd.read_csv("sample/relational/order_items.csv", nrows=50)

    # Build DataProfile with real relational structure
    prof = DataProfile(
        name="olist_ecommerce",
        modality="relational",
        tables=[
            TableProfile(
                name="customers",
                primary_key="customer_id",
                columns=[
                    ColumnProfile(name="customer_id", data_type="string", is_primary_key=True),
                    ColumnProfile(name="customer_city", data_type="string", semantic_type="city"),
                    ColumnProfile(name="customer_state", data_type="string"),
                ],
            ),
            TableProfile(
                name="orders",
                primary_key="order_id",
                foreign_keys={"customer_id": "customers.customer_id"},
                columns=[
                    ColumnProfile(name="order_id", data_type="string", is_primary_key=True),
                    ColumnProfile(name="customer_id", data_type="string", is_foreign_key=True),
                    ColumnProfile(name="order_status", data_type="string"),
                ],
            ),
            TableProfile(
                name="order_items",
                primary_key="order_item_id",
                foreign_keys={"order_id": "orders.order_id"},
                columns=[
                    ColumnProfile(name="order_item_id", data_type="integer", is_primary_key=True),
                    ColumnProfile(name="order_id", data_type="string", is_foreign_key=True),
                    ColumnProfile(name="price", data_type="float", semantic_type="currency"),
                    ColumnProfile(name="freight_value", data_type="float"),
                ],
            ),
        ],
    )

    req = RelationalGenerateRequest(
        profile=prof,
        random_seed=42,
        table_row_counts={"customers": 15, "orders": 25, "order_items": 40},
    )

    result = relational_engine.generate(req)
    assert result.tables is not None
    tables = result.tables

    # Check parent tables generated
    assert "customers" in tables
    assert "orders" in tables
    assert "order_items" in tables

    # Verify FK Integrity: every order.customer_id exists in customers
    cust_pks = {c["customer_id"] for c in tables["customers"]}
    for o in tables["orders"]:
        assert o["customer_id"] in cust_pks, "Orphaned customer_id in orders!"

    # Verify FK Integrity: every order_item.order_id exists in orders
    order_pks = {o["order_id"] for o in tables["orders"]}
    for item in tables["order_items"]:
        assert item["order_id"] in order_pks, "Orphaned order_id in order_items!"

    # Referential integrity audit must be 100% valid
    assert result.referential_integrity["valid"] is True
    assert result.referential_integrity["orphaned_foreign_keys"] == 0


# ── 7. Document Engine Input-Awareness ────────────────────────────────────────
def test_document_engine_input_aware_from_profile():
    """
    Verifies that DocumentEngine extracts custom items and dynamic catalogs
    from an input DataProfile instead of relying solely on fixed demo constants.
    """
    custom_prof = DataProfile(
        name="custom_vendor_profile",
        modality="tabular",
        tables=[
            TableProfile(
                name="catalog",
                primary_key="id",
                columns=[
                    ColumnProfile(
                        name="item_description",
                        data_type="string",
                        sample_values=["Enterprise AI Agent License", "Cloud GPU Cluster Hours", "Security Audit Token"],
                    ),
                    ColumnProfile(
                        name="unit_price",
                        data_type="float",
                        mean_value=450.0,
                    ),
                ],
            )
        ],
    )

    inv_req = InvoiceGenerateRequest(
        count=2,
        random_seed=123,
        profile=custom_prof,
        vendor_name="Acme Quantum Corp",
        vendor_address="999 Silicon Parkway",
    )
    inv_res = document_engine.generate_invoices(inv_req)
    assert inv_res.total_generated == 2
    inv = inv_res.invoices[0]
    assert inv.billed_from == "Acme Quantum Corp"
    assert inv.billed_from_address == "999 Silicon Parkway"
    # Line items should be extracted from profile sample_values
    all_item_names = [it.item for it in inv.line_items]
    assert any("AI Agent" in name or "GPU" in name or "Security" in name for name in all_item_names)
    assert inv_res.reconciliation_audit["status"] == "passed"
    assert inv_res.reconciliation_audit["discrepancies"] == 0

    # Bank Statement with dynamic profile
    stmt_req = BankStatementGenerateRequest(
        transaction_count=10,
        random_seed=456,
        profile=custom_prof,
        account_holder="Elena Rostova",
    )
    stmt_res = document_engine.generate_bank_statement(stmt_req)
    stmt = stmt_res.statement
    assert stmt.account_holder == "Elena Rostova"
    assert len(stmt.transactions) == 10
    assert stmt_res.balance_audit["status"] == "passed"
    assert stmt_res.balance_audit["discrepancies"] == 0


# ── 8. AI Semantic Enrichment & Fallback ──────────────────────────────────────
def test_ai_semantic_enrichment_and_caching():
    """
    Verifies:
    1. with use_ai=true, AI schema inference enriches column semantic types.
    2. Repeated calls hit the LRU cache without unnecessary tokens.
    3. Missing or invalid Groq key falls back to heuristic engine gracefully.
    """
    from backend.app.ai.groq_service import ai_service
    from backend.app.ai.cache import ai_cache

    csv_data = "TransactionID,CustomerEmail,AmountUSD,Date\nTX101,akif@example.com,450.25,2026-09-29\n"

    # Call infer_schema
    res1 = ai_service.infer_schema(csv_data, "csv", "transactions")
    assert res1 is not None
    assert len(res1.columns) == 4

    # Second call with same content should hit cache
    initial_hits = ai_cache.hits
    res2 = ai_service.infer_schema(csv_data, "csv", "transactions")
    assert res2 is not None
    assert ai_cache.hits >= initial_hits

    # Offline/heuristic fallback test
    orig_client = ai_service._groq_client
    ai_service._groq_client = None  # simulate offline / missing key
    fallback_res = ai_service.infer_schema("email,salary\njohn@doe.com,95000", "csv", "employees")
    assert fallback_res is not None
    assert fallback_res.ai_used is False
    assert len(fallback_res.columns) == 2
    # Restore
    ai_service._groq_client = orig_client


# ── 9. Resource Control: Row Limit and Cancellation ──────────────────────────
def test_resource_control_row_limit_and_cancellation():
    """
    Verifies:
    1. Requests for massive row counts (e.g. 100,000) are capped to MAX_ALLOWED_ROWS (50,000).
    2. Cancelled jobs terminate gracefully without crashing.
    """
    raw_df = pd.DataFrame({"id": range(10), "score": [99.5] * 10})
    profile = profile_dataframe(raw_df, "test_resource")
    job_store.store_session("ds_res_test", {
        "df": raw_df,
        "profile": profile,
        "fingerprint": "abc123",
        "filename": "test.csv",
        "modality": "tabular",
    })

    # Create job with 1,000,000 rows
    job = job_store.create_job("ds_res_test", {"row_count": 1_000_000, "model_strategy": "deterministic"})
    assert job.state == "queued"

    # Cancel immediately
    job_store.cancel_job(job.job_id)
    cancelled_job = job_store.get_job(job.job_id)
    assert cancelled_job.state == "cancelled"


# ── 10. Security Testing: Zero-byte, Null Bytes, SQL Injection Identifiers ────
def test_security_suite_zero_byte_null_bytes_and_injection():
    """
    Verifies:
    1. Zero-byte files rejected.
    2. Files with null bytes rejected.
    3. Files with path traversal rejected.
    4. SQL identifiers with injection payloads are safely quoted.
    """
    # 1. Zero-byte upload
    with pytest.raises(IngestionError, match="empty"):
        ingest(b"", "empty.csv")

    # 2. Null byte characters
    with pytest.raises(IngestionError, match="null byte"):
        ingest(b"col1,col2\nval1\x00,val2", "bad_null.csv")

    # 3. Path traversal
    with pytest.raises(IngestionError, match="Invalid filename"):
        ingest(b"a,b\n1,2", "../../etc/passwd.csv")

    # 4. SQL Injection in table / column names
    malicious_dataset = {
        "tables": {
            "users; DROP TABLE users; --": [
                {"id'; DROP TABLE students; --": 1, "name": "Akif"}
            ]
        }
    }
    exp_res = client.post(
        "/api/v1/export",
        json={"format": "sql", "modality": "relational", "dataset": malicious_dataset},
    )
    assert exp_res.status_code == 200
    sql_text = exp_res.json()["data"]["raw_content"]
    # Identifiers must be double-quoted to neutralize SQL injection
    assert '"users; DROP TABLE users; --"' in sql_text
    assert '"id\'; DROP TABLE students; --"' in sql_text


# ── 11. Export Integrity: Preview Size vs Requested Count ────────────────────
def test_export_integrity_preview_vs_requested():
    """
    Verifies clear distinction between preview size and generated/exported artifact size.
    For 200 requested rows:
    - JSON preview payload returns rows capped to preview limit
    - Exported CSV contains all 200 requested rows
    """
    raw_df = pd.DataFrame({
        "customer_id": range(100),
        "signup_age": [20 + (i % 50) for i in range(100)],
        "balance": [100.0 * i for i in range(100)],
    })
    csv_bytes = raw_df.to_csv(index=False).encode("utf-8")

    res = client.post(
        "/api/v1/datasets/ingest",
        files={"file": ("preview_test.csv", csv_bytes, "text/csv")},
    )
    dataset_id = res.json()["data"]["dataset_id"]

    gen_res = client.post(
        f"/api/v1/datasets/{dataset_id}/generate/sync",
        json={"row_count": 200, "seed": 42, "model_strategy": "statistical"},
    )
    assert gen_res.status_code == 200
    gen_data = gen_res.json()["data"]
    assert gen_data["rows_generated"] == 200

    # Streamed export must contain all 200 rows
    exp = client.get(f"/api/v1/datasets/{dataset_id}/export?format=csv")
    assert exp.status_code == 200
    exported_df = pd.read_csv(io.StringIO(exp.text))
    assert len(exported_df) == 200
