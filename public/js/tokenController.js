"use strict";

import { updateToken } from "./api.js";
export class TokenController {
  constructor(mapCanvas, { mapId, roomId, socket }) {
    this.mapCanvas = mapCanvas;
    this.mapId = mapId;
    this.roomId = roomId;
    this.socket = socket;

    this.draggingTokenId = null;

    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);

    const canvas = this.mapCanvas.canvas;
    canvas.addEventListener("mousedown", this.handleMouseDown);
    canvas.addEventListener("mousemove", this.handleMouseMove);
    canvas.addEventListener("mouseup", this.handleMouseUp);
    canvas.addEventListener("mouseleave", this.handleMouseUp);
  }
  findTokenAt(gridX, gridY) {
    return (this.mapCanvas.tokens || []).find(
      (t) => t.x === gridX && t.y === gridY
    );
  }

  handleMouseDown(e) {
    const { gx, gy } = this.mapCanvas.screenToGrid(e.clientX, e.clientY);
    const token = this.findTokenAt(gx, gy);
    if (token) {
      this.draggingTokenId = token.id;
    }
  }
  async handleMouseMove(e) {
    if (!this.draggingTokenId) return;
    const { gx, gy } = this.mapCanvas.screenToGrid(e.clientX, e.clientY);
    const token = (this.mapCanvas.tokens || []).find(
      (t) => t.id === this.draggingTokenId
    );
    if (!token) return;

    token.x = gx;
    token.y = gy;
    this.mapCanvas.draw();
  }
  async handleMouseUp(e) {
    if (!this.draggingTokenId) return;
    const id = this.draggingTokenId;
    this.draggingTokenId = null;

    const { gx, gy } = this.mapCanvas.screenToGrid(e.clientX, e.clientY);
    try {
      await updateToken(this.mapId, id, { x: gx, y: gy });

      if (this.socket && this.roomId) {
        this.socket.emit("tokenMoved", {
          roomId: this.roomId,
          mapId: this.mapId,
          tokenId: id,
          x: gx,
          y: gy
        });
      }
    } catch (err) {
      console.error("Failed to update token:", err);
    }
  }
}
