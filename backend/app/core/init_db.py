from app.core.db import check_db_connection, create_tables


def init_db() -> None:
    check_db_connection()
    create_tables()
    print("Database initialized")


if __name__ == "__main__":
    init_db()
