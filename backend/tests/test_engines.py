from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.models.schemas import TabularGenerateRequest, RelationalGenerateRequest, InvoiceGenerateRequest, BankStatementGenerateRequest

client = TestClient(app)

def test_tabular_generation_default():
    response = client.post("/api/v1/generate/tabular", json={"row_count": 25, "random_seed": 42})
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    data = payload["data"]
    assert data["total_rows_generated"] == 25
    assert len(data["rows"]) == 25
    assert data["seed_applied"] == 42
    # Verify standard columns
    first_row = data["rows"][0]
    assert "ID" in first_row
    assert "Name" in first_row
    assert "Email" in first_row
    assert "Signup" in first_row
    assert "Balance" in first_row

def test_tabular_seed_determinism():
    res1 = client.post("/api/v1/generate/tabular", json={"row_count": 10, "random_seed": 10231})
    res2 = client.post("/api/v1/generate/tabular", json={"row_count": 10, "random_seed": 10231})
    assert res1.status_code == 200 and res2.status_code == 200
    assert res1.json()["data"]["rows"] == res2.json()["data"]["rows"]

def test_tabular_privacy_masking():
    response = client.post("/api/v1/generate/tabular", json={
        "row_count": 5,
        "random_seed": 99,
        "columns": [
            {"name": "Email", "data_type": "string", "semantic_type": "email", "privacy": {"mask": True}}
        ]
    })
    assert response.status_code == 200
    rows = response.json()["data"]["rows"]
    for r in rows:
        assert "*" in r["Email"]
        assert "@" in r["Email"]

def test_relational_generation_and_integrity():
    response = client.post("/api/v1/generate/relational", json={
        "random_seed": 42,
        "table_row_counts": {"customers": 10}
    })
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    data = payload["data"]
    tables = data["tables"]
    
    customers = tables["customers"]
    orders = tables["orders"]
    order_items = tables["order_items"]

    assert len(customers) == 10
    assert len(orders) >= 10
    assert len(order_items) >= len(orders)

    # 1. Referential integrity: 0 orphaned keys
    cust_ids = set(c["customer_id"] for c in customers)
    for o in orders:
        assert o["customer_id"] in cust_ids

    order_ids = set(o["order_id"] for o in orders)
    for it in order_items:
        assert it["order_id"] in order_ids

    # 2. Arithmetic Reconciliation
    assert data["referential_integrity"]["status"] == "passed"
    assert data["reconciliation_audit"]["status"] == "passed"
    assert data["reconciliation_audit"]["discrepancies_count"] == 0

    for o in orders:
        items_for_order = [it for it in order_items if it["order_id"] == o["order_id"]]
        expected_total = round(sum(it["amount"] for it in items_for_order), 2)
        assert abs(expected_total - o["total_amount"]) < 0.001

def test_invoice_generation_math_reconciliation():
    response = client.post("/api/v1/generate/documents/invoice", json={
        "count": 3,
        "random_seed": 10432,
        "tax_rate": 0.05
    })
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    invoices = payload["data"]["invoices"]
    assert len(invoices) == 3

    for inv in invoices:
        subtotal = round(sum(it["amount"] for it in inv["line_items"]), 2)
        assert abs(subtotal - inv["subtotal"]) < 0.001
        expected_total = round(subtotal + inv["tax"], 2)
        assert abs(expected_total - inv["total"]) < 0.001

def test_bank_statement_running_balance_math():
    response = client.post("/api/v1/generate/documents/bank-statement", json={
        "starting_balance": 1204.30,
        "transaction_count": 10,
        "random_seed": 777
    })
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    statement = payload["data"]["statement"]
    txns = statement["transactions"]

    curr = statement["starting_balance"]
    for t in txns:
        c = t["credit"] or 0.0
        d = t["debit"] or 0.0
        curr = round(curr + c - d, 2)
        assert abs(curr - t["balance"]) < 0.001

    assert abs(curr - statement["ending_balance"]) < 0.001
    assert payload["data"]["balance_audit"]["status"] == "passed"

