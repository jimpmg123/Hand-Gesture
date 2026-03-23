from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import DATABASE_URL

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, class_=Session)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_db_connection() -> None:
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))


def create_tables() -> None:
    import app.models  # noqa: F401

    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    check_db_connection()
    print("DB connected")
 
