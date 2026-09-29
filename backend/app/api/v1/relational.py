from fastapi import APIRouter
from backend.app.models.envelope import SuccessResponse, ResponseMetadata
from backend.app.models.schemas import RelationalGenerateRequest, RelationalGenerateData
from backend.app.engine.relational_engine import relational_engine

router = APIRouter()

@router.post("/generate/relational", response_model=SuccessResponse[RelationalGenerateData])
def generate_relational(request: RelationalGenerateRequest):
    result = relational_engine.generate(request)
    total_rows = sum(result.table_counts.values())
    return SuccessResponse(
        data=result,
        metadata=ResponseMetadata(
            seed_used=result.seed_applied,
            row_count=total_rows,
            execution_time_ms=result.execution_time_ms
        )
    )
