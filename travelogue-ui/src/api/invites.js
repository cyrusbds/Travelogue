const BASE = "http://localhost:5000/api/invites";

const authHeader = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("travelogue_token")}`,
});

export async function apiGetInviteLinks(tripId) {
  const res  = await fetch(`${BASE}/${tripId}`, { headers: authHeader() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data; // { links: [] }
}

export async function apiGenerateInviteLink(tripId, settings = {}) {
  const res  = await fetch(`${BASE}/${tripId}`, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(settings),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data; // { link }
}

export async function apiRevokeInviteLink(tripId, linkId) {
  const res  = await fetch(`${BASE}/${tripId}/${linkId}`, {
    method: "DELETE",
    headers: authHeader(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

export async function apiRemoveMember(tripId, memberId) {
  const res  = await fetch(`${BASE}/${tripId}/members/${memberId}`, {
    method: "DELETE",
    headers: authHeader(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

export async function apiValidateInvite(token) {
  const res  = await fetch(`${BASE}/join/${token}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data; // { valid, trip, role, guestAccess }
}

export async function apiJoinTrip(token, nickname = null) {
  const res  = await fetch(`${BASE}/join/${token}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(localStorage.getItem("travelogue_token")
        ? { Authorization: `Bearer ${localStorage.getItem("travelogue_token")}` }
        : {}),
    },
    body: JSON.stringify(nickname ? { nickname } : {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data; // { tripId } or { tripId, guest, nickname }
}