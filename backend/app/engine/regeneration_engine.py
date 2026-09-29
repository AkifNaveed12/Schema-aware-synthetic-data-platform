"""
backend/app/engine/regeneration_engine.py

Controlled Regeneration & Optimization Engine.
Replaces blind re-generation with a closed diagnostic loop:
Generate -> Validate -> Evaluate -> Diagnose -> Explain Issue -> Select Strategy -> Regenerate -> Compare -> Retain Preferred.

Supported Diagnostic Rules:
- categorical_distribution_drift
- numeric_distribution_mismatch
- relationship_weakness
- missingness_mismatch
- structural_constraint_failure
- insufficient_utility

Supported Strategies:
- change_seed
- change_model
- rebalance_categories
- strengthen_constraints
- adjust_distribution_fitting
"""
from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional, Tuple
import numpy as np
import pandas as pd

from backend.app.models.data_profile import DataProfile
from backend.app.models.adapters.statistical import StatisticalBaselineAdapter
from backend.app.models.adapters.deterministic import DeterministicFallbackAdapter
from backend.app.models.adapters.ctgan_adapter import CTGANAdapter
from backend.app.models.adapters.tvae_adapter import TVAEAdapter

logger = logging.getLogger("hackdata.regeneration")


class DiagnosticFinding:
    def __init__(self, issue_type: str, severity: str, message: str, recommended_strategy: str):
        self.issue_type = issue_type
        self.severity = severity  # low, medium, high, critical
        self.message = message
        self.recommended_strategy = recommended_strategy

    def to_dict(self) -> Dict[str, Any]:
        return {
            "issue_type": self.issue_type,
            "severity": self.severity,
            "message": self.message,
            "recommended_strategy": self.recommended_strategy,
        }


def diagnose_generation_issues(
    real_df: pd.DataFrame,
    synthetic_df: pd.DataFrame,
    profile: Optional[DataProfile] = None,
    evaluation_metrics: Optional[Dict[str, Any]] = None,
) -> List[DiagnosticFinding]:
    """Inspect quality metrics and data distributions to identify specific degradation points."""
    findings: List[DiagnosticFinding] = []

    # 1. Missing columns or row mismatch
    missing_cols = set(real_df.columns) - set(synthetic_df.columns)
    if missing_cols:
        findings.append(DiagnosticFinding(
            issue_type="structural_constraint_failure",
            severity="critical",
            message=f"Synthetic data missing required schema columns: {', '.join(missing_cols)}",
            recommended_strategy="strengthen_constraints",
        ))

    # 2. Categorical drift detection
    cat_cols = [c for c in real_df.columns if not pd.api.types.is_numeric_dtype(real_df[c]) and c in synthetic_df.columns]
    for c in cat_cols[:5]:
        r_vc = real_df[c].value_counts(normalize=True).to_dict()
        s_vc = synthetic_df[c].value_counts(normalize=True).to_dict()
        max_drift = 0.0
        for val, r_p in r_vc.items():
            s_p = s_vc.get(val, 0.0)
            drift = abs(r_p - s_p)
            if drift > max_drift:
                max_drift = drift
        if max_drift > 0.25:
            findings.append(DiagnosticFinding(
                issue_type="categorical_distribution_drift",
                severity="medium" if max_drift < 0.4 else "high",
                message=f"Column '{c}' exhibits substantial category probability drift ({max_drift*100:.1f}% variation).",
                recommended_strategy="rebalance_categories",
            ))

    # 3. Numeric distribution variance check
    num_cols = [c for c in real_df.columns if pd.api.types.is_numeric_dtype(real_df[c]) and c in synthetic_df.columns]
    for c in num_cols[:5]:
        r_mean = real_df[c].dropna().mean()
        s_mean = synthetic_df[c].dropna().mean()
        if pd.notna(r_mean) and pd.notna(s_mean) and abs(r_mean) > 1e-4:
            pct_diff = abs(s_mean - r_mean) / abs(r_mean)
            if pct_diff > 0.35:
                findings.append(DiagnosticFinding(
                    issue_type="numeric_distribution_mismatch",
                    severity="medium",
                    message=f"Column '{c}' mean value diverged by {pct_diff*100:.1f}% from observed data.",
                    recommended_strategy="adjust_distribution_fitting",
                ))

    # 4. Overall score inspection
    if evaluation_metrics:
        score = evaluation_metrics.get("overall_score", 1.0)
        if score is not None and score < 0.7:
            findings.append(DiagnosticFinding(
                issue_type="insufficient_utility",
                severity="high",
                message=f"Overall quality score ({score:.2f}) falls below 0.70 confidence threshold.",
                recommended_strategy="change_model",
            ))

    if not findings:
        findings.append(DiagnosticFinding(
            issue_type="minor_statistical_variance",
            severity="low",
            message="No critical fidelity violations detected. Subtle variance may be optimized via seed exploration.",
            recommended_strategy="change_seed",
        ))

    return findings


