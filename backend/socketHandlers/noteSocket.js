// noteSocket.js;

module.exports = function registerNoteSocket(socket, io) {
  socket.on("notes:join", ({ tripId }) => {
    if (!tripId) return;
    socket.join(`trip:${tripId}:notes`);
    console.log(`Socket ${socket.id} joined notes room: ${tripId}`);
  });

  socket.on("notes:pin", ({ tripId, noteId, pinned }) => {
    if (!tripId || !noteId) return;
    socket.to(`trip:${tripId}:notes`).emit("notes:pinned", { noteId, pinned });
  });
};
