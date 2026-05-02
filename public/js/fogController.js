"use strict";

import { updateFog, updateFogCells } from "./api.js";
export class FogController {
  constructor(mapCanvas, { mapId, roomId, socket }) {
    this.mapCanvas = mapCanvas;
    this.mapId = mapId;
    this.roomId = roomId;
    this.socket = socket;

    this.isGM = false;

    this.handleClick = this.handleClick.bind(this);
    this.canvas = mapCanvas.canvas;
    this.canvas.addEventListener("click", this.handleClick);
  }
  setGMMode(isGM) {
    this.isGM = isGM;
  }

  async toggleFog() {
    const fog = this.mapCanvas.fog || { enabled: false, clearedCells: [] };
    fog.enabled = !fog.enabled;
    try {
      const updated = await updateFog(this.mapId, fog);
      this.mapCanvas.fog = updated;
      this.mapCanvas.draw();

      if (this.socket && this.roomId) {
        this.socket.emit("fogUpdated", {
          roomId: this.roomId,
          mapId: this.mapId,
          fog: updated
        });
      }
    } catch (err) {
      console.error("Failed to toggle fog:", err);
    }
  }
  async handleClick(e) {
    if (!this.isGM) return;
    if (!this.mapCanvas.fog || !this.mapCanvas.fog.enabled) return;

    const { gx, gy } = this.mapCanvas.screenToGrid(e.clientX, e.clientY);
    const cells = this.mapCanvas.fog.clearedCells || [];

    const exists = cells.some((c) => c.x === gx && c.y === gy);
    if (!exists) {
      cells.push({ x: gx, y: gy });
    }

    try {
      const updatedFog = await updateFogCells(this.mapId, cells);
      this.mapCanvas.fog = updatedFog;
      this.mapCanvas.draw();

      if (this.socket && this.roomId) {
        this.socket.emit("fogUpdated", {
          roomId: this.roomId,
          mapId: this.mapId,
          fog: updatedFog
        });
      }
    } catch (err) {
      console.error("Failed to update fog cells:", err);
    }
  }
}
