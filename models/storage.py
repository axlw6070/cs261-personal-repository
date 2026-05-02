import json
import threading
from pathlib import Path
from typing import Callable, Any

from config import Config

_db_lock = threading.Lock()


def _ensure_db_file() -> None:
    Config.DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    if not Config.DATA_FILE.exists():
        Config.DATA_FILE.write_text(json.dumps({"maps": [], "rooms": []}, indent=2), encoding="utf-8")


def read_db() -> dict:
    _ensure_db_file()
    with _db_lock:
        raw = Config.DATA_FILE.read_text(encoding="utf-8")
        return json.loads(raw or "{}")


def write_db(db: dict) -> None:
    _ensure_db_file()
    with _db_lock:
        Config.DATA_FILE.write_text(json.dumps(db, indent=2), encoding="utf-8")


def update_db(mutator: Callable[[dict], Any]) -> Any:
    _ensure_db_file()
    with _db_lock:
        raw = Config.DATA_FILE.read_text(encoding="utf-8")
        db = json.loads(raw or "{}")
        result = mutator(db)
        Config.DATA_FILE.write_text(json.dumps(db, indent=2), encoding="utf-8")
        return result
