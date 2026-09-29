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
    elif modality in ["documents", "document", "invoice", "bank_statement"] or "invoices" in dataset or "statement" in dataset or "invoice_number" in dataset:
        doc_type = "invoice" if "invoice" in modality or "invoices" in dataset or "invoice_number" in dataset else "bank_statement"
        result = quality_evaluation_engine.evaluate_document(dataset, doc_type=doc_type)
    else:
        rows = dataset.get("rows", [])
        result = quality_evaluation_engine.evaluate_tabular(rows)
    return SuccessResponse(data=result)
