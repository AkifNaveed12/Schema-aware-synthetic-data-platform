"""
backend/app/pipeline/profiler.py

Real statistical profiler: converts a pandas DataFrame into a rich DataProfile.
No hardcoded schemas. Works on arbitrary CSV/JSON tabular datasets.
"""
import hashlib
import re
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd

from backend.app.models.data_profile import (
    ColumnProfile,
    DataProfile,
    DistributionConfig,
    GenerationDefaults,
    QualityFinding,
    SourceFingerprint,
    TableProfile,
)

# ── Semantic type heuristics ──────────────────────────────────────────────────
_SEMANTIC_PATTERNS: List[Tuple[str, str]] = [
    # (column-name pattern, semantic_type)
    (r"(?i)\b(email|e_mail|e-mail)\b", "email"),
    (r"(?i)\b(phone|mobile|tel|contact_no)\b", "phone"),
    (r"(?i)\b(zip|postal|postcode)\b", "postal_code"),
    (r"(?i)\b(lat|latitude)\b", "latitude"),
    (r"(?i)\b(lon|lng|longitude)\b", "longitude"),
    (r"(?i)\b(name|full_name|customer_name|user_name)\b", "full_name"),
    (r"(?i)\b(first_name|fname|given_name)\b", "first_name"),
    (r"(?i)\b(last_name|lname|surname|family_name)\b", "last_name"),
    (r"(?i)\b(company|firm|organisation|organization)\b", "company"),
    (r"(?i)\b(city|town|municipality)\b", "city"),
    (r"(?i)\b(country|nation)\b", "country"),
    (r"(?i)\b(address|street|addr)\b", "address"),
    (r"(?i)\b(dob|date_of_birth|birth_date|birthdate)\b", "date_of_birth"),
    (r"(?i)\b(url|website|link|href)\b", "url"),
    (r"(?i)\b(ip|ip_address)\b", "ip_address"),
    (r"(?i)\b(uuid|guid)\b", "uuid"),
    (r"(?i)\b(iban|account_no|account_number)\b", "bank_account"),
    (r"(?i)\b(ssn|nid|national_id|cnic)\b", "national_id"),
    (r"(?i)\b(balance|account_balance)\b", "currency"),
    (r"(?i)\b(price|amount|cost|total|revenue|salary|income|fee|charge)\b", "currency"),
    (r"(?i)\b(age)\b", "age"),
    (r"(?i)\b(gender|sex)\b", "gender"),
    (r"(?i)\b(status|state|flag)\b", "category"),
    (r"(?i)\b(type|category|kind|class|tier)\b", "category"),
    (r"(?i)\b(description|notes?|comment|remarks?)\b", "text"),
    (r"(?i)\b(date|created_at|updated_at|signup|joined|timestamp)\b", "date"),
    (r"(?i)\b(year)\b", "year"),
    (r"(?i)\b(month)\b", "month"),
]


def _infer_semantic_type(col_name: str, series: pd.Series, dtype_str: str) -> Optional[str]:
    """Heuristic semantic type from column name then sample values."""
    for pattern, sem in _SEMANTIC_PATTERNS:
        if re.search(pattern, col_name):
            return sem
    # value-based heuristics
    sample = series.dropna().head(50)
    if dtype_str == "string":
        str_sample = sample.astype(str)
        if str_sample.str.contains(r"@[\w.]+\.\w{2,}", regex=True).mean() > 0.7:
            return "email"
        if str_sample.str.match(r"\d{4}-\d{2}-\d{2}").mean() > 0.7:
            return "date"
        if str_sample.str.startswith(("http://", "https://")).mean() > 0.5:
            return "url"
    return None


def _infer_data_type(series: pd.Series) -> Tuple[str, pd.Series]:
    """Return (dtype_str, coerced_series). Modifies nothing in place."""
    if pd.api.types.is_bool_dtype(series):
        return "boolean", series
    if pd.api.types.is_integer_dtype(series):
        return "integer", series
    if pd.api.types.is_float_dtype(series):
        return "float", series

    # Try coercing object/string column
    not_null = series.dropna()
    if len(not_null) == 0:
        return "string", series

    # Date test
    try:
        parsed = pd.to_datetime(not_null, infer_datetime_format=True, errors="coerce")
        if parsed.notna().mean() > 0.85:
            return "date", series
    except Exception:
        pass

    # Numeric test
    coerced = pd.to_numeric(not_null, errors="coerce")
    if coerced.notna().mean() > 0.90:
        if (coerced % 1 == 0).all():
            return "integer", series
        return "float", series

    return "string", series


