from __future__ import annotations
import json
import logging
import time
from typing import Any, Dict, Optional

from backend.app.core.config import settings

logger = logging.getLogger("hackdata.queue")

_QUEUE_NAME = "hackdata:jobs"
_client = None

def _get_redis():
    global _client
    if _client is not None:
        try:
            _client.ping()
            return _client
        except Exception:
            _client = None
    if not settings.REDIS_URL:
        return None
    try:
        import redis
        _client = redis.from_url(settings.REDIS_URL, decode_responses=True, socket_connect_timeout=5)
        _client.ping()
        logger.info("Redis queue connected: %s", settings.REDIS_URL.split("@")[-1])
        return _client
    except Exception as exc:
        logger.error("Failed to connect to Redis queue: %s", exc)
        return None

def enqueue_job(job_id: str, dataset_id: str, config: Dict[str, Any]) -> bool:
    r = _get_redis()
    if r is None:
        logger.warning("Redis not configured - job %s will run in-process only", job_id)
        return False
    message = json.dumps({"job_id": job_id, "dataset_id": dataset_id, "config": config})
    try:
        r.rpush(_QUEUE_NAME, message)
        logger.info("Enqueued job %s to Redis queue", job_id)
        return True
    except Exception as exc:
        logger.error("Failed to enqueue job %s: %s", job_id, exc)
        return False

def dequeue_job(timeout: int = 30) -> Optional[Dict[str, Any]]:
    r = _get_redis()
    if r is None:
        return None
    try:
        result = r.blpop(_QUEUE_NAME, timeout=timeout)
        if result is None:
            return None
        _, message = result
        return json.loads(message)
    except Exception as exc:
        logger.error("Failed to dequeue job: %s", exc)
        return None

def is_queue_configured() -> bool:
    return bool(settings.REDIS_URL)

def check_queue_health() -> Dict[str, Any]:
    r = _get_redis()
    if r is None:
        return {"status": "not_configured", "queue_length": 0}
    try:
        length = r.llen(_QUEUE_NAME)
        return {"status": "connected", "queue_length": length}
    except Exception as exc:
        return {"status": "error", "error": str(exc)}
