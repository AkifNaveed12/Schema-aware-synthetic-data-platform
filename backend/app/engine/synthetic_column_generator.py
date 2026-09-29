"""
backend/app/engine/synthetic_column_generator.py

Generator engine for user-specified synthetic columns.
Integrates with DataProfile and supports:
- Primitive data types: string, integer, float, date, boolean, categorical, currency, email
- Semantic types: full_name, email, city, country, company, phone, id_sequence, salary_band, etc.
- Numeric distributions: normal, uniform, log_normal, exponential
- Categorical choices with optional probability weights
- Date ranges & formats
- Deterministic seed reproduction
- Nullable rates & boundaries
"""
from __future__ import annotations

import re
from datetime import datetime
from typing import Any, Dict, List, Optional
import numpy as np
import pandas as pd
from faker import Faker

from backend.app.models.data_profile import DataProfile, SyntheticColumnSpec, TableProfile


def validate_column_name(name: str, existing_names: List[str]) -> None:
    """Validate name is non-empty, valid identifier-like, and not colliding."""
    if not name or not name.strip():
        raise ValueError("Synthetic column name cannot be empty.")
    clean = name.strip()
    if not re.match(r"^[A-Za-z_][A-Za-z0-9_]*$", clean):
        raise ValueError(
            f"Invalid column name '{clean}'. Column names must start with a letter or underscore and contain only alphanumeric characters and underscores."
        )
    existing_lower = [e.lower() for e in existing_names]
    if clean.lower() in existing_lower:
        raise ValueError(f"Column name '{clean}' already exists in dataset schema.")


