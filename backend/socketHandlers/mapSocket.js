// socketHandlers/mapSocket.js

function registerMapEvents(io, socket) {
  // ── Trip room ───────────
  socket.on("join-trip", (tripId) => {
    socket.join(`trip:${tripId}`);
    console.log(`Socket ${socket.id} joined trip:${tripId}`);
  });

  // ── Map room ─────────────────────────────────────
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

  // ── Handle ungraceful disconnects ─────────────────────────────────────────
  socket.on("disconnect", async () => {
    const rooms = [...socket.rooms].filter((r) => r.startsWith("map:"));
    for (const room of rooms) {
      socket.leave(room);
      const sockets = await io.in(room).allSockets();
      const count = sockets.size;
      io.to(room).emit("map-viewer-count", count);
    }
  });
}

module.exports = { registerMapEvents };
