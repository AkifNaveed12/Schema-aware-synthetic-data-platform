from fastapi import APIRouter
from backend.app.api.v1 import (
    health,
    schema,
    tabular,
    relational,
    documents,
    validation,
    evaluation,
    export,
    ai,
    datasets,
    jobs,
)

api_v1_router = APIRouter()

api_v1_router.include_router(health.router, tags=["Health & Status"])
api_v1_router.include_router(schema.router, tags=["Schema Ingestion & Inference"])
api_v1_router.include_router(datasets.router, tags=["Dataset Ingestion & Sessions"])
api_v1_router.include_router(jobs.router, tags=["Job Management"])
api_v1_router.include_router(tabular.router, tags=["Tabular Generation"])
api_v1_router.include_router(relational.router, tags=["Relational Generation"])
api_v1_router.include_router(documents.router, tags=["Document Generation"])
api_v1_router.include_router(validation.router, tags=["Validation Engine"])
api_v1_router.include_router(evaluation.router, tags=["Quality Evaluation"])
api_v1_router.include_router(export.router, tags=["Export Engine"])
api_v1_router.include_router(ai.router, tags=["AI Intelligence & Semantic Layer"])