def test_schema_infer_endpoint():
    sample_csv = "id,name,email,balance\n1,Alice,alice@example.com,500.00\n2,Bob,bob@example.com,750.50"
    response = client.post("/api/v1/schema/infer", json={
        "raw_content": sample_csv,
        "format": "csv",
        "table_name": "users"
    })
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    cols = {c["name"]: c for c in payload["data"]["columns"]}
    assert "id" in cols
    assert cols["id"]["data_type"] == "integer"
    assert "email" in cols
    assert cols["email"]["semantic_type"] == "email"

def test_export_service_csv_and_sql():
    tabular_res = client.post("/api/v1/generate/tabular", json={"row_count": 5, "random_seed": 1})
    dataset = tabular_res.json()["data"]

    # Export to CSV
    csv_res = client.post("/api/v1/export", json={
        "format": "csv",
        "modality": "tabular",
        "dataset": dataset
    })
    assert csv_res.status_code == 200
    assert "ID,Name,Email,Signup,Balance" in csv_res.json()["data"]["raw_content"]

    # Export to SQL
    sql_res = client.post("/api/v1/export", json={
        "format": "sql",
        "modality": "tabular",
        "dataset": dataset
    })
    assert sql_res.status_code == 200
    assert "CREATE TABLE" in sql_res.json()["data"]["raw_content"]
    assert "INSERT INTO" in sql_res.json()["data"]["raw_content"]


def test_validation_endpoint():
    # Tabular validation
    tab_res = client.post("/api/v1/generate/tabular", json={"row_count": 5, "random_seed": 42})
    val_res = client.post("/api/v1/validate", json={"modality": "tabular", "dataset": tab_res.json()["data"]})
    assert val_res.status_code == 200
    assert val_res.json()["data"]["overall_status"] == "passed"

    # Relational validation
    rel_res = client.post("/api/v1/generate/relational", json={"random_seed": 42})
    rel_val_res = client.post("/api/v1/validate", json={"modality": "relational", "dataset": rel_res.json()["data"]})
    assert rel_val_res.status_code == 200
    assert rel_val_res.json()["data"]["overall_status"] == "passed"

def test_evaluation_endpoint():
    tab_res = client.post("/api/v1/generate/tabular", json={"row_count": 10, "random_seed": 42})
    eval_res = client.post("/api/v1/evaluate", json={"modality": "tabular", "dataset": tab_res.json()["data"]})
    assert eval_res.status_code == 200
    data = eval_res.json()["data"]
    assert data["overall_status"] == "passed"
    assert data["overall_score"] > 0.8
    assert data["statistical_fidelity"]["status"] == "passed"
    assert data["structural_fidelity"]["status"] == "passed"
    assert data["privacy_compliance"]["status"] == "passed"

def test_evaluation_document_invoice_and_statement():
    # 1. Invoice evaluation
    inv_res = client.post("/api/v1/generate/documents/invoice", json={"count": 1, "random_seed": 10432})
    assert inv_res.status_code == 200
    inv_eval = client.post("/api/v1/evaluate", json={"modality": "documents", "dataset": inv_res.json()["data"]})
    assert inv_eval.status_code == 200
    inv_data = inv_eval.json()["data"]
    assert inv_data["overall_status"] == "passed"
    assert inv_data["business_rules"]["status"] == "passed"
    assert inv_data["business_rules"]["score"] == 1.0

    # 2. Bank statement evaluation
    stmt_res = client.post("/api/v1/generate/documents/bank-statement", json={"random_seed": 42})
    assert stmt_res.status_code == 200
    stmt_eval = client.post("/api/v1/evaluate", json={"modality": "documents", "dataset": stmt_res.json()["data"]})
    assert stmt_eval.status_code == 200
    stmt_data = stmt_eval.json()["data"]
    assert stmt_data["overall_status"] == "passed"
    assert stmt_data["business_rules"]["status"] == "passed"
    assert stmt_data["business_rules"]["score"] == 1.0

