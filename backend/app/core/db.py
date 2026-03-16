from sqlalchemy import create_engine, text

from app.core.config import DATABASE_URL

engine = create_engine(DATABASE_URL, pool_pre_ping=True)


def check_db_connection() -> None:
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))


if __name__ == "__main__":
    check_db_connection()
    print("DB connected")
 