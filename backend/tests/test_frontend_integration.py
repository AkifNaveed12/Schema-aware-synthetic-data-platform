import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_frontend_health_check_contract():
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    json_data = res.json()
    assert json_data["success"] is True
    assert json_data["data"]["status"] == "healthy"

def test_frontend_tabular_preview_contract():
    payload = {
        "generation": {
            "row_count": 25,
            "random_seed": 42,
            "locale": "en-US",
            "null_rate": 0.0,
            "outlier_rate": 0.0,
        },
        "privacy": {
            "enabled": True,
            "masking": True,
            "hashing": False,
            "differential_noise": False,
            "epsilon": 0.1,
        },
        "preview": True,
    }
    res = client.post("/api/v1/generate/tabular", json=payload)
    assert res.status_code == 200
    json_data = res.json()
    assert json_data["success"] is True
    assert "rows" in json_data["data"]
    assert len(json_data["data"]["rows"]) == 25
    # Verify slide 5 default columns exist
    first_row = json_data["data"]["rows"][0]
    for key in ["id", "name", "email", "signup_date", "balance"]:
        assert key in first_row

def test_frontend_relational_preview_contract():
    payload = {
        "generation": {
            "random_seed": 42,
            "locale": "en-US",
            "preview": True,
            "tables": {
                "customers": {"row_count": 10},
                "orders": {"cardinality": {"min": 1, "max": 3}},
                "order_items": {"cardinality": {"min": 1, "max": 4}},
            },
        },
        "validation": {
            "referential_integrity": True,
            "business_rules": True,
        },
    }
    res = client.post("/api/v1/generate/relational", json=payload)
    assert res.status_code == 200
    json_data = res.json()
    assert json_data["success"] is True
    tables = json_data["data"]["tables"]
    assert "customers" in tables
    assert "orders" in tables
    assert "order_items" in tables
    assert json_data["data"]["referential_integrity"]["orphaned_foreign_keys"] == 0

def test_frontend_invoice_preview_contract():
    payload = {
        "count": 1,
        "locale": "en-US",
        "currency": "USD",
        "random_seed": 10432,
        "business_type": "saas",
    }
    res = client.post("/api/v1/generate/documents/invoice", json=payload)
    assert res.status_code == 200
    json_data = res.json()
    assert json_data["success"] is True
    invoices = json_data["data"]["invoices"]
    assert len(invoices) == 1
    inv = invoices[0]
    assert inv["invoice_number"].startswith("INV-")
    # Verify exact math
    calculated_subtotal = round(sum(it["amount"] for it in inv["line_items"]), 2)
    assert abs(inv["subtotal"] - calculated_subtotal) < 0.001
    assert abs(inv["total"] - (inv["subtotal"] + inv["tax"])) < 0.001

def test_frontend_bank_statement_preview_contract():
    payload = {
        "locale": "en-US",
        "currency": "USD",
        "random_seed": 777,
        "query": {"natural_language": "last 90 days, balance over $500"},
    }
    res = client.post("/api/v1/generate/documents/bank-statement", json=payload)
    assert res.status_code == 200
    json_data = res.json()
    assert json_data["success"] is True
    statement = json_data["data"]["statement"]
    assert statement["currency"] == "USD"
    # Verify running balance
    curr = statement["starting_balance"]
    for tx in statement["transactions"]:
        if tx["credit"] is not None:
            curr += tx["credit"]
        if tx["debit"] is not None:
            curr -= tx["debit"]
        assert abs(tx["balance"] - round(curr, 2)) < 0.001
