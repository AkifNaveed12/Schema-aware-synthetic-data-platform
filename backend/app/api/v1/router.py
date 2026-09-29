from fastapi import APIRouter
from backend.app.api.v1 import health

api_v1_router = APIRouter()
api_v1_router.include_router(health.router, tags=["Health & Status"])
