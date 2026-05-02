# D&D Battle Map — Python Flask Version v0.1.0

## How to run

```bash
cd C:\Users\张\Desktop\cs361\code3
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.p
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
