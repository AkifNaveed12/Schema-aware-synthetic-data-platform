from fastapi import APIRouter
from backend.app.models.envelope import SuccessResponse
from backend.app.models.schemas import (
    AIQueryInterpretRequest,
    AIQueryInterpretData,
    AISemanticPoolRequest,
    AISemanticPoolData,
    AIMetricsData
)
from backend.app.ai.groq_service import ai_service

router = APIRouter()

@router.post("/ai/interpret-query", response_model=SuccessResponse[AIQueryInterpretData])
def interpret_query(request: AIQueryInterpretRequest):
    interpretation = ai_service.interpret_query(request.query, request.modality)
    return SuccessResponse(
        data=AIQueryInterpretData(
            modality=interpretation.modality,
            document_type=interpretation.document_type,
            row_count=interpretation.row_count,
            locale=interpretation.locale,
            currency=interpretation.currency,
            domain=interpretation.domain,
            filters=interpretation.filters,
            distributions=interpretation.distributions,
            edge_cases=interpretation.edge_cases,
            explanation=interpretation.explanation,
            ai_used=interpretation.ai_used,
            cache_hit=interpretation.cache_hit
        )
    )

@router.post("/ai/semantic-pool", response_model=SuccessResponse[AISemanticPoolData])
def generate_semantic_pool(request: AISemanticPoolRequest):
    items = ai_service.generate_semantic_pool(request.category, request.count, request.domain)
    return SuccessResponse(
        data=AISemanticPoolData(
            category=request.category,
            count=len(items),
            items=items
        )
    )

@router.get("/ai/metrics", response_model=SuccessResponse[AIMetricsData])
def get_ai_metrics():
    metrics = ai_service.metrics()
    return SuccessResponse(
        data=AIMetricsData(**metrics)
    )
