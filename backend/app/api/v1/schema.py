import csv
import io
import json
from typing import Any, Dict, List
from fastapi import APIRouter
from backend.app.models.envelope import SuccessResponse
from backend.app.models.schemas import SchemaInferRequest, SchemaInferData, InferredColumn
from backend.app.models.data_profile import DataProfile, TableProfile, ColumnProfile, DistributionConfig
from backend.app.ai.groq_service import ai_service

router = APIRouter()

@router.post("/schema/infer", response_model=SuccessResponse[SchemaInferData])
def infer_schema(request: SchemaInferRequest):
    raw = request.raw_content.strip()
    table_name = request.table_name or "inferred_table"

    if request.use_ai:
        ai_res = ai_service.infer_schema(raw, request.format, table_name)
        columns = [
            InferredColumn(
                name=col.name,
                data_type=col.data_type,
                semantic_type=col.semantic_type,
                is_primary_key=col.is_primary_key,
                is_foreign_key=col.is_foreign_key,
                distribution={"type": col.distribution, "parameters": col.parameters},
                sample_values=col.sample_values
            ) for col in ai_res.columns
        ]
        inferred_row_count = ai_res.row_count_suggested
        pk = ai_res.primary_key
    else:
        columns = []
        inferred_row_count = 0
        if request.format == "csv" or ("," in raw and "\n" in raw):
            reader = csv.reader(io.StringIO(raw))
            header = next(reader, [])
            sample_rows = list(reader)
            inferred_row_count = len(sample_rows)

            for col_idx, col_name in enumerate(header):
                col_name_clean = col_name.strip()
                values = [row[col_idx].strip() for row in sample_rows if len(row) > col_idx]

                dtype = "string"
                semantic = None
                is_pk = "id" in col_name_clean.lower() and col_idx == 0

                if values and all(v.replace("-", "").isdigit() for v in values if v):
                    dtype = "integer"
                    if is_pk:
                        semantic = "id_sequence"
                elif values and all(v.replace(".", "", 1).replace("-", "").isdigit() for v in values if v):
                    dtype = "float"
                    if any(kw in col_name_clean.lower() for kw in ["balance", "price", "amount", "total", "cost"]):
                        dtype = "currency"
                        semantic = "currency"
                elif values and any("-" in v or "/" in v for v in values) and any(kw in col_name_clean.lower() for kw in ["date", "signup", "created"]):
                    dtype = "date"
                    semantic = "date"
                elif values and all("@" in v for v in values if v):
                    dtype = "string"
                    semantic = "email"
                elif any(kw in col_name_clean.lower() for kw in ["name", "user", "customer"]):
                    dtype = "string"
                    semantic = "full_name"

                columns.append(InferredColumn(
                    name=col_name_clean,
                    data_type=dtype,
                    semantic_type=semantic,
                    is_primary_key=is_pk,
                    sample_values=values[:3]
                ))
        else:
            columns = [
                InferredColumn(name="ID", data_type="integer", semantic_type="id_sequence", is_primary_key=True),
                InferredColumn(name="Name", data_type="string", semantic_type="full_name"),
                InferredColumn(name="Email", data_type="string", semantic_type="email"),
                InferredColumn(name="Signup", data_type="date", semantic_type="date"),
                InferredColumn(name="Balance", data_type="currency", semantic_type="currency")
            ]
            inferred_row_count = 3
        pk = columns[0].name if columns else "id"

    suggested_table = TableProfile(
        name=table_name,
        row_count=max(inferred_row_count, 50),
        primary_key=pk,
        columns=[
            ColumnProfile(
                name=c.name,
                data_type=c.data_type,
                semantic_type=c.semantic_type,
                is_primary_key=c.is_primary_key,
                distribution=DistributionConfig(
                    type=c.distribution.get("type", "uniform") if c.distribution else "uniform",
                    parameters=c.distribution.get("parameters", {}) if c.distribution else {}
                )
            ) for c in columns
        ]
    )

    suggested_profile = DataProfile(
        name=f"Profile for {table_name}",
        modality="tabular",
        tables=[suggested_table]
    )

    return SuccessResponse(
        data=SchemaInferData(
            table_name=table_name,
            row_count_inferred=inferred_row_count,
            columns=columns,
            suggested_profile=suggested_profile
        )
    )

