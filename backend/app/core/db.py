from collections.abc import Generator

from sqlmodel import Session, SQLModel, create_engine

from app.core.config import get_settings

settings = get_settings()

# pool_pre_ping avoids serving stale/dead connections after DB restarts
engine = create_engine(settings.database_url, pool_pre_ping=True)


def init_db() -> None:
    """Create tables. In production this is replaced by Alembic migrations —
    kept here only as a convenience for local/dev bootstrapping."""
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session