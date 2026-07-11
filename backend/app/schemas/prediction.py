from pydantic import BaseModel


class TransactionRequest(BaseModel):
    features: dict[str, float]  # keyed by feature name, e.g. {"V1": -1.23, "Amount": 149.62, "Hour": 14, ...}


class PredictionResponse(BaseModel):
    is_fraud: bool
    fraud_probability: float
    anomaly_score: float
    threshold: float