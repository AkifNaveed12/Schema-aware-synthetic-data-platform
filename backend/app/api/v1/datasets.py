"""
backend/app/api/v1/datasets.py

Dataset ingestion and session management API.

POST /api/v1/datasets/ingest      — upload a file, get back dataset_id + profile
GET  /api/v1/datasets/{id}        — retrieve stored profile/session
POST /api/v1/datasets/{id}/generate — submit generation job
GET  /api/v1/datasets/{id}/export  — export the validated artifact
"""
import io
import uuid
from typing import Any, Dict, Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse

from backend.app.jobs.job_store import job_store
from backend.app.jobs.worker import submit_job
from backend.app.models.envelope import SuccessResponse
from backend.app.pipeline.ingestion import IngestionError, ingest
from backend.app.pipeline.profiler import profile_dataframe
from backend.app.pipeline.cleaner import clean_dataframe

router = APIRouter()


# ── POST /datasets/ingest ─────────────────────────────────────────────────────
@router.post("/datasets/ingest", response_model=SuccessResponse)
async def ingest_dataset(
    file: UploadFile = File(...),
    table_name: Optional[str] = Form(default=None),
    use_ai: bool = Form(default=False),
):
    """
    Upload a CSV or JSON file.  Returns a dataset_id and a rich DataProfile.
    """
    raw = await file.read()
    filename = file.filename or "upload.csv"

    # ── Security + parse ──────────────────────────────────────────────────
    try:
        df, modality, fingerprint = ingest(raw, filename, file.content_type)
    except IngestionError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    t_name = table_name or filename.rsplit(".", 1)[0].replace(" ", "_")[:64] or "dataset"

    # ── Profile ───────────────────────────────────────────────────────────
    profile = profile_dataframe(
        df,
        table_name=t_name,
        source_bytes=raw,
        filename=filename,
        modality=modality,
    )

    # ── AI semantic enrichment (optional, non-blocking) ──────────────────
    if use_ai:
        try:
            from backend.app.ai.groq_service import ai_service
            sample_csv = df.head(10).to_csv(index=False)
            ai_res = ai_service.infer_schema(sample_csv, "csv", t_name)
            if ai_res and ai_res.columns:
                ai_col_map = {c.name.lower(): c for c in ai_res.columns}
                for table in profile.tables:
                    for col in table.columns:
                        match = ai_col_map.get(col.name.lower())
                        if match and match.semantic_type:
                            col.semantic_type = match.semantic_type
                            col.ai_confidence = 0.92
        except Exception:
            pass  # AI enrichment is best-effort and graceful fallback

    # ── Session store ─────────────────────────────────────────────────────
    dataset_id = f"ds_{uuid.uuid4().hex[:10]}"
    profile.dataset_id = dataset_id

    job_store.store_session(dataset_id, {
        "df": df,
        "profile": profile,
        "fingerprint": fingerprint,
        "filename": filename,
        "modality": modality,
    })

    return SuccessResponse(data={
        "dataset_id": dataset_id,
        "filename": filename,
        "modality": modality,
        "source_fingerprint": fingerprint,
        "row_count": len(df),
        "column_count": len(df.columns),
        "columns": [c.name for c in profile.tables[0].columns] if profile.tables else [],
        "quality_findings": len(profile.quality_findings),
        "profile": profile.model_dump(),
    })


