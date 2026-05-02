from datetime import datetime, timezone
from uuid import uuid4

from models.storage import read_db, update_db


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def get_all_rooms():
    db = read_db()
    return db.get("rooms", [])


def get_room_by_id(room_id):
    db = read_db()
    return next((r for r in db.get("rooms", []) if r.get("id") == room_id), None)


def create_room(data):
    timestamp = now_iso()
    room = {
        "id": str(uuid4()),
        "name": data.get("name") or "New Room",
        "mapId": data.get("mapId"),
        "players": [],
        "initiative": {
            "order": [],
            "currentIndex": 0,
            "round": 1
        },
        "createdAt": timestamp,
        "updatedAt": timestamp
    }

    def mutator(db):
        db.setdefault("rooms", []).append(room)

    update_db(mutator)
    return room


def update_room(room_id, partial):
    def mutator(db):
        rooms = db.setdefault("rooms", [])
        current = next((r for r in rooms if r.get("id") == room_id), None)
        if current is None:
            return None
        current.update(partial)
        current["updatedAt"] = now_iso()
        return current

    return update_db(mutator)


def delete_room(room_id):
    def mutator(db):
        rooms = db.setdefault("rooms", [])
        for index, current in enumerate(rooms):
            if current.get("id") == room_id:
                return rooms.pop(index)
        return None

    return update_db(mutator)


def add_player(room_id, player_data):
    def mutator(db):
        current = next((r for r in db.setdefault("rooms", []) if r.get("id") == room_id), None)
        if current is None:
            return None

        player = {
            "id": str(uuid4()),
            "name": player_data.get("name") or "Player",
            "isGM": bool(player_data.get("isGM"))
        }
        current.setdefault("players", []).append(player)
        current["updatedAt"] = now_iso()
        return player

    return update_db(mutator)


def remove_player(room_id, player_id):
    def mutator(db):
        current = next((r for r in db.setdefault("rooms", []) if r.get("id") == room_id), None)
        if current is None:
            return None

        players = current.setdefault("players", [])
        for index, player in enumerate(players):
            if player.get("id") == player_id:
                current["updatedAt"] = now_iso()
                return players.pop(index)
        return None

    return update_db(mutator)


def set_initiative(room_id, initiative_list):
    def mutator(db):
        current = next((r for r in db.setdefault("rooms", []) if r.get("id") == room_id), None)
        if current is None:
            return None

        current["initiative"] = {
            "order": initiative_list,
            "currentIndex": 0,
            "round": 1
        }
        current["updatedAt"] = now_iso()
        return current["initiative"]

    return update_db(mutator)


def next_turn(room_id):
    def mutator(db):
        current = next((r for r in db.setdefault("rooms", []) if r.get("id") == room_id), None)
        if current is None or not current.get("initiative") or not current["initiative"].get("order"):
            return None

        initiative = current["initiative"]
        initiative["currentIndex"] = initiative.get("currentIndex", 0) + 1
        if initiative["currentIndex"] >= len(initiative["order"]):
            initiative["currentIndex"] = 0
            initiative["round"] = initiative.get("round", 1) + 1
        current["updatedAt"] = now_iso()
        return initiative

    return update_db(mutator)
