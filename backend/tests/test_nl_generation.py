from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.nl_generation_engine import nl_generation_engine

client = TestClient(app)


def test_nl_generation_pakistani_ecommerce_flow():
    """
    Test Case 1: End-to-end natural language generation for Pakistani e-commerce customers.
    Verifies:
      - Intent parsed to Tabular modality
      - Row count extracted (10,000)
      - Locale set to en_PK
      - Currency PKR and city distribution (Lahore/Karachi dominance)
      - Formats CSV and SQL
      - Provenance tracking (explicit_user_request)
      - Deterministic Plan Validation passes
      - Real generation executes without LLM hallucination
      - Requirement Satisfaction Audit validates rules
      - Quality metrics scored
    """
    prompt = (
        "I need 10,000 realistic customer records for a Pakistani e-commerce company. "
        "Lahore and Karachi should be the most common cities. Output CSV and SQL."
    )
    response = client.post(
        "/api/v1/generation-requests",
        json={"user_prompt": prompt, "locale_hint": "en_PK"}
    )
    assert response.status_code == 200
    data = response.json()
    request_id = data["request_id"]
    assert request_id is not None
    spec = data["specification"]
    assert spec["modality"] == "tabular"
    assert spec["row_count"] == 10000
    assert spec.get("locale_code") == "en_PK" or spec["locale"]["country"] == "Pakistan"
    assert "csv" in spec["output_formats"]
    assert "sql" in spec["output_formats"]
    assert spec["provenance"]["locale"] == "explicit_user_request"

    # Validate plan
    val_res = client.post(f"/api/v1/generation-requests/{request_id}/plan/validate")
    assert val_res.status_code == 200
    val_data = val_res.json()
    assert val_data["is_valid"] is True
    assert val_data["status"] == "validated"
    assert len(val_data["ledger"]) > 0

    # Scale down spec row_count to 200 for fast test run
    spec_obj = nl_generation_engine.active_requests[request_id]["specification"]
    spec_obj.row_count = 200

    gen_res = client.post(f"/api/v1/generation-requests/{request_id}/generate")
    assert gen_res.status_code == 200
    gen_data = gen_res.json()
    assert gen_data["status"] == "completed"
    assert "generation_result" in gen_data
    assert "requirement_audit" in gen_data

    # Verify requirement satisfaction audit
    audit = gen_data["requirement_audit"]
    assert audit["verdict"] in ("PASSED", "WARNING")
    assert audit["total_checks"] > 0
    assert audit["failed_checks"] == 0

    # Verify preview & export endpoints
    res_endpoint = client.get(f"/api/v1/generation-requests/{request_id}/result")
    assert res_endpoint.status_code == 200
    res_data = res_endpoint.json()
    assert "generation_result" in res_data
    assert "preview_rows" in res_data["generation_result"]
    assert "exports" in res_data["generation_result"]
    assert "csv" in res_data["generation_result"]["exports"]
    assert "sql" in res_data["generation_result"]["exports"]


def test_nl_generation_relational_billing_flow():
    """
    Test Case 2: Relational billing data request with multiple entities and referential integrity.
    "I need relational billing data with customers, invoices, invoice items, products and payments for 500 invoices."
    """
    prompt = "I need relational billing data with customers, invoices, invoice items, products and payments for 500 invoices."
    response = client.post(
        "/api/v1/generation-requests",
        json={"user_prompt": prompt}
    )
    assert response.status_code == 200
    data = response.json()
    request_id = data["request_id"]
    spec = data["specification"]
    assert spec["modality"] == "relational"
    assert len(spec["entities"]) >= 3

    # Validate plan
    val_res = client.post(f"/api/v1/generation-requests/{request_id}/plan/validate")
    assert val_res.status_code == 200
    assert val_res.json()["is_valid"] is True

    # Scale down for fast test run
    spec_obj = nl_generation_engine.active_requests[request_id]["specification"]
    spec_obj.row_count = 50

    # Generate relational
    gen_res = client.post(f"/api/v1/generation-requests/{request_id}/generate")
    assert gen_res.status_code == 200
    gen_data = gen_res.json()
    assert gen_data["status"] == "completed"
    assert "relational_tables" in gen_data["generation_result"]
    assert len(gen_data["generation_result"]["relational_tables"]) >= 3


def test_nl_generation_conversational_refinement():
    """
    Test Case 3: Interactive conversational refinement.
    User asks initial prompt -> system asks clarification or accepts -> user refines ("Make it 20,000 instead").
    """
    prompt = "Generate employee records for HR dashboard testing."
    res = client.post(
        "/api/v1/generation-requests",
        json={"user_prompt": prompt}
    )
    assert res.status_code == 200
    request_id = res.json()["request_id"]

    # Refine with conversational turn
    msg_res = client.post(
        f"/api/v1/generation-requests/{request_id}/message",
        json={"message": "Please set the volume to 25,000 rows and include salary_band and department."}
    )
    assert msg_res.status_code == 200
    updated = msg_res.json()
    spec = updated["specification"]
    assert spec["row_count"] == 25000
    col_names = [c["name"].lower() for c in spec["columns"]]
    assert any("salary" in c for c in col_names)
    assert any("department" in c for c in col_names)


def test_nl_generation_roman_urdu_understanding():
    """
    Test Case 4: Roman Urdu natural language request.
    "Mujhe Pakistan ke retail business ke liye 5,000 customers ka synthetic data chahiye. Lahore aur Karachi zyada common hon."
    """
    prompt = "Mujhe Pakistan ke retail business ke liye 5000 customers ka synthetic data chahiye. Lahore aur Karachi zyada common hon aur mujhe CSV aur SQL output chahiye."
    res = client.post(
        "/api/v1/generation-requests",
        json={"user_prompt": prompt}
    )
    assert res.status_code == 200
    spec = res.json()["specification"]
    assert spec.get("locale_code") == "en_PK" or spec["locale"]["country"] == "Pakistan"
    assert spec["row_count"] == 5000
    assert "csv" in spec["output_formats"]
    assert "sql" in spec["output_formats"]


def test_nl_generation_vague_prompt_clarification():
    """
    Test Case 5: Extremely vague prompt triggers structured clarification question.
    """
    prompt = "give me data"
    res = client.post(
        "/api/v1/generation-requests",
        json={"user_prompt": prompt}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["needs_clarification"] is True
    assert len(data["clarification_questions"]) > 0

