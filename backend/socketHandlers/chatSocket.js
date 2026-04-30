// chatSocket.js - Socket.IO event handlers for real-time chat & checklist
const Message = require('../models/Message');
const ChecklistItem = require('../models/ChecklistItem');

// Track typing users per trip room: { tripId: { socketId: name } }
const typingUsers = {};

const registerChatEvents = (io, socket) => {
  // ─── CHAT EVENTS ──────────────────────────────────────────────────────────

  // Client joins a trip chat room
  socket.on('chat:join', ({ tripId, user }) => {
    socket.join(`trip:${tripId}:chat`);
    socket.data.chatUser = user;
    socket.data.chatTripId = tripId;

    // NOTE: We intentionally do NOT broadcast a join system message here.
    // Doing so caused a "X joined" spam message on every page load/refresh.
  });

  // Client sends a new message
  socket.on('chat:send', async ({ tripId, content, sender, tempId }) => {
    if (!content?.trim()) return;

    try {
      // Persist message to MongoDB
      const message = await Message.create({
        tripId,
        sender: {
          userId: sender.userId || null,
          name: sender.name,
          isGuest: sender.isGuest || false,
          guestId: sender.guestId || null,
        },
        content: content.trim(),
      });

      const payload = {
        _id: message._id,
        tripId,
        sender: message.sender,
        content: message.content,
        createdAt: message.createdAt,
      };

      // Send back to SENDER only — includes tempId so client can
      // swap the optimistic bubble with the real persisted message.
      socket.emit('chat:message', { ...payload, tempId });

      // Broadcast to everyone ELSE in the room (no tempId needed).
      socket.to(`trip:${tripId}:chat`).emit('chat:message', payload);

      // Clear typing for this sender
      clearTyping(io, tripId, socket.id);
      socket.to(`trip:${tripId}:chat`).emit('chat:typing_update', {
        users: Object.values(typingUsers[tripId] || {}),
      });
    } catch (err) {
      console.error('chat:send error:', err);
      socket.emit('chat:error', { message: 'Failed to send message' });
    }
  });

  // Typing indicator start
  socket.on('chat:typing_start', ({ tripId, name }) => {
    if (!typingUsers[tripId]) typingUsers[tripId] = {};
    typingUsers[tripId][socket.id] = name;

    // Broadcast to others only (not sender)
    socket.to(`trip:${tripId}:chat`).emit('chat:typing_update', {
      users: Object.values(typingUsers[tripId]),
    });
  });

  // Typing indicator stop
  socket.on('chat:typing_stop', ({ tripId }) => {
    clearTyping(io, tripId, socket.id);
    socket.to(`trip:${tripId}:chat`).emit('chat:typing_update', {
      users: Object.values(typingUsers[tripId] || {}),
    });
  });

  // Message delete — after REST delete succeeds, broadcast removal
  socket.on('chat:delete', ({ tripId, messageId }) => {
    io.to(`trip:${tripId}:chat`).emit('chat:message_deleted', { messageId });
  });

  // ─── CHECKLIST EVENTS ─────────────────────────────────────────────────────

  socket.on('checklist:join', ({ tripId }) => {
    socket.join(`trip:${tripId}:checklist`);
  });

  // New item added
  socket.on('checklist:item_added', ({ tripId, item }) => {
    socket.to(`trip:${tripId}:checklist`).emit('checklist:item_added', { item });
  });

  // Item updated (toggle, rename, etc.)
  socket.on('checklist:item_updated', ({ tripId, item }) => {
    socket.to(`trip:${tripId}:checklist`).emit('checklist:item_updated', { item });
  });

  // Item deleted
  socket.on('checklist:item_deleted', ({ tripId, itemId }) => {
    socket.to(`trip:${tripId}:checklist`).emit('checklist:item_deleted', { itemId });
  });

  // ─── CLEANUP ON DISCONNECT ────────────────────────────────────────────────
  socket.on('disconnect', () => {
    const tripId = socket.data.chatTripId;
    const user = socket.data.chatUser;

    if (tripId) {
      clearTyping(io, tripId, socket.id);
      if (typingUsers[tripId]) {
        socket.to(`trip:${tripId}:chat`).emit('chat:typing_update', {
          users: Object.values(typingUsers[tripId]),
        });
      }
      // Notify room of departure (only on real disconnect, not page refresh noise)
      if (user) {
        socket.to(`trip:${tripId}:chat`).emit('chat:user_left', {
          name: user.name,
          timestamp: new Date().toISOString(),
        });
      }
    }
  });
};

// Helper: remove user from typing tracker
const clearTyping = (io, tripId, socketId) => {
  if (typingUsers[tripId]) {
    delete typingUsers[tripId][socketId];
    if (Object.keys(typingUsers[tripId]).length === 0) {
      delete typingUsers[tripId];
    }
  }
};

module.exports = { registerChatEvents };