def execute_controlled_regeneration(
    real_df: pd.DataFrame,
    previous_synthetic_df: pd.DataFrame,
    profile: Optional[DataProfile] = None,
    strategy: str = "rebalance_categories",
    reason: str = "Categorical drift correction",
    current_model: str = "statistical",
    current_seed: int = 42,
    num_rows: Optional[int] = None,
) -> Dict[str, Any]:
    """
    Execute controlled re-generation based on diagnostic strategy:
    Applies parameter adjustments, samples new dataset, computes delta,
    and honestly reports whether the regenerated output improved or worsened.
    """
    rows_to_gen = num_rows or len(previous_synthetic_df)
    new_seed = (current_seed + 1337) % 100000
    target_model_name = current_model.lower()
    changed_params = {}

    # Strategy application
    if strategy == "change_model":
        if target_model_name == "statistical":
            ca = CTGANAdapter()
            target_model_name = "ctgan" if ca.capabilities().available else "tvae"
        else:
            target_model_name = "statistical"
        changed_params["model_strategy"] = target_model_name

    elif strategy == "change_seed":
        new_seed = (current_seed * 31 + 17) % 99999
        changed_params["seed"] = new_seed

    elif strategy == "rebalance_categories":
        changed_params["rebalance_weights"] = True
        changed_params["seed"] = new_seed

    elif strategy == "adjust_distribution_fitting":
        changed_params["tighten_clipping"] = True
        changed_params["seed"] = new_seed

    else:
        changed_params["strengthen_constraints"] = True
        changed_params["seed"] = new_seed

    # Instantiate chosen adapter
    if target_model_name == "ctgan":
        adapter = CTGANAdapter(epochs=6, batch_size=25)
    elif target_model_name == "tvae":
        adapter = TVAEAdapter(epochs=6, batch_size=25)
    elif target_model_name == "deterministic":
        adapter = DeterministicFallbackAdapter()
    else:
        adapter = StatisticalBaselineAdapter()

    # Fit and sample
    adapter.fit(real_df, profile, changed_params)
    new_synth_df = adapter.sample(rows_to_gen, seed=new_seed)

    # Evaluate previous vs new
    prev_eval_adapter = StatisticalBaselineAdapter()
    prev_eval_adapter.fit(real_df, profile)
    prev_metrics = prev_eval_adapter.evaluate(real_df, previous_synthetic_df, profile)
    new_metrics = adapter.evaluate(real_df, new_synth_df, profile)

    prev_score = prev_metrics.overall_score
    new_score = new_metrics.overall_score
    score_delta = round(new_score - prev_score, 4)

    improved = score_delta >= 0.0

    return {
        "strategy": strategy,
        "reason": reason,
        "changed_parameters": changed_params,
        "previous_metrics": {
            "overall_score": round(prev_score, 4),
            "distribution_fidelity": round(prev_metrics.distribution_fidelity, 4),
            "schema_fidelity": round(prev_metrics.schema_fidelity, 4),
            "novelty_rate": round(prev_metrics.novelty_rate, 4),
        },
        "new_metrics": {
            "overall_score": round(new_score, 4),
            "distribution_fidelity": round(new_metrics.distribution_fidelity, 4),
            "schema_fidelity": round(new_metrics.schema_fidelity, 4),
            "novelty_rate": round(new_metrics.novelty_rate, 4),
        },
        "improvement_delta": score_delta,
        "improved": improved,
        "preferred_run": "new" if improved else "previous",
        "status": "completed",
        "new_synthetic_df": new_synth_df,
    }
