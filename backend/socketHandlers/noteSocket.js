/**
 * noteSocket.js
 * Handles the socket side of notes — joining trip rooms so that
 * REST controller emits (noteCreated / noteUpdated / noteDeleted)
 * are delivered to every connected client in that room.
 *
 * The frontend NotesPanel already calls:
 *   socket.emit("chat:join", { tripId })   ← reuses the chat join event
 * so no extra join logic is needed here unless you want a dedicated event.
 */

module.exports = function registerNoteSocket(socket, io) {
  // Optional: dedicated join event for notes if you ever split rooms
  socket.on("notes:join", ({ tripId }) => {
    if (!tripId) return;
    socket.join(tripId);
    console.log(`Socket ${socket.id} joined notes room: ${tripId}`);
  });

  // Optional: client-side optimistic pin toggle broadcast
  // (the REST PUT already emits noteUpdated, so this is a fallback)
  socket.on("notes:pin", ({ tripId, noteId, pinned }) => {
    if (!tripId || !noteId) return;
    socket.to(tripId).emit("notes:pinned", { noteId, pinned });
  });
};
