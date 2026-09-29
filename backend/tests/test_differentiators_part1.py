import pytest
import pandas as pd
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.models.data_profile import SyntheticColumnSpec, DistributionConfig
from backend.app.engine.synthetic_column_generator import (
    generate_synthetic_column_values,
    apply_synthetic_columns,
    validate_column_name,
)
from backend.app.engine.benchmark_engine import run_benchmark
from backend.app.engine.tstr_engine import evaluate_tstr, identify_suitable_targets
from backend.app.engine.regeneration_engine import (
    diagnose_generation_issues,
    execute_controlled_regeneration,
)
from backend.app.services.synthia_service import synthia_service
from backend.app.services.supabase_service import SupabaseService

client = TestClient(app)


# ── 1. Synthetic Column Engine & Validation Tests ─────────────────────────────

def test_synthetic_column_name_validation():
    existing = ["id", "name", "salary"]
    with pytest.raises(ValueError, match="cannot be empty"):
        validate_column_name("", existing)
    with pytest.raises(ValueError, match="Invalid column name"):
        validate_column_name("invalid-name-with-dashes", existing)
    with pytest.raises(ValueError, match="already exists"):
        validate_column_name("salary", existing)
    with pytest.raises(ValueError, match="already exists"):
        validate_column_name("SALARY", existing)
    # Valid name
    validate_column_name("bonus_tier_2026", existing)


def test_synthetic_column_generation_types_and_seed():
    # Integer with range and normal distribution
    spec_int = SyntheticColumnSpec(
        name="bonus_amount",
        data_type="integer",
        range_min=100,
        range_max=5000,
        distribution=DistributionConfig(type="normal", mean=2000, std_dev=500),
        seed=123,
    )
    vals1 = generate_synthetic_column_values(spec_int, num_rows=20, seed=123)
    vals2 = generate_synthetic_column_values(spec_int, num_rows=20, seed=123)
    assert len(vals1) == 20
    assert vals1 == vals2  # Deterministic seed reproducibility
    assert all(isinstance(v, int) for v in vals1)
    assert all(100 <= v <= 5000 for v in vals1)

    # Categorical with weights
    spec_cat = SyntheticColumnSpec(
        name="performance_band",
        data_type="categorical",
        categories=["Low", "Medium", "High"],
        weights=[0.1, 0.7, 0.2],
        seed=456,
    )
    cat_vals = generate_synthetic_column_values(spec_cat, num_rows=50)
    assert len(cat_vals) == 50
    assert set(cat_vals).issubset({"Low", "Medium", "High"})

    # Date range
    spec_date = SyntheticColumnSpec(
        name="contract_date",
        data_type="date",
        date_start="2025-01-01",
        date_end="2025-12-31",
        date_format="%Y-%m-%d",
    )
    date_vals = generate_synthetic_column_values(spec_date, num_rows=15)
    assert len(date_vals) == 15
    assert all(d.startswith("2025-") for d in date_vals)

    # Float/currency
    spec_float = SyntheticColumnSpec(
        name="risk_score",
        data_type="float",
        range_min=0.0,
        range_max=1.0,
    )
    float_vals = generate_synthetic_column_values(spec_float, num_rows=10)
    assert all(0.0 <= v <= 1.0 for v in float_vals)


