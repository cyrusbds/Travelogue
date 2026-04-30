const BASE = "http://localhost:5000/api";

const authHeader = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("travelogue_token")}`,
});

const base = (tripId) => `${BASE}/trips/${tripId}/itinerary`;

/** Fetch all itinerary items for a trip */
export const apiGetItinerary = async (tripId) => {
  const res = await fetch(base(tripId), { headers: authHeader() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

/** Create a new itinerary item */
export const apiCreateItem = async (tripId, payload) => {
  const res = await fetch(base(tripId), {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

/** Update an existing itinerary item */
export const apiUpdateItem = async (tripId, itemId, payload) => {
  const res = await fetch(`${base(tripId)}/${itemId}`, {
    method: "PUT",
    headers: authHeader(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

/** Delete an itinerary item */
export const apiDeleteItem = async (tripId, itemId) => {
  const res = await fetch(`${base(tripId)}/${itemId}`, {
    method: "DELETE",
    headers: authHeader(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

/** Bulk reorder items */
export const apiReorderItems = async (tripId, updates) => {
  const res = await fetch(`${base(tripId)}/reorder`, {
    method: "PUT",
    headers: authHeader(),
    body: JSON.stringify({ updates }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};