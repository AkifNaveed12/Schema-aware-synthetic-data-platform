"""
backend/app/models/model_adapter.py

Abstract ModelAdapter interface.  All synthetic-data generation backends
implement this boundary so the API layer can select, benchmark, and fall
back between models without coupling to any specific library.

Concrete implementations
------------------------
- StatisticalBaselineAdapter  : NumPy/SciPy distribution fitting (always available)
- CTGANAdapter                : SDV CTGAN wrapper (requires sdv+torch; graceful stub otherwise)
- TVAEAdapter                 : SDV TVAE wrapper  (requires sdv+torch; graceful stub otherwise)
- DeterministicFallbackAdapter: Faker/rule-based, zero-training fallback
"""
from __future__ import annotations

import time
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

import pandas as pd

from backend.app.models.data_profile import DataProfile


@dataclass
class AdapterCapabilities:
    name: str
    version: str
    supports_tabular: bool = True
    supports_relational: bool = False
    supports_document: bool = False
    requires_training: bool = False
    min_rows_for_training: int = 1
    max_rows_for_training: int = 1_000_000
    available: bool = True
    unavailable_reason: Optional[str] = None


@dataclass
class BenchmarkMetrics:
    adapter_name: str
    fit_time_ms: float = 0.0
    sample_time_ms: float = 0.0
    rows_generated: int = 0
    # Quality dimensions (0–1, higher is better)
    schema_fidelity: float = 0.0
    distribution_fidelity: float = 0.0
    pairwise_fidelity: float = 0.0
    privacy_score: float = 1.0
    novelty_rate: float = 1.0
    overall_score: float = 0.0
    hard_constraint_passed: bool = True
    selection_reason: str = ""
    extra: Dict[str, Any] = field(default_factory=dict)


class ModelAdapter(ABC):
    """Abstract base class for all synthetic-data generation backends."""

    @abstractmethod
    def capabilities(self) -> AdapterCapabilities:
        """Return static metadata about what this adapter supports."""

    @abstractmethod
    def fit(
        self,
        df: pd.DataFrame,
        profile: DataProfile,
        config: Optional[Dict[str, Any]] = None,
    ) -> None:
        """
        Train / fit the model on the supplied cleaned DataFrame.
        Must be called before sample().
        """

    @abstractmethod
    def sample(
        self,
        num_rows: int,
        seed: Optional[int] = None,
        conditions: Optional[Dict[str, Any]] = None,
    ) -> pd.DataFrame:
        """
        Generate *num_rows* synthetic rows.
        Returns a DataFrame with the same columns as the training data.
        """

    def evaluate(
        self,
        real: pd.DataFrame,
        synthetic: pd.DataFrame,
        profile: Optional[DataProfile] = None,
    ) -> BenchmarkMetrics:
        """
        Compute quality metrics comparing real vs synthetic data.
        Default implementation provides schema + basic distribution checks.
        Override in subclasses for richer metrics.
        """
        caps = self.capabilities()
        metrics = BenchmarkMetrics(adapter_name=caps.name)

        # ── Schema fidelity ────────────────────────────────────────────────
        real_cols = set(real.columns)
        synth_cols = set(synthetic.columns)
        col_match = len(real_cols & synth_cols) / max(len(real_cols), 1)
        metrics.schema_fidelity = round(col_match, 4)

        # ── Row count ──────────────────────────────────────────────────────
        metrics.rows_generated = len(synthetic)

        # ── Distribution fidelity (per numeric column) ─────────────────────
        dist_scores: List[float] = []
        for col in real.columns:
            if col not in synthetic.columns:
                continue
            try:
                r_vals = pd.to_numeric(real[col], errors="coerce").dropna()
                s_vals = pd.to_numeric(synthetic[col], errors="coerce").dropna()
                if len(r_vals) < 2 or len(s_vals) < 2:
                    continue
                # Mean relative error (capped)
                r_mean = float(r_vals.mean())
                s_mean = float(s_vals.mean())
                if abs(r_mean) < 1e-9:
                    continue
                mean_err = min(abs((s_mean - r_mean) / r_mean), 1.0)
                dist_scores.append(1.0 - mean_err)
            except Exception:
                pass
        metrics.distribution_fidelity = round(sum(dist_scores) / max(len(dist_scores), 1), 4) if dist_scores else 0.5

        # ── Novelty (no exact row duplication) ────────────────────────────
        try:
            merged = pd.merge(real, synthetic, how="inner")
            exact_matches = len(merged)
            metrics.novelty_rate = round(1.0 - exact_matches / max(len(synthetic), 1), 4)
        except Exception:
            metrics.novelty_rate = 1.0

        # ── Privacy (basic exact-match rate check) ────────────────────────
        metrics.privacy_score = metrics.novelty_rate

        # ── Overall composite ─────────────────────────────────────────────
        metrics.overall_score = round(
            0.30 * metrics.schema_fidelity
            + 0.40 * metrics.distribution_fidelity
            + 0.15 * metrics.novelty_rate
            + 0.15 * metrics.privacy_score,
            4,
        )
        return metrics

    def diagnostics(self) -> Dict[str, Any]:
        """Return adapter-specific diagnostic info (optional override)."""
        return {"adapter": self.capabilities().name}
