from fastapi.testclient import TestClient

# One real row from the dataset (legit transaction) — same one used for
# manual testing earlier, so we know roughly what to expect back
SAMPLE_FEATURES = {
    "V1": 1.12559234254042, "V2": -0.147998895552766, "V3": 1.15100767933996,
    "V4": 1.15885087558611, "V5": -0.823913744911569, "V6": 0.298829398022973,
    "V7": -0.708731942079327, "V8": 0.294682521910475, "V9": 0.75083811125687,
    "V10": -0.0153355639443182, "V11": 0.506095201656347, "V12": 0.722428577422242,
    "V13": -0.632942327955027, "V14": -0.0546091249935901, "V15": -0.427454055564454,
    "V16": 0.400527135613106, "V17": -0.581417301903452, "V18": 0.619128088987477,
    "V19": 0.204921881716933, "V20": -0.145903789804936, "V21": -0.0374527780145629,
    "V22": 0.0243876462322979, "V23": -0.0527202438309492, "V24": -0.0036148849417503,
    "V25": 0.405681822294172, "V26": -0.404596965005485, "V27": 0.0633572258019516,
    "V28": 0.0240908379766265, "Amount": 12.99, "Hour": 23.0,
}


def _get_token(client: TestClient) -> str:
    client.post("/auth/register", json={"email": "predictor@example.com", "password": "strongpass123"})
    response = client.post(
        "/auth/login",
        data={"username": "predictor@example.com", "password": "strongpass123"},
    )
    return response.json()["access_token"]


def test_predict_requires_auth(client: TestClient):
    response = client.post("/api/predict", json={"features": SAMPLE_FEATURES})
    assert response.status_code == 401


def test_predict_returns_expected_shape(client: TestClient):
    token = _get_token(client)
    response = client.post(
        "/api/predict",
        json={"features": SAMPLE_FEATURES},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert set(data.keys()) == {"is_fraud", "fraud_probability", "anomaly_score", "threshold"}
    assert isinstance(data["is_fraud"], bool)
    assert 0.0 <= data["fraud_probability"] <= 1.0
    assert data["threshold"] == 0.970


def test_predict_missing_feature_returns_422(client: TestClient):
    token = _get_token(client)
    incomplete = {k: v for k, v in SAMPLE_FEATURES.items() if k != "V14"}  # drop one required feature
    response = client.post(
        "/api/predict",
        json={"features": incomplete},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 422