def test_export_service_relational_and_documents():
    # 1. Relational SQL export
    rel_res = client.post("/api/v1/generate/relational", json={"random_seed": 42})
    assert rel_res.status_code == 200
    rel_export = client.post("/api/v1/export", json={
        "format": "sql",
        "modality": "relational",
        "dataset": rel_res.json()["data"]
    })
    assert rel_export.status_code == 200
    assert "CREATE TABLE IF NOT EXISTS customers" in rel_export.json()["data"]["raw_content"]
    assert "INSERT INTO customers" in rel_export.json()["data"]["raw_content"]

    # 2. Bank statement CSV export
    stmt_res = client.post("/api/v1/generate/documents/bank-statement", json={"random_seed": 42})
    stmt_export = client.post("/api/v1/export", json={
        "format": "csv",
        "modality": "documents",
        "dataset": stmt_res.json()["data"]
    })
    assert stmt_export.status_code == 200
    assert "date,description,debit,credit,balance" in stmt_export.json()["data"]["raw_content"]


def test_relational_generic_profile_driven():
    """
    Relational engine with a non-ecommerce DataProfile schema:
    employees → projects (1:N). No hardcoded customers/orders/order_items.
    """
    from backend.app.models.data_profile import (
        DataProfile, TableProfile, ColumnProfile, RelationshipProfile, DistributionConfig
    )
    from backend.app.engine.relational_engine import relational_engine
    from backend.app.models.schemas import RelationalGenerateRequest

    employees_profile = TableProfile(
        name="employees",
        row_count=5,
        primary_key="employee_id",
        columns=[
            ColumnProfile(name="employee_id", data_type="integer", is_primary_key=True),
            ColumnProfile(name="full_name", data_type="string", semantic_type="full_name"),
            ColumnProfile(name="department", data_type="string", distribution=DistributionConfig(
                type="categorical", categories=["Engineering", "Marketing", "Sales", "HR"]
            )),
            ColumnProfile(name="salary", data_type="currency", distribution=DistributionConfig(
                type="normal", mean=75000.0, std_dev=15000.0, min_value=30000.0, max_value=200000.0
            )),
        ]
    )
    projects_profile = TableProfile(
        name="projects",
        row_count=10,
        primary_key="project_id",
        columns=[
            ColumnProfile(name="project_id", data_type="integer", is_primary_key=True),
            ColumnProfile(name="employee_id", data_type="integer", is_foreign_key=True,
                         references_table="employees", references_column="employee_id"),
            ColumnProfile(name="project_name", data_type="string"),
            ColumnProfile(name="budget", data_type="currency", distribution=DistributionConfig(
                type="log_normal", mean=50000.0, std_dev=20000.0, min_value=5000.0
            )),
            ColumnProfile(name="start_date", data_type="date", semantic_type="date"),
        ]
    )
    profile = DataProfile(
        name="Enterprise HR",
        modality="relational",
        tables=[employees_profile, projects_profile],
        relationships=[
            RelationshipProfile(
                parent_table="employees", parent_key="employee_id",
                child_table="projects", child_key="employee_id",
                cardinality="1:N", min_children=1, max_children=3
            )
        ]
    )
    req = RelationalGenerateRequest(
        random_seed=42,
        schema_preset=None,  # force generic path
        profile=profile,
        table_row_counts={"employees": 5},
    )
    result = relational_engine.generate(req)

    assert "employees" in result.tables
    assert "projects" in result.tables
    assert result.table_counts["employees"] == 5
    # Each employee generates 1–3 projects; 5 employees → at least 5 projects
    assert result.table_counts["projects"] >= 5
    # Verify no hardcoded ecommerce columns
    emp_row = result.tables["employees"][0]
    assert "customer_id" not in emp_row
    assert "employee_id" in emp_row or "full_name" in emp_row
    # FK integrity should pass
    assert result.referential_integrity["status"] == "passed"

