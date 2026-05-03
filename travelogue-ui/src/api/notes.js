import api from "./axios";

export const apiGetNotes = (tripId) =>
  api.get(`/trips/${tripId}/notes`).then((r) => r.data);

export const apiCreateNote = (tripId, data) =>
  api.post(`/trips/${tripId}/notes`, data).then((r) => r.data);

export const apiUpdateNote = (tripId, noteId, data) =>
  api.patch(`/trips/${tripId}/notes/${noteId}`, data).then((r) => r.data);

export const apiDeleteNote = (tripId, noteId) =>
  api.delete(`/trips/${tripId}/notes/${noteId}`).then((r) => r.data);
