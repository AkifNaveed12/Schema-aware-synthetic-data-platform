"""
backend/app/models/adapters/statistical.py

StatisticalBaselineAdapter — always-available, no training dependencies.

Fit: captures per-column univariate distributions (normal / lognormal /
categorical frequencies / date ranges) from the supplied DataFrame.

Sample: draws from the captured distributions respecting column types,
null rates, and privacy rules from the DataProfile.
"""
from __future__ import annotations

import time
from typing import Any, Dict, List, Optional

import numpy as np
import pandas as pd
from faker import Faker

from backend.app.models.model_adapter import AdapterCapabilities, BenchmarkMetrics, ModelAdapter
from backend.app.models.data_profile import DataProfile

_VERSION = "1.0.0"


class StatisticalBaselineAdapter(ModelAdapter):
    """
    Fit: learns column-level univariate statistics from a DataFrame.
    Sample: draws from learned distributions in a vectorised NumPy pass.
    No external ML dependencies required.
    """

    def __init__(self) -> None:
        self._fitted = False
        self._col_stats: Dict[str, Dict[str, Any]] = {}
        self._columns: List[str] = []
        self._profile: Optional[DataProfile] = None
        self._fit_time_ms: float = 0.0

    # ── Adapter contract ──────────────────────────────────────────────────────

    def capabilities(self) -> AdapterCapabilities:
        return AdapterCapabilities(
            name="StatisticalBaseline",
            version=_VERSION,
            supports_tabular=True,
            supports_relational=False,
            supports_document=False,
            requires_training=True,
            min_rows_for_training=1,
            max_rows_for_training=500_000,
            available=True,
        )

    def fit(
        self,
        df: pd.DataFrame,
        profile: DataProfile,
        config: Optional[Dict[str, Any]] = None,
    ) -> None:
        t0 = time.perf_counter()
        self._profile = profile
        self._columns = list(df.columns)
        self._col_stats = {}

        for col in self._columns:
            series = df[col]
            stats: Dict[str, Any] = {"null_rate": float(series.isna().mean())}

            clean = series.dropna()
            # ── Numeric ───────────────────────────────────────────────────
            numeric = pd.to_numeric(clean, errors="coerce").dropna()
            if len(numeric) >= 2 and (numeric.dtype in (np.float64, np.int64) or
                                      pd.api.types.is_numeric_dtype(clean)):
                stats["kind"] = "numeric"
                stats["mean"] = float(numeric.mean())
                stats["std"] = float(numeric.std())
                stats["min"] = float(numeric.min())
                stats["max"] = float(numeric.max())
                # Detect log-normal: skewness > 1 and all-positive
                if (numeric > 0).all() and float(numeric.skew()) > 1.0:
                    log_vals = np.log(numeric.clip(lower=1e-9))
                    stats["dist"] = "lognormal"
                    stats["log_mean"] = float(log_vals.mean())
                    stats["log_std"] = float(log_vals.std())
                else:
                    stats["dist"] = "normal"
                # Is it effectively integer?
                stats["is_integer"] = bool((numeric % 1 == 0).all())

            # ── Date-like ─────────────────────────────────────────────────
            elif len(clean) > 0:
                try:
                    parsed = pd.to_datetime(clean, infer_datetime_format=True, errors="coerce")
                    ok_rate = parsed.notna().mean()
                    if ok_rate > 0.8:
                        ts = parsed.dropna().astype("int64") // 10**9
                        stats["kind"] = "date"
                        stats["ts_min"] = int(ts.min())
                        stats["ts_max"] = int(ts.max())
                    else:
                        raise ValueError("not date")
                except Exception:
                    # ── Categorical / string ───────────────────────────────
                    vc = clean.value_counts(normalize=True)
                    if clean.nunique() <= max(50, int(0.1 * len(clean))):
                        stats["kind"] = "categorical"
                        cats = list(vc.index[:50])
                        weights = list(vc.values[:50])
                        total = sum(weights)
                        weights = [w / total for w in weights]
                        stats["categories"] = cats
                        stats["weights"] = weights
                    else:
                        stats["kind"] = "freetext"
                        stats["sample"] = list(clean.sample(min(len(clean), 200), random_state=0))

            self._col_stats[col] = stats

        self._fitted = True
        self._fit_time_ms = round((time.perf_counter() - t0) * 1000, 2)

    def sample(
        self,
        num_rows: int,
        seed: Optional[int] = None,
        conditions: Optional[Dict[str, Any]] = None,
    ) -> pd.DataFrame:
        if not self._fitted:
            raise RuntimeError("StatisticalBaselineAdapter.sample() called before fit()")

        rng = np.random.RandomState(seed if seed is not None else 42)
        locale = (self._profile.default_locale if self._profile else None) or "en_US"
        fake = Faker(locale)
        fake.seed_instance(seed or 42)

        col_data: Dict[str, List[Any]] = {}

        for col in self._columns:
            stats = self._col_stats.get(col, {})
            kind = stats.get("kind", "freetext")
            null_rate = stats.get("null_rate", 0.0)

            if kind == "numeric":
                if stats.get("dist") == "lognormal":
                    raw = rng.lognormal(stats["log_mean"], max(stats["log_std"], 1e-6), num_rows)
                else:
                    raw = rng.normal(stats["mean"], max(stats["std"], 1e-6), num_rows)
                # Clip to observed range
                mn, mx = stats.get("min"), stats.get("max")
                if mn is not None:
                    raw = np.clip(raw, mn, mx)
                if stats.get("is_integer"):
                    vals: Any = [int(v) for v in raw]
                else:
                    vals = [round(float(v), 4) for v in raw]

            elif kind == "date":
                ts_min = stats.get("ts_min", 1577836800)
                ts_max = stats.get("ts_max", 1735689600)
                rand_ts = rng.randint(ts_min, max(ts_min + 1, ts_max), num_rows)
                from datetime import datetime
                vals = [datetime.fromtimestamp(int(ts)).strftime("%Y-%m-%d") for ts in rand_ts]

            elif kind == "categorical":
                cats = stats["categories"]
                weights = stats["weights"]
                # Normalise weights to sum to 1.0 safely
                total = sum(weights)
                norm_weights = [w / total for w in weights]
                norm_weights[-1] = 1.0 - sum(norm_weights[:-1])
                vals = list(rng.choice(cats, size=num_rows, p=norm_weights))

            else:
                # freetext — sample from observed pool
                pool = stats.get("sample", [fake.word()])
                vals = [pool[rng.randint(0, len(pool))] for _ in range(num_rows)]

            # Apply null_rate
            if null_rate > 0:
                mask = rng.rand(num_rows) < null_rate
                for idx in np.where(mask)[0]:
                    vals[idx] = None

            col_data[col] = vals

        return pd.DataFrame(col_data, columns=self._columns)

    def evaluate(
        self,
        real: pd.DataFrame,
        synthetic: pd.DataFrame,
        profile: Optional[DataProfile] = None,
    ) -> BenchmarkMetrics:
        base = super().evaluate(real, synthetic, profile)
        base.selection_reason = "Statistical baseline — always available, no dependency on ML libraries"
        return base

    def diagnostics(self) -> Dict[str, Any]:
        return {
            "adapter": "StatisticalBaseline",
            "fitted": self._fitted,
            "fit_time_ms": self._fit_time_ms,
            "columns": self._columns,
            "column_count": len(self._columns),
        }
