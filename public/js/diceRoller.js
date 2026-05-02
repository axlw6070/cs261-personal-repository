"use strict";

import { rollDice } from "./api.js";

export class DiceRoller {
  constructor(container) {
    this.container = container;
    this.render();
  }
render() {
    this.container.innerHTML = `
      <div class="dice-row">
        <label>Faces:</label>
        <select id="dice-faces">
          <option value="4">d4</option>
          <option value="6">d6</option>
          <option value="8">d8</option>
          <option value="10">d10</option>
          <option value="12">d12</option>
          <option value="20" selected>d20</option>
          <option value="100">d100</option>
        </select>
      </div>
      <div class="dice-row">
        <label>Count:</label>
        <input type="number" id="dice-count" value="1" min="1" max="20" />
        <button id="dice-roll-btn">Roll</button>
      </div>
      <div id="dice-result"></div>
    `;

    this.container
      .querySelector("#dice-roll-btn")
      .addEventListener("click", () => this.handleRoll());
  }
  async handleRoll() {
    const facesEl = this.container.querySelector("#dice-faces");
    const countEl = this.container.querySelector("#dice-count");
    const resultEl = this.container.querySelector("#dice-result");

    const faces = Number(facesEl.value);
    const count = Number(countEl.value);

    resultEl.textContent = "Rolling...";

    try {
      const res = await rollDice(faces, count);
      resultEl.textContent = `Rolls: ${res.rolls.join(
        ", "
      )} (total: ${res.total})`;
    } catch (err) {
      console.error(err);
      resultEl.textContent = "Error rolling dice: " + err.message;
    }
  }
}
