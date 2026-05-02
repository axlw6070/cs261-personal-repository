"use strict";

import {
  fetchRoom,
  fetchMap,
  uploadMapImage,
  createMap,
  updateRoom,
  deleteRoom,
  createToken,     
  deleteToken 
} from "./api.js";
import { MapCanvas } from "./mapCanvas.js";
import { TokenController } from "./tokenController.js";
import { FogController } from "./fogController.js";
import { InitiativeUI } from "./initiative.js";
import { DiceRoller } from "./diceRoller.js";
// const socket = io();

document.addEventListener("DOMContentLoaded", async () => {

  const match = window.location.pathname.match(/^\/rooms?\/([^/]+)/);
  const roomId = match ? decodeURIComponent(match[1]) : null;

  if (!roomId) {
    alert("Missing roomId");
    window.location.href = "/";
    return;
  }

  const socket = null;

  const titleEl       = document.getElementById("room-title");
  const canvas        = document.getElementById("map-canvas");
  const playerList    = document.getElementById("player-list");
  const initContainer = document.getElementById("initiative-container");
  const diceContainer = document.getElementById("dice-container");
  const btnGM         = document.getElementById("btn-gm-toggle");
  const btnFog        = document.getElementById("btn-fog-toggle");
  const uploadInput   = document.getElementById("map-upload-input");
  const btnBackHome   = document.getElementById("btn-back-home");
  const btnDeleteRoom = document.getElementById("btn-delete-room");

  const tokenNameInput  = document.getElementById("token-name-input");
  const tokenColorInput = document.getElementById("token-color-input");
  const btnAddToken     = document.getElementById("btn-add-token");
  const tokenList       = document.getElementById("token-list");



  
  const mapCanvas = new MapCanvas(canvas);
  let tokenController = null;
  let fogController   = null;
  const initiativeUI  = new InitiativeUI(initContainer, { roomId, socket });
  new DiceRoller(diceContainer);

  let isGM = false;
  let currentMapId = null;

function renderTokenList(map) {
  if (!tokenList) return;
  tokenList.innerHTML = "";

  const tokens = map?.tokens || [];
  tokens.forEach((t) => {
    const li = document.createElement("li");
    li.style.display = "flex";
    li.style.justifyContent = "space-between";
    li.style.alignItems = "center";
    li.style.marginBottom = "4px";

    const infoSpan = document.createElement("span");
    infoSpan.textContent = `${t.name} (${t.x}, ${t.y})`;

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.classList.add("btn-delete-token");
    delBtn.dataset.tokenId = t.id;

    li.appendChild(infoSpan);
    li.appendChild(delBtn);
    tokenList.appendChild(li);
  });
}


  
  function setGMMode(newValue) {
    isGM = newValue;
    btnGM.textContent = isGM ? "Switch to Player View" : "Switch to GM View";
    if (fogController) {
      fogController.setGMMode(isGM);
    }
  }

  btnGM.addEventListener("click", () => {
    setGMMode(!isGM);
  });

  btnFog.addEventListener("click", async () => {
    if (!fogController) return;
    await fogController.toggleFog();
  });
// Back to Home
if (btnBackHome) {
  btnBackHome.addEventListener("click", () => {
    window.location.href = "/";
  });
}
// Delete Room
if (btnDeleteRoom) {
  btnDeleteRoom.addEventListener("click", async () => {
    const ok = window.confirm(
      "Are you sure you want to delete this room? This action cannot be undone."
    );
    if (!ok) return;

    try {
      await deleteRoom(roomId);
      alert("Room deleted successfully.");
      window.location.href = "/";
    } catch (err) {
      console.error("Failed to delete room:", err);
      alert("Failed to delete room: " + err.message);
    }
  });
}
  // Add Token 
  if (btnAddToken) {
    btnAddToken.addEventListener("click", async () => {
      if (!currentMapId) {
        alert("No map is assigned to this room yet.");
        return;
      }
      const name = (tokenNameInput?.value || "").trim();
      const color = tokenColorInput?.value || "#ff0000";

      if (!name) {
        alert("Please enter a token name.");
        return;
      }

      try {

        await createToken(currentMapId, {
          name,
          x: 0,
          y: 0,
          color,
          isGM: false
        });


        tokenNameInput.value = "";

 
        await loadRoom();
      } catch (err) {
        console.error("Failed to create token:", err);
        alert("Failed to create token: " + err.message);
      }
    });
  }
//  Delete token
if (tokenList) {
  tokenList.addEventListener("click", async (e) => {
    const target = e.target;
    if (!target.classList.contains("btn-delete-token")) return;

    const tokenId = target.dataset.tokenId;
    if (!tokenId || !currentMapId) return;

    const ok = window.confirm("Are you sure you want to delete this token?");
    if (!ok) return;

    try {
      await deleteToken(currentMapId, tokenId);
      await loadRoom();  
    } catch (err) {
      console.error("Failed to delete token:", err);
      alert("Failed to delete token: " + err.message);
    }
  });
}



  
  if (uploadInput) {
    uploadInput.addEventListener("change", async () => {
      if (!uploadInput.files.length) return;
      if (!currentMapId) {
        alert("This room has no map bound yet, cannot upload image.");
        uploadInput.value = "";
        return;
      }

      const file = uploadInput.files[0];
      try {
        await uploadMapImage(currentMapId, file);
        await loadRoom();  
        uploadInput.value = "";
      } catch (err) {
        console.error("Failed to upload map image:", err);
        alert("Failed to upload map image: " + err.message);
      }
    });
  }

  async function loadRoom() {
    let room = await fetchRoom(roomId);
    titleEl.textContent = `Room: ${room.name || roomId}`;

    if (!room.mapId) {
      const newMap = await createMap({
        name: `${room.name || "Room"} map`,
        width: 30,
        height: 20,
        gridSize: 32
      });

      room = await updateRoom(roomId, { mapId: newMap.id });
    }

    // players
    playerList.innerHTML = "";
    for (const p of room.players || []) {
      const li = document.createElement("li");
      li.textContent = p.name + (p.isGM ? " (GM)" : "");
      playerList.appendChild(li);
    }
    if (room.initiative) {
      initiativeUI.setState(room.initiative);
    }
    if (room.mapId) {
      const map = await fetchMap(room.mapId);
      currentMapId = map.id;

      mapCanvas.setState({
        map,
        tokens: map.tokens || [],
        fog: map.fog || null
      });
      renderTokenList(map);
      if (!tokenController) {
        tokenController = new TokenController(mapCanvas, {
          roomId,
          mapId: map.id,
          socket
        });
      }
      if (!fogController) {
        fogController = new FogController(mapCanvas, {
          roomId,
          mapId: map.id,
          socket
        });
      }
    } else {
      currentMapId = null;
    }
  }
  await loadRoom();
});
