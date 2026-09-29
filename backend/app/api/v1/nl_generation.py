"""
Natural-Language Synthetic Data Generation API Endpoints.

Provides a unified conversational control plane to translate natural-language
prompts into verified GenerationSpecifications, execute actual data generation
via existing HackData engines (tabular, relational, document), perform post-generation
Requirement Satisfaction Audits, and evaluate statistical/structural quality.
"""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field

from backend.app.models.generation_specification import (
    GenerationSpecification,
    RequirementSatisfactionAudit,
)
from backend.app.services.nl_generation_engine import nl_generation_engine

router = APIRouter(prefix="/generation-requests")


class CreateRequestPayload(BaseModel):
    user_prompt: str = Field(..., description="Natural language prompt describing the synthetic data required")
    locale_hint: Optional[str] = Field(None, description="Optional locale hint (e.g. en_PK, en_US)")
    dataset_id: Optional[str] = Field(None, description="Optional reference dataset ID to base generation upon")


class SendMessagePayload(BaseModel):
    message: str = Field(..., description="User message, clarification reply, or refinement instruction")


class PlanValidationResponse(BaseModel):
    request_id: str
    is_valid: bool
    status: str
    blocking_errors: List[str]
    warnings: List[str]
    ledger: List[Dict[str, Any]]
    specification: Dict[str, Any]


class GeneratePayload(BaseModel):
    dataset_id: Optional[str] = Field(None, description="Optional reference dataset ID for tabular CTGAN/TVAE/baseline")


@router.post("", summary="Submit a new natural language generation request")
async def create_generation_request(payload: CreateRequestPayload) -> Dict[str, Any]:
    """
    Submits a natural language prompt, analyzes intent, extracts constraints,
    tracks requirement provenance, and generates a structured specification.
    Returns the parsed specification, any clarification questions needed, and initial status.
    """
    if not payload.user_prompt.strip():
        raise HTTPException(status_code=400, detail="User prompt cannot be empty.")

    req = await nl_generation_engine.create_generation_request(
        user_prompt=payload.user_prompt,
        locale_hint=payload.locale_hint,
        dataset_id=payload.dataset_id,
    )
    return req


@router.get("/{request_id}", summary="Get current status and specification of a generation request")
async def get_generation_request(request_id: str) -> Dict[str, Any]:
    """Retrieves the generation request record, conversation history, and current specification."""
    req = nl_generation_engine.get_request(request_id)
    if not req:
        raise HTTPException(status_code=404, detail=f"Generation request '{request_id}' not found.")
    return req


@router.post("/{request_id}/message", summary="Send a conversational message, clarification reply, or refinement")
async def send_message(request_id: str, payload: SendMessagePayload) -> Dict[str, Any]:
    """
    Appends a user turn to the conversation, refines the specification with provenance tracking,
    and returns updated questions or confirmation.
    """
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    req = await nl_generation_engine.add_message_and_refine(
        request_id=request_id,
        user_message=payload.message,
    )
    return req


@router.post("/{request_id}/plan/validate", summary="Validate the current generation plan")
async def validate_plan(request_id: str) -> PlanValidationResponse:
    """
    Performs deterministic validation on the current specification, checks referential integrity,
    semantic types, volume limits, and produces the complete requirement validation ledger.
    """
    res = await nl_generation_engine.validate_request_plan(request_id)
    return PlanValidationResponse(**res)


@router.post("/{request_id}/generate", summary="Execute generation according to the validated plan")
async def execute_generation(request_id: str, payload: Optional[GeneratePayload] = None) -> Dict[str, Any]:
    """
    Executes real synthetic data generation using HackData's existing generators
    (tabular_engine, relational_engine, or document_engine). Zero fake demo rows or LLM raw rows.
    Automatically runs post-generation Requirement Satisfaction Audit and Quality Evaluation.
    """
    dataset_id = payload.dataset_id if payload else None
    res = await nl_generation_engine.execute_generation(request_id=request_id, dataset_id=dataset_id)
    return res


@router.get("/{request_id}/result", summary="Get generated data preview and requirement audit report")
async def get_generation_result(request_id: str) -> Dict[str, Any]:
    """
    Returns the preview rows, export previews (CSV, JSON, SQL), requirement satisfaction audit,
    and quality metrics for the generated request.
    """
    req = nl_generation_engine.get_request(request_id)
    if not req:
        raise HTTPException(status_code=404, detail=f"Generation request '{request_id}' not found.")

    if req["status"] not in ("completed", "evaluating", "failed"):
        raise HTTPException(
            status_code=400,
            detail=f"Generation has not completed yet. Current status: {req['status']}",
        )

    return {
        "request_id": request_id,
        "status": req["status"],
        "spec_id": req.get("spec_id"),
        "generation_result": req.get("generation_result"),
        "requirement_audit": req.get("requirement_audit"),
        "quality_report": req.get("quality_report"),
        "conversation": req.get("conversation"),
    }


@router.post("/{request_id}/regenerate", summary="Regenerate data with modified constraints or model seed")
async def regenerate(
    request_id: str,
    override_constraints: Optional[Dict[str, Any]] = None,
    dataset_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Regenerates data with updated constraints, adjusted distributions, or altered parameters
    while retaining the conversational provenance and schema design.
    """
    res = await nl_generation_engine.regenerate(
        request_id=request_id,
        override_constraints=override_constraints,
        dataset_id=dataset_id,
    )
    return res
