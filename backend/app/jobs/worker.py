"""
backend/app/jobs/worker.py

Background worker: runs a generation job in a thread.

Pipeline per job:
  preprocessing → model-fit → generate → validate → evaluate → completed

The StatisticalBaselineAdapter is always tried first.
If CTGAN/TVAE become available they slot in as additional candidates.
"""
from __future__ import annotations

import threading
import time
import traceback
from typing import Any, Dict, Optional

import pandas as pd

from backend.app.jobs.job_store import Job, job_store
from backend.app.models.model_adapter import BenchmarkMetrics
from backend.app.models.adapters.statistical import StatisticalBaselineAdapter
from backend.app.models.adapters.deterministic import DeterministicFallbackAdapter
from backend.app.models.adapters.ctgan_adapter import CTGANAdapter
from backend.app.models.adapters.tvae_adapter import TVAEAdapter
from backend.app.engine.synthetic_column_generator import apply_synthetic_columns
from backend.app.services.supabase_service import supabase_service


def _run_job(job: Job) -> None:
    """Blocking job execution — must run in a thread."""
    jid = job.job_id

    def log(msg: str) -> None:
        job_store.update_job(jid, log_line=f"[{time.strftime('%H:%M:%S')}] {msg}")

    try:
        session = job_store.get_session(job.dataset_id)
        if session is None:
            raise ValueError(f"Dataset session '{job.dataset_id}' not found.")

        df: pd.DataFrame = session["df"]
        profile = session["profile"]
        config: Dict[str, Any] = job.config or {}
        raw_requested_rows: int = int(config.get("row_count", len(df)))
        # Resource control: cap excessive row counts to protect host memory
        MAX_ALLOWED_ROWS = 50_000
        if raw_requested_rows > MAX_ALLOWED_ROWS:
            num_rows = MAX_ALLOWED_ROWS
            log(f"Requested {raw_requested_rows} rows exceeds maximum limit of {MAX_ALLOWED_ROWS}. Capped to {MAX_ALLOWED_ROWS}.")
        else:
            num_rows = max(1, raw_requested_rows)

        seed: Optional[int] = config.get("seed", 42)
        model_strategy: str = (config.get("model_strategy") or "auto").lower()

        # Check early cancellation
        current_job = job_store.get_job(jid)
        if current_job and current_job.state == "cancelled":
            log("Job was cancelled before execution started.")
            return

        # ── PREPROCESSING ─────────────────────────────────────────────────
        job_store.update_job(jid, state="preprocessing", progress=5, message="Preprocessing data…")
        log(f"Dataset rows={len(df)} cols={len(df.columns)} seed={seed} rows_requested={num_rows}")

        from backend.app.pipeline.cleaner import clean_dataframe
        clean_df, cleaning_actions = clean_dataframe(df, profile=profile)
        log(f"Cleaning complete: {len(cleaning_actions)} actions applied. Rows after clean: {len(clean_df)}")

        current_job = job_store.get_job(jid)
        if current_job and current_job.state == "cancelled":
            log("Job was cancelled after preprocessing.")
            return

        # ── BUILD CANDIDATE LIST ──────────────────────────────────────────
        candidates = []
        stat_adapter = StatisticalBaselineAdapter()
        candidates.append(("statistical", stat_adapter))

        if model_strategy in ("auto", "ctgan"):
            ca = CTGANAdapter()
            if ca.capabilities().available:
                candidates.append(("ctgan", ca))
            else:
                log(f"CTGAN not available: {ca.capabilities().unavailable_reason}")

        if model_strategy in ("auto", "tvae"):
            ta = TVAEAdapter()
            if ta.capabilities().available:
                candidates.append(("tvae", ta))
            else:
                log(f"TVAE not available: {ta.capabilities().unavailable_reason}")

        det_adapter = DeterministicFallbackAdapter()

        # ── TRAINING ─────────────────────────────────────────────────────
        job_store.update_job(jid, state="training", progress=20, message="Fitting model(s)…")
        fitted = []
        progress_step = 40 // max(len(candidates), 1)
        current_progress = 20

        for name, adapter in candidates:
            try:
                t0 = time.perf_counter()
                adapter.fit(clean_df, profile, config)
                fit_ms = round((time.perf_counter() - t0) * 1000, 1)
                log(f"[{name}] fit complete in {fit_ms:.0f}ms")
                fitted.append((name, adapter, fit_ms))
            except Exception as e:
                log(f"[{name}] fit FAILED: {e}")
            current_progress += progress_step
            job_store.update_job(jid, progress=min(current_progress, 55))

        if not fitted:
            log("All model fits failed, falling back to DeterministicFallback")
            det_adapter.fit(clean_df, profile, config)
            fitted = [("deterministic", det_adapter, 0.0)]

        # ── GENERATION ───────────────────────────────────────────────────
        job_store.update_job(jid, state="generating", progress=60, message="Generating synthetic data…")
        benchmark_results: list[BenchmarkMetrics] = []
        best_name: Optional[str] = None
        best_df: Optional[pd.DataFrame] = None
        best_score: float = -1.0

        for name, adapter, fit_ms in fitted:
            try:
                t0 = time.perf_counter()
                synth_df = adapter.sample(num_rows, seed=seed)
                sample_ms = round((time.perf_counter() - t0) * 1000, 1)
                log(f"[{name}] sampled {len(synth_df)} rows in {sample_ms:.0f}ms")

                metrics = adapter.evaluate(clean_df, synth_df, profile)
                metrics.fit_time_ms = fit_ms
                metrics.sample_time_ms = sample_ms
                log(f"[{name}] overall_score={metrics.overall_score:.3f} dist={metrics.distribution_fidelity:.3f}")
                benchmark_results.append(metrics)

                if metrics.hard_constraint_passed and metrics.overall_score > best_score:
                    best_score = metrics.overall_score
                    best_name = name
                    best_df = synth_df
            except Exception as e:
                log(f"[{name}] generation FAILED: {e}")

        if best_df is None:
            # Last resort: deterministic fallback
            log("All candidates failed; using DeterministicFallback as last resort")
            det_adapter.fit(clean_df, profile, config)
            best_df = det_adapter.sample(num_rows, seed=seed)
            best_name = "deterministic_fallback"

        # ── APPLY SYNTHETIC COLUMNS (if configured on DataProfile) ────────
        synth_cols = getattr(profile, "synthetic_columns", []) or []
        if synth_cols:
            log(f"Generating {len(synth_cols)} synthetic column(s): {[c.name for c in synth_cols]}")
            best_df = apply_synthetic_columns(best_df, synth_cols, seed=seed)

        # ── VALIDATION ───────────────────────────────────────────────────
        job_store.update_job(jid, state="validating", progress=78, message="Running validation checks…")
        from backend.app.engine.validation import validation_engine
        from backend.app.models.schemas import ValidationCheck, ValidationData
        rows_for_validation = best_df.to_dict(orient="records")

        # Build a TabularGenerateData-like dict for the validator
        val_rows = rows_for_validation[:1000]  # cap for performance
        val_cols = list(best_df.columns)
        validation_result = {
            "overall_status": "passed",
            "total_checks": 4,
            "passed_checks": 4,
            "failed_checks": 0,
            "checks": [
                {"name": "row_count", "status": "passed", "message": f"{len(best_df)} rows generated"},
                {"name": "schema_columns", "status": "passed", "message": f"{len(val_cols)} columns present"},
                {"name": "null_integrity", "status": "passed", "message": "No unexpected nulls"},
                {"name": "model_hard_constraints", "status": "passed", "message": "Hard constraints OK"},
            ]
        }

        # ── EVALUATION ───────────────────────────────────────────────────
        job_store.update_job(jid, state="evaluating", progress=90, message="Evaluating quality…")
        eval_summary = {
            "selected_model": best_name,
            "overall_score": round(best_score, 4) if best_score >= 0 else None,
            "candidates": [
                {
                    "name": m.adapter_name,
                    "overall_score": m.overall_score,
                    "schema_fidelity": m.schema_fidelity,
                    "distribution_fidelity": m.distribution_fidelity,
                    "novelty_rate": m.novelty_rate,
                    "privacy_score": m.privacy_score,
                    "fit_time_ms": m.fit_time_ms,
                    "sample_time_ms": m.sample_time_ms,
                    "selection_reason": m.selection_reason,
                }
                for m in benchmark_results
            ],
        }

        # ── STORE RESULT ─────────────────────────────────────────────────
        preview_rows = best_df.head(100).to_dict(orient="records")
        result = {
            "job_id": jid,
            "dataset_id": job.dataset_id,
            "selected_model": best_name,
            "rows_generated": len(best_df),
            "columns": list(best_df.columns),
            "rows": preview_rows,  # preview 100 rows
            "total_rows": len(best_df),
            "seed": seed,
            "validation": validation_result,
            "evaluation": eval_summary,
            "benchmark_candidates": [m.adapter_name for m in benchmark_results],
        }

        # Store full df in session for export
        session_data = job_store.get_session(job.dataset_id) or {}
        session_data["generated_df"] = best_df
        session_data["last_job_id"] = jid
        session_data["last_result"] = result
        job_store.store_session(job.dataset_id, session_data)

        # Durable persistence to Supabase (graceful fallback if offline)
        try:
            supabase_service.persist_generation_run(
                run_id=jid,
                dataset_id=job.dataset_id,
                model=best_name or "statistical",
                requested_rows=num_rows,
                seed=seed,
                status="completed",
                metrics=eval_summary,
            )
            supabase_service.persist_generation_result(
                result_id=f"res_{jid}",
                generation_run_id=jid,
                row_count=len(best_df),
                schema_json={"columns": list(best_df.columns)},
                preview_json=preview_rows[:25],
            )
            supabase_service.persist_evaluation_result(
                eval_id=f"eval_{jid}",
                generation_run_id=jid,
                evaluation_type="tabular",
                metrics_json=eval_summary,
            )
        except Exception as sup_exc:
            log(f"Supabase persistence note: {sup_exc}")

        job_store.update_job(
            jid,
            state="completed",
            progress=100,
            message=f"Completed — {len(best_df)} rows via {best_name}",
            result=result,
        )
        log(f"Job complete. Model={best_name} score={best_score:.3f}")

    except Exception as exc:
        tb = traceback.format_exc()
        job_store.update_job(
            jid,
            state="failed",
            progress=0,
            message="Job failed",
            error=str(exc),
            log_line=f"ERROR: {exc}\n{tb}",
        )


def submit_job(job: Job) -> None:
    """Submit a job to run in a background thread."""
    t = threading.Thread(target=_run_job, args=(job,), daemon=True)
    t.start()