def _distribution_config(series: pd.Series, dtype_str: str) -> Optional[DistributionConfig]:
    """Build a DistributionConfig from observed data statistics."""
    clean = series.dropna()
    if len(clean) == 0:
        return None

    if dtype_str in ("integer", "float", "currency"):
        try:
            vals = pd.to_numeric(clean, errors="coerce").dropna()
            if len(vals) < 2:
                return None
            return DistributionConfig(
                type="normal",
                mean=float(vals.mean()),
                std_dev=float(vals.std()),
                min_value=float(vals.min()),
                max_value=float(vals.max()),
            )
        except Exception:
            return None

    if dtype_str == "string":
        if clean.nunique() <= 30:
            vc = clean.value_counts(normalize=True)
            cats = list(vc.index[:20])
            weights = [round(float(w), 4) for w in vc.values[:20]]
            # normalise weights
            total = sum(weights)
            if total > 0:
                weights = [round(w / total, 4) for w in weights]
            weights[-1] = round(1.0 - sum(weights[:-1]), 4)
            return DistributionConfig(type="categorical", categories=cats, weights=weights)
        return None

    return None


def _find_quality_issues(
    series: pd.Series, col_name: str, dtype_str: str, total_rows: int
) -> List[QualityFinding]:
    findings: List[QualityFinding] = []

    # Missing values
    null_count = int(series.isna().sum())
    if null_count > 0:
        rate = null_count / max(total_rows, 1)
        sev = "high" if rate > 0.3 else "medium" if rate > 0.05 else "low"
        findings.append(QualityFinding(
            column=col_name,
            issue_type="missing_values",
            severity=sev,
            count=null_count,
            rate=round(rate, 4),
            description=f"{col_name}: {null_count} missing values ({rate:.1%})",
        ))

    clean = series.dropna()

    # Outliers (IQR method) for numeric
    if dtype_str in ("integer", "float", "currency"):
        try:
            vals = pd.to_numeric(clean, errors="coerce").dropna()
            if len(vals) >= 10:
                q1, q3 = vals.quantile(0.25), vals.quantile(0.75)
                iqr = q3 - q1
                if iqr > 0:
                    outliers = vals[(vals < q1 - 3 * iqr) | (vals > q3 + 3 * iqr)]
                    if len(outliers) > 0:
                        findings.append(QualityFinding(
                            column=col_name,
                            issue_type="outlier",
                            severity="low",
                            count=int(len(outliers)),
                            rate=round(len(outliers) / max(len(vals), 1), 4),
                            description=f"{col_name}: {len(outliers)} statistical outliers (3×IQR)",
                            examples=[round(float(v), 2) for v in outliers.head(3)],
                        ))
        except Exception:
            pass

    # Constant column
    if clean.nunique() <= 1 and len(clean) > 5:
        findings.append(QualityFinding(
            column=col_name,
            issue_type="constant_column",
            severity="medium",
            count=int(len(clean)),
            rate=1.0,
            description=f"{col_name}: all non-null values are identical",
            examples=list(clean.head(1)),
        ))

    # High-cardinality string (potential identifier)
    if dtype_str == "string" and clean.nunique() == len(clean) and len(clean) > 10:
        findings.append(QualityFinding(
            column=col_name,
            issue_type="high_cardinality_identifier",
            severity="low",
            count=int(clean.nunique()),
            rate=1.0,
            description=f"{col_name}: all values unique — likely an identifier column",
        ))

    return findings


def _sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def _schema_hash(columns: List[ColumnProfile]) -> str:
    schema_str = "|".join(f"{c.name}:{c.data_type}" for c in columns)
    return hashlib.sha256(schema_str.encode()).hexdigest()[:16]


# ── Public API ────────────────────────────────────────────────────────────────

