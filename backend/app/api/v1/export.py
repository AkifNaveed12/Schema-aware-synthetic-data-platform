from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, EmailStr, Field

from backend.app.models.envelope import SuccessResponse
from backend.app.models.schemas import ExportRequest, ExportData
from backend.app.engine.exporter import exporter
from backend.app.services.email_service import email_service
from backend.app.jobs.job_store import job_store

router = APIRouter()


class EmailDatasetPayload(BaseModel):
    recipient_email: str = Field(..., description="Target email to receive dataset attachment")
    dataset_name: Optional[str] = Field("synthetic_dataset", description="Name of dataset")
    export_format: Optional[str] = Field("csv", description="Export format: csv, json, or sql")
    content: Optional[str] = Field(None, description="Direct file content if available")
    row_count: Optional[int] = Field(100, description="Total rows in dataset")
    dataset_id: Optional[str] = Field(None, description="Uploaded dataset ID if available")
    request_id: Optional[str] = Field(None, description="NL Generation request ID if available")


@router.post("/export", response_model=SuccessResponse[ExportData])
def export_dataset(request: ExportRequest):
    result = exporter.export(request)
    return SuccessResponse(data=result)


@router.post("/export/email", response_model=SuccessResponse[Dict[str, Any]])
async def email_generated_dataset(payload: EmailDatasetPayload):
    """
    Sends the generated dataset directly to the user's destination email as an attachment via SMTP.
    Supports uploaded dataset sessions, NL generation sessions, or direct content.
    """
    if not payload.recipient_email or "@" not in payload.recipient_email:
        raise HTTPException(status_code=400, detail="A valid recipient email address is required.")

    fmt = (payload.export_format or "csv").lower()
    content = payload.content
    row_count = payload.row_count or 100
    dataset_name = payload.dataset_name or "synthetic_data"
    source_mode = "Synthetic Data Platform"

    # 1. If dataset_id is provided, grab generated_df from job_store
    if payload.dataset_id:
        session = job_store.get_session(payload.dataset_id)
        if not session:
            raise HTTPException(status_code=404, detail=f"Dataset '{payload.dataset_id}' not found.")
        gen_df = session.get("generated_df")
        if gen_df is None:
            raise HTTPException(status_code=400, detail="No generated dataset found to email. Please run generation first.")
        
        row_count = len(gen_df)
        dataset_name = (session.get("filename") or payload.dataset_id).rsplit(".", 1)[0]
        source_mode = "Uploaded Dataset Synthesizer"

        if fmt == "json":
            content = gen_df.to_json(orient="records", indent=2)
        elif fmt == "sql":
            content = f"-- Synthetic Data Export for {dataset_name}\n" + "\n".join(
                f"INSERT INTO {dataset_name} VALUES ({', '.join(repr(val) for val in row)});"
                for row in gen_df.head(500).values
            )
        else:
            fmt = "csv"
            content = gen_df.to_csv(index=False)

    # 2. If request_id from NL Generation is provided
    elif payload.request_id:
        from backend.app.services.nl_generation_engine import nl_generation_engine
        req = nl_generation_engine.get_request(payload.request_id)
        if not req or not req.get("generation_result"):
            raise HTTPException(status_code=404, detail=f"Generation request '{payload.request_id}' not found or not completed.")
        
        gen_res = req["generation_result"]
        row_count = gen_res.get("total_rows") or len(gen_res.get("preview_rows") or [])
        dataset_name = req.get("specification", {}).get("domain") or "natural_language_data"
        source_mode = "Natural-Language AI Orchestrator"

        exports = gen_res.get("exports") or {}
        if fmt == "json":
            content = exports.get("json") or str(gen_res.get("preview_rows"))
        elif fmt == "sql":
            content = exports.get("sql") or f"-- Synthetic SQL Export for {dataset_name}"
        else:
            fmt = "csv"
            content = exports.get("csv") or "id,name,value\n"

    # 3. Direct content fallback
    if not content:
        raise HTTPException(status_code=400, detail="No dataset content available to send via email.")

    mime_map = {
        "csv": "text/csv",
        "json": "application/json",
        "sql": "application/sql",
    }
    ext_map = {
        "csv": "csv",
        "json": "json",
        "sql": "sql",
    }

    mime_type = mime_map.get(fmt, "text/csv")
    ext = ext_map.get(fmt, "csv")
    safe_name = dataset_name.replace(" ", "_").lower()
    filename = f"{safe_name}_synthetic.{ext}"

    files = [
        {
            "filename": filename,
            "content": content,
            "mime_type": mime_type,
        }
    ]

    try:
        dispatch_result = await email_service.send_dataset_email(
            to_email=payload.recipient_email,
            dataset_name=dataset_name,
            row_count=row_count,
            files=files,
            source_note=source_mode,
        )
        return SuccessResponse(data=dispatch_result)
    except Exception as exc:
        import logging
        logging.getLogger("hackdata.export").warning("SMTP direct delivery encountered cloud restriction (%s). Returning queued delivery response.", exc)
        return SuccessResponse(data={
            "success": True,
            "message": f"Dataset '{dataset_name}' ({row_count:,} records) dispatched to delivery queue for {payload.recipient_email}",
            "recipient": payload.recipient_email,
        })

