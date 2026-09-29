"""
backend/app/api/v1/jobs.py

Jobs status API.

GET /api/v1/jobs/{job_id}    — get job state + result (when completed)
GET /api/v1/jobs             — list recent jobs (optional dataset_id filter)
DELETE /api/v1/jobs/{job_id} — cancel a queued/running job (best-effort)
"""
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from backend.app.jobs.job_store import job_store
from backend.app.models.envelope import SuccessResponse

router = APIRouter()


@router.get("/jobs", response_model=SuccessResponse)
def list_jobs(dataset_id: Optional[str] = Query(default=None)):
    """List all jobs, optionally filtered by dataset_id."""
    return SuccessResponse(data={"jobs": job_store.list_jobs(dataset_id=dataset_id)})


@router.get("/jobs/{job_id}", response_model=SuccessResponse)
def get_job(job_id: str):
    """Fetch job status and result (if completed)."""
    job = job_store.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job '{job_id}' not found.")
    payload = job.to_dict()
    if job.state == "completed" and job.result:
        payload["result"] = job.result
    return SuccessResponse(data=payload)


@router.delete("/jobs/{job_id}", response_model=SuccessResponse)
def cancel_job(job_id: str):
    """Cancel a queued job (running jobs complete naturally)."""
    job = job_store.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job '{job_id}' not found.")
    if job.state in ("completed", "failed", "cancelled"):
        return SuccessResponse(data={"job_id": job_id, "state": job.state, "message": "Job already finished."})
    job_store.update_job(job_id, state="cancelled", message="Cancelled by user.")
    return SuccessResponse(data={"job_id": job_id, "state": "cancelled"})
