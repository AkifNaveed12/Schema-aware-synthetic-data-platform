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
    from backend.app.services.supabase_service import supabase_service, _get_client, _get_bucket_name
    job = job_store.get_job(job_id)

    # Sync with durable Supabase record if job is still in progress or not in local memory
    if (not job or job.state in ("queued", "preprocessing", "training", "generating", "validating", "evaluating")) and supabase_service.is_configured():
        durable = supabase_service.get_job_record(job_id)
        if durable:
            if not job:
                from backend.app.jobs.job_store import Job
                job = Job(
                    job_id=job_id,
                    dataset_id=durable.get("dataset_id", ""),
                    state=durable.get("state", "queued"),
                    progress=durable.get("progress", 0),
                    message=durable.get("message", ""),
                    error=durable.get("error"),
                    created_at=float(durable.get("created_at") or 0),
                    updated_at=float(durable.get("updated_at") or 0),
                    completed_at=float(durable["completed_at"]) if durable.get("completed_at") else None,
                )
                with job_store._lock:
                    job_store._jobs[job_id] = job
            else:
                job.state = durable.get("state", job.state)
                job.progress = durable.get("progress", job.progress)
                job.message = durable.get("message", job.message)
                job.error = durable.get("error", job.error)
                if durable.get("completed_at"):
                    job.completed_at = float(durable["completed_at"])

            # If completed and result not in memory, restore preview from Supabase Storage
            if job.state == "completed" and not job.result:
                try:
                    import io, pandas as pd
                    client = _get_client()
                    bucket = _get_bucket_name()
                    if client and job.dataset_id:
                        data = client.storage.from_(bucket).download(f"datasets/generated/{job.dataset_id}.csv")
                        gen_df = pd.read_csv(io.BytesIO(data))
                        job.result = {
                            "job_id": job_id,
                            "dataset_id": job.dataset_id,
                            "rows_generated": len(gen_df),
                            "columns": list(gen_df.columns),
                            "rows": gen_df.head(100).to_dict(orient="records"),
                            "total_rows": len(gen_df),
                        }
                        session = job_store.get_session(job.dataset_id) or {}
                        session["generated_df"] = gen_df
                        job_store.store_session(job.dataset_id, session)
                except Exception:
                    pass

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