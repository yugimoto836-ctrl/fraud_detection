import json

from sqlmodel import Session

from app.ml.model_loader import model_service
from app.models.prediction import PredictionLog


def run_prediction(session: Session, features: dict[str, float], user_id: int | None) -> dict:
    result = model_service.predict(features)

    log = PredictionLog(
        user_id=user_id,
        features_json=json.dumps(features),
        is_fraud=result["is_fraud"],
        fraud_probability=result["fraud_probability"],
        anomaly_score=result["anomaly_score"],
    )
    session.add(log)
    session.commit()

    return result