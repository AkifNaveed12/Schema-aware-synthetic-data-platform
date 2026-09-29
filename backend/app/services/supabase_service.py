from __future__ import annotations
import io, json, logging, time
from typing import Any, Dict, Optional
import pandas as pd
from backend.app.core.config import settings

logger = logging.getLogger("hackdata.supabase")
_BUCKET = "hackdata-v2"
_client = None

def _get_client():
    global _client
    if _client is not None:
        return _client
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        logger.warning("Supabase not configured. Running in local-only mode.")
        return None
    try:
        from supabase import create_client
        _client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
        logger.info("Supabase client initialised.")
        return _client
    except Exception as exc:
        logger.error("Failed to initialise Supabase client: %s", exc)
        return None

def _ensure_bucket(client) -> bool:
    try:
        buckets = [b.name for b in client.storage.list_buckets()]
        if _BUCKET not in buckets:
            client.storage.create_bucket(_BUCKET, options={"public": False})
        return True
    except Exception as exc:
        logger.error("Failed to ensure bucket: %s", exc)
        return False

def upload_raw_dataset(dataset_id: str, df: pd.DataFrame) -> Optional[str]:
    client = _get_client()
    if client is None:
        return None
    _ensure_bucket(client)
    path = f"datasets/raw/{dataset_id}.csv"
    try:
        csv_bytes = df.to_csv(index=False).encode("utf-8")
        client.storage.from_(_BUCKET).upload(path=path, file=csv_bytes, file_options={"content-type": "text/csv", "upsert": "true"})
        logger.info("Uploaded raw dataset: %s", path)
        return path
    except Exception as exc:
        logger.error("Failed to upload raw dataset: %s", exc)
        return None

def download_raw_dataset(dataset_id: str) -> Optional[pd.DataFrame]:
    client = _get_client()
    if client is None:
        return None
    path = f"datasets/raw/{dataset_id}.csv"
    try:
        data = client.storage.from_(_BUCKET).download(path)
        return pd.read_csv(io.BytesIO(data))
    except Exception as exc:
        logger.error("Failed to download raw dataset: %s", exc)
        return None

def upload_generated_dataset(dataset_id: str, df: pd.DataFrame) -> Optional[str]:
    client = _get_client()
    if client is None:
        return None
    _ensure_bucket(client)
    path = f"datasets/generated/{dataset_id}.csv"
    try:
        csv_bytes = df.to_csv(index=False).encode("utf-8")
        client.storage.from_(_BUCKET).upload(path=path, file=csv_bytes, file_options={"content-type": "text/csv", "upsert": "true"})
        logger.info("Uploaded generated dataset: %s", path)
        return path
    except Exception as exc:
        logger.error("Failed to upload generated dataset: %s", exc)
        return None

def get_generated_dataset_url(dataset_id: str, fmt: str = "csv") -> Optional[str]:
    client = _get_client()
    if client is None:
        return None
    path = f"datasets/generated/{dataset_id}.{fmt}"
    try:
        result = client.storage.from_(_BUCKET).create_signed_url(path, expires_in=3600)
        return result.get("signedURL") or result.get("signed_url")
    except Exception as exc:
        logger.error("Failed to get signed URL: %s", exc)
        return None

def upsert_job_record(job_dict: Dict[str, Any]) -> bool:
    client = _get_client()
    if client is None:
        return False
    try:
        record = {
            "job_id": job_dict.get("job_id"),
            "dataset_id": job_dict.get("dataset_id"),
            "state": job_dict.get("state"),
            "progress": job_dict.get("progress", 0),
            "message": job_dict.get("message", ""),
            "error": job_dict.get("error"),
            "created_at": int(job_dict.get("created_at") or time.time()),
            "updated_at": int(time.time()),
            "completed_at": int(job_dict.get("completed_at")) if job_dict.get("completed_at") else None,
        }
        client.table("jobs").upsert(record).execute()
        return True
    except Exception as exc:
        logger.error("Failed to upsert job record: %s", exc)
        return False

def get_job_record(job_id: str) -> Optional[Dict[str, Any]]:
    client = _get_client()
    if client is None:
        return None
    try:
        result = client.table("jobs").select("*").eq("job_id", job_id).execute()
        if result.data:
            return result.data[0]
        return None
    except Exception as exc:
        logger.error("Failed to get job record: %s", exc)
        return None

class SupabaseService:
    upload_raw_dataset = staticmethod(upload_raw_dataset)
    download_raw_dataset = staticmethod(download_raw_dataset)
    upload_generated_dataset = staticmethod(upload_generated_dataset)
    get_generated_dataset_url = staticmethod(get_generated_dataset_url)
    upsert_job_record = staticmethod(upsert_job_record)
    get_job_record = staticmethod(get_job_record)

    def is_configured(self) -> bool:
        return bool(settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY)

supabase_service = SupabaseService()
