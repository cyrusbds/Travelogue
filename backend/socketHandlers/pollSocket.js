// socketHandlers/pollSocket.js
// Real-time poll events — mirrors the pattern in chatSocket.js
// Register this alongside registerChatEvents in server.js

const registerPollEvents = (io, socket) => {
  // ─── JOIN ─────────────────────────────────────────────────────────────────
  // Frontend: socket.emit('poll:join', { tripId })
  socket.on('poll:join', ({ tripId }) => {
    socket.join(`trip:${tripId}:polls`);
    socket.data.pollTripId = tripId;
  });

  // ─── CREATED ──────────────────────────────────────────────────────────────
  // REST controller broadcasts after DB save via io.to().emit().
  // This client-side relay handles edge cases (e.g. multiple tabs).
  socket.on('poll:created', ({ tripId, poll }) => {
    socket.to(`trip:${tripId}:polls`).emit('poll:created', { poll });
  });

  // ─── VOTE CAST ────────────────────────────────────────────────────────────
  // Relay vote update to everyone else in the room so progress bars update live.
  socket.on('poll:vote_cast', ({ tripId, poll }) => {
    socket.to(`trip:${tripId}:polls`).emit('poll:vote_cast', { poll });
  });

  // ─── CLOSED / DELETED ─────────────────────────────────────────────────────
  socket.on('poll:closed', ({ tripId, pollId }) => {
    io.to(`trip:${tripId}:polls`).emit('poll:closed', { pollId });
  });

  socket.on('poll:deleted', ({ tripId, pollId }) => {
    io.to(`trip:${tripId}:polls`).emit('poll:deleted', { pollId });
  });
};

module.exports = { registerPollEvents };