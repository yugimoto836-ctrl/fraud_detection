import json
import random
from pathlib import Path

import joblib
import numpy as np
import onnxruntime as ort
import pandas as pd

from app.core.config import get_settings

settings = get_settings()


class ModelService:
    """
    Loads the XGBoost (primary) and Isolation Forest (secondary) ONNX models
    plus the feature scaler, once, at process startup. Exposes a single
    predict() call so the API layer doesn't need to know anything about
    ONNX Runtime, feature order, or how the two models' outputs are shaped.
    """

    def __init__(self) -> None:
        artifacts_dir = Path(settings.model_dir)

        self.xgb_session = ort.InferenceSession(str(artifacts_dir / "fraud_xgb.onnx"))
        self.xgb_input_name = self.xgb_session.get_inputs()[0].name

        self.iso_session = ort.InferenceSession(str(artifacts_dir / "iso_forest.onnx"))
        self.iso_input_name = self.iso_session.get_inputs()[0].name

        self.scaler = joblib.load(artifacts_dir / "scaler.pkl")

        self.feature_order = settings.feature_order
        self.threshold = settings.fraud_threshold

        with open(artifacts_dir / "live_sample.json") as f:
            self.live_sample = json.load(f)

        with open(artifacts_dir / "model_metrics.json") as f:
            self.metrics = json.load(f)

    def random_transaction(self) -> dict[str, float]:
        return random.choice(self.live_sample)
    
    def get_metrics(self) -> dict:
        return self.metrics

    def predict(self, features: dict[str, float]) -> dict:
        # Enforce the exact training-time feature order — this is the one
        # thing that must never silently drift, so we build the array from
        # the dict explicitly rather than trusting caller-supplied order.
        try:
            ordered = [features[name] for name in self.feature_order]
        except KeyError as e:
            raise ValueError(f"Missing required feature: {e}")

        x = np.array(ordered, dtype=np.float32).reshape(1, -1)

        # --- Primary: XGBoost fraud probability ---
        xgb_outputs = self.xgb_session.run(None, {self.xgb_input_name: x})
        fraud_probability = float(xgb_outputs[1][0][1])  # [labels, probabilities][class 1]
        is_fraud = fraud_probability >= self.threshold

        # --- Secondary: Isolation Forest anomaly score ---
        x_df = pd.DataFrame(x, columns=self.feature_order)
        x_scaled = self.scaler.transform(x_df).astype(np.float32)
        iso_outputs = self.iso_session.run(None, {self.iso_input_name: x_scaled})
        anomaly_score = float(iso_outputs[1][0][0])  # [labels, scores]

        return {
            "is_fraud": is_fraud,
            "fraud_probability": fraud_probability,
            "anomaly_score": anomaly_score,
            "threshold": self.threshold,
        }


# Singleton, built once at import time (first time this module is imported —
# which we'll trigger at app startup in main.py, same as before)
model_service = ModelService()