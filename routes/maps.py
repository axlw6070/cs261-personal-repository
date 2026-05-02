from uuid import uuid4

from flask import Blueprint, jsonify, request
from werkzeug.utils import secure_filename

from config import Config
from models import map_model

maps_bp = Blueprint("maps", __name__, url_prefix="/api/maps")


@maps_bp.get("")
def get_maps():
    try:
        return jsonify(map_model.get_all_maps())
    except Exception as exc:
        print("Error getting maps:", exc)
        return jsonify({"error": "Failed to get maps"}), 500


@maps_bp.get("/<map_id>")
def get_map(map_id):
    try:
        current = map_model.get_map_by_id(map_id)
        if current is None:
            return jsonify({"error": "Map not found"}), 404
        return jsonify(current)
    except Exception as exc:
        print("Error getting map:", exc)
        return jsonify({"error": "Failed to get map"}), 500


@maps_bp.post("")
def create_map():
    try:
        current = map_model.create_map(request.get_json(silent=True) or {})
        return jsonify(current), 201
    except Exception as exc:
        print("Error creating map:", exc)
        return jsonify({"error": "Failed to create map"}), 500


@maps_bp.put("/<map_id>")
def update_map(map_id):
    try:
        current = map_model.update_map(map_id, request.get_json(silent=True) or {})
        if current is None:
            return jsonify({"error": "Map not found"}), 404
        return jsonify(current)
    except Exception as exc:
        print("Error updating map:", exc)
        return jsonify({"error": "Failed to update map"}), 500


@maps_bp.delete("/<map_id>")
def delete_map(map_id):
    try:
        deleted = map_model.delete_map(map_id)
        if deleted is None:
            return jsonify({"error": "Map not found"}), 404
        return jsonify({"success": True})
    except Exception as exc:
        print("Error deleting map:", exc)
        return jsonify({"error": "Failed to delete map"}), 500


@maps_bp.post("/<map_id>/tokens")
def add_token(map_id):
    try:
        token = map_model.add_token(map_id, request.get_json(silent=True) or {})
        if token is None:
            return jsonify({"error": "Map not found"}), 404
        return jsonify(token), 201
    except Exception as exc:
        print("Error adding token:", exc)
        return jsonify({"error": "Failed to add token"}), 500


@maps_bp.put("/<map_id>/tokens/<token_id>")
def update_token(map_id, token_id):
    try:
        token = map_model.update_token(map_id, token_id, request.get_json(silent=True) or {})
        if token is None:
            return jsonify({"error": "Map or token not found"}), 404
        return jsonify(token)
    except Exception as exc:
        print("Error updating token:", exc)
        return jsonify({"error": "Failed to update token"}), 500


@maps_bp.delete("/<map_id>/tokens/<token_id>")
def delete_token(map_id, token_id):
    try:
        token = map_model.delete_token(map_id, token_id)
        if token is None:
            return jsonify({"error": "Map or token not found"}), 404
        return jsonify({"success": True})
    except Exception as exc:
        print("Error deleting token:", exc)
        return jsonify({"error": "Failed to delete token"}), 500


@maps_bp.put("/<map_id>/fog")
def update_fog(map_id):
    try:
        body = request.get_json(silent=True) or {}
        fog = map_model.set_fog_enabled(map_id, body.get("enabled"))
        if fog is None:
            return jsonify({"error": "Map not found"}), 404
        return jsonify(fog)
    except Exception as exc:
        print("Error updating fog:", exc)
        return jsonify({"error": "Failed to update fog"}), 500


@maps_bp.put("/<map_id>/fog/cells")
def update_fog_cells(map_id):
    try:
        body = request.get_json(silent=True) or {}
        fog = map_model.clear_fog_cells(map_id, body.get("clearedCells") or [])
        if fog is None:
            return jsonify({"error": "Map not found"}), 404
        return jsonify(fog)
    except Exception as exc:
        print("Error updating fog cells:", exc)
        return jsonify({"error": "Failed to update fog cells"}), 500


@maps_bp.post("/<map_id>/image")
def upload_map_image(map_id):
    try:
        file = request.files.get("image")
        if file is None or file.filename == "":
            return jsonify({"error": "No file uploaded"}), 400

        Config.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        original = secure_filename(file.filename)
        suffix = f"_{original}" if original else ""
        filename = f"{uuid4().hex}{suffix}"
        file.save(Config.UPLOAD_DIR / filename)

        image_url = f"/uploads/{filename}"
        current = map_model.update_map(map_id, {"backgroundImageUrl": image_url})
        if current is None:
            return jsonify({"error": "Map not found"}), 404
        return jsonify(current)
    except Exception as exc:
        print("Error uploading map image:", exc)
        return jsonify({"error": "Failed to upload map image"}), 500
