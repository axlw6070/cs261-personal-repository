"use strict";

import { setInitiative, nextTurn } from "./api.js";

export class InitiativeUI {
  constructor(container, { roomId, socket }) {
    this.container = container;
    this.roomId = roomId;
    this.socket = socket;

    // structure
    this.state = {
      order: [],        // [{ id, name, initiativeValue }]
      currentIndex: 0,  
      round: 1          
    };

    this.render();
  }
  setState(initiative) {
    this.state = {
      order: [],
      currentIndex: 0,
      round: 1,
      ...(initiative || {})
    };
    this.render();
  }
  render() {
    const s = this.state;

    this.container.innerHTML = `
      <div class="initiative-row">
        <label>Characters (comma separated):</label>
        <input type="text" id="init-names" placeholder="Alice, Bob, Goblin" />
      </div>
      <div class="initiative-row">
        <label>Roll (d20) or enter values separated by commas:</label>
        <input type="text" id="init-values" placeholder="15, 12, 8" />
        <button id="init-set-btn">Set Initiative</button>
      </div>
      <div class="initiative-row">
        <strong>Current round:</strong> ${s.round}
        <button id="init-next-btn">Next Turn</button>
        <button id="init-reset-btn" style="margin-left:8px; color:red;">Reset</button>
      </div>
      <ul class="initiative-list">
        ${s.order
          .map((e, idx) => {
            const active = idx === s.currentIndex ? " (active)" : "";
            return `<li>${e.name}: ${e.initiativeValue}${active}</li>`;
          })
          .join("")}
      </ul>
    `;

    this.container
      .querySelector("#init-set-btn")
      .addEventListener("click", () => this.handleSet());
    this.container
      .querySelector("#init-next-btn")
      .addEventListener("click", () => this.handleNext());
    this.container
      .querySelector("#init-reset-btn")
      .addEventListener("click", () => this.handleReset());

  }
  async handleSet() {
    const namesInput = this.container.querySelector("#init-names");
    const valuesInput = this.container.querySelector("#init-values");

    const names = namesInput.value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    let values = valuesInput.value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((v) => Number(v));

    // 如果没填数值，就给每个人一个默认 10
    if (!values.length) {
      values = names.map(() => 10);
    }
  const existing = this.state.order || [];
  const newEntries = names.map((name, idx) => ({
      id: name + "-" + Date.now() + "-" + idx,  
      name,
      initiativeValue: values[idx] ?? 10
    }));
 const merged = [...existing, ...newEntries];
  merged.sort((a, b) => b.initiativeValue - a.initiativeValue);
    const initiativeState = {
      ...this.state,              
      order: merged,
      currentIndex: 0,            
      round: this.state.round || 1
    };
    try {
      const saved = await setInitiative(this.roomId, initiativeState);
      const newInit = saved.initiative || saved;
      this.setState(newInit);

      if (this.socket) {
        this.socket.emit("initiativeUpdated", {
          roomId: this.roomId,
          initiative: newInit
        });
      }

      namesInput.value = "";
      valuesInput.value = "";
    } catch (err) {
      console.error("Failed to set initiative:", err);
    }
  }
  async handleNext() {
    try {
      const saved = await nextTurn(this.roomId);
      const newInit = saved.initiative || saved;

      this.setState(newInit);

      if (this.socket) {
        this.socket.emit("initiativeUpdated", {
          roomId: this.roomId,
          initiative: newInit
        });
      }
    } catch (err) {
      console.error("Failed to advance initiative:", err);
    }
  }
async handleReset() {
  const emptyState = {
    order: [],
    currentIndex: 0,
    round: 1
  };

  try {
    const saved = await setInitiative(this.roomId, emptyState);
    const newInit = saved.initiative || saved;

    this.setState(newInit);

    if (this.socket) {
      this.socket.emit("initiativeUpdated", {
        roomId: this.roomId,
        initiative: newInit
      });
    }
  } catch (err) {
    console.error("Failed to reset initiative", err);
  }
}

}
