from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, predict, live
from app.core.config import get_settings
from app.core.db import init_db

from contextlib import asynccontextmanager

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="FraudWatch AI API",
    description="Real-time credit card fraud detection: supervised XGBoost + Isolation Forest, served via ONNX.",
    version="2.0.0",
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_origins,  # explicit list, not "*"
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(predict.router, prefix="/api", tags=["Machine Learning"])
app.include_router(live.router, prefix="/ws", tags=["Live Feed"])
# predict router gets wired in during step 3, once the ML pipeline exists


@app.get("/")
def root():
    return {"message": "FraudWatch AI API is operational", "docs": "/docs"}