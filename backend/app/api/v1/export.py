from fastapi import APIRouter
from backend.app.models.envelope import SuccessResponse
from backend.app.models.schemas import ExportRequest, ExportData
from backend.app.engine.exporter import exporter

router = APIRouter()

@router.post("/export", response_model=SuccessResponse[ExportData])
def export_dataset(request: ExportRequest):
    result = exporter.export(request)
    return SuccessResponse(data=result)
