import io
import pandas as pd
import pytest
from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)

@pytest.fixture(scope="module")
def ingested_test_dataset():
    """Helper fixture to ingest a test dataset."""
    df = pd.read_csv("sample/test/employee_salary.csv").head(60)
    csv_bytes = df.to_csv(index=False).encode("utf-8")
    res = client.post(
        "/api/v1/datasets/ingest",
        files={"file": ("employee_salary.csv", csv_bytes, "text/csv")},
        data={"table_name": "employee_salary", "use_ai": "false"},
    )
    assert res.status_code == 200
    data = res.json()["data"]
    return data["dataset_id"]

def test_model_benchmark_endpoint(ingested_test_dataset):
    ds_id = ingested_test_dataset
    res = client.post(f"/api/v1/datasets/{ds_id}/benchmark")
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    data = body["data"]
    assert "candidates" in data
    assert len(data["candidates"]) >= 3
    assert data["selected_model"] != ""
    assert "selection_rationale" in data

def test_tstr_evaluation_endpoint(ingested_test_dataset):
    ds_id = ingested_test_dataset
    res = client.post(
        f"/api/v1/datasets/{ds_id}/tstr",
        json={"target_column": "Salary (USD)", "task_type": "regression"},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    data = body["data"]
    assert data["target_column"] == "Salary (USD)"
    assert data["status"] == "completed"
    assert "metrics" in data
    assert len(data["metrics"]) > 0
    assert data["overall_utility_retention"] > 0

def test_controlled_regeneration_endpoint(ingested_test_dataset):
    ds_id = ingested_test_dataset
    res = client.post(
        f"/api/v1/datasets/{ds_id}/regenerate",
        json={"strategy": "rebalance", "parameters": {"seed": 999}},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    data = body["data"]
    assert data["applied_strategy"] == "rebalance"
    assert data["status"] in ("completed", "worse_retained")
    assert "quality_delta" in data

def test_semantic_understanding_endpoint(ingested_test_dataset):
    ds_id = ingested_test_dataset
    res = client.get(f"/api/v1/datasets/{ds_id}/semantic-understanding")
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    data = body["data"]
    assert "meanings" in data
    assert "ai_suggestions" in data
    assert len(data["meanings"]) > 0

def test_synthia_session_and_messages(ingested_test_dataset):
    ds_id = ingested_test_dataset
    # 1. Create session in English
    s_res = client.post(
        "/api/v1/assistant/synthia/session",
        json={"dataset_id": ds_id, "language": "en"},
    )
    assert s_res.status_code == 200
    sid = s_res.json()["data"]["session_id"]

    # 2. Send message asking for salary band column
    m_res = client.post(
        "/api/v1/assistant/synthia/message",
        json={
            "session_id": sid,
            "message": "Can you add a salary_band column?",
            "language": "en",
        },
    )
    assert m_res.status_code == 200
    msg = m_res.json()["data"]
    assert msg["role"] == "assistant"
    assert msg.get("proposal") is not None
    assert msg["proposal"]["type"] == "add_synthetic_columns"

    # 3. Test Roman Urdu understanding
    m_urdu = client.post(
        "/api/v1/assistant/synthia/message",
        json={
            "session_id": sid,
            "message": "Model benchmark kaise kaam karta hai?",
            "language": "ur-Latn",
        },
    )
    assert m_urdu.status_code == 200
    msg_u = m_urdu.json()["data"]
    assert "Statistical Baseline" in msg_u["content"] or "CTGAN" in msg_u["content"]

    # 4. Execute confirmed proposal action
    act_res = client.post(
        "/api/v1/assistant/synthia/action",
        json={
            "session_id": sid,
            "action_type": msg["proposal"]["type"],
            "parameters": {
                "dataset_id": ds_id,
                "columns": msg["proposal"]["columns"],
            },
        },
    )
    assert act_res.status_code == 200
    assert act_res.json()["data"]["status"] == "applied"

def test_durable_execution_history():
    res = client.get("/api/v1/history/runs")
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    data = body["data"]
    assert data["total_records"] >= 1
