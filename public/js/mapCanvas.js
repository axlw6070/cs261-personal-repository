"use strict";

export class MapCanvas {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.map = null;
    this.tokens = [];
    this.fog = null;
    this.gridSize = 32;
    this.bgImage = null; 

    this.defaultWidth = canvas.width;
    this.defaultHeight = canvas.height;
  }

  setState({ map, tokens, fog }) {
    this.map = map;
    this.tokens = tokens || [];
    this.fog = fog || null;

    //  map  gridSize，
    this.gridSize = map?.gridSize || this.gridSize;

    if (map && map.backgroundImageUrl) {
      const img = new Image();
      img.src = map.backgroundImageUrl;

      img.onload = () => {
        this.bgImage = img;


        const imgW = img.naturalWidth || img.width;
        const imgH = img.naturalHeight || img.height;
        this.canvas.width = imgW;
        this.canvas.height = imgH;



        if (this.map && this.map.width && this.map.height) {
          const cellW = this.canvas.width / this.map.width;
          const cellH = this.canvas.height / this.map.height;


          this.gridSize = Math.min(cellW, cellH);
        }

        this.draw();
      };

      img.onerror = () => {
        console.warn("Failed to load map background:", map.backgroundImageUrl);
        this.bgImage = null;

        this.canvas.width = this.defaultWidth;
        this.canvas.height = this.defaultHeight;
        this.draw();
      };
    } else {

      this.bgImage = null;
      this.canvas.width = this.defaultWidth;
      this.canvas.height = this.defaultHeight;
      this.draw();
    }
  }

  draw() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;


    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);

    if (!this.map) return;


    if (this.bgImage) {
      ctx.drawImage(this.bgImage, 0, 0, width, height);
    }


    ctx.strokeStyle = "#1f2937";
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += this.gridSize) {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += this.gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(width, y + 0.5);
      ctx.stroke();
    }

    // token
    for (const token of this.tokens) {
      this.drawToken(token);
    }

    // 迷雾
    if (this.fog && this.fog.enabled) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      for (const cell of this.fog.clearedCells || []) {
        ctx.beginPath();
        ctx.rect(
          cell.x * this.gridSize,
          cell.y * this.gridSize,
          this.gridSize,
          this.gridSize
        );
        ctx.fill();
      }
      ctx.restore();
    }
  }

  drawToken(token) {
    const ctx = this.ctx;
    const r = this.gridSize * 0.35;
    const cx = token.x * this.gridSize + this.gridSize / 2;
    const cy = token.y * this.gridSize + this.gridSize / 2;

    ctx.fillStyle = token.color || "#ef4444";
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#e5e7eb";
    ctx.font = `${this.gridSize * 0.3}px system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(token.name[0] || "T", cx, cy);
  }

  screenToGrid(x, y) {
    const rect = this.canvas.getBoundingClientRect();
    const gx = Math.floor((x - rect.left) / this.gridSize);
    const gy = Math.floor((y - rect.top) / this.gridSize);
    return { gx, gy };
  }
}
