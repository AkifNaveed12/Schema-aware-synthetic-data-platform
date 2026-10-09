from fastapi import APIRouter
from backend.app.models.envelope import SuccessResponse
from backend.app.models.schemas import HealthData, ReadinessData, ServiceStatus

router = APIRouter()

@router.api_route("/health", methods=["GET", "HEAD"], response_model=SuccessResponse[HealthData])
def get_health():
    return SuccessResponse(
        data=HealthData(
            status="healthy",
            service="hackdata-v2-api",
            version="1.0.0"
        )
    )

@router.api_route("/health/ready", methods=["GET", "HEAD"], response_model=SuccessResponse[ReadinessData])
def get_readiness():
    return SuccessResponse(
        data=ReadinessData(
            status="ready",
            services=ServiceStatus(
                api="ready",
                tabular_engine="ready",
                relational_engine="ready",
                document_engine="ready",
                validation_engine="ready",
                evaluation_engine="ready",
                ai_service="ready"
            )
        )
    )
