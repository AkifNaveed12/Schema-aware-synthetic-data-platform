from datetime import datetime, timezone
import uuid
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field

class PrivacyRule(BaseModel):
    mask: bool = False
    mask_pattern: Optional[str] = None
    hash_sha256: bool = False
    differential_noise: bool = False
    epsilon: float = 1.0

class DistributionConfig(BaseModel):
    type: Literal["normal", "log_normal", "uniform", "exponential", "categorical", "sequence"] = "uniform"
    mean: Optional[float] = None
    std_dev: Optional[float] = None
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    categories: Optional[List[str]] = None
    weights: Optional[List[float]] = None
    start_value: Optional[int] = 1

class ColumnProfile(BaseModel):
    name: str
    original_name: Optional[str] = None          # pre-rename name from source
    data_type: str = "string"                     # integer, float, string, date, boolean, currency, email
    semantic_type: Optional[str] = None           # full_name, email, address, company, currency, date, id_sequence
    is_primary_key: bool = False
    is_foreign_key: bool = False
    references_table: Optional[str] = None
    references_column: Optional[str] = None
    distribution: Optional[DistributionConfig] = None
    privacy: Optional[PrivacyRule] = Field(default_factory=PrivacyRule)
    null_rate: float = 0.0
    unique_count: Optional[int] = None
    total_count: Optional[int] = None
    min_value: Optional[Any] = None
    max_value: Optional[Any] = None
    mean_value: Optional[float] = None
    median_value: Optional[float] = None
    std_dev: Optional[float] = None
    sample_values: Optional[List[Any]] = None
    outlier_rate: float = 0.0
    generator_hint: Optional[str] = None
    ai_confidence: Optional[float] = None         # 0–1 confidence in semantic_type from AI

class TableProfile(BaseModel):
    name: str
    row_count: int = 50
    primary_key: str = "id"
    foreign_keys: Dict[str, str] = Field(default_factory=dict)  # column_name -> "parent_table.parent_key"
    columns: List[ColumnProfile] = Field(default_factory=list)

class RelationshipProfile(BaseModel):
    name: Optional[str] = None
    parent_table: str
    parent_key: str
    child_table: str
    child_key: str
    cardinality: Literal["1:1", "1:N", "N:N"] = "1:N"
    min_children: int = 1
    max_children: int = 4

class BusinessRule(BaseModel):
    rule_type: str  # cross_table_sum, running_balance, minimum_value, range
    target_table: str
    target_column: str
    source_table: Optional[str] = None
    source_column: Optional[str] = None
    operator: Optional[str] = None
    parameters: Dict[str, Any] = Field(default_factory=dict)

# ── New: Source Fingerprint ───────────────────────────────────────────────────
class SourceFingerprint(BaseModel):
    source_fingerprint: str                        # SHA-256 of source bytes
    input_filename: Optional[str] = None
    input_modality: str = "tabular"
    row_count: int = 0
    column_count: int = 0
    schema_hash: Optional[str] = None             # SHA-256 of column names+types
    profile_version: str = "1"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# ── New: Quality Findings ─────────────────────────────────────────────────────
class QualityFinding(BaseModel):
    column: Optional[str] = None                  # None = table-level finding
    issue_type: str                                # missing_values, duplicate_rows, outlier, etc.
    severity: Literal["critical", "high", "medium", "low"] = "medium"
    count: int = 0
    rate: float = 0.0
    description: str
    examples: Optional[List[Any]] = None

# ── New: Cleaning Actions (audit trail) ──────────────────────────────────────
class CleaningAction(BaseModel):
    action_type: str                               # impute_median, remove_duplicates, coerce_date, etc.
    column: Optional[str] = None
    rows_affected: int = 0
    before_value: Optional[Any] = None
    after_value: Optional[Any] = None
    description: str

# ── New: Synthetic Column Specification ──────────────────────────────────────
class SyntheticColumnSpec(BaseModel):
    name: str
    data_type: str = "string"
    semantic_type: Optional[str] = None
    description: Optional[str] = None
    range_min: Optional[float] = None
    range_max: Optional[float] = None
    distribution: Optional[DistributionConfig] = None
    source_dependencies: Optional[List[str]] = None
    generation_method: Literal["statistical", "deterministic", "ai_assisted"] = "statistical"
    privacy: Optional[PrivacyRule] = Field(default_factory=PrivacyRule)
    nullable: bool = False
    required: bool = True

# ── New: Generation Defaults ─────────────────────────────────────────────────
class GenerationDefaults(BaseModel):
    row_count: int = 100
    preview_row_count: int = 25
    seed: int = 42
    locale: str = "en_US"
    currency: str = "USD"
    privacy_mode: bool = False
    model_strategy: Literal["auto", "statistical", "deterministic"] = "auto"

# ── Core DataProfile (extended, backward-compatible) ─────────────────────────
class DataProfile(BaseModel):
    profile_id: str = Field(default_factory=lambda: f"prof_{uuid.uuid4().hex[:10]}")
    dataset_id: Optional[str] = None              # links to ingested dataset session
    name: str = "Untitled Dataset Profile"
    modality: Literal["tabular", "relational", "document"] = "tabular"
    tables: List[TableProfile] = Field(default_factory=list)
    relationships: List[RelationshipProfile] = Field(default_factory=list)
    business_rules: List[BusinessRule] = Field(default_factory=list)
    # Extended fields
    source_fingerprint: Optional[SourceFingerprint] = None
    quality_findings: List[QualityFinding] = Field(default_factory=list)
    cleaning_actions: List[CleaningAction] = Field(default_factory=list)
    synthetic_columns: List[SyntheticColumnSpec] = Field(default_factory=list)
    generation_defaults: GenerationDefaults = Field(default_factory=GenerationDefaults)
    user_overrides: Dict[str, Any] = Field(default_factory=dict)
    # Legacy / compatibility
    default_seed: Optional[int] = 42
    default_locale: str = "en_US"
    default_currency: str = "USD"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

