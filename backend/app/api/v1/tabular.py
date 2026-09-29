from fastapi import APIRouter
from backend.app.models.envelope import SuccessResponse, ResponseMetadata
from backend.app.models.schemas import TabularGenerateRequest, TabularGenerateData
from backend.app.engine.tabular_engine import tabular_engine

router = APIRouter()

@router.post("/generate/tabular", response_model=SuccessResponse[TabularGenerateData])
def generate_tabular(request: TabularGenerateRequest):
    result = tabular_engine.generate(request)
    return SuccessResponse(
        data=result,
        metadata=ResponseMetadata(
            seed_used=result.seed_applied,
            row_count=result.total_rows_generated,
            execution_time_ms=result.execution_time_ms
        )
    )
