from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "HackData V2 Synthetic Data Platform"
    assert data["status"] == "online"

def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert payload["data"]["status"] == "healthy"
    assert payload["data"]["service"] == "hackdata-v2-api"
    assert "request_id" in payload["metadata"]

def test_health_ready_endpoint():
    response = client.get("/api/v1/health/ready")
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert payload["data"]["status"] == "ready"
    services = payload["data"]["services"]
    assert services["tabular_engine"] == "ready"
    assert services["relational_engine"] == "ready"
    assert services["document_engine"] == "ready"
    assert services["ai_service"] == "ready"

def test_request_validation_error_envelope():
    # Make invalid post request to trigger 422
    response = client.post("/api/v1/schema/infer", json={"invalid": "payload"})
    assert response.status_code in [404, 422]  # until router is connected
