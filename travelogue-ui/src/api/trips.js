const BASE = "http://localhost:5000/api/trips";

const authHeader = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("travelogue_token")}`,
});

// ── Trips ────────────────────────────────────────────────────────────────────

export async function apiGetTrips() {
  const res  = await fetch(BASE, { headers: authHeader() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

export async function apiGetTrip(id) {
  const res  = await fetch(`${BASE}/${id}`, { headers: authHeader() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

export async function apiCreateTrip(trip) {
  const res  = await fetch(BASE, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(trip),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

export async function apiDeleteTrip(id) {
  const res  = await fetch(`${BASE}/${id}`, {
    method: "DELETE",
    headers: authHeader(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

// ── Activities ───────────────────────────────────────────────────────────────

export async function apiAddActivity(tripId, activity) {
  const res  = await fetch(`${BASE}/${tripId}/activities`, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(activity),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

export async function apiDeleteActivity(tripId, actId) {
  const res  = await fetch(`${BASE}/${tripId}/activities/${actId}`, {
    method: "DELETE",
    headers: authHeader(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

// ── Map Pins ─────────────────────────────────────────────────────────────────

export async function apiAddPin(tripId, pin) {
  const res  = await fetch(`${BASE}/${tripId}/pins`, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(pin),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

export async function apiDeletePin(tripId, pinId) {
  const res  = await fetch(`${BASE}/${tripId}/pins/${pinId}`, {
    method: "DELETE",
    headers: authHeader(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

// ── Budget & Expenses ────────────────────────────────────────────────────────

export async function apiSetBudget(tripId, budget) {
  const res  = await fetch(`${BASE}/${tripId}/budget`, {
    method: "PATCH",
    headers: authHeader(),
    body: JSON.stringify({ budget }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

export async function apiAddExpense(tripId, expense) {
  const res  = await fetch(`${BASE}/${tripId}/expenses`, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(expense),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

export async function apiDeleteExpense(tripId, expId) {
  const res  = await fetch(`${BASE}/${tripId}/expenses/${expId}`, {
    method: "DELETE",
    headers: authHeader(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

// ── Votes ────────────────────────────────────────────────────────────────────

export async function apiAddVote(tripId, voteData) {
  const res  = await fetch(`${BASE}/${tripId}/votes`, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(voteData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

export async function apiCastVote(tripId, voteId, optionIndex) {
  const res  = await fetch(`${BASE}/${tripId}/votes/${voteId}/cast`, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify({ optionIndex }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

// ── Messages ─────────────────────────────────────────────────────────────────

export async function apiGetMessages(tripId) {
  const res  = await fetch(`${BASE}/${tripId}/messages`, { headers: authHeader() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

export async function apiSendMessage(tripId, msg) {
  const res  = await fetch(`${BASE}/${tripId}/messages`, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(msg),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

// ── Packing ──────────────────────────────────────────────────────────────────

export async function apiAddPackItem(tripId, item) {
  const res  = await fetch(`${BASE}/${tripId}/pack`, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(item),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

export async function apiTogglePackItem(tripId, itemId) {
  const res  = await fetch(`${BASE}/${tripId}/pack/${itemId}/toggle`, {
    method: "PATCH",
    headers: authHeader(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

export async function apiDeletePackItem(tripId, itemId) {
  const res  = await fetch(`${BASE}/${tripId}/pack/${itemId}`, {
    method: "DELETE",
    headers: authHeader(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}