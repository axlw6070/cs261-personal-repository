from flask import Blueprint, jsonify, request

from models import room_model

rooms_bp = Blueprint("rooms", __name__, url_prefix="/api/rooms")


@rooms_bp.get("")
def get_rooms():
    try:
        return jsonify(room_model.get_all_rooms())
    except Exception as exc:
        print("Error getting rooms:", exc)
        return jsonify({"error": "Failed to get rooms"}), 500


@rooms_bp.get("/<room_id>")
def get_room(room_id):
    try:
        current = room_model.get_room_by_id(room_id)
        if current is None:
            return jsonify({"error": "Room not found"}), 404
        return jsonify(current)
    except Exception as exc:
        print("Error getting room:", exc)
        return jsonify({"error": "Failed to get room"}), 500


@rooms_bp.post("")
def create_room():
    try:
        current = room_model.create_room(request.get_json(silent=True) or {})
        return jsonify(current), 201
    except Exception as exc:
        print("Error creating room:", exc)
        return jsonify({"error": "Failed to create room"}), 500


@rooms_bp.put("/<room_id>")
def update_room(room_id):
    try:
        current = room_model.update_room(room_id, request.get_json(silent=True) or {})
        if current is None:
            return jsonify({"error": "Room not found"}), 404
        return jsonify(current)
    except Exception as exc:
        print("Error updating room:", exc)
        return jsonify({"error": "Failed to update room"}), 500


@rooms_bp.delete("/<room_id>")
def delete_room(room_id):
    try:
        deleted = room_model.delete_room(room_id)
        if deleted is None:
            return jsonify({"error": "Room not found"}), 404
        return jsonify({"success": True})
    except Exception as exc:
        print("Error deleting room:", exc)
        return jsonify({"error": "Failed to delete room"}), 500


@rooms_bp.post("/<room_id>/players")
def add_player(room_id):
    try:
        player = room_model.add_player(room_id, request.get_json(silent=True) or {})
        if player is None:
            return jsonify({"error": "Room not found"}), 404
        return jsonify(player), 201
    except Exception as exc:
        print("Error adding player:", exc)
        return jsonify({"error": "Failed to add player"}), 500


@rooms_bp.delete("/<room_id>/players/<player_id>")
def remove_player(room_id, player_id):
    try:
        removed = room_model.remove_player(room_id, player_id)
        if removed is None:
            return jsonify({"error": "Room or player not found"}), 404
        return jsonify({"success": True})
    except Exception as exc:
        print("Error removing player:", exc)
        return jsonify({"error": "Failed to remove player"}), 500


@rooms_bp.put("/<room_id>/initiative")
def update_initiative(room_id):
    try:
        current = room_model.get_room_by_id(room_id)
        if current is None:
            return jsonify({"error": "Room not found"}), 404

        body = request.get_json(silent=True) or {}
        initiative = {
            "order": [],
            "currentIndex": 0,
            "round": 1,
            **body
        }
        updated = room_model.update_room(room_id, {"initiative": initiative})
        return jsonify(updated["initiative"])
    except Exception as exc:
        print("Error setting initiative:", exc)
        return jsonify({"error": "Failed to set initiative"}), 500


@rooms_bp.post("/<room_id>/initiative/next")
def next_initiative(room_id):
    try:
        current = room_model.get_room_by_id(room_id)
        if current is None or not current.get("initiative"):
            return jsonify({"error": "Room not found or initiative not set"}), 404

        initiative = current["initiative"]
        order = initiative.get("order") or []
        if not order:
            return jsonify({"error": "Initiative is empty"}), 404

        current_index = initiative.get("currentIndex", 0)
        round_number = initiative.get("round", 1)
        current_index = (current_index + 1) % len(order)
        if current_index == 0:
            round_number += 1

        new_initiative = {
            **initiative,
            "currentIndex": current_index,
            "round": round_number
        }
        updated = room_model.update_room(room_id, {"initiative": new_initiative})
        return jsonify(updated["initiative"])
    except Exception as exc:
        print("Error advancing initiative:", exc)
        return jsonify({"error": "Failed to advance initiative"}), 500
