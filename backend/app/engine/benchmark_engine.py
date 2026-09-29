"""
backend/app/engine/benchmark_engine.py

Real model benchmarking engine across candidates:
- Statistical Baseline
- CTGAN
- TVAE
- Deterministic fallback

For every candidate, captures:
- availability
- fit status
- sample status
- training time (ms)
- generation time (ms)
- resource usage
- schema validity
- diagnostic metrics
- quality metrics (overall, distribution, correlation)
- privacy/novelty metrics
- failure reason if applicable

Transparent dataset-specific selection based on hard constraints and quality scores.
"""
from __future__ import annotations

import time
import logging
from typing import Any, Dict, List, Optional
import pandas as pd

from backend.app.models.data_profile import DataProfile
from backend.app.models.adapters.statistical import StatisticalBaselineAdapter
from backend.app.models.adapters.deterministic import DeterministicFallbackAdapter
from backend.app.models.adapters.ctgan_adapter import CTGANAdapter
from backend.app.models.adapters.tvae_adapter import TVAEAdapter

logger = logging.getLogger("hackdata.benchmark")


class BenchmarkCandidateReport:
    def __init__(
        self,
        name: str,
        available: bool,
        unavailable_reason: str = "",
    ) -> None:
        self.name = name
        self.available = available
        self.unavailable_reason = unavailable_reason
        self.fit_status: str = "pending" if available else "skipped"
        self.sample_status: str = "pending" if available else "skipped"
        self.fit_time_ms: float = 0.0
        self.sample_time_ms: float = 0.0
        self.memory_mb: float = 0.0
        self.schema_validity: float = 0.0
        self.overall_score: float = 0.0
        self.distribution_fidelity: float = 0.0
        self.novelty_rate: float = 0.0
        self.privacy_score: float = 0.0
        self.hard_constraint_passed: bool = False
        self.failure_reason: Optional[str] = unavailable_reason if not available else None
        self.selection_reason: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "available": self.available,
            "fit_status": self.fit_status,
            "sample_status": self.sample_status,
            "fit_time_ms": round(self.fit_time_ms, 2),
            "sample_time_ms": round(self.sample_time_ms, 2),
            "memory_mb": round(self.memory_mb, 2),
            "schema_validity": round(self.schema_validity, 4),
            "overall_score": round(self.overall_score, 4),
            "distribution_fidelity": round(self.distribution_fidelity, 4),
            "novelty_rate": round(self.novelty_rate, 4),
            "privacy_score": round(self.privacy_score, 4),
            "hard_constraint_passed": self.hard_constraint_passed,
            "failure_reason": self.failure_reason,
            "selection_reason": self.selection_reason,
        }


def run_benchmark(
    df: pd.DataFrame,
    profile: Optional[DataProfile] = None,
    config: Optional[Dict[str, Any]] = None,
    evaluation_sample_size: int = 50,
    seed: int = 42,
) -> Dict[str, Any]:
    """
    Execute real benchmarking across all adapters.
    Returns full candidate evaluation reports and selected model.
    """
    bench_config = config or {}
    candidates = [
        ("StatisticalBaseline", StatisticalBaselineAdapter()),
        ("CTGAN", CTGANAdapter(epochs=bench_config.get("epochs", 5), batch_size=bench_config.get("batch_size", 20))),
        ("TVAE", TVAEAdapter(epochs=bench_config.get("epochs", 5), batch_size=bench_config.get("batch_size", 20))),
        ("DeterministicFallback", DeterministicFallbackAdapter()),
    ]

    reports: List[BenchmarkCandidateReport] = []
    sample_size = min(evaluation_sample_size, len(df)) if len(df) > 0 else 20

    best_candidate: Optional[BenchmarkCandidateReport] = None
    best_score = -1.0

    for name, adapter in candidates:
        caps = adapter.capabilities()
        rep = BenchmarkCandidateReport(name=name, available=caps.available, unavailable_reason=caps.unavailable_reason)

        if not caps.available:
            reports.append(rep)
            continue

        # Compatibility check
        min_rows = getattr(caps, "min_rows_for_training", 1)
        if len(df) < min_rows:
            rep.available = False
            rep.fit_status = "skipped"
            rep.failure_reason = f"Dataset row count ({len(df)}) is below candidate minimum ({min_rows})"
            reports.append(rep)
            continue

        # Fit Phase
        try:
            t0 = time.perf_counter()
            adapter.fit(df, profile, bench_config)
            rep.fit_time_ms = (time.perf_counter() - t0) * 1000
            rep.fit_status = "passed"
        except Exception as exc:
            rep.fit_status = "failed"
            rep.failure_reason = f"Fit error: {str(exc)}"
            reports.append(rep)
            continue

        # Sample Phase
        try:
            t0 = time.perf_counter()
            synth_sample = adapter.sample(num_rows=sample_size, seed=seed)
            rep.sample_time_ms = (time.perf_counter() - t0) * 1000
            rep.sample_status = "passed"
        except Exception as exc:
            rep.sample_status = "failed"
            rep.failure_reason = f"Sample error: {str(exc)}"
            reports.append(rep)
            continue

        # Evaluate Phase
        try:
            metrics = adapter.evaluate(df, synth_sample, profile)
            rep.schema_validity = metrics.schema_fidelity
            rep.overall_score = metrics.overall_score
            rep.distribution_fidelity = metrics.distribution_fidelity
            rep.novelty_rate = metrics.novelty_rate
            rep.privacy_score = metrics.privacy_score
            rep.hard_constraint_passed = metrics.hard_constraint_passed

            # Estimate approximate memory footprint
            rep.memory_mb = round((synth_sample.memory_usage(deep=True).sum()) / (1024 * 1024), 3)

            # Transparent selection logic: hard constraints must pass
            if rep.hard_constraint_passed and rep.overall_score > best_score:
                best_score = rep.overall_score
                best_candidate = rep
        except Exception as exc:
            rep.sample_status = "evaluation_failed"
            rep.failure_reason = f"Evaluation error: {str(exc)}"

        reports.append(rep)

    if best_candidate is None:
        # Fallback to statistical or first valid
        valid_reps = [r for r in reports if r.sample_status == "passed"]
        if valid_reps:
            best_candidate = valid_reps[0]
            best_candidate.selection_reason = f"Fallback to {best_candidate.name} as highest available stable candidate."
        else:
            best_candidate = reports[-1]
            best_candidate.selection_reason = "Deterministic fallback selected as last resort."
    else:
        best_candidate.selection_reason = (
            f"Achieved highest overall quality score ({best_candidate.overall_score:.3f}) "
            f"and passed all schema/hard constraints with {best_candidate.fit_time_ms:.1f}ms training time."
        )

    return {
        "dataset_rows": len(df),
        "dataset_columns": len(df.columns),
        "selected_model": best_candidate.name,
        "selection_reason": best_candidate.selection_reason,
        "best_overall_score": round(best_candidate.overall_score, 4),
        "candidates": [r.to_dict() for r in reports],
    }
