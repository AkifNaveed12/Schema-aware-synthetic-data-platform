from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173,https://datavaultplatform.vercel.app,https://datavault.vercel.app,https://schema-aware-synthetic-data-platform.vercel.app"
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "qwen/qwen3.8-27b"
    GROQ_ASSISTANT_API_KEY: str = ""
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_SECRET_KEY: str = ""
    SUPABASE_BUCKET: str = "hackdata-v2"
    REDIS_URL: str = ""  # Redis/Valkey URL for distributed job queue (production only)
    MAX_ROW_COUNT: int = 10000
    DEFAULT_PREVIEW_ROWS: int = 50
    MAX_UPLOAD_SIZE_MB: int = 50

    # SMTP Email Configuration
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = ""
    SMTP_FROM_NAME: str = "Synthetic Data Generator"

    model_config = SettingsConfigDict(
        env_file=("backend/.env", ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def cors_origins(self) -> List[str]:
        if not self.ALLOWED_ORIGINS:
            return ["http://localhost:3000", "http://localhost:5173"]
        origins = []
        for origin in self.ALLOWED_ORIGINS.split(","):
            raw = origin.strip().rstrip("/")
            if not raw:
                continue
            origins.append(raw)
            if not raw.startswith("http://") and not raw.startswith("https://") and raw != "*":
                origins.append(f"https://{raw}")
                origins.append(f"http://{raw}")
        return origins

    @property
    def supabase_key(self) -> str:
        return self.SUPABASE_SERVICE_ROLE_KEY or self.SUPABASE_SECRET_KEY

settings = Settings()
