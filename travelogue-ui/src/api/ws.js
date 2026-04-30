const WS_BASE = import.meta.env.VITE_WS_URL;

export function connectWS(sessionId, memberId, onMessage) {
  const ws = new WebSocket(`${WS_BASE}/ws/${sessionId}/${memberId}`);
  ws.onmessage = (e) => onMessage(JSON.parse(e.data));
  ws.onclose = () => console.log('WS disconnected');
  return ws;
}