import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parents[2]

# Load backend/.env when present, then fall back to normal environment variables.
load_dotenv(BASE_DIR / ".env")
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
GOOGLE_CLOUD_VISION_API_KEY = os.getenv("GOOGLE_CLOUD_VISION_API_KEY", GOOGLE_MAPS_API_KEY)
GOOGLE_APPLICATION_CREDENTIALS = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg://travel_user:travel_password@127.0.0.1:5432/travel_db",
)
