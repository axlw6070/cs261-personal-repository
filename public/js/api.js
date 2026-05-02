"use strict";

async function apiRequest(path, options = {}) {
  const res = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  if (!res.ok) {
    let message = "Request failed";
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch (_) {}
    throw new Error(message);
  }

  if (res.status === 204) return null;
  return res.json();
}

// Rooms 

export async function fetchRooms() {
  return apiRequest("/api/rooms");
}

export async function createRoom(name) {
  return apiRequest("/api/rooms", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function fetchRoom(id) {
  return apiRequest(`/api/rooms/${encodeURIComponent(id)}`);
}


export async function updateRoom(id, partial) {
  return apiRequest(`/api/rooms/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(partial),
  });
}
export async function deleteRoom(id) {
  return apiRequest(`/api/rooms/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
// Initiative 
export async function setInitiative(roomId, initiativeState) {
  return apiRequest(`/api/rooms/${encodeURIComponent(roomId)}/initiative`, {
    method: "PUT",
    body: JSON.stringify(initiativeState),
  });
}

export async function nextTurn(roomId) {
  return apiRequest(`/api/rooms/${encodeURIComponent(roomId)}/initiative/next`, {
    method: "POST",
  });
}

//  Maps 

export async function fetchMaps() {
  return apiRequest("/api/maps");
}

export async function fetchMap(id) {
  return apiRequest(`/api/maps/${encodeURIComponent(id)}`);
}


export async function createMap(data = {}) {
  return apiRequest("/api/maps", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function uploadMapImage(mapId, file) {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`/api/maps/${encodeURIComponent(mapId)}/image`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    let msg = "Failed to upload map image";
    try {
      const j = await res.json();
      if (j?.error) msg = j.error;
    } catch (_) {}
    throw new Error(msg);
  }

  return res.json();
}

// Tokens 

// Tokens 

// 新增：创建一个 token
export async function createToken(mapId, tokenData) {
  return apiRequest(
    `/api/maps/${encodeURIComponent(mapId)}/tokens`,
    {
      method: "POST",
      body: JSON.stringify(tokenData),
    }
  );
}

// 更新 token 位置等
export async function updateToken(mapId, tokenId, partial) {
  return apiRequest(
    `/api/maps/${encodeURIComponent(mapId)}/tokens/${encodeURIComponent(tokenId)}`,
    {
      method: "PUT",
      body: JSON.stringify(partial),
    }
  );
}

// （可选）删除 token
export async function deleteToken(mapId, tokenId) {
  return apiRequest(
    `/api/maps/${encodeURIComponent(mapId)}/tokens/${encodeURIComponent(tokenId)}`,
    {
      method: "DELETE",
    }
  );
}


// Fog 

export async function updateFog(mapId, fog) {
  return apiRequest(`/api/maps/${encodeURIComponent(mapId)}/fog`, {
    method: "PUT",
    body: JSON.stringify({ enabled: fog.enabled }),
  });
}

export async function updateFogCells(mapId, cells) {
  return apiRequest(`/api/maps/${encodeURIComponent(mapId)}/fog/cells`, {
    method: "PUT",
    body: JSON.stringify({ clearedCells: cells }),
  });
}

// Dice 

export async function rollDice(faces, count = 1) {
  const params = new URLSearchParams({
    faces: faces + "",
    count: count + "",
  });

  return apiRequest(`/api/dice/roll?${params.toString()}`);
}
