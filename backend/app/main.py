import time
import uuid
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from backend.app.core.config import settings
from backend.app.api.v1.router import api_v1_router
from backend.app.models.envelope import ErrorPayload, ErrorDetail

app = FastAPI(
    title="HackData V2 — Synthetic Data Platform API",
    description="Schema-aware, statistically faithful synthetic data generation across Tabular, Relational, and Document modalities.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware — allow localhost on any port (3000, 5173, etc.) and all configured origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins if "*" not in settings.cors_origins else ["*"],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request ID & Performance Timing Middleware
@app.middleware("http")
async def add_request_id_and_timing(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID", f"req_{uuid.uuid4().hex[:12]}")
    request.state.request_id = request_id
    start_time = time.perf_counter()
    
    response = await call_next(request)
    
    execution_time_ms = round((time.perf_counter() - start_time) * 1000, 2)
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Execution-Time-MS"] = str(execution_time_ms)
    return response

# Standardized Error Handling
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    request_id = getattr(request.state, "request_id", f"req_{uuid.uuid4().hex[:12]}")
    details = []
    for err in exc.errors():
        loc = ".".join(str(p) for p in err.get("loc", []))
        details.append(ErrorDetail(field=loc, issue=err.get("msg", "Invalid parameter")))
    
    error_payload = {
        "success": False,
        "error": {
            "code": "REQUEST_VALIDATION_ERROR",
            "message": "Input validation failed for request payload.",
            "details": [d.model_dump() for d in details]
        },
        "metadata": {
            "request_id": request_id
        }
    }
    return JSONResponse(status_code=422, content=error_payload)

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    request_id = getattr(request.state, "request_id", f"req_{uuid.uuid4().hex[:12]}")
    error_payload = {
        "success": False,
        "error": {
            "code": f"HTTP_{exc.status_code}",
            "message": str(exc.detail),
            "details": []
        },
        "metadata": {
            "request_id": request_id
        }
    }
    return JSONResponse(status_code=exc.status_code, content=error_payload)

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    request_id = getattr(request.state, "request_id", f"req_{uuid.uuid4().hex[:12]}")
    error_payload = {
        "success": False,
        "error": {
            "code": "INTERNAL_SERVER_ERROR",
            "message": "An unexpected error occurred during processing.",
            "details": [{"issue": str(exc)}]
        },
        "metadata": {
            "request_id": request_id
        }
    }
    return JSONResponse(status_code=500, content=error_payload)

# Include v1 Router
app.include_router(api_v1_router, prefix="/api/v1")

@app.get("/")
def get_root():
    return {
        "name": "HackData V2 Synthetic Data Platform",
        "api_docs": "/docs",
        "version": "1.0.0",
        "status": "online"
    }
