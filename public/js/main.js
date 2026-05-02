"use strict";

import { fetchRooms, createRoom } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("create-room-form");
  const nameInput = document.getElementById("create-room-name");
  const roomList = document.getElementById("room-list");
  async function loadRooms() {
    roomList.innerHTML = "<li>Loading...</li>";
    try {
      const rooms = await fetchRooms();
      if (!rooms.length) {
        roomList.innerHTML = "<li>No rooms yet. Create one!</li>";
        return;
      }
      roomList.innerHTML = "";
      for (const room of rooms) {
        const li = document.createElement("li");
        li.innerHTML = `
  <span>${room.name}</span>
  <a href="/room/${encodeURIComponent(room.id)}">Join</a>
`;
        roomList.appendChild(li);
      }
    } catch (err) {
      console.error(err);
      roomList.innerHTML = `<li>Error loading rooms: ${err.message}</li>`;
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    if (!name) return;

    try {
      const room = await createRoom(name);
      window.location.href = `/room/${encodeURIComponent(room.id)}`;
    } catch (err) {
      alert("Failed to create room: " + err.message);
    }
  });

  loadRooms();
});
