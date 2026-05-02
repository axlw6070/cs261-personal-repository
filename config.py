from pathlib import Path
import os

ROOT_DIR = Path(__file__).resolve().parent

class Config:
    PORT = int(os.environ.get("PORT", 3000))
    ENV = os.environ.get("FLASK_ENV", "development")
    DATA_FILE = Path(os.environ.get("DATA_FILE", ROOT_DIR / "data" / "db.json"))
    PUBLIC_DIR = ROOT_DIR / "public"
    UPLOAD_DIR = PUBLIC_DIR / "uploads"
    SECRET_KEY = os.environ.get("SESSION_SECRET", "dev-session-secret-change-me")
