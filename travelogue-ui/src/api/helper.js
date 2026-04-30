const BASE = import.meta.env.VITE_API_URL;

export const createSession = (body) =>
  fetch(`${BASE}/sessions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json());

export const joinSession = (body) =>
  fetch(`${BASE}/sessions/join`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json());

export const getMessages = (sessionId) =>
  fetch(`${BASE}/sessions/${sessionId}/messages`).then(r => r.json());

export default { createSession, joinSession, getMessages };