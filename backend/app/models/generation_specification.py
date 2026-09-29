"""
backend/app/models/generation_specification.py

Structured Generation Specification and Requirement Satisfaction Ledger
for Natural-Language Synthetic Data Generation.
"""
from datetime import datetime, timezone
import uuid
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field

from backend.app.models.data_profile import SyntheticColumnSpec, DistributionConfig, PrivacyRule

RequirementSource = Literal[
    "explicit_user_request",
    "inferred_from_context",
    "system_default",
    "needs_clarification"
]

class TrackedRequirement(BaseModel):
    field: str
    value: Any
    source: RequirementSource = "explicit_user_request"
    confidence: float = 1.0
    notes: Optional[str] = None

class ColumnSpec(BaseModel):
    name: str
    data_type: str = "string"
    semantic_type: Optional[str] = None
    is_primary_key: bool = False
    is_foreign_key: bool = False
    references_table: Optional[str] = None
    references_column: Optional[str] = None
    nullable: bool = False
    distribution: Optional[DistributionConfig] = None
    categorical_values: Optional[List[str]] = None
    weights: Optional[List[float]] = None
    range_min: Optional[float] = None
    range_max: Optional[float] = None
    description: Optional[str] = None

class EntitySpec(BaseModel):
    name: str
    row_count: int = 100
    primary_key: str = "id"
    foreign_keys: Dict[str, str] = Field(default_factory=dict)
    columns: List[ColumnSpec] = Field(default_factory=list)

class ConstraintSpec(BaseModel):
    id: str = Field(default_factory=lambda: f"cst_{uuid.uuid4().hex[:6]}")
    type: str  # gender_balance, city_frequency, cross_table_sum, running_balance, age_range, etc.
    description: str
    target_column: Optional[str] = None
    target_entity: Optional[str] = None
    parameters: Dict[str, Any] = Field(default_factory=dict)
    deterministic_enforced: bool = True

class GenerationSpecification(BaseModel):
    request_id: str = Field(default_factory=lambda: f"nlr_{uuid.uuid4().hex[:10]}")
    user_prompt: str
    language: str = "en"  # en, ur, ur-Latn
    domain: str = "general"
    purpose: Optional[str] = None
    modality: Literal["tabular", "relational", "document"] = "tabular"
    document_type: Optional[Literal["invoice", "bank_statement"]] = None
    row_requirements: Dict[str, int] = Field(default_factory=lambda: {"total": 1000})
    locale: Dict[str, str] = Field(default_factory=lambda: {"country": "Pakistan", "language": "en", "currency": "PKR"})

    @property
    def row_count(self) -> int:
        return self.row_requirements.get("total", 1000)

    @row_count.setter
    def row_count(self, value: int):
        self.row_requirements["total"] = value
    entities: List[EntitySpec] = Field(default_factory=list)
    columns: List[ColumnSpec] = Field(default_factory=list)
    relationships: List[Dict[str, Any]] = Field(default_factory=list)
    constraints: List[ConstraintSpec] = Field(default_factory=list)
    synthetic_columns: List[SyntheticColumnSpec] = Field(default_factory=list)
    output_formats: List[str] = Field(default_factory=lambda: ["csv", "json", "sql"])
    explicit_requirements: List[TrackedRequirement] = Field(default_factory=list)
    inferred_requirements: List[TrackedRequirement] = Field(default_factory=list)
    clarifications_needed: List[str] = Field(default_factory=list)
    is_clarification_required: bool = False
    status: Literal[
        "draft",
        "clarification_needed",
        "ready_for_approval",
        "approved",
        "generating",
        "completed",
        "failed"
    ] = "draft"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class RequirementLedgerItem(BaseModel):
    category: str  # row_count, country, currency, distribution, columns, integrity, output_formats
    requirement: str
    expected_value: Any
    actual_value: Any
    satisfied: bool
    source: RequirementSource = "explicit_user_request"
    message: str

class RequirementSatisfactionAudit(BaseModel):
    total_requirements: int = 0
    satisfied_count: int = 0
    satisfaction_rate: float = 1.0
    all_satisfied: bool = True
    ledger: List[RequirementLedgerItem] = Field(default_factory=list)
    audited_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class GenerationConversationTurn(BaseModel):
    id: str = Field(default_factory=lambda: f"turn_{uuid.uuid4().hex[:8]}")
    role: Literal["user", "assistant", "system"]
    content: str
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    clarification: Optional[str] = None
    specification_snapshot: Optional[Dict[str, Any]] = None