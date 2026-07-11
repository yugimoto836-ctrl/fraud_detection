# FraudWatch AI

Real-time credit card fraud detection: a supervised XGBoost model (primary signal) paired with
an Isolation Forest (secondary anomaly signal), served via ONNX Runtime behind a FastAPI backend,
with a React dashboard for exploring predictions and watching a live scoring feed.

## Why this exists

An earlier version of this project used only an unsupervised Isolation Forest. This rebuild
switches to a supervised model as the primary signal because the training data
(the [ULB/Kaggle Credit Card Fraud dataset](https://www.kaggle.com/mlg-ulb/creditcardfraud))
actually has real fraud labels — throwing that away in favor of a purely unsupervised approach
was leaving the best available signal on the table. Isolation Forest is kept as a secondary,
complementary signal rather than the primary decision-maker.

## Architecture

```
frontend/          React + Vite + TypeScript + Tailwind
backend/
  app/
    core/           config, db session, security (JWT/bcrypt)
    models/         SQLModel tables (User, PredictionLog)
    schemas/        Pydantic request/response shapes
    services/       business logic, framework-agnostic
    api/            route handlers (auth, predict, live)
    ml/             ONNX model loading + inference
  tests/            pytest suite
notebooks/          model training & evaluation (exploratory)
```

## Model

- **Primary**: XGBoost, trained with class weighting (not SMOTE — safer for this sample size,
  avoids synthetic-data leakage risk) to handle the ~0.17% fraud rate.
- **Secondary**: Isolation Forest, unsupervised, provides an anomaly score alongside the
  primary prediction — useful as a second opinion, not trusted alone (it catches only ~20%
  of fraud on its own vs. the supervised model's ~75%).
- **Split**: time-based (train on the first half of the 2-day window, test on the second),
  not random — avoids leaking information across a fraud burst that a random split would miss.
- **Deployed threshold**: 0.970, chosen for ~75% recall / ~85% precision on held-out data —
  a deliberate choice to catch more real fraud at the cost of more false positives for
  analysts to review.

Full metrics are served live at `GET /api/model-info` and shown on the app's Model Details page.

## Running locally

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\Activate.ps1        # Windows
pip install -r requirements.txt
# copy .env.example to .env and fill in JWT_SECRET_KEY, DATABASE_URL
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Tests

```bash
cd backend
pytest -v
```

## Training the model

See `notebooks/` for the full exploratory training process (data split, class imbalance
handling, threshold selection, ONNX export). Trained artifacts live in
`backend/app/ml/artifacts/` and are loaded once at backend startup.
