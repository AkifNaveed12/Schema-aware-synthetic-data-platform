"""
backend/app/pipeline/cleaner.py

Controlled data cleaning / normalization layer.
- Auditable: every transformation is recorded in CleaningAction list.
- Non-destructive: returns (cleaned_df, actions) — never mutates input.
- Conservative: does not silently delete rows; reports what it does.
"""
from typing import List, Optional, Tuple

import numpy as np
import pandas as pd

from backend.app.models.data_profile import CleaningAction, DataProfile


def clean_dataframe(
    df: pd.DataFrame,
    profile: Optional[DataProfile] = None,
    remove_duplicates: bool = True,
    impute_numeric: bool = True,
    coerce_dates: bool = True,
    max_rows: int = 100_000,
) -> Tuple[pd.DataFrame, List[CleaningAction]]:
    """
    Apply safe data cleaning to *df* and return (clean_df, actions).

    Parameters
    ----------
    df              : raw DataFrame from ingestion
    profile         : optional DataProfile; used to know column types
    remove_duplicates : deduplicate fully identical rows if True
    impute_numeric  : fill missing numeric values with column median
    coerce_dates    : normalise recognised date-like strings to ISO-8601
    max_rows        : hard cap; rows beyond this are truncated

    Returns
    -------
    clean_df        : a new DataFrame (copy), never the input
    actions         : ordered list of CleaningAction records
    """
    df = df.copy()
    actions: List[CleaningAction] = []

    # ── Row cap ──────────────────────────────────────────────────────────────
    if len(df) > max_rows:
        trimmed = len(df) - max_rows
        df = df.head(max_rows)
        actions.append(CleaningAction(
            action_type="row_cap",
            rows_affected=trimmed,
            description=f"Truncated dataset to {max_rows} rows (was {len(df) + trimmed})",
        ))

    # ── Duplicate removal ─────────────────────────────────────────────────────
    if remove_duplicates:
        before = len(df)
        df = df.drop_duplicates()
        removed = before - len(df)
        if removed > 0:
            actions.append(CleaningAction(
                action_type="remove_duplicates",
                rows_affected=removed,
                description=f"Removed {removed} fully duplicate rows",
            ))

    # ── Column-level cleaning ──────────────────────────────────────────────────
    # Build a quick dtype map from profile (if available)
    profile_types: dict = {}
    if profile and profile.tables:
        for col in profile.tables[0].columns:
            profile_types[col.name] = col.data_type

    for col in df.columns:
        series = df[col]
        null_count = int(series.isna().sum())
        dtype_hint = profile_types.get(col, "string")

        # ── Coerce numeric strings ─────────────────────────────────────────
        if dtype_hint in ("integer", "float", "currency"):
            coerced = pd.to_numeric(series, errors="coerce")
            newly_null = int(coerced.isna().sum()) - null_count
            if newly_null > 0:
                actions.append(CleaningAction(
                    action_type="coerce_numeric_failed",
                    column=col,
                    rows_affected=newly_null,
                    description=f"{col}: {newly_null} non-numeric strings could not be coerced to {dtype_hint}",
                ))
            df[col] = coerced

        # ── Impute missing numeric with column median ───────────────────────
        if impute_numeric and dtype_hint in ("integer", "float", "currency"):
            col_null = int(df[col].isna().sum())
            if col_null > 0:
                median_val = df[col].median()
                if pd.notna(median_val):
                    df[col] = df[col].fillna(median_val)
                    actions.append(CleaningAction(
                        action_type="impute_median",
                        column=col,
                        rows_affected=col_null,
                        after_value=round(float(median_val), 4),
                        description=f"{col}: imputed {col_null} missing values with median={round(float(median_val), 4)}",
                    ))

        # ── Coerce date strings to ISO-8601 ────────────────────────────────
        if coerce_dates and dtype_hint == "date":
            try:
                parsed = pd.to_datetime(series, infer_datetime_format=True, errors="coerce")
                success = int(parsed.notna().sum())
                before_null = int(series.isna().sum())
                if success > 0:
                    df[col] = parsed.dt.strftime("%Y-%m-%d")
                    # Re-mark values that failed to parse as NaT→None
                    failed = int(df[col].isna().sum()) - before_null
                    if failed > 0:
                        actions.append(CleaningAction(
                            action_type="coerce_date_failed",
                            column=col,
                            rows_affected=failed,
                            description=f"{col}: {failed} date strings could not be parsed and were set to null",
                        ))
                    else:
                        actions.append(CleaningAction(
                            action_type="coerce_date",
                            column=col,
                            rows_affected=success,
                            description=f"{col}: normalised {success} date values to ISO-8601",
                        ))
            except Exception:
                pass

        # ── Strip leading/trailing whitespace from strings ─────────────────
        if series.dtype == object:
            stripped = series.str.strip() if hasattr(series, "str") else series
            changed = int((stripped != series).sum())
            if changed > 0:
                df[col] = stripped
                actions.append(CleaningAction(
                    action_type="strip_whitespace",
                    column=col,
                    rows_affected=changed,
                    description=f"{col}: stripped whitespace from {changed} values",
                ))

    df = df.reset_index(drop=True)
    return df, actions
