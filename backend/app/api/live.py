import asyncio

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlmodel import Session

from app.core.db import engine
from app.core.security import decode_access_token
from app.ml.model_loader import model_service
from app.services.prediction_service import run_prediction

router = APIRouter()


@router.websocket("/live")
async def live_feed(websocket: WebSocket, token: str):
    await websocket.accept()

    email = decode_access_token(token)
    if email is None:
        await websocket.close(code=4401)
        return

    try:
        while True:
            features = model_service.random_transaction()

            with Session(engine) as session:
                result = run_prediction(session, features, user_id=None)

            await websocket.send_json({
                "features": features,
                **result,
            })

            await asyncio.sleep(2)
    except WebSocketDisconnect:
        pass