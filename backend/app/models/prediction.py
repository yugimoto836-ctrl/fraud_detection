from datetime import datetime, timezone

from sqlmodel import Field, SQLModel


class PredictionLog(SQLModel, table=True):
    __tablename__ = "prediction_logs"

    id: int | None = Field(default=None, primary_key=True)
    user_id: int | None = Field(default=None, foreign_key="users.id", index=True)

    # Raw input features, stored as JSON text for auditability
    features_json: str

    is_fraud: bool
    fraud_probability: float  # supervised model's probability of the positive class
    anomaly_score: float  # isolation forest's secondary signal

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), index=True)