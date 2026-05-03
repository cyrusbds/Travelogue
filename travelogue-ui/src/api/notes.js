// api/notes.js

const BASE = import.meta.env.VITE_API_URL;

const authHeader = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("travelogue_token")}`,
});

const base = (tripId) => `${BASE}/trips/${tripId}/notes`;

/** Fetch all notes for a trip */
export const apiGetNotes = async (tripId) => {
  const res = await fetch(base(tripId), { headers: authHeader() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data; // { notes: [...] }
};

/** Create a new note */
export const apiCreateNote = async (tripId, payload) => {
  const res = await fetch(base(tripId), {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data; // { note }
};

/** Update an existing note */
export const apiUpdateNote = async (tripId, noteId, payload) => {
  const res = await fetch(`${base(tripId)}/${noteId}`, {
    method: "PATCH",
    headers: authHeader(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data; // { note }
};

/** Delete a note */
export const apiDeleteNote = async (tripId, noteId) => {
  const res = await fetch(`${base(tripId)}/${noteId}`, {
    method: "DELETE",
    headers: authHeader(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data; // { message }
};