def test_synthetic_columns_api_flow():
    # Ingest employee salary
    csv_bytes = b"id,name,salary,department\n1,Alice,70000,Engineering\n2,Bob,80000,Sales\n3,Charlie,90000,Engineering\n4,David,60000,Support\n"
    res_ingest = client.post(
        "/api/v1/datasets/ingest",
        files={"file": ("staff.csv", csv_bytes, "text/csv")},
        data={"table_name": "staff"},
    )
    assert res_ingest.status_code == 200
    dataset_id = res_ingest.json()["data"]["dataset_id"]

    # Add synthetic column via API
    col_payload = {
        "name": "tenure_tier",
        "data_type": "categorical",
        "semantic_type": "tier",
        "categories": ["Junior", "Mid", "Senior"],
    }
    res_add = client.post(f"/api/v1/datasets/{dataset_id}/synthetic-columns", json=col_payload)
    assert res_add.status_code == 200
    assert res_add.json()["data"]["column_added"]["name"] == "tenure_tier"

    # Reject duplicate
    res_dup = client.post(f"/api/v1/datasets/{dataset_id}/synthetic-columns", json=col_payload)
    assert res_dup.status_code == 422

    # Verify column appears in sync generation
    res_gen = client.post(f"/api/v1/datasets/{dataset_id}/generate/sync", json={"row_count": 5, "seed": 42})
    assert res_gen.status_code == 200
    gen_data = res_gen.json()["data"]
    assert "tenure_tier" in gen_data["columns"]
    assert len(gen_data["rows"]) == 5
    assert all("tenure_tier" in r for r in gen_data["rows"])

    # Verify column appears in export
    res_export = client.get(f"/api/v1/datasets/{dataset_id}/export?format=csv")
    assert res_export.status_code == 200
    csv_text = res_export.text
    assert "tenure_tier" in csv_text


# ── 2. Real Model Benchmarking Tests ──────────────────────────────────────────

def test_model_benchmarking_real_candidates():
    df = pd.read_csv("sample/test/employee_salary.csv").head(40)
    bench_result = run_benchmark(df, evaluation_sample_size=20, seed=42)
    assert "selected_model" in bench_result
    assert "candidates" in bench_result
    candidate_names = [c["name"] for c in bench_result["candidates"]]
    assert "StatisticalBaseline" in candidate_names
    assert "DeterministicFallback" in candidate_names

    stat_rep = next(c for c in bench_result["candidates"] if c["name"] == "StatisticalBaseline")
    assert stat_rep["available"] is True
    assert stat_rep["fit_status"] == "passed"
    assert stat_rep["sample_status"] == "passed"
    assert stat_rep["fit_time_ms"] >= 0
    assert stat_rep["overall_score"] > 0


def test_model_benchmarking_api_endpoint():
    csv_bytes = b"age,income,score\n25,50000,700\n35,80000,750\n45,120000,800\n30,60000,710\n40,95000,770\n"
    res_ingest = client.post(
        "/api/v1/datasets/ingest",
        files={"file": ("credit.csv", csv_bytes, "text/csv")},
    )
    dataset_id = res_ingest.json()["data"]["dataset_id"]

    res_bench = client.post(f"/api/v1/datasets/{dataset_id}/benchmark", json={"seed": 42})
    assert res_bench.status_code == 200
    data = res_bench.json()["data"]
    assert "selected_model" in data
    assert len(data["candidates"]) >= 2


# ── 3. TSTR (Train on Synthetic, Test on Real) Tests ─────────────────────────

def test_tstr_classification_and_regression():
    df = pd.read_csv("sample/test/employee_salary.csv").head(60)
    targets = identify_suitable_targets(df)
    assert len(targets) > 0

    synth_df = df.copy()

    # Classification test
    class_target = next((t["column"] for t in targets if t["task_type"] == "classification"), None)
    if class_target:
        res_clf = evaluate_tstr(df, synth_df, target_column=class_target, task_type="classification")
        assert res_clf["task_type"] == "classification"
        assert "utility_retention_pct" in res_clf
        assert 0.0 <= res_clf["utility_retention_pct"] <= 100.0
        assert "real_to_real" in res_clf
        assert "synthetic_to_real" in res_clf

    # Regression test
    reg_target = next((t["column"] for t in targets if t["task_type"] == "regression"), None)
    if reg_target:
        res_reg = evaluate_tstr(df, synth_df, target_column=reg_target, task_type="regression")
        assert res_reg["task_type"] == "regression"
        assert "utility_retention_pct" in res_reg
        assert 0.0 <= res_reg["utility_retention_pct"] <= 100.0


