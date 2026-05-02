from datetime import datetime, timezone
from uuid import uuid4

from models.storage import read_db, update_db


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def get_all_maps():
    db = read_db()
    return db.get("maps", [])


def get_map_by_id(map_id):
    db = read_db()
    return next((m for m in db.get("maps", []) if m.get("id") == map_id), None)


def create_map(data):
    timestamp = now_iso()
    new_map = {
        "id": str(uuid4()),
        "name": data.get("name") or "New Map",
        "width": int(data.get("width") or 30),
        "height": int(data.get("height") or 20),
        "gridSize": int(data.get("gridSize") or 32),
        "backgroundImageUrl": data.get("backgroundImageUrl"),
        "tokens": [],
        "fog": {
            "enabled": bool(data.get("fogEnabled")),
            "clearedCells": []
        },
        "createdAt": timestamp,
        "updatedAt": timestamp
    }

    def mutator(db):
        db.setdefault("maps", []).append(new_map)

    update_db(mutator)
    return new_map


def update_map(map_id, partial):
    def mutator(db):
        maps = db.setdefault("maps", [])
        current = next((m for m in maps if m.get("id") == map_id), None)
        if current is None:
            return None
        current.update(partial)
        current["updatedAt"] = now_iso()
        return current

    return update_db(mutator)


def delete_map(map_id):
    def mutator(db):
        maps = db.setdefault("maps", [])
        for index, current in enumerate(maps):
            if current.get("id") == map_id:
                return maps.pop(index)
        return None

    return update_db(mutator)


def add_token(map_id, token_data):
    def mutator(db):
        current = next((m for m in db.setdefault("maps", []) if m.get("id") == map_id), None)
        if current is None:
            return None

        token = {
            "id": str(uuid4()),
            "name": token_data.get("name") or "Token",
            "x": int(token_data.get("x") or 0),
            "y": int(token_data.get("y") or 0),
            "color": token_data.get("color") or "#ff0000",
            "isGM": bool(token_data.get("isGM"))
        }
        current.setdefault("tokens", []).append(token)
        current["updatedAt"] = now_iso()
        return token

    return update_db(mutator)


def update_token(map_id, token_id, partial):
    def mutator(db):
        current = next((m for m in db.setdefault("maps", []) if m.get("id") == map_id), None)
        if current is None:
            return None

        token = next((t for t in current.setdefault("tokens", []) if t.get("id") == token_id), None)
        if token is None:
            return None

        token.update(partial)
        current["updatedAt"] = now_iso()
        return token

    return update_db(mutator)


def delete_token(map_id, token_id):
    def mutator(db):
        current = next((m for m in db.setdefault("maps", []) if m.get("id") == map_id), None)
        if current is None:
            return None

        tokens = current.setdefault("tokens", [])
        for index, token in enumerate(tokens):
            if token.get("id") == token_id:
                current["updatedAt"] = now_iso()
                return tokens.pop(index)
        return None

    return update_db(mutator)


def set_fog_enabled(map_id, enabled):
    def mutator(db):
        current = next((m for m in db.setdefault("maps", []) if m.get("id") == map_id), None)
        if current is None:
            return None

        fog = current.setdefault("fog", {"enabled": False, "clearedCells": []})
        fog["enabled"] = bool(enabled)
        current["updatedAt"] = now_iso()
        return fog

    return update_db(mutator)


def clear_fog_cells(map_id, cells):
    def mutator(db):
        current = next((m for m in db.setdefault("maps", []) if m.get("id") == map_id), None)
        if current is None:
            return None

        fog = current.setdefault("fog", {"enabled": False, "clearedCells": []})
        fog["clearedCells"] = cells or []
        current["updatedAt"] = now_iso()
        return fog

    return update_db(mutator)
