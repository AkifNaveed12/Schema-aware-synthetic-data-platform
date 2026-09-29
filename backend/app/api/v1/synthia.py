"""
backend/app/api/v1/synthia.py

Synthia Assistant REST API Endpoints:
POST /api/v1/assistant/synthia/session — Initialize assistant conversation
GET  /api/v1/assistant/synthia/session/{id} — Retrieve message history
POST /api/v1/assistant/synthia/message — Send speech transcript or text message
POST /api/v1/assistant/synthia/action  — Confirm/apply structured configuration action
"""
from __future__ import annotations

from typing import Any, Dict, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from backend.app.models.envelope import SuccessResponse
from backend.app.services.synthia_service import synthia_service
from backend.app.jobs.job_store import job_store
from backend.app.models.data_profile import SyntheticColumnSpec
from backend.app.engine.synthetic_column_generator import validate_column_name
from backend.app.services.supabase_service import supabase_service

router = APIRouter()


class SessionCreateRequest(BaseModel):
    dataset_id: Optional[str] = None
    language: str = "en"


class MessageSendRequest(BaseModel):
    session_id: str
    message: str = Field(..., min_length=1)
    dataset_id: Optional[str] = None
    language: Optional[str] = None
    context: Optional[Dict[str, Any]] = None


class ActionExecuteRequest(BaseModel):
    session_id: str
    dataset_id: str
    action_type: str  # add_synthetic_columns, select_model, apply_regeneration_strategy
    proposal: Dict[str, Any]
    confirmed: bool = True


@router.post("/assistant/synthia/session", response_model=SuccessResponse)
def create_synthia_session(payload: SessionCreateRequest):
    """Start a new Synthia assistant conversation session."""
    session = synthia_service.create_session(
        dataset_id=payload.dataset_id,
        language=payload.language,
    )
    greeting = "Hi, I'm Synthia. How can I help you with your synthetic-data workflow?"
    if payload.language == "ur":
        greeting = "ہیلو! میں سنتھیا ہوں۔ مصنوعی ڈیٹا کے ورک فلو میں میں آپ کی کیا مدد کر سکتی ہوں؟"
    elif payload.language == "roman_ur":
        greeting = "Hi! Main Synthia hoon. Synthetic-data workflow me main aapki kya madad kar sakti hoon?"

    return SuccessResponse(data={
        "session_id": session.session_id,
        "dataset_id": session.dataset_id,
        "language": session.language,
        "greeting": greeting,
    })


@router.get("/assistant/synthia/session/{session_id}", response_model=SuccessResponse)
def get_synthia_session(session_id: str):
    """Retrieve message history for an active Synthia session."""
    session = synthia_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found.")
    messages = synthia_service.get_messages(session_id)
    return SuccessResponse(data={
        "session_id": session.session_id,
        "dataset_id": session.dataset_id,
        "language": session.language,
        "messages": [
            {
                "message_id": m.message_id,
                "role": m.role,
                "content": m.content,
                "structured_action": m.structured_action,
                "created_at": m.created_at,
            }
            for m in messages
        ],
    })


@router.post("/assistant/synthia/message", response_model=SuccessResponse)
def send_synthia_message(payload: MessageSendRequest):
    """
    Send text or transcribed voice to Synthia.
    Returns guided AI response and optional structured configuration proposal.
    """
    # Build context from dataset if provided and not explicitly given
    context = payload.context or {}
    if payload.dataset_id and not context:
        ds_session = job_store.get_session(payload.dataset_id)
        if ds_session:
            profile = ds_session.get("profile")
            last_res = ds_session.get("last_result", {})
            context = {
                "dataset_id": payload.dataset_id,
                "modality": ds_session.get("modality", "tabular"),
                "row_count": len(ds_session["df"]) if "df" in ds_session else 0,
                "columns": [c.name for c in profile.tables[0].columns] if (profile and profile.tables) else [],
                "validation_status": last_res.get("validation", {}).get("overall_status"),
                "evaluation_summary": last_res.get("evaluation", {}).get("overall_score"),
            }

    res = synthia_service.process_message(
        session_id=payload.session_id,
        content=payload.message,
        context=context,
        language_override=payload.language,
    )
    return SuccessResponse(data=res)


@router.post("/assistant/synthia/action", response_model=SuccessResponse)
def execute_synthia_action(payload: ActionExecuteRequest):
    """
    Safely execute a confirmed structured proposal.
    Rejects any unconfirmed or malicious arbitrary commands.
    """
    if not payload.confirmed:
        return SuccessResponse(data={"status": "rejected", "message": "Action execution cancelled by user."})

    dataset_session = job_store.get_session(payload.dataset_id)
    if not dataset_session:
        raise HTTPException(status_code=404, detail=f"Dataset '{payload.dataset_id}' not found.")

    profile = dataset_session.get("profile")
    proposal = payload.proposal
    action = payload.action_type

    if action == "add_synthetic_columns":
        raw_cols = proposal.get("columns", [])
        if not raw_cols:
            raise HTTPException(status_code=422, detail="Proposal contains no columns to add.")

        added_specs = []
        existing_cols = list(dataset_session["df"].columns) if "df" in dataset_session else []
        if profile and profile.synthetic_columns:
            existing_cols.extend([sc.name for sc in profile.synthetic_columns])

        for c_dict in raw_cols:
            name = c_dict.get("name", "").strip()
            validate_column_name(name, existing_cols)
            spec = SyntheticColumnSpec(
                name=name,
                data_type=c_dict.get("data_type", "string"),
                semantic_type=c_dict.get("semantic_type"),
                categories=c_dict.get("suggested_values"),
            )
            profile.synthetic_columns.append(spec)
            existing_cols.append(name)
            added_specs.append(spec.model_dump())

        dataset_session["profile"] = profile
        job_store.store_session(payload.dataset_id, dataset_session)
        try:
            supabase_service.persist_profile(payload.dataset_id, profile.model_dump())
        except Exception:
            pass

        return SuccessResponse(data={
            "status": "applied",
            "action": action,
            "columns_added": added_specs,
            "total_synthetic_columns": len(profile.synthetic_columns),
        })

    elif action == "select_model":
        selected_model = proposal.get("model_strategy", "statistical")
        return SuccessResponse(data={
            "status": "applied",
            "action": action,
            "selected_model": selected_model,
        })

    else:
        raise HTTPException(status_code=400, detail=f"Unknown or unsupported action '{action}'.")
