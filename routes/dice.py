import random

from flask import Blueprint, jsonify, request

dice_bp = Blueprint("dice", __name__, url_prefix="/api/dice")


def clamp(value, low, high):
    return max(low, min(high, value))


@dice_bp.get("/roll")
def roll_dice():
    try:
        faces = int(request.args.get("faces", 20))
    except ValueError:
        faces = 20
    try:
        count = int(request.args.get("count", 1))
    except ValueError:
        count = 1

    faces = clamp(faces, 2, 1000)
    count = clamp(count, 1, 100)
    rolls = [random.randint(1, faces) for _ in range(count)]

    return jsonify({
        "faces": faces,
        "count": count,
        "rolls": rolls,
        "total": sum(rolls)
    })