def test_tstr_invalid_target_and_leakage_rejection():
    df = pd.DataFrame({"a": range(20), "b": range(20)})
    synth_df = df.copy()

    with pytest.raises(ValueError, match="does not exist"):
        evaluate_tstr(df, synth_df, target_column="nonexistent")

    tiny_df = pd.DataFrame({"a": [1, 2], "b": [3, 4]})
    with pytest.raises(ValueError, match="Minimum 15 rows"):
        evaluate_tstr(tiny_df, tiny_df, target_column="b")


# ── 4. Controlled Regeneration Engine Tests ───────────────────────────────────

def test_regeneration_diagnostics_and_execution():
    df = pd.read_csv("sample/test/employee_salary.csv").head(50)
    synth_df = df.sample(30, random_state=1).copy()

    findings = diagnose_generation_issues(df, synth_df)
    assert len(findings) > 0

    # Execute controlled regeneration with categorical rebalancing
    regen = execute_controlled_regeneration(
        real_df=df,
        previous_synthetic_df=synth_df,
        strategy="rebalance_categories",
        reason="Test drift optimization",
    )
    assert regen["status"] == "completed"
    assert "previous_metrics" in regen
    assert "new_metrics" in regen
    assert "improvement_delta" in regen
    assert "preferred_run" in regen
    assert regen["preferred_run"] in ("new", "previous")


# ── 5. Synthia Assistant API & Structured Proposals ───────────────────────────

def test_synthia_session_and_message_proposal():
    res_sess = client.post("/api/v1/assistant/synthia/session", json={"language": "en"})
    assert res_sess.status_code == 200
    session_id = res_sess.json()["data"]["session_id"]
    assert "greeting" in res_sess.json()["data"]

    # Send message asking for a column suggestion
    res_msg = client.post(
        "/api/v1/assistant/synthia/message",
        json={
            "session_id": session_id,
            "message": "Can you recommend a synthetic column for salary data?",
        },
    )
    assert res_msg.status_code == 200
    msg_data = res_msg.json()["data"]
    assert "reply" in msg_data
    assert msg_data["proposal"] is not None
    assert msg_data["proposal"]["action"] == "add_synthetic_columns"


def test_synthia_action_execution_safety():
    csv_bytes = b"id,name,val\n1,Alpha,100\n2,Beta,200\n"
    res_ingest = client.post(
        "/api/v1/datasets/ingest",
        files={"file": ("sample.csv", csv_bytes, "text/csv")},
    )
    dataset_id = res_ingest.json()["data"]["dataset_id"]

    res_sess = client.post("/api/v1/assistant/synthia/session", json={"dataset_id": dataset_id})
    session_id = res_sess.json()["data"]["session_id"]

    # Confirm action
    action_payload = {
        "session_id": session_id,
        "dataset_id": dataset_id,
        "action_type": "add_synthetic_columns",
        "confirmed": True,
        "proposal": {
            "columns": [
                {
                    "name": "tier_level",
                    "data_type": "categorical",
                    "suggested_values": ["Tier1", "Tier2"],
                }
            ]
        },
    }
    res_act = client.post("/api/v1/assistant/synthia/action", json=action_payload)
    assert res_act.status_code == 200
    assert res_act.json()["data"]["status"] == "applied"

    # Reject unconfirmed action
    action_payload["confirmed"] = False
    res_unconf = client.post("/api/v1/assistant/synthia/action", json=action_payload)
    assert res_unconf.json()["data"]["status"] == "rejected"


# ── 6. Supabase Persistence Graceful Fallback ────────────────────────────────

def test_supabase_service_graceful_offline_behavior():
    # Instantiate with dummy/offline URL
    svc = SupabaseService(supabase_url="", supabase_key="")
    assert svc.is_configured is False
    # Must safely return None without throwing or crashing
    assert svc.insert("datasets", {"id": "test"}) is None
    assert svc.select("datasets") == []
    assert svc.persist_dataset("ds_test", "test", "tabular", "fp", 10, 2) is None
