from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.api.deps import get_current_user
from app.core.db import get_session
from app.ml.model_loader import model_service as ml_service
from app.models.user import User
from app.schemas.prediction import PredictionResponse, TransactionRequest
from app.services.prediction_service import run_prediction

router = APIRouter()


@router.post("/predict", response_model=PredictionResponse)
def predict_fraud(
    request: TransactionRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    try:
        result = run_prediction(session, request.features, user_id=current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    return result


@router.get("/sample-transaction")
def sample_transaction(current_user: User = Depends(get_current_user)):
    return ml_service.random_transaction()


@router.get("/model-info")
def model_info(current_user: User = Depends(get_current_user)):
    return ml_service.get_metrics()