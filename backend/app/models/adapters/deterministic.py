"""
backend/app/models/adapters/deterministic.py

DeterministicFallbackAdapter — pure Faker + rule-based generation.

- Zero training required (fit() is a no-op).
- Uses DataProfile column specifications to drive generation.
- Correct fallback for previews, simple schemas, and environments
  without ML library support.
- Delegates to the existing TabularEngine under the ModelAdapter interface.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional

import pandas as pd

from backend.app.models.model_adapter import AdapterCapabilities, BenchmarkMetrics, ModelAdapter
from backend.app.models.data_profile import DataProfile, ColumnProfile, DistributionConfig
from faker import Faker
import numpy as np


class DeterministicFallbackAdapter(ModelAdapter):
    """
    Faker/rules-based fallback. Always available; no training.
    """

    def __init__(self) -> None:
        self._profile: Optional[DataProfile] = None
        self._df_columns: List[str] = []

    def capabilities(self) -> AdapterCapabilities:
        return AdapterCapabilities(
            name="DeterministicFallback",
            version="1.0.0",
            supports_tabular=True,
            supports_relational=False,
            supports_document=False,
            requires_training=False,
            min_rows_for_training=0,
            max_rows_for_training=0,
            available=True,
        )

    def fit(
        self,
        df: pd.DataFrame,
        profile: DataProfile,
        config: Optional[Dict[str, Any]] = None,
    ) -> None:
        """No-op: deterministic adapter derives everything from the profile."""
        self._profile = profile
        self._df_columns = list(df.columns) if df is not None else []

    def sample(
        self,
        num_rows: int,
        seed: Optional[int] = None,
        conditions: Optional[Dict[str, Any]] = None,
    ) -> pd.DataFrame:
        """Generate using TabularEngine with the stored profile."""
        from backend.app.engine.tabular_engine import tabular_engine
        from backend.app.models.schemas import TabularGenerateRequest

        rq = TabularGenerateRequest(
            row_count=num_rows,
            random_seed=seed,
            profile=self._profile,
            apply_privacy=False,
        )
        result = tabular_engine.generate(rq)
        return pd.DataFrame(result.rows)

    def diagnostics(self) -> Dict[str, Any]:
        return {
            "adapter": "DeterministicFallback",
            "profile_id": self._profile.profile_id if self._profile else None,
        }
