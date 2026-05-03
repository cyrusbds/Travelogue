// socketHandlers/noteSocket.js
module.exports = function registerNoteSocket(socket, io) {
  // Room name matches req.io.to(tripId) in noteController
  socket.on("join-trip", (tripId) => {
    if (!tripId) return;
    socket.join(tripId);
  });

  socket.on("notes:pin", ({ tripId, noteId, pinned }) => {
    if (!tripId || !noteId) return;
    socket.to(tripId).emit("notes:pinned", { noteId, pinned });
  });
};
