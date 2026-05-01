// socketHandlers/mapSocket.js
// Handles real-time map collaboration:

function registerMapEvents(io, socket) {
  socket.on("join-trip-map", async (tripId) => {
    const room = `map:${tripId}`;
    socket.join(room);

    const sockets = await io.in(room).allSockets();
    const count = sockets.size;

    io.to(room).emit("map-viewer-count", count);

    console.log(`Socket ${socket.id} joined ${room} — ${count} viewer(s)`);
  });

  socket.on("leave-trip-map", async (tripId) => {
    const room = `map:${tripId}`;
    socket.leave(room);

    const sockets = await io.in(room).allSockets();
    const count = sockets.size;

    io.to(room).emit("map-viewer-count", count);

    console.log(
      `Socket ${socket.id} left ${room} — ${count} viewer(s) remaining`,
    );
  });

  socket.on("disconnect", async () => {
    const rooms = [...socket.rooms].filter((r) => r.startsWith("map:"));

    for (const room of rooms) {
      socket.leave(room);
      const sockets = await io.in(room).allSockets();
      const count = sockets.size;
      io.to(room).emit("map-viewer-count", count);
      console.log(
        `Socket ${socket.id} disconnected from ${room} — ${count} viewer(s) remaining`,
      );
    }
  });
}

module.exports = { registerMapEvents };
