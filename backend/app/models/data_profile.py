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
    data_type: str = "string"  # integer, float, string, date, boolean, currency, email
    semantic_type: Optional[str] = None  # full_name, email, address, company, currency, date, id_sequence
    is_primary_key: bool = False
    is_foreign_key: bool = False
    references_table: Optional[str] = None
    references_column: Optional[str] = None
    distribution: Optional[DistributionConfig] = None
    privacy: Optional[PrivacyRule] = Field(default_factory=PrivacyRule)
    null_rate: float = 0.0
    outlier_rate: float = 0.0
    generator_hint: Optional[str] = None

class TableProfile(BaseModel):
    name: str
    row_count: int = 50
    primary_key: str = "id"
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

class DataProfile(BaseModel):
    profile_id: str = Field(default_factory=lambda: f"prof_{uuid.uuid4().hex[:10]}")
    name: str = "Untitled Dataset Profile"
    modality: Literal["tabular", "relational", "document"] = "tabular"
    tables: List[TableProfile] = Field(default_factory=list)
    relationships: List[RelationshipProfile] = Field(default_factory=list)
    business_rules: List[BusinessRule] = Field(default_factory=list)
    default_seed: Optional[int] = 42
    default_locale: str = "en_US"
    default_currency: str = "USD"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