def profile_dataframe(
    df: pd.DataFrame,
    table_name: str = "dataset",
    source_bytes: Optional[bytes] = None,
    filename: Optional[str] = None,
    modality: str = "tabular",
) -> DataProfile:
    """
    Accepts a raw pandas DataFrame and returns a rich DataProfile.
    Does NOT modify the DataFrame.
    """
    total_rows = len(df)
    columns: List[ColumnProfile] = []
    findings: List[QualityFinding] = []

    # Table-level duplicate check
    dup_count = int(df.duplicated().sum())
    if dup_count > 0:
        findings.append(QualityFinding(
            column=None,
            issue_type="duplicate_rows",
            severity="medium",
            count=dup_count,
            rate=round(dup_count / max(total_rows, 1), 4),
            description=f"{dup_count} fully duplicate rows detected",
        ))

    for col_name in df.columns:
        series = df[col_name]
        dtype_str, _ = _infer_data_type(series)

        # For currency semantic type derived below, upgrade float → currency
        sem_type = _infer_semantic_type(col_name, series, dtype_str)
        if sem_type == "currency" and dtype_str == "float":
            dtype_str = "currency"

        clean = series.dropna()
        null_count = int(series.isna().sum())
        null_rate = null_count / max(total_rows, 1)
        unique_count = int(series.nunique())

        # Numeric stats
        min_v = max_v = mean_v = median_v = std_v = None
        if dtype_str in ("integer", "float", "currency"):
            try:
                vals = pd.to_numeric(clean, errors="coerce").dropna()
                if len(vals) > 0:
                    min_v = round(float(vals.min()), 4)
                    max_v = round(float(vals.max()), 4)
                    mean_v = round(float(vals.mean()), 4)
                    median_v = round(float(vals.median()), 4)
                    std_v = round(float(vals.std()), 4) if len(vals) > 1 else 0.0
            except Exception:
                pass

        # Outlier rate
        outlier_rate = 0.0
        if dtype_str in ("integer", "float", "currency"):
            try:
                vals = pd.to_numeric(clean, errors="coerce").dropna()
                if len(vals) >= 10:
                    q1, q3 = vals.quantile(0.25), vals.quantile(0.75)
                    iqr = q3 - q1
                    if iqr > 0:
                        out = vals[(vals < q1 - 3 * iqr) | (vals > q3 + 3 * iqr)]
                        outlier_rate = round(len(out) / max(len(vals), 1), 4)
            except Exception:
                pass

        # Distribution config
        dist = _distribution_config(series, dtype_str)

        # Primary key heuristic
        is_pk = (
            unique_count == total_rows
            and null_rate == 0.0
            and col_name.lower() in ("id", "customer_id", "order_id", "user_id",
                                      "product_id", "record_id", "transaction_id")
        )

        sample_vals = [v for v in clean.head(5).tolist() if v is not None]

        cp = ColumnProfile(
            name=col_name,
            original_name=col_name,
            data_type=dtype_str,
            semantic_type=sem_type,
            is_primary_key=is_pk,
            null_rate=round(null_rate, 4),
            unique_count=unique_count,
            total_count=total_rows,
            min_value=min_v,
            max_value=max_v,
            mean_value=mean_v,
            median_value=median_v,
            std_dev=std_v,
            outlier_rate=outlier_rate,
            distribution=dist,
            sample_values=sample_vals,
        )
        columns.append(cp)

        col_findings = _find_quality_issues(series, col_name, dtype_str, total_rows)
        findings.extend(col_findings)

    # Source fingerprint
    fp_hash = _sha256_bytes(source_bytes) if source_bytes else _sha256_bytes(df.to_csv(index=False).encode())
    s_hash = _schema_hash(columns)
    source_fp = SourceFingerprint(
        source_fingerprint=fp_hash,
        input_filename=filename,
        input_modality=modality,
        row_count=total_rows,
        column_count=len(columns),
        schema_hash=s_hash,
    )

    # Pick primary key
    pk_cols = [c.name for c in columns if c.is_primary_key]
    primary_key = pk_cols[0] if pk_cols else (columns[0].name if columns else "id")

    table_profile = TableProfile(
        name=table_name,
        row_count=total_rows,
        primary_key=primary_key,
        columns=columns,
    )

    return DataProfile(
        name=f"Profile: {filename or table_name}",
        modality=modality,
        tables=[table_profile],
        source_fingerprint=source_fp,
        quality_findings=findings,
        generation_defaults=GenerationDefaults(
            row_count=total_rows,
            seed=42,
        ),
        default_locale="en_US",
    )