# ── GET /datasets/{dataset_id} ────────────────────────────────────────────────
@router.get("/datasets/{dataset_id}", response_model=SuccessResponse)
def get_dataset(dataset_id: str):
    """Return stored profile and session metadata for a dataset."""
    session = job_store.get_session(dataset_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Dataset '{dataset_id}' not found.")
    profile = session.get("profile")
    return SuccessResponse(data={
        "dataset_id": dataset_id,
        "filename": session.get("filename"),
        "modality": session.get("modality"),
        "fingerprint": session.get("fingerprint"),
        "row_count": len(session["df"]) if "df" in session else 0,
        "profile": profile.model_dump() if profile else None,
        "jobs": job_store.list_jobs(dataset_id=dataset_id),
    })


# ── POST /datasets/{dataset_id}/generate ─────────────────────────────────────
@router.post("/datasets/{dataset_id}/generate", response_model=SuccessResponse)
def generate_dataset(dataset_id: str, config: Dict[str, Any] = {}):
    """
    Submit an async generation job for the stored dataset.
    Returns immediately with a job_id; client polls /jobs/{job_id}.
    """
    session = job_store.get_session(dataset_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Dataset '{dataset_id}' not found.")

    job = job_store.create_job(dataset_id, config)
    submit_job(job)

    return SuccessResponse(data={
        "job_id": job.job_id,
        "dataset_id": dataset_id,
        "state": job.state,
        "message": "Job submitted. Poll GET /api/v1/jobs/{job_id} for status.",
    })


# ── POST /datasets/{dataset_id}/generate/sync ────────────────────────────────
@router.post("/datasets/{dataset_id}/generate/sync", response_model=SuccessResponse)
def generate_dataset_sync(dataset_id: str, config: Dict[str, Any] = {}):
    """
    Synchronous generation (blocks until done).  Use only for small datasets
    or preview requests (preview_only=True).  For large datasets use the async
    /generate endpoint.
    """
    session = job_store.get_session(dataset_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Dataset '{dataset_id}' not found.")

    import time
    df = session["df"]
    profile = session["profile"]
    row_count = config.get("row_count", min(len(df), 100))
    seed = config.get("seed", 42)
    model_strategy = (config.get("model_strategy") or "statistical").lower()

    from backend.app.models.adapters.statistical import StatisticalBaselineAdapter
    from backend.app.models.adapters.deterministic import DeterministicFallbackAdapter
    from backend.app.models.adapters.ctgan_adapter import CTGANAdapter
    from backend.app.models.adapters.tvae_adapter import TVAEAdapter

    selected_model_name = "StatisticalBaseline"
    if model_strategy == "ctgan":
        ca = CTGANAdapter()
        if ca.capabilities().available:
            adapter = ca
            selected_model_name = "CTGAN"
        else:
            adapter = StatisticalBaselineAdapter()
    elif model_strategy == "tvae":
        ta = TVAEAdapter()
        if ta.capabilities().available:
            adapter = ta
            selected_model_name = "TVAE"
        else:
            adapter = StatisticalBaselineAdapter()
    elif model_strategy == "deterministic":
        adapter = DeterministicFallbackAdapter()
        selected_model_name = "DeterministicFallback"
    else:
        adapter = StatisticalBaselineAdapter()
        selected_model_name = "StatisticalBaseline"

    adapter.fit(df, profile, config)
    synth_df = adapter.sample(row_count, seed=seed)

    # Populate synthetic columns if requested
    synth_cols = config.get("synthetic_columns") or (getattr(profile, "synthetic_columns", None) if profile else None)
    if synth_cols:
        from backend.app.pipeline.profiler import populate_synthetic_columns
        synth_df = populate_synthetic_columns(synth_df, synth_cols, seed=seed)

    metrics = adapter.evaluate(df, synth_df, profile)

    result = {
        "dataset_id": dataset_id,
        "selected_model": selected_model_name,
        "rows_generated": len(synth_df),
        "columns": list(synth_df.columns),
        "rows": synth_df.head(row_count).to_dict(orient="records"),
        "total_rows": len(synth_df),
        "seed": seed,
        "evaluation": {
            "schema_fidelity": metrics.schema_fidelity,
            "distribution_fidelity": metrics.distribution_fidelity,
            "novelty_rate": metrics.novelty_rate,
            "overall_score": metrics.overall_score,
        }
    }

    # Store in session for export
    session["generated_df"] = synth_df
    session["last_result"] = result
    job_store.store_session(dataset_id, session)

    return SuccessResponse(data=result)


# ── POST /datasets/{dataset_id}/synthetic-columns ────────────────────────────
@router.post("/datasets/{dataset_id}/synthetic-columns", response_model=SuccessResponse)
def add_synthetic_column(dataset_id: str, payload: Dict[str, Any]):
    """Add a synthetic column specification to the dataset profile."""
    session = job_store.get_session(dataset_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Dataset '{dataset_id}' not found.")
    profile = session.get("profile")
    if not profile:
        raise HTTPException(status_code=400, detail="No profile found for dataset.")

    from backend.app.models.data_profile import SyntheticColumnSpec
    col_name = payload.get("name")
    if not col_name:
        raise HTTPException(status_code=422, detail="Column name is required.")

    # Check collision with existing source columns
    source_cols = [c.name.lower() for t in profile.tables for c in t.columns]
    if col_name.lower() in source_cols:
        raise HTTPException(status_code=400, detail=f"Collision: column '{col_name}' already exists in source dataset.")

    # Check duplicate in synthetic columns
    existing_synth = [c.name.lower() for c in profile.synthetic_columns]
    if col_name.lower() in existing_synth:
        raise HTTPException(status_code=400, detail=f"Duplicate: synthetic column '{col_name}' already exists.")

    spec = SyntheticColumnSpec(**payload)
    profile.synthetic_columns.append(spec)
    session["profile"] = profile
    job_store.store_session(dataset_id, session)

    return SuccessResponse(data={
        "dataset_id": dataset_id,
        "synthetic_columns": [c.model_dump() for c in profile.synthetic_columns],
        "total_source_columns": len(source_cols),
        "total_synthetic_columns": len(profile.synthetic_columns),
        "total_schema_columns": len(source_cols) + len(profile.synthetic_columns),
    })


# ── GET /datasets/{dataset_id}/export ────────────────────────────────────────
@router.get("/datasets/{dataset_id}/export")
def export_dataset(dataset_id: str, format: str = "csv"):
    """Export the validated generated artifact for a dataset."""
    session = job_store.get_session(dataset_id) or {}
    generated_df = session.get("generated_df")
    if generated_df is None:
        try:
            import pandas as pd
            from backend.app.services.supabase_service import _get_client, _get_bucket_name
            client = _get_client()
            bucket = _get_bucket_name()
            if client:
                data = client.storage.from_(bucket).download(f"datasets/generated/{dataset_id}.csv")
                generated_df = pd.read_csv(io.BytesIO(data))
                session["generated_df"] = generated_df
                job_store.store_session(dataset_id, session)
        except Exception:
            pass
    if generated_df is None:
        raise HTTPException(status_code=400, detail="No generated data found for this dataset. Run generation first.")

    filename_base = (session.get("filename") or dataset_id).rsplit(".", 1)[0]

    if format == "csv":
        content = generated_df.to_csv(index=False).encode("utf-8")
        return StreamingResponse(
            io.BytesIO(content),
            media_type="text/csv",
            headers={"Content-Disposition": f'attachment; filename="{filename_base}_synthetic.csv"'},
        )
    elif format == "json":
        content = generated_df.to_json(orient="records", indent=2).encode("utf-8")
        return StreamingResponse(
            io.BytesIO(content),
            media_type="application/json",
            headers={"Content-Disposition": f'attachment; filename="{filename_base}_synthetic.json"'},
        )
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported export format '{format}'. Use csv or json.")
