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
from backend.app.models.data_profile import SyntheticColumnSpec, DistributionConfig
from backend.app.engine.synthetic_column_generator import (
    apply_synthetic_columns,
    validate_column_name,
)
from backend.app.engine.benchmark_engine import run_benchmark
from backend.app.engine.tstr_engine import evaluate_tstr, identify_suitable_targets
from backend.app.engine.regeneration_engine import (
    diagnose_generation_issues,
    execute_controlled_regeneration,
)
from backend.app.services.supabase_service import supabase_service

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

    # Durable persistence to Supabase (graceful fallback if offline)
    try:
        supabase_service.persist_dataset(
            dataset_id=dataset_id,
            name=filename,
            modality=modality,
            source_fingerprint=fingerprint,
            row_count=len(df),
            column_count=len(df.columns),
            status="ingested",
        )
        supabase_service.persist_profile(dataset_id, profile.model_dump())
    except Exception:
        pass

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


# ── POST /datasets/{dataset_id}/synthetic-columns ────────────────────────────
@router.post("/datasets/{dataset_id}/synthetic-columns", response_model=SuccessResponse)
def add_synthetic_column(dataset_id: str, column_spec: SyntheticColumnSpec):
    """
    Add a synthetic column specification to the dataset profile.
    Validates column name, prevents duplicate/source collisions, and updates profile.
    """
    session = job_store.get_session(dataset_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Dataset '{dataset_id}' not found.")

    profile = session.get("profile")
    df = session.get("df")
    existing_cols = list(df.columns) if df is not None else []
    if profile and profile.tables:
        existing_cols.extend([c.name for c in profile.tables[0].columns])
    if profile and profile.synthetic_columns:
        existing_cols.extend([sc.name for sc in profile.synthetic_columns])

    # Validate identifier & collision
    try:
        validate_column_name(column_spec.name, existing_cols)
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))

    # Add to profile
    if profile:
        profile.synthetic_columns.append(column_spec)
        session["profile"] = profile
        job_store.store_session(dataset_id, session)
        try:
            supabase_service.persist_profile(dataset_id, profile.model_dump())
        except Exception:
            pass

    return SuccessResponse(data={
        "dataset_id": dataset_id,
        "column_added": column_spec.model_dump(),
        "total_synthetic_columns": len(profile.synthetic_columns) if profile else 1,
        "all_synthetic_columns": [sc.model_dump() for sc in (profile.synthetic_columns if profile else [column_spec])],
    })


