import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.ai.cache import AICache
from backend.app.ai.rate_limiter import AIRateLimiter
from backend.app.ai.groq_service import AIService

client = TestClient(app)

def test_ai_cache_basic():
    cache = AICache(max_size=3, default_ttl=60)
    assert cache.get("k1") is None
    cache.set("k1", {"data": 123})
    assert cache.get("k1") == {"data": 123}
    assert cache.hits == 1
    assert cache.misses == 1

def test_ai_cache_eviction():
    cache = AICache(max_size=2, default_ttl=60)
    cache.set("a", 1)
    cache.set("b", 2)
    cache.set("c", 3)
    assert len(cache._cache) == 2
    assert cache.evictions == 1

def test_ai_rate_limiter():
    limiter = AIRateLimiter(max_requests_per_minute=2, burst_limit=2)
    ok1, wait1 = limiter.acquire()
    ok2, wait2 = limiter.acquire()
    ok3, wait3 = limiter.acquire()
    assert ok1 is True
    assert ok2 is True
    assert ok3 is False
    assert wait3 > 0.0
    stats = limiter.stats()
    assert stats["total_allowed"] == 2
    assert stats["total_throttled"] == 1

def test_groq_service_heuristics():
    svc = AIService()
    raw = "ID,Name,Email,Signup,Balance\n1,Alice,alice@corp.com,2025-01-01,950.0"
    res = svc.infer_schema(raw, format_type="csv", table_name="users")
    assert res.table_name == "users"
    assert len(res.columns) == 5
    col_names = [c.name for c in res.columns]
    assert "ID" in col_names
    assert "Email" in col_names

def test_groq_service_query_interpretation():
    svc = AIService()
    q = "Generate 100 SaaS invoices in EUR with high discounts"
    res = svc.interpret_query(q)
    assert res.currency == "EUR"
    assert res.row_count == 100
    assert res.domain == "saas"
    assert res.modality == "document"
    assert res.document_type == "invoice"

def test_groq_service_semantic_pools():
    svc = AIService()
    pool = svc.generate_semantic_pool(category="products", count=5, domain="ecommerce")
    assert len(pool) == 5
    assert isinstance(pool[0], str)

def test_ai_interpret_query_endpoint():
    payload = {
        "query": "Create 30 bank statement transactions for last 90 days with balance over $1,000",
        "modality": "document"
    }
    res = client.post("/api/v1/ai/interpret-query", json=payload)
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    data = body["data"]
    assert data["document_type"] == "bank_statement"
    assert data["row_count"] == 30
    assert data["filters"].get("days") == 90
    assert data["filters"].get("min_balance") == 1000.0

def test_ai_semantic_pool_endpoint():
    payload = {
        "category": "merchants",
        "count": 6,
        "domain": "financial"
    }
    res = client.post("/api/v1/ai/semantic-pool", json=payload)
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    assert len(body["data"]["items"]) == 6

def test_ai_metrics_endpoint():
    res = client.get("/api/v1/ai/metrics")
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    assert "cache" in body["data"]
    assert "rate_limiter" in body["data"]

def test_schema_infer_with_ai():
    payload = {
        "raw_content": "id,full_name,email,signup_date,account_balance\n101,John Doe,john@test.com,2025-01-01,150.00",
        "format": "csv",
        "table_name": "customers",
        "use_ai": True
    }
    res = client.post("/api/v1/schema/infer", json=payload)
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    data = body["data"]
    assert data["table_name"] == "customers"
    assert len(data["columns"]) == 5
