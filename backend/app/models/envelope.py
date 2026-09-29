import uuid
import time
from typing import Any, Dict, Generic, List, Optional, TypeVar
from pydantic import BaseModel, Field

T = TypeVar("T")

class ResponseMetadata(BaseModel):
    request_id: str = Field(default_factory=lambda: f"req_{uuid.uuid4().hex[:12]}")
    execution_time_ms: Optional[float] = None
    seed_used: Optional[int] = None
    row_count: Optional[int] = None
    extra: Optional[Dict[str, Any]] = None

class ErrorDetail(BaseModel):
    field: Optional[str] = None
    issue: str

class ErrorPayload(BaseModel):
    code: str
    message: str
    details: Optional[List[ErrorDetail]] = None

class SuccessResponse(BaseModel, Generic[T]):
    success: bool = True
    data: T
    metadata: ResponseMetadata = Field(default_factory=ResponseMetadata)

class ErrorResponse(BaseModel):
    success: bool = False
    error: ErrorPayload
    metadata: ResponseMetadata = Field(default_factory=ResponseMetadata)
