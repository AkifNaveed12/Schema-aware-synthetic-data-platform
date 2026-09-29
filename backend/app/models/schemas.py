from typing import Any, Dict, List, Literal, Optional, Union
from pydantic import BaseModel, Field
from backend.app.models.data_profile import DataProfile, ColumnProfile, TableProfile, RelationshipProfile

# 1. Health
class ServiceStatus(BaseModel):
    api: str = "ready"
    tabular_engine: str = "ready"
    relational_engine: str = "ready"
    document_engine: str = "ready"
    validation_engine: str = "ready"
    evaluation_engine: str = "ready"
    ai_service: str = "ready"

class HealthData(BaseModel):
    status: str = "healthy"
    service: str = "hackdata-v2-api"
    version: str = "1.0.0"

class ReadinessData(BaseModel):
    status: str = "ready"
    services: ServiceStatus = Field(default_factory=ServiceStatus)

# 2. Schema Infer
class SchemaInferRequest(BaseModel):
    input_type: Literal["sample_data", "ddl", "json_schema"] = "sample_data"
    raw_content: str
    format: Literal["csv", "json", "sql"] = "csv"
    table_name: Optional[str] = "dataset"
    use_ai: bool = True

class InferredColumn(BaseModel):
    name: str
    data_type: str
    semantic_type: Optional[str] = None
    is_primary_key: bool = False
    is_foreign_key: bool = False
    distribution: Optional[Dict[str, Any]] = None
    sample_values: Optional[List[Any]] = None

class SchemaInferData(BaseModel):
    table_name: str
    row_count_inferred: int
    columns: List[InferredColumn]
    suggested_profile: Optional[DataProfile] = None

# 3. Tabular Generation
class TabularGenerateRequest(BaseModel):
    row_count: int = Field(default=50, ge=1, le=50000)
    random_seed: Optional[int] = 42
    locale: str = "en_US"
    currency: str = "USD"
    columns: Optional[List[ColumnProfile]] = None
    profile: Optional[DataProfile] = None
    null_rate: float = Field(default=0.0, ge=0.0, le=1.0)
    outlier_rate: float = Field(default=0.0, ge=0.0, le=1.0)
    preview_only: bool = False
    apply_privacy: bool = True

class TabularGenerateData(BaseModel):
    columns: List[str]
    rows: List[Dict[str, Any]]
    total_rows_generated: int
    seed_applied: int
    execution_time_ms: float
    validation_status: Optional[str] = "passed"

# 4. Relational Generation
class RelationalGenerateRequest(BaseModel):
    random_seed: Optional[int] = 42
    locale: str = "en_US"
    currency: str = "USD"
    schema_preset: Optional[str] = "ecommerce_default"  # customers -> orders -> order_items
    profile: Optional[DataProfile] = None
    table_row_counts: Optional[Dict[str, int]] = None
    preview_only: bool = False
    reconcile_totals: bool = True

class RelationalGenerateData(BaseModel):
    tables: Dict[str, List[Dict[str, Any]]]
    table_counts: Dict[str, int]
    seed_applied: int
    execution_time_ms: float
    referential_integrity: Dict[str, Any]
    reconciliation_audit: Dict[str, Any]

# 5. Documents - Invoice
class LineItem(BaseModel):
    item: str
    qty: int
    price: float
    amount: float

class InvoiceDocument(BaseModel):
    invoice_number: str
    date: str
    due_date: str
    billed_to: str
    billed_to_address: Optional[str] = None
    billed_from: str = "Synth Data Co."
    billed_from_address: Optional[str] = "100 Synthetic Way, Suite 400"
    line_items: List[LineItem]
    subtotal: float
    tax_rate: float = 0.0
    tax: float = 0.0
    total: float
    currency: str = "USD"

class InvoiceGenerateRequest(BaseModel):
    count: int = Field(default=1, ge=1, le=100)
    random_seed: Optional[int] = 10432
    locale: str = "en_US"
    currency: str = "USD"
    business_type: str = "saas"
    min_items: int = 1
    max_items: int = 4
    tax_rate: float = 0.0

class InvoiceGenerateData(BaseModel):
    invoices: List[InvoiceDocument]
    total_generated: int
    seed_applied: int
    reconciliation_audit: Dict[str, Any]

# 6. Documents - Bank Statement
class StatementTransaction(BaseModel):
    date: str
    description: str
    debit: Optional[float] = None
    credit: Optional[float] = None
    balance: float

class BankStatementDocument(BaseModel):
    account_holder: str
    account_number: str
    starting_balance: float
    ending_balance: float
    currency: str = "USD"
    statement_period: str
    transactions: List[StatementTransaction]
    reconciliation_verified: bool = True

class BankStatementGenerateRequest(BaseModel):
    account_holder: Optional[str] = "Sofia Ivanova"
    starting_balance: float = 1204.30
    transaction_count: int = Field(default=15, ge=1, le=500)
    random_seed: Optional[int] = 777
    query_filter: Optional[str] = None  # e.g., "last 90 days, balance over $500"
    locale: str = "en_US"
    currency: str = "USD"

class BankStatementGenerateData(BaseModel):
    statement: BankStatementDocument
    balance_audit: Dict[str, Any]
    seed_applied: int

# 7. Validation & Evaluation
class ValidationCheck(BaseModel):
    name: str
    status: Literal["passed", "failed", "warning"] = "passed"
    severity: Literal["critical", "high", "medium", "low"] = "critical"
    errors_count: int = 0
    message: str = "Check passed"
    details: Optional[List[str]] = None

class ValidationData(BaseModel):
    overall_status: Literal["passed", "failed"] = "passed"
    total_checks: int
    passed_checks: int
    failed_checks: int
    checks: List[ValidationCheck]

class EvaluationDimension(BaseModel):
    status: Literal["passed", "warning", "failed", "not_run"] = "passed"
    score: float = 1.0  # 0.0 - 1.0
    summary: str
    metrics: Dict[str, Any] = Field(default_factory=dict)

class EvaluationData(BaseModel):
    overall_status: Literal["passed", "warning", "failed"] = "passed"
    overall_score: float = 1.0
    statistical_fidelity: EvaluationDimension
    structural_fidelity: EvaluationDimension
    privacy_compliance: EvaluationDimension
    business_rules: EvaluationDimension

# 8. Export
class ExportRequest(BaseModel):
    format: Literal["csv", "json", "sql", "pdf", "zip"] = "json"
    modality: Literal["tabular", "relational", "document"] = "tabular"
    dataset: Dict[str, Any]
    filename: Optional[str] = "synthetic_export"

class ExportData(BaseModel):
    filename: str
    format: str
    content_type: str
    download_url: Optional[str] = None
    raw_content: Optional[str] = None
    size_bytes: int