# ── GET /datasets/{dataset_id}/synthetic-columns ─────────────────────────────
@router.get("/datasets/{dataset_id}/synthetic-columns", response_model=SuccessResponse)
def list_synthetic_columns(dataset_id: str):
    """Retrieve all defined synthetic columns for this dataset session."""
    session = job_store.get_session(dataset_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Dataset '{dataset_id}' not found.")
    profile = session.get("profile")
    synth_cols = profile.synthetic_columns if profile else []
    return SuccessResponse(data={
        "dataset_id": dataset_id,
        "count": len(synth_cols),
        "synthetic_columns": [sc.model_dump() for sc in synth_cols],
    })


# ── POST /datasets/{dataset_id}/benchmark ────────────────────────────────────
@router.post("/datasets/{dataset_id}/benchmark", response_model=SuccessResponse)
def benchmark_models(dataset_id: str, config: Dict[str, Any] = {}):
    """
    Run real model benchmarking across candidates:
    Statistical Baseline, CTGAN, TVAE, Deterministic Fallback.
    Returns resource, time, and quality metrics with dataset-specific selection.
    """
    session = job_store.get_session(dataset_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Dataset '{dataset_id}' not found.")

    df = session["df"]
    profile = session.get("profile")
    sample_size = config.get("evaluation_sample_size", 50)
    seed = config.get("seed", 42)

    benchmark_result = run_benchmark(
        df=df,
        profile=profile,
        config=config,
        evaluation_sample_size=sample_size,
        seed=seed,
    )
    return SuccessResponse(data=benchmark_result)


# ── GET /datasets/{dataset_id}/tstr/targets ──────────────────────────────────
@router.get("/datasets/{dataset_id}/tstr/targets", response_model=SuccessResponse)
def get_tstr_target_candidates(dataset_id: str):
    """Scan dataset columns to identify valid targets for classification or regression TSTR."""
    session = job_store.get_session(dataset_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Dataset '{dataset_id}' not found.")

    df = session["df"]
    targets = identify_suitable_targets(df)
    return SuccessResponse(data={
        "dataset_id": dataset_id,
        "available_targets_count": len(targets),
        "targets": targets,
    })


# ── POST /datasets/{dataset_id}/tstr ─────────────────────────────────────────
@router.post("/datasets/{dataset_id}/tstr", response_model=SuccessResponse)
def run_tstr_evaluation(dataset_id: str, payload: Dict[str, Any]):
    """
    Execute Train on Synthetic, Test on Real (TSTR) evaluation.
    Requires target_column. Compares Synthetic->Real with Real->Real baseline.
    """
    session = job_store.get_session(dataset_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Dataset '{dataset_id}' not found.")

    target_column = payload.get("target_column")
    if not target_column:
        raise HTTPException(status_code=422, detail="Missing required 'target_column' field for TSTR.")

    real_df = session["df"]
    synthetic_df = session.get("generated_df")

    # If synthetic_df not yet generated, generate a fast synchronous sample
    if synthetic_df is None:
        from backend.app.models.adapters.statistical import StatisticalBaselineAdapter
        adapter = StatisticalBaselineAdapter()
        profile = session.get("profile")
        adapter.fit(real_df, profile)
        synthetic_df = adapter.sample(min(len(real_df), 100), seed=42)
        # Apply synthetic columns if configured
        if profile and profile.synthetic_columns:
            synthetic_df = apply_synthetic_columns(synthetic_df, profile.synthetic_columns, seed=42)

    try:
        tstr_result = evaluate_tstr(
            real_df=real_df,
            synthetic_df=synthetic_df,
            target_column=target_column,
            task_type=payload.get("task_type"),
            test_size=float(payload.get("test_size", 0.25)),
            seed=int(payload.get("seed", 42)),
        )
        return SuccessResponse(data=tstr_result)
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))


# ── POST /datasets/{dataset_id}/regenerate/diagnose ──────────────────────────
@router.post("/datasets/{dataset_id}/regenerate/diagnose", response_model=SuccessResponse)
def diagnose_quality(dataset_id: str):
    """Diagnose quality/drift issues in the current synthetic dataset and suggest strategies."""
    session = job_store.get_session(dataset_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Dataset '{dataset_id}' not found.")

    real_df = session["df"]
    synthetic_df = session.get("generated_df")
    if synthetic_df is None:
        raise HTTPException(status_code=400, detail="No generated data found for this dataset. Generate data first.")

    profile = session.get("profile")
    last_res = session.get("last_result", {})
    eval_metrics = last_res.get("evaluation") if isinstance(last_res, dict) else None

    findings = diagnose_generation_issues(
        real_df=real_df,
        synthetic_df=synthetic_df,
        profile=profile,
        evaluation_metrics=eval_metrics,
    )
    return SuccessResponse(data={
        "dataset_id": dataset_id,
        "diagnostics_count": len(findings),
        "findings": [f.to_dict() for f in findings],
    })


# ── POST /datasets/{dataset_id}/regenerate ───────────────────────────────────
@router.post("/datasets/{dataset_id}/regenerate", response_model=SuccessResponse)
def regenerate_with_strategy(dataset_id: str, payload: Dict[str, Any] = {}):
    """
    Execute controlled re-generation based on a diagnostic recovery strategy.
    Compares new vs previous metrics and honestly indicates if output improved.
    """
    session = job_store.get_session(dataset_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Dataset '{dataset_id}' not found.")

    real_df = session["df"]
    previous_synthetic_df = session.get("generated_df")
    if previous_synthetic_df is None:
        raise HTTPException(status_code=400, detail="No prior generation found. Run generation first.")

    strategy = payload.get("strategy", "rebalance_categories")
    reason = payload.get("reason", "Controlled quality optimization")
    current_model = payload.get("current_model", "statistical")
    current_seed = int(payload.get("seed", 42))
    profile = session.get("profile")

    regen_result = execute_controlled_regeneration(
        real_df=real_df,
        previous_synthetic_df=previous_synthetic_df,
        profile=profile,
        strategy=strategy,
        reason=reason,
        current_model=current_model,
        current_seed=current_seed,
    )

    new_synth_df = regen_result.pop("new_synthetic_df")

    # If new is preferred, store as active generated_df; otherwise retain previous
    if regen_result.get("improved", False):
        session["generated_df"] = new_synth_df

    parent_job_id = session.get("last_job_id") or f"run_{dataset_id}"
    regen_run_id = f"regen_{uuid.uuid4().hex[:10]}"

    # Persist regeneration record to Supabase
    try:
        supabase_service.persist_regeneration_run(
            run_id=regen_run_id,
            parent_generation_id=parent_job_id,
            reason=reason,
            strategy_json={"strategy": strategy, "changed_parameters": regen_result["changed_parameters"]},
            previous_metrics_json=regen_result["previous_metrics"],
            new_metrics_json=regen_result["new_metrics"],
            status="completed",
        )
    except Exception:
        pass

    session["last_regeneration"] = regen_result
    job_store.store_session(dataset_id, session)

    return SuccessResponse(data={
        "dataset_id": dataset_id,
        "regeneration_id": regen_run_id,
        **regen_result,
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
    Synchronous generation (blocks until done). Use only for small datasets
    or preview requests (preview_only=True). For large datasets use the async
    /generate endpoint.
    """
    session = job_store.get_session(dataset_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Dataset '{dataset_id}' not found.")

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

    # Apply synthetic columns if defined on DataProfile
    synth_cols = getattr(profile, "synthetic_columns", []) or []
    if synth_cols:
        synth_df = apply_synthetic_columns(synth_df, synth_cols, seed=seed)

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


# ── GET /datasets/{dataset_id}/export ────────────────────────────────────────
@router.get("/datasets/{dataset_id}/export")
def export_dataset(dataset_id: str, format: str = "csv"):
    """Export the validated generated artifact for a dataset."""
    session = job_store.get_session(dataset_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Dataset '{dataset_id}' not found.")
    generated_df = session.get("generated_df")
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
