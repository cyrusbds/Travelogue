const BASE = import.meta.env.VITE_API_URL;

export const createSession = (body) =>
  fetch(`${BASE}/trips`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => r.json());

export const joinSession = (body) =>
  fetch(`${BASE}/trips/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => r.json());

export const getMessages = (sessionId) =>
  fetch(`${BASE}/trips/${sessionId}/messages`).then((r) => r.json());

export default { createSession, joinSession, getMessages };