def generate_synthetic_column_values(
    spec: SyntheticColumnSpec,
    num_rows: int,
    seed: Optional[int] = None,
    df_context: Optional[pd.DataFrame] = None,
) -> List[Any]:
    """Generate a list of values adhering strictly to SyntheticColumnSpec."""
    effective_seed = spec.seed if spec.seed is not None else seed
    rng = np.random.RandomState(effective_seed if effective_seed is not None else 42)
    locale = spec.locale or "en_US"
    fake = Faker(locale)
    fake.seed_instance(effective_seed if effective_seed is not None else 42)

    dtype = (spec.data_type or "string").lower()
    semantic = (spec.semantic_type or "").lower()
    dist = spec.distribution

    # 1. Semantic-specific generators
    if semantic in ("id_sequence", "id", "sequence"):
        start = int(spec.range_min) if spec.range_min is not None else 1
        vals = [start + i for i in range(num_rows)]
    elif semantic in ("email", "mail"):
        vals = [fake.email() for _ in range(num_rows)]
    elif semantic in ("full_name", "name", "customer_name"):
        vals = [fake.name() for _ in range(num_rows)]
    elif semantic in ("first_name",):
        vals = [fake.first_name() for _ in range(num_rows)]
    elif semantic in ("last_name",):
        vals = [fake.last_name() for _ in range(num_rows)]
    elif semantic in ("company", "organization"):
        vals = [fake.company() for _ in range(num_rows)]
    elif semantic in ("city",):
        vals = [fake.city() for _ in range(num_rows)]
    elif semantic in ("country",):
        vals = [fake.country() for _ in range(num_rows)]
    elif semantic in ("street_address", "address"):
        vals = [fake.street_address() for _ in range(num_rows)]
    elif semantic in ("phone", "phone_number"):
        vals = [fake.phone_number() for _ in range(num_rows)]
    elif semantic in ("salary_band", "tier", "grade"):
        cats = spec.categories or ["Entry", "Mid", "Senior", "Lead"]
        weights = spec.weights
        if weights and len(weights) == len(cats):
            tot = sum(weights)
            norm_w = [w / tot for w in weights]
        else:
            norm_w = None
        vals = list(rng.choice(cats, size=num_rows, p=norm_w))

    # 2. General Data Types
    elif dtype in ("integer", "int"):
        low = int(spec.range_min if spec.range_min is not None else (dist.min_value if dist and dist.min_value is not None else 1))
        high = int(spec.range_max if spec.range_max is not None else (dist.max_value if dist and dist.max_value is not None else 1000))
        if dist and dist.type == "normal":
            mean = dist.mean if dist.mean is not None else (low + high) / 2
            std = dist.std_dev if dist.std_dev is not None else max((high - low) / 6, 1)
            raw = rng.normal(mean, std, num_rows)
            vals = [int(np.clip(round(v), low, high)) for v in raw]
        else:
            vals = [int(v) for v in rng.randint(min(low, high), max(low, high) + 1, num_rows)]

    elif dtype in ("float", "numeric", "currency"):
        low = float(spec.range_min if spec.range_min is not None else (dist.min_value if dist and dist.min_value is not None else 0.0))
        high = float(spec.range_max if spec.range_max is not None else (dist.max_value if dist and dist.max_value is not None else 1000.0))
        if dist and dist.type == "normal":
            mean = dist.mean if dist.mean is not None else (low + high) / 2
            std = dist.std_dev if dist.std_dev is not None else max((high - low) / 6, 0.1)
            raw = rng.normal(mean, std, num_rows)
            vals = [round(float(np.clip(v, low, high)), 2) for v in raw]
        elif dist and dist.type == "log_normal":
            mean = dist.mean if dist.mean is not None else 500.0
            std = dist.std_dev if dist.std_dev is not None else 200.0
            sigma = float(np.sqrt(np.log(1 + (std / max(mean, 1e-3)) ** 2)))
            mu = float(np.log(max(mean, 1e-3)) - 0.5 * sigma ** 2)
            raw = rng.lognormal(mu, sigma, num_rows)
            vals = [round(float(np.clip(v, low, high)), 2) for v in raw]
        else:
            vals = [round(float(v), 2) for v in rng.uniform(min(low, high), max(low, high), num_rows)]

    elif dtype in ("categorical", "category") or (spec.categories and len(spec.categories) > 0):
        cats = spec.categories or ["Alpha", "Beta", "Gamma"]
        weights = spec.weights
        if weights and len(weights) == len(cats):
            tot = sum(weights)
            norm_w = [w / tot for w in weights]
        else:
            norm_w = None
        vals = list(rng.choice(cats, size=num_rows, p=norm_w))

    elif dtype in ("date", "datetime"):
        fmt = spec.date_format or "%Y-%m-%d"
        start_ts = 1704067200  # 2024-01-01
        end_ts = 1772496000    # 2026-03-01
        if spec.date_start:
            try:
                start_ts = int(datetime.fromisoformat(spec.date_start).timestamp())
            except Exception:
                pass
        if spec.date_end:
            try:
                end_ts = int(datetime.fromisoformat(spec.date_end).timestamp())
            except Exception:
                pass
        if start_ts > end_ts:
            start_ts, end_ts = end_ts, start_ts
        rand_ts = rng.randint(start_ts, max(start_ts + 1, end_ts), num_rows)
        vals = [datetime.fromtimestamp(int(ts)).strftime(fmt) for ts in rand_ts]

    elif dtype in ("bool", "boolean"):
        vals = [bool(b) for b in rng.choice([True, False], size=num_rows)]

    else:
        # Default string words
        if spec.pattern:
            vals = [f"{spec.pattern}_{rng.randint(100, 999)}" for _ in range(num_rows)]
        else:
            vals = [fake.word().capitalize() for _ in range(num_rows)]

    # Nullable application
    if spec.nullable:
        null_mask = rng.rand(num_rows) < 0.08
        vals = [None if null_mask[i] else vals[i] for i in range(num_rows)]

    return vals


def apply_synthetic_columns(
    df: pd.DataFrame,
    synthetic_columns: List[SyntheticColumnSpec],
    seed: Optional[int] = None,
) -> pd.DataFrame:
    """Attach generated synthetic columns to a generated or sample DataFrame."""
    if not synthetic_columns:
        return df

    out_df = df.copy()
    num_rows = len(out_df)

    for spec in synthetic_columns:
        col_vals = generate_synthetic_column_values(spec, num_rows=num_rows, seed=seed, df_context=out_df)
        out_df[spec.name] = col_vals

    return out_df
