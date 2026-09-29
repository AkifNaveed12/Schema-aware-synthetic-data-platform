"""
backend/app/engine/tstr_engine.py

TSTR (Train on Synthetic, Test on Real) Engine.
Evaluates ML utility preservation without data leakage.

Pipeline:
1. Validate dataset & target column suitability.
2. Partition Real dataset into Real-Train and Real-Test (held-out evaluation set).
3. Train baseline ML model on Real-Train -> evaluate on Real-Test (Real -> Real Baseline).
4. Train candidate ML model on Synthetic-Data -> evaluate on same Real-Test (Synthetic -> Real).
5. Compute utility retention:
   Retention = (Metric_synth / Metric_real) * 100%
   Formula explicitly documented in output.

Supports:
- Classification: accuracy, precision, recall, f1, roc_auc (when valid)
- Regression: mae, rmse, r2
"""
from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    mean_absolute_error,
    mean_squared_error,
    r2_score,
)

logger = logging.getLogger("hackdata.tstr")


def identify_suitable_targets(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """Scan columns to find suitable supervised learning targets."""
    candidates = []
    num_rows = len(df)
    if num_rows < 15:
        return candidates

    for col in df.columns:
        series = df[col].dropna()
        if len(series) < 10:
            continue

        nunique = series.nunique()
        # Binary or multiclass classification candidate
        if 2 <= nunique <= min(20, max(2, int(num_rows * 0.2))):
            candidates.append({
                "column": col,
                "task_type": "classification",
                "classes_count": nunique,
                "data_type": str(series.dtype),
            })
        # Numeric regression candidate
        elif pd.api.types.is_numeric_dtype(series) and nunique > 20:
            candidates.append({
                "column": col,
                "task_type": "regression",
                "classes_count": nunique,
                "data_type": str(series.dtype),
            })

    return candidates


def _preprocess_features(
    train_df: pd.DataFrame,
    test_df: pd.DataFrame,
    target_col: str,
) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """Align features, encode categoricals, impute missing values."""
    feature_cols = [c for c in train_df.columns if c != target_col and c in test_df.columns]

    X_train_raw = train_df[feature_cols].copy()
    X_test_raw = test_df[feature_cols].copy()
    y_train = train_df[target_col].copy()
    y_test = test_df[target_col].copy()

    # Fill NA & simple frequency encoding for categoricals
    for col in feature_cols:
        if pd.api.types.is_numeric_dtype(X_train_raw[col]):
            median = X_train_raw[col].median()
            X_train_raw[col] = X_train_raw[col].fillna(median if pd.notna(median) else 0)
            X_test_raw[col] = X_test_raw[col].fillna(median if pd.notna(median) else 0)
        else:
            cat_map = {val: i + 1 for i, val in enumerate(X_train_raw[col].dropna().unique())}
            X_train_raw[col] = X_train_raw[col].map(cat_map).fillna(0)
            X_test_raw[col] = X_test_raw[col].map(cat_map).fillna(0)

    # Encode target if categorical
    if not pd.api.types.is_numeric_dtype(y_train):
        y_cats = {val: i for i, val in enumerate(y_train.dropna().unique())}
        y_train = y_train.map(y_cats).fillna(0).astype(int)
        y_test = y_test.map(y_cats).fillna(0).astype(int)
    else:
        y_train = y_train.fillna(y_train.median() if pd.notna(y_train.median()) else 0)
        y_test = y_test.fillna(y_train.median() if pd.notna(y_train.median()) else 0)

    return (
        X_train_raw.to_numpy(dtype=float),
        y_train.to_numpy(),
        X_test_raw.to_numpy(dtype=float),
        y_test.to_numpy(),
    )


def evaluate_tstr(
    real_df: pd.DataFrame,
    synthetic_df: pd.DataFrame,
    target_column: str,
    task_type: Optional[str] = None,
    test_size: float = 0.25,
    seed: int = 42,
) -> Dict[str, Any]:
    """
    Run TSTR evaluation:
    Train ML model on Synthetic data -> Test on held-out Real test partition.
    Compare with Real -> Real baseline.
    """
    if len(real_df) < 15:
        raise ValueError(f"Dataset has only {len(real_df)} rows. Minimum 15 rows required for reliable TSTR evaluation.")
    if target_column not in real_df.columns:
        raise ValueError(f"Target column '{target_column}' does not exist in real dataset.")
    if target_column not in synthetic_df.columns:
        raise ValueError(f"Target column '{target_column}' does not exist in synthetic dataset.")

    # Determine task type
    inferred_task = task_type
    if not inferred_task:
        nunique = real_df[target_column].dropna().nunique()
        inferred_task = "classification" if (nunique <= 20 or not pd.api.types.is_numeric_dtype(real_df[target_column])) else "regression"

    # Held-out real test split to prevent leakage
    clean_real = real_df.dropna(subset=[target_column])
    clean_synth = synthetic_df.dropna(subset=[target_column])

    if len(clean_real) < 10 or len(clean_synth) < 10:
        raise ValueError("Insufficient non-null rows in target column for TSTR training/testing.")

    real_train, real_test = train_test_split(
        clean_real,
        test_size=test_size,
        random_state=seed,
    )

    if inferred_task == "classification":
        # 1. Real -> Real Baseline
        X_rt, y_rt, X_te, y_te = _preprocess_features(real_train, real_test, target_column)
        clf_real = RandomForestClassifier(n_estimators=50, random_state=seed, max_depth=8)
        clf_real.fit(X_rt, y_rt)
        preds_real = clf_real.predict(X_te)

        r_acc = float(accuracy_score(y_te, preds_real))
        r_f1 = float(f1_score(y_te, preds_real, average="weighted", zero_division=0))
        r_prec = float(precision_score(y_te, preds_real, average="weighted", zero_division=0))
        r_rec = float(recall_score(y_te, preds_real, average="weighted", zero_division=0))

        # 2. Synthetic -> Real Evaluation
        X_st, y_st, _, _ = _preprocess_features(clean_synth, real_test, target_column)
        clf_synth = RandomForestClassifier(n_estimators=50, random_state=seed, max_depth=8)
        clf_synth.fit(X_st, y_st)
        preds_synth = clf_synth.predict(X_te)

        s_acc = float(accuracy_score(y_te, preds_synth))
        s_f1 = float(f1_score(y_te, preds_synth, average="weighted", zero_division=0))
        s_prec = float(precision_score(y_te, preds_synth, average="weighted", zero_division=0))
        s_rec = float(recall_score(y_te, preds_synth, average="weighted", zero_division=0))

        # Utility Retention based on F1 (or Accuracy)
        primary_metric_real = max(r_f1, 1e-4)
        primary_metric_synth = s_f1
        retention = min(100.0, max(0.0, (primary_metric_synth / primary_metric_real) * 100.0))

        return {
            "task_type": "classification",
            "target_column": target_column,
            "real_test_samples": len(real_test),
            "synthetic_train_samples": len(clean_synth),
            "utility_retention_pct": round(retention, 2),
            "retention_formula": "Utility Retention (%) = (Synthetic_to_Real_F1 / Real_to_Real_F1) * 100",
            "real_to_real": {
                "accuracy": round(r_acc, 4),
                "f1_score": round(r_f1, 4),
                "precision": round(r_prec, 4),
                "recall": round(r_rec, 4),
            },
            "synthetic_to_real": {
                "accuracy": round(s_acc, 4),
                "f1_score": round(s_f1, 4),
                "precision": round(s_prec, 4),
                "recall": round(s_rec, 4),
            },
        }

    else:
        # Regression
        X_rt, y_rt, X_te, y_te = _preprocess_features(real_train, real_test, target_column)
        reg_real = RandomForestRegressor(n_estimators=50, random_state=seed, max_depth=8)
        reg_real.fit(X_rt, y_rt)
        preds_real = reg_real.predict(X_te)

        r_mae = float(mean_absolute_error(y_te, preds_real))
        r_rmse = float(np.sqrt(mean_squared_error(y_te, preds_real)))
        r_r2 = float(r2_score(y_te, preds_real))

        X_st, y_st, _, _ = _preprocess_features(clean_synth, real_test, target_column)
        reg_synth = RandomForestRegressor(n_estimators=50, random_state=seed, max_depth=8)
        reg_synth.fit(X_st, y_st)
        preds_synth = reg_synth.predict(X_te)

        s_mae = float(mean_absolute_error(y_te, preds_synth))
        s_rmse = float(np.sqrt(mean_squared_error(y_te, preds_synth)))
        s_r2 = float(r2_score(y_te, preds_synth))

        # Utility Retention: inverted error ratio or R2 ratio
        if r_mae > 0 and s_mae > 0:
            retention = min(100.0, max(0.0, (r_mae / max(s_mae, 1e-6)) * 100.0))
        else:
            retention = 100.0 if s_mae == 0 else 50.0

        return {
            "task_type": "regression",
            "target_column": target_column,
            "real_test_samples": len(real_test),
            "synthetic_train_samples": len(clean_synth),
            "utility_retention_pct": round(retention, 2),
            "retention_formula": "Utility Retention (%) = min(100, (Real_to_Real_MAE / Synthetic_to_Real_MAE) * 100)",
            "real_to_real": {
                "mae": round(r_mae, 4),
                "rmse": round(r_rmse, 4),
                "r2": round(r_r2, 4),
            },
            "synthetic_to_real": {
                "mae": round(s_mae, 4),
                "rmse": round(s_rmse, 4),
                "r2": round(s_r2, 4),
            },
        }
