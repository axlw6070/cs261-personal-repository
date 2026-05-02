# D&D Battle Map — Python Flask Version

This is a Python/Flask rewrite of the original Node/Express project.
The frontend files in `public/` are mostly unchanged. The backend REST API was rewritten in Python.

## How to run

```bash
python -m venv .venv
source .venv/bin/activate   # Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

Then open:

```text
http://localhost:3000
```

## Main files

- `app.py`: Flask app entry point
- `config.py`: path and port configuration
- `routes/`: API route handlers
- `models/`: JSON database logic
- `data/db.json`: simple JSON storage
- `public/`: frontend CSS/JS/uploads
- `templates/`: Flask/Jinja HTML templates

## Converted API routes

- `GET /api/rooms`
- `GET /api/rooms/<room_id>`
- `POST /api/rooms`
- `PUT /api/rooms/<room_id>`
- `DELETE /api/rooms/<room_id>`
- `POST /api/rooms/<room_id>/players`
- `DELETE /api/rooms/<room_id>/players/<player_id>`
- `PUT /api/rooms/<room_id>/initiative`
- `POST /api/rooms/<room_id>/initiative/next`
- `GET /api/maps`
- `GET /api/maps/<map_id>`
- `POST /api/maps`
- `PUT /api/maps/<map_id>`
- `DELETE /api/maps/<map_id>`
- `POST /api/maps/<map_id>/tokens`
- `PUT /api/maps/<map_id>/tokens/<token_id>`
- `DELETE /api/maps/<map_id>/tokens/<token_id>`
- `PUT /api/maps/<map_id>/fog`
- `PUT /api/maps/<map_id>/fog/cells`
- `POST /api/maps/<map_id>/image`
- `GET /api/dice/roll`

## Note about Socket.IO

The original project contains Socket.IO setup, but the current frontend uses `const socket = null;` in `public/js/room.js`, so real-time sync is not active. This Flask version keeps a small `/socket.io/socket.io.js` stub to avoid browser errors, but it does not implement live WebSocket updates.
