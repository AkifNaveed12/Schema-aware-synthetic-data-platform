from typing import Any, Dict
from fastapi import APIRouter
from pydantic import BaseModel
from backend.app.models.envelope import SuccessResponse
from backend.app.models.schemas import EvaluationData
from backend.app.engine.evaluation import quality_evaluation_engine

router = APIRouter()

class EvaluatePayload(BaseModel):
    modality: str = "tabular"
    dataset: Dict[str, Any]

@router.post("/evaluate", response_model=SuccessResponse[EvaluationData])
def evaluate_dataset(payload: EvaluatePayload):
    modality = payload.modality.lower()
    dataset = payload.dataset
    if modality == "relational" or "tables" in dataset:
        tables = dataset.get("tables", {})
        result = quality_evaluation_engine.evaluate_relational(tables)
    else:
        rows = dataset.get("rows", [])
        result = quality_evaluation_engine.evaluate_tabular(rows)
    return SuccessResponse(data=result)
