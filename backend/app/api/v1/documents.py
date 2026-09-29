from fastapi import APIRouter
from backend.app.models.envelope import SuccessResponse, ResponseMetadata
from backend.app.models.schemas import (
    InvoiceGenerateRequest,
    InvoiceGenerateData,
    BankStatementGenerateRequest,
    BankStatementGenerateData,
)
from backend.app.engine.document_engine import document_engine

router = APIRouter()

@router.post("/generate/documents/invoice", response_model=SuccessResponse[InvoiceGenerateData])
def generate_invoices(request: InvoiceGenerateRequest):
    result = document_engine.generate_invoices(request)
    return SuccessResponse(
        data=result,
        metadata=ResponseMetadata(
            seed_used=result.seed_applied,
            row_count=result.total_generated
        )
    )

@router.post("/generate/documents/bank-statement", response_model=SuccessResponse[BankStatementGenerateData])
def generate_bank_statement(request: BankStatementGenerateRequest):
    result = document_engine.generate_bank_statement(request)
    return SuccessResponse(
        data=result,
        metadata=ResponseMetadata(
            seed_used=result.seed_applied,
            row_count=len(result.statement.transactions)
        )
    )
