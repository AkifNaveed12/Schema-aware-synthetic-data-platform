"""
backend/app/services/supabase_service.py

Durable persistence client for Supabase using native REST/HTTP.
Adheres strictly to the architectural constraints:
1. Backend-only service-role access (never client-exposed).
2. Fully non-blocking / graceful fallback if Supabase is unconfigured or unreachable.
3. Zero storage of raw PII datasets by default; persists metadata, profiles, metrics, and chat transcripts.
"""
from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional
import httpx

from backend.app.core.config import settings

logger = logging.getLogger("hackdata.supabase")


class SupabaseService:
    def __init__(
        self,
        supabase_url: Optional[str] = None,
        supabase_key: Optional[str] = None,
        timeout: float = 8.0,
    ) -> None:
        self.supabase_url = (supabase_url or settings.SUPABASE_URL or "").rstrip("/")
        self.supabase_key = supabase_key or settings.SUPABASE_SERVICE_ROLE_KEY or ""
        self.timeout = timeout

    @property
    def is_configured(self) -> bool:
        return bool(self.supabase_url and self.supabase_key)

    def _headers(self, prefer_return: str = "representation") -> Dict[str, str]:
        return {
            "apikey": self.supabase_key,
            "Authorization": f"Bearer {self.supabase_key}",
            "Content-Type": "application/json",
            "Prefer": f"return={prefer_return}",
        }

    # ── Core HTTP Methods ─────────────────────────────────────────────────────

    def insert(self, table: str, payload: Dict[str, Any] | List[Dict[str, Any]]) -> Optional[Any]:
        if not self.is_configured:
            return None
        url = f"{self.supabase_url}/rest/v1/{table}"
        try:
            with httpx.Client(timeout=self.timeout) as client:
                res = client.post(url, headers=self._headers(), json=payload)
                if res.is_success:
                    return res.json()
                logger.warning(f"Supabase insert failed [{table}] {res.status_code}: {res.text}")
                return None
        except Exception as exc:
            logger.warning(f"Supabase connection error on insert [{table}]: {exc}")
            return None

    def upsert(self, table: str, payload: Dict[str, Any], on_conflict: str = "id") -> Optional[Any]:
        if not self.is_configured:
            return None
        url = f"{self.supabase_url}/rest/v1/{table}?on_conflict={on_conflict}"
        headers = self._headers()
        headers["Prefer"] = "resolution=merge-duplicates,return=representation"
        try:
            with httpx.Client(timeout=self.timeout) as client:
                res = client.post(url, headers=headers, json=payload)
                if res.is_success:
                    return res.json()
                logger.warning(f"Supabase upsert failed [{table}] {res.status_code}: {res.text}")
                return None
        except Exception as exc:
            logger.warning(f"Supabase connection error on upsert [{table}]: {exc}")
            return None

    def select(
        self,
        table: str,
        query_params: Optional[Dict[str, str]] = None,
        limit: int = 50,
        order: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        if not self.is_configured:
            return []
        url = f"{self.supabase_url}/rest/v1/{table}"
        params: Dict[str, str] = dict(query_params or {})
        params["limit"] = str(limit)
        if order:
            params["order"] = order
        try:
            with httpx.Client(timeout=self.timeout) as client:
                res = client.get(url, headers=self._headers(), params=params)
                if res.is_success:
                    return res.json()
                logger.warning(f"Supabase select failed [{table}] {res.status_code}: {res.text}")
                return []
        except Exception as exc:
            logger.warning(f"Supabase connection error on select [{table}]: {exc}")
            return []

    def update(self, table: str, query_params: Dict[str, str], payload: Dict[str, Any]) -> Optional[Any]:
        if not self.is_configured:
            return None
        url = f"{self.supabase_url}/rest/v1/{table}"
        try:
            with httpx.Client(timeout=self.timeout) as client:
                res = client.patch(url, headers=self._headers(), params=query_params, json=payload)
                if res.is_success:
                    return res.json()
                logger.warning(f"Supabase update failed [{table}] {res.status_code}: {res.text}")
                return None
        except Exception as exc:
            logger.warning(f"Supabase connection error on update [{table}]: {exc}")
            return None

    # ── Domain-specific Persistence Helpers ───────────────────────────────────

    def persist_dataset(
        self,
        dataset_id: str,
        name: str,
        modality: str,
        source_fingerprint: Optional[str],
        row_count: int,
        column_count: int,
        status: str = "ingested",
    ) -> Optional[Any]:
        return self.upsert("datasets", {
            "id": dataset_id,
            "name": name,
            "modality": modality,
            "source_fingerprint": source_fingerprint,
            "row_count": row_count,
            "column_count": column_count,
            "status": status,
        })

    def persist_profile(self, dataset_id: str, profile_dict: Dict[str, Any]) -> Optional[Any]:
        prof_id = profile_dict.get("profile_id") or f"prof_{dataset_id}"
        return self.upsert("dataset_profiles", {
            "id": prof_id,
            "dataset_id": dataset_id,
            "profile_json": profile_dict,
        })

    def persist_generation_run(
        self,
        run_id: str,
        dataset_id: str,
        model: str,
        requested_rows: int,
        seed: Optional[int],
        status: str,
        metrics: Optional[Dict[str, Any]] = None,
        error_message: Optional[str] = None,
    ) -> Optional[Any]:
        return self.upsert("generation_runs", {
            "id": run_id,
            "dataset_id": dataset_id,
            "model": model,
            "requested_rows": requested_rows,
            "seed": seed,
            "status": status,
            "metrics_json": metrics,
            "error_message": error_message,
        })

    def persist_generation_result(
        self,
        result_id: str,
        generation_run_id: str,
        row_count: int,
        schema_json: Optional[Dict[str, Any]] = None,
        preview_json: Optional[List[Dict[str, Any]]] = None,
        export_metadata_json: Optional[Dict[str, Any]] = None,
    ) -> Optional[Any]:
        return self.insert("generation_results", {
            "id": result_id,
            "generation_run_id": generation_run_id,
            "row_count": row_count,
            "schema_json": schema_json,
            "preview_json": preview_json,
            "export_metadata_json": export_metadata_json,
        })

    def persist_evaluation_result(
        self,
        eval_id: str,
        generation_run_id: str,
        evaluation_type: str,
        metrics_json: Dict[str, Any],
    ) -> Optional[Any]:
        return self.insert("evaluation_results", {
            "id": eval_id,
            "generation_run_id": generation_run_id,
            "evaluation_type": evaluation_type,
            "metrics_json": metrics_json,
        })

    def persist_regeneration_run(
        self,
        run_id: str,
        parent_generation_id: str,
        reason: str,
        strategy_json: Dict[str, Any],
        previous_metrics_json: Dict[str, Any],
        new_metrics_json: Dict[str, Any],
        status: str = "completed",
    ) -> Optional[Any]:
        return self.insert("regeneration_runs", {
            "id": run_id,
            "parent_generation_id": parent_generation_id,
            "reason": reason,
            "strategy_json": strategy_json,
            "previous_metrics_json": previous_metrics_json,
            "new_metrics_json": new_metrics_json,
            "status": status,
        })

    def persist_assistant_session(
        self,
        session_id: str,
        dataset_id: Optional[str] = None,
        language: str = "en",
    ) -> Optional[Any]:
        return self.upsert("assistant_sessions", {
            "id": session_id,
            "dataset_id": dataset_id,
            "language": language,
        })

    def persist_assistant_message(
        self,
        message_id: str,
        session_id: str,
        role: str,
        content: str,
        structured_action_json: Optional[Dict[str, Any]] = None,
    ) -> Optional[Any]:
        return self.insert("assistant_messages", {
            "id": message_id,
            "session_id": session_id,
            "role": role,
            "content": content,
            "structured_action_json": structured_action_json,
        })


supabase_service = SupabaseService()
