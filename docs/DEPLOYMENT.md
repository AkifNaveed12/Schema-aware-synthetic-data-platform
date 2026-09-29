# HackData V2 — Production Deployment Guide & Architecture

## 1. Production Architecture Overview

The production architecture is deployed on a strict ₹0 / $0 zero-cost stack:

```text
[ Browser / Client ]
         │
         ▼
[ Vercel Frontend (SPA) ]
  URL: https://frontend-lac-three-nwfjxct5qr.vercel.app
         │
         │  HTTPS + CORS
         ▼
[ Render FastAPI Web Service ] (Plan: Free)
  URL: https://hackdata-api.onrender.com
  Docker: python:3.13-slim
         │
         ├──► [ Supabase Storage ] (Bucket: hackdata-v2, Private)
         │    Raw uploaded datasets & generated artifacts
         │
         ├──► [ Supabase Postgres ] (Table: jobs, RLS enabled)
         │    Durable job state across container lifecycles
         │
         ▼
[ Render Key Value / Valkey Queue ] (Plan: Free)
  Connection: redis://red-dau4eufavr4c73fl0vh0:6379 (Internal)
         │
         ▼  BLPOP / RPUSH
[ Render ML Background Worker ] (Plan: Free, Web Service with health check)
  URL: https://hackdata-worker.onrender.com
  Docker: python:3.13-slim + torch CPU + SDV + CTGAN
```

## 2. Deployed Services & Live Endpoints

| Resource | Provider | Plan | Live URL / Identifier |
| :--- | :--- | :--- | :--- |
| **Frontend** | Vercel | Free (Hobby) | `https://frontend-lac-three-nwfjxct5qr.vercel.app` |
| **API** | Render | Free | `https://hackdata-api.onrender.com` (`srv-dau4g6lg1s2s73bdrk4g`) |
| **Worker** | Render | Free | `https://hackdata-worker.onrender.com` (`srv-dau4gmnlot8c739ksh70`) |
| **Queue** | Render (Valkey) | Free | `hackdata-queue` (`red-dau4eufavr4c73fl0vh0`) |
| **Database** | Supabase | Free | `https://cfpdolxxpaxgobaxjece.supabase.co` |
| **Storage** | Supabase | Free | Bucket: `hackdata-v2` (Private) |

## 3. End-to-End Execution Flow

1. **Client / UI**: Uploads dataset via `POST /api/v1/datasets/ingest` to Render API.
2. **API**: Saves raw dataset CSV to Supabase Storage (`datasets/raw/{id}.csv`).
3. **Queue**: API enqueues job `{job_id, dataset_id, config}` into Valkey queue.
4. **Worker**: Dequeues job reference from Valkey, fetches raw CSV from Supabase Storage.
5. **Generation**: Worker fits model (`statistical`, `tvae`, `ctgan`), validates constraints, evaluates quality metrics.
6. **Artifact Store**: Worker uploads generated artifact to Supabase Storage (`datasets/generated/{id}.csv`).
7. **Durable State**: Worker updates Supabase Postgres `jobs` table with `completed` state and duration.
8. **Client Poll / Export**: API returns completed job with preview rows, client exports CSV/JSON.

## 4. Hardware & Memory Guardrails

- **Render Free Tier Limit**: 512 MB RAM per service.
- **Model Fallback Chain**: Heavy neural architectures (`CTGAN` / `TVAE`) on large datasets (>500 rows) are guarded by an automatic fallback chain: `CTGAN → TVAE → Statistical → Deterministic`.
- **Dataset Caps**: `MAX_ALLOWED_ROWS=50,000`, `MAX_ROW_COUNT=10,000` default.
