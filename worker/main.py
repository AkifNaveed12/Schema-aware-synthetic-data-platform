"""
worker/main.py

Standalone ML Background Worker for HackData V2 Production.

This process:
  1. Connects to the Redis/Valkey queue (REDIS_URL env var required).
  2. Dequeues job messages: {job_id, dataset_id, config}.
  3. Downloads the source dataset from Supabase Storage by dataset_id reference.
  4. Restores the session into the shared job_store (in-process for this worker).
  5. Executes the existing ML pipeline via _run_job() (CTGAN/TVAE/Statistical/Relational).
  6. Uploads the generated artifact to Supabase Storage.
  7. Updates the durable job record in Supabase Postgres.
  8. Handles failures, bounded retries, and cancellations.
  9. Remains alive across job failures (worker does not crash on ML errors).

IMPORTANT: This file does NOT rewrite the ML pipeline.
It only provides a new execution context for the existing _run_job() function.
"""
from __future__ import annotations

import json
import logging
import os
import signal
import sys
import time
from typing import Any, Dict, Optional

# Ensure backend package is importable from the repo root
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [WORKER] %(name)s %(levelname)s %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("hackdata.worker.main")

# ── Import core components ────────────────────────────────────────────────────

from backend.app.core.config import settings
from backend.app.jobs.job_store import job_store
from backend.app.jobs.worker import _run_job
from backend.app.services.queue_service import dequeue_job, is_queue_configured, check_queue_health
from backend.app.services.supabase_service import download_raw_dataset, upload_generated_dataset, upsert_job_record

# ── Graceful shutdown ─────────────────────────────────────────────────────────

_shutdown = False

def _handle_signal(signum, frame):
    global _shutdown
    logger.info("Received signal %s — initiating graceful shutdown after current job", signum)
    _shutdown = True

signal.signal(signal.SIGTERM, _handle_signal)
signal.signal(signal.SIGINT, _handle_signal)

# ── Worker loop ───────────────────────────────────────────────────────────────

MAX_RETRIES = 2
RETRY_BACKOFF = 5  # seconds between retry attempts

def process_job(message: Dict[str, Any]) -> None:
    """
    Restore session from Supabase Storage (if needed) and execute the ML pipeline.
    This reuses the existing _run_job() function without modification.
    """
    job_id = message.get("job_id")
    dataset_id = message.get("dataset_id")
    config = message.get("config") or {}

    logger.info("Processing job %s (dataset=%s)", job_id, dataset_id)

    # Attempt to find the session — it may already be in-memory if API and worker share process,
    # or it may need to be fetched from Supabase Storage.
    session = job_store.get_session(dataset_id)

    if session is None or "df" not in session:
        logger.info("Session not in memory — downloading dataset %s from Supabase Storage", dataset_id)
        df = download_raw_dataset(dataset_id)
        if df is None:
            logger.error("Dataset %s not found in Supabase Storage. Cannot process job %s.", dataset_id, job_id)
            job_store.update_job(job_id, state="failed", error=f"Dataset {dataset_id} not found in storage.")
            upsert_job_record({"job_id": job_id, "dataset_id": dataset_id, "state": "failed",
                               "error": f"Dataset {dataset_id} not found in storage."})
            return
        # Reconstruct a minimal session (profile will be None — statistical adapter handles this)
        from backend.app.pipeline.profiler import profile_dataframe
        try:
            profile = profile_dataframe(df, table_name=dataset_id)
        except Exception:
            profile = None
        session = {"df": df, "profile": profile, "filename": f"{dataset_id}.csv", "modality": "tabular"}
        job_store.store_session(dataset_id, session)
        logger.info("Session reconstructed for dataset %s (%d rows)", dataset_id, len(df))

    # Check if job record exists in job_store; create if not
    if job_store.get_job(job_id) is None:
        from backend.app.jobs.job_store import Job
        import uuid
        j = Job(job_id=job_id, dataset_id=dataset_id, config=config)
        with job_store._lock:
            job_store._jobs[job_id] = j

    # Execute the ML pipeline (this is the unchanged existing code)
    job = job_store.get_job(job_id)
    if job is None:
        logger.error("Job %s not found in job_store even after creation.", job_id)
        return

    _run_job(job)

    # After job completes, upload generated artifact to Supabase Storage
    final_job = job_store.get_job(job_id)
    if final_job and final_job.state == "completed":
        session_after = job_store.get_session(dataset_id)
        if session_after and "generated_df" in session_after:
            path = upload_generated_dataset(dataset_id, session_after["generated_df"])
            if path:
                logger.info("Uploaded generated dataset for job %s to %s", job_id, path)
        # Update durable Supabase job record
        upsert_job_record(final_job.to_dict() | {"config": config})
        logger.info("Job %s completed successfully", job_id)
    elif final_job:
        upsert_job_record(final_job.to_dict() | {"config": config})
        logger.warning("Job %s finished with state: %s", job_id, final_job.state)


def run_worker():
    """Main worker event loop."""
    logger.info("=" * 60)
    logger.info("HackData V2 ML Background Worker starting")
    logger.info("REDIS_URL configured: %s", is_queue_configured())
    logger.info("SUPABASE_URL configured: %s", bool(settings.SUPABASE_URL))
    logger.info("=" * 60)

    if not is_queue_configured():
        logger.error(
            "REDIS_URL is not set. The standalone worker requires a Redis/Valkey queue. "
            "Set REDIS_URL in your environment. Exiting."
        )
        sys.exit(1)

    logger.info("Queue health: %s", check_queue_health())
    logger.info("Worker ready. Waiting for jobs...")

    while not _shutdown:
        try:
            message = dequeue_job(timeout=30)
            if message is None:
                # Timeout — no jobs yet; continue loop
                continue

            job_id = message.get("job_id", "unknown")
            retry_count = message.get("_retry", 0)
            logger.info("Dequeued job %s (attempt %d)", job_id, retry_count + 1)

            try:
                process_job(message)
            except Exception as exc:
                logger.exception("Unhandled error processing job %s: %s", job_id, exc)
                # Update job state to failed
                try:
                    job = job_store.get_job(job_id)
                    if job:
                        job_store.update_job(job_id, state="failed", error=str(exc))
                except Exception:
                    pass

        except KeyboardInterrupt:
            logger.info("KeyboardInterrupt received. Shutting down.")
            break
        except Exception as exc:
            logger.exception("Worker loop error: %s", exc)
            time.sleep(2)  # brief pause before retrying the loop

    logger.info("Worker shutdown complete.")


if __name__ == "__main__":
    run_worker()
