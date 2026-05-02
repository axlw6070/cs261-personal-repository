from flask import Flask, Response, render_template, send_from_directory

from config import Config
from routes.dice import dice_bp
from routes.maps import maps_bp
from routes.rooms import rooms_bp


def create_app():
    app = Flask(
        __name__,
        static_folder=str(Config.PUBLIC_DIR),
        static_url_path=""
    )
    app.config.from_object(Config)

    Config.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    app.register_blueprint(maps_bp)
    app.register_blueprint(rooms_bp)
    app.register_blueprint(dice_bp)

    @app.get("/")
    def home():
        return render_template("index.html", title="DnD Battle Map")

    @app.get("/room/<room_id>")
    @app.get("/rooms/<room_id>")
    def room_page(room_id):
        return render_template("room.html", title=f"Room {room_id}", room_id=room_id)

    @app.get("/socket.io/socket.io.js")
    def socket_io_stub():
        # The current frontend sets socket = null, so real Socket.IO is not required.
        # This tiny stub prevents a browser 404 if the script tag is kept.
        return Response("window.io = window.io || function(){ return null; };", mimetype="application/javascript")

    @app.get("/uploads/<path:filename>")
    def uploaded_file(filename):
        return send_from_directory(Config.UPLOAD_DIR, filename)

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=Config.PORT, debug=(Config.ENV == "development"))
