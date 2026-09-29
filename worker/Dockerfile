# worker/Dockerfile
# HackData V2 — ML Background Worker Container
#
# Same Python/ML stack as the API container.
# This is a Render Background Worker — it has no public HTTP port.
# It connects to the Redis/Valkey queue and processes generation jobs.
#
# Build:  docker build -t hackdata-worker -f worker/Dockerfile .
# Run:    docker run --env-file backend/.env hackdata-worker

FROM python:3.13-slim

LABEL maintainer="HackData V2 Team"
LABEL description="HackData V2 ML Background Worker — CTGAN/TVAE/Statistical Generation"

# System dependencies for ML libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -m -u 1000 hackdata
WORKDIR /app

# Copy requirements (same as API — shared ML stack)
COPY backend/requirements.txt ./requirements.txt

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend source (worker imports backend modules)
COPY backend/ ./backend/

# Copy worker entrypoint
COPY worker/ ./worker/

# Set ownership
RUN chown -R hackdata:hackdata /app
USER hackdata

# No EXPOSE — this is a background worker, not an HTTP service

# Start the standalone ML worker process
CMD ["python", "-u", "worker/main.py"]
