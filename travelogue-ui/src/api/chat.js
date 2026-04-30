// src/api/chat.js - Axios helpers for chat & checklist REST endpoints
import axios from 'axios';

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });

// Attach JWT or guest token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('travelogue_token');
  const guestToken = localStorage.getItem('guestToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (guestToken) config.headers['x-guest-token'] = guestToken;
  return config;
});

// ─── CHAT ────────────────────────────────────────────────────────────────────
export const fetchMessages = (tripId, before, limit = 50) =>
  API.get(`/trips/${tripId}/chat/messages`, { params: { before, limit } });

export const sendMessage = (tripId, content) =>
  API.post(`/trips/${tripId}/chat/messages`, { content });

export const deleteMessage = (tripId, messageId) =>
  API.delete(`/trips/${tripId}/chat/messages/${messageId}`);

// ─── CHECKLIST ───────────────────────────────────────────────────────────────
export const fetchChecklist = (tripId) => API.get(`/trips/${tripId}/checklist`);

export const addChecklistItem = (tripId, payload) =>
  API.post(`/trips/${tripId}/checklist`, payload);

export const updateChecklistItem = (tripId, itemId, payload) =>
  API.patch(`/trips/${tripId}/checklist/${itemId}`, payload);

export const deleteChecklistItem = (tripId, itemId) =>
  API.delete(`/trips/${tripId}/checklist/${itemId}`);