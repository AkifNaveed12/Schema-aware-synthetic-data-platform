# backend/Dockerfile
# HackData V2 — FastAPI Backend Container
#
# Uses python:3.13-slim (Python 3.14.5 is not yet available as an official Docker image).
# All ML libraries (torch, ctgan, sdv, scikit-learn) are installed in the same image
# to preserve the verified dependency stack as closely as possible.
#
# Build:  docker build -t hackdata-api -f backend/Dockerfile .
# Run:    docker run -p 8000:8000 --env-file backend/.env hackdata-api

FROM python:3.13-slim

LABEL maintainer="HackData V2 Team"
LABEL description="HackData V2 FastAPI Backend — Synthetic Data Platform"

# System dependencies for ML libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN useradd -m -u 1000 hackdata
WORKDIR /app

# Copy requirements first for better layer caching
COPY backend/requirements.txt ./requirements.txt

# Install Python dependencies (torch CPU build; no CUDA needed)
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r requirements.txt

# Copy entire source
COPY backend/ ./backend/

# Set ownership
RUN chown -R hackdata:hackdata /app
USER hackdata

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8000/api/v1/health || exit 1

EXPOSE 8000

# Start the FastAPI backend
CMD ["python", "-m", "uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1", "--log-level", "info"]
