import time
from collections.abc import Generator

from sqlalchemy.exc import OperationalError
from sqlmodel import Session, SQLModel, create_engine

from app.core.config import get_settings

settings = get_settings()

# pool_pre_ping avoids serving stale/dead connections after DB restarts
engine = create_engine(settings.database_url, pool_pre_ping=True)


def init_db(max_retries: int = 10, delay_seconds: float = 3.0) -> None:
    """Create tables. In production this is replaced by Alembic migrations —
    kept here only as a convenience for local/dev bootstrapping.

    Retries on connection failure: on platforms like Railway there's no
    `depends_on: condition: service_healthy` equivalent, so the backend can
    start before Postgres is ready to accept connections.
    """
    for attempt in range(1, max_retries + 1):
        try:
            SQLModel.metadata.create_all(engine)
            return
        except OperationalError:
            if attempt == max_retries:
                raise
            print(
                f"[init_db] database not ready (attempt {attempt}/{max_retries}), "
                f"retrying in {delay_seconds}s..."
            )
            time.sleep(delay_seconds)


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
