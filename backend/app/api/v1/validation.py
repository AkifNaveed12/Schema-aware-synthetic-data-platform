from typing import Any, Dict
from fastapi import APIRouter
from pydantic import BaseModel
from backend.app.models.envelope import SuccessResponse
from backend.app.models.schemas import ValidationData
from backend.app.engine.validation import validation_engine

router = APIRouter()

class ValidatePayload(BaseModel):
    modality: str = "tabular"
    dataset: Dict[str, Any]

@router.post("/validate", response_model=SuccessResponse[ValidationData])
def validate_dataset(payload: ValidatePayload):
    modality = payload.modality.lower()
    dataset = payload.dataset
    if modality == "relational" or "tables" in dataset:
        tables = dataset.get("tables", {})
        result = validation_engine.validate_relational(tables)
    else:
        rows = dataset.get("rows", [])
        result = validation_engine.validate_tabular(rows)
    return SuccessResponse(data=result)
