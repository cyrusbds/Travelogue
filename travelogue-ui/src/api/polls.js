// api/polls.js
// Follows the exact same pattern as trips.js — fetch + authHeader.

const BASE = "http://localhost:5000/api/trips";

const authHeader = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("travelogue_token")}`,
});

// ── Get all polls for a trip ──────────────────────────────────────────────────
export async function apiGetPolls(tripId) {
  const res  = await fetch(`${BASE}/${tripId}/polls`, { headers: authHeader() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data; // { polls: [...] }
}

// ── Create a poll ─────────────────────────────────────────────────────────────
// payload: { question, description, options[], expiresAt, anonymous, multipleSelection }
export async function apiCreatePoll(tripId, payload) {
  const res  = await fetch(`${BASE}/${tripId}/polls`, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data; // { poll }
}

// ── Cast / change a vote ──────────────────────────────────────────────────────
// optionIndexes: number[]  e.g. [0] or [0, 2] for multi-select
export async function apiVotePoll(tripId, pollId, optionIndexes) {
  const res  = await fetch(`${BASE}/${tripId}/polls/${pollId}/vote`, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify({ optionIndexes }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data; // { poll }
}

// ── Update a poll (only before any votes) ────────────────────────────────────
export async function apiUpdatePoll(tripId, pollId, payload) {
  const res  = await fetch(`${BASE}/${tripId}/polls/${pollId}`, {
    method: "PATCH",
    headers: authHeader(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data; // { poll }
}

// ── Close a poll ──────────────────────────────────────────────────────────────
export async function apiClosePoll(tripId, pollId) {
  const res  = await fetch(`${BASE}/${tripId}/polls/${pollId}/close`, {
    method: "POST",
    headers: authHeader(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data; // { poll }
}

// ── Delete a poll ─────────────────────────────────────────────────────────────
export async function apiDeletePoll(tripId, pollId) {
  const res  = await fetch(`${BASE}/${tripId}/polls/${pollId}`, {
    method: "DELETE",
    headers: authHeader(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data; // { message }
}