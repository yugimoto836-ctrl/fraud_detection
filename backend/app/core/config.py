from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Central app configuration. All values come from environment variables
    (or a local .env file, never committed) — no secrets hardcoded here.
    """

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # --- Database ---
    database_url: str = "postgresql+psycopg2://fraud:fraud@localhost:5432/fraud_db"

    # --- Auth / JWT ---
    jwt_secret_key: str  # required, must be set via env — no default on purpose
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # --- CORS ---
    cors_allow_origins: list[str] = ["http://localhost:5173"]

    # --- ML ---
    model_dir: str = "app/ml/artifacts"
    fraud_threshold: float = 0.970  # recall ~0.75, precision ~0.85 on held-out test
    feature_order: list[str] = [
        "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10",
        "V11", "V12", "V13", "V14", "V15", "V16", "V17", "V18", "V19", "V20",
        "V21", "V22", "V23", "V24", "V25", "V26", "V27", "V28", "Amount", "Hour",
    ]


@lru_cache
def get_settings() -> Settings:
    return Settings()