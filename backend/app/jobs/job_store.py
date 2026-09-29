"""
backend/app/jobs/job_store.py

In-process job store: lightweight, thread-safe, no external queue needed.

Architecture boundary: API handlers submit jobs and return immediately with
a job_id. Background threads run the actual work. Frontend polls
GET /api/v1/jobs/{job_id} for status.

States: queued → preprocessing → training → generating → validating
        → evaluating → completed | failed | cancelled
"""
from __future__ import annotations

import threading
import time
import uuid
from dataclasses import dataclass, field
from typing import Any, Dict, List, Literal, Optional

JobState = Literal[
    "queued", "preprocessing", "training", "generating",
    "validating", "evaluating", "completed", "failed", "cancelled"
]


@dataclass
class Job:
    job_id: str
    dataset_id: str
    state: JobState = "queued"
    progress: int = 0          # 0–100
    message: str = "Queued"
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    logs: List[str] = field(default_factory=list)
    created_at: float = field(default_factory=time.time)
    updated_at: float = field(default_factory=time.time)
    completed_at: Optional[float] = None
    # Generation config snapshot
    config: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "job_id": self.job_id,
            "dataset_id": self.dataset_id,
            "state": self.state,
            "progress": self.progress,
            "message": self.message,
            "error": self.error,
            "logs": self.logs[-20:],  # last 20 lines to frontend
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "completed_at": self.completed_at,
            "has_result": self.result is not None,
        }


class JobStore:
    """Thread-safe in-memory job registry."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._jobs: Dict[str, Job] = {}
        # Dataset sessions: dataset_id → {df, profile, fingerprint}
        self._sessions: Dict[str, Dict[str, Any]] = {}

    # ── Job management ────────────────────────────────────────────────────────

    def create_job(self, dataset_id: str, config: Dict[str, Any]) -> Job:
        job = Job(
            job_id=f"job_{uuid.uuid4().hex[:10]}",
            dataset_id=dataset_id,
            config=config,
        )
        with self._lock:
            self._jobs[job.job_id] = job
        return job

    def get_job(self, job_id: str) -> Optional[Job]:
        return self._jobs.get(job_id)

    def update_job(
        self,
        job_id: str,
        state: Optional[JobState] = None,
        progress: Optional[int] = None,
        message: Optional[str] = None,
        result: Optional[Dict[str, Any]] = None,
        error: Optional[str] = None,
        log_line: Optional[str] = None,
    ) -> None:
        with self._lock:
            job = self._jobs.get(job_id)
            if job is None:
                return
            if state is not None:
                job.state = state
                if state in ("completed", "failed", "cancelled"):
                    job.completed_at = time.time()
            if progress is not None:
                job.progress = progress
            if message is not None:
                job.message = message
            if result is not None:
                job.result = result
            if error is not None:
                job.error = error
            if log_line is not None:
                job.logs.append(log_line)

    def cancel_job(self, job_id: str) -> bool:
        with self._lock:
            job = self._jobs.get(job_id)
            if job is None or job.state in ("completed", "failed", "cancelled"):
                return False
            job.state = "cancelled"
            job.completed_at = time.time()
            job.message = "Job cancelled by user"
            return True
            job.updated_at = time.time()

    def list_jobs(self, dataset_id: Optional[str] = None) -> List[Dict[str, Any]]:
        with self._lock:
            jobs = list(self._jobs.values())
        if dataset_id:
            jobs = [j for j in jobs if j.dataset_id == dataset_id]
        return [j.to_dict() for j in sorted(jobs, key=lambda j: j.created_at, reverse=True)]

    # ── Dataset session management ────────────────────────────────────────────

    def store_session(self, dataset_id: str, data: Dict[str, Any]) -> None:
        with self._lock:
            self._sessions[dataset_id] = data

    def get_session(self, dataset_id: str) -> Optional[Dict[str, Any]]:
        return self._sessions.get(dataset_id)

    def list_sessions(self) -> List[str]:
        return list(self._sessions.keys())


# ── Global singleton ──────────────────────────────────────────────────────────
job_store = JobStore()
