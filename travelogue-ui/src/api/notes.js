const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function authHeaders() {
  const token = localStorage.getItem("travelogue_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleRes(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

export const apiGetNotes = (tripId) =>
  fetch(`${BASE}/trips/${tripId}/notes`, {
    headers: authHeaders(),
  }).then(handleRes);

export const apiCreateNote = (tripId, body) =>
  fetch(`${BASE}/trips/${tripId}/notes`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  }).then(handleRes);

export const apiUpdateNote = (tripId, noteId, body) =>
  fetch(`${BASE}/trips/${tripId}/notes/${noteId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(body),
  }).then(handleRes);

export const apiDeleteNote = (tripId, noteId) =>
  fetch(`${BASE}/trips/${tripId}/notes/${noteId}`, {
    method: "DELETE",
    headers: authHeaders(),
  }).then(handleRes);
