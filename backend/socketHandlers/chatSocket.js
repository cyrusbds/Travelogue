// socketHandlers/chatSocket.js
const Message = require("../models/Message");
const ChecklistItem = require("../models/ChecklistItem");

const typingUsers = {};

const registerChatEvents = (io, socket) => {
  // ── Shared trip room (itinerary, notes, packing, polls, voting) ──────────
  socket.on("join-trip", (tripId) => {
    if (tripId) socket.join(tripId);
  });

  // ─── CHAT EVENTS ──────────────────────────────────────────────────────────
  socket.on("chat:join", ({ tripId, user }) => {
    socket.join(`trip:${tripId}:chat`);
    socket.data.chatUser = user;
    socket.data.chatTripId = tripId;
  });

  socket.on("chat:send", async ({ tripId, content, sender, tempId }) => {
    if (!content?.trim()) return;
    try {
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

      socket.emit("chat:message", { ...payload, tempId });
      socket.to(`trip:${tripId}:chat`).emit("chat:message", payload);

      clearTyping(io, tripId, socket.id);
      socket.to(`trip:${tripId}:chat`).emit("chat:typing_update", {
        users: Object.values(typingUsers[tripId] || {}),
      });
    } catch (err) {
      console.error("chat:send error:", err);
      socket.emit("chat:error", { message: "Failed to send message" });
    }
  });

  socket.on("chat:typing_start", ({ tripId, name }) => {
    if (!typingUsers[tripId]) typingUsers[tripId] = {};
    typingUsers[tripId][socket.id] = name;
    socket.to(`trip:${tripId}:chat`).emit("chat:typing_update", {
      users: Object.values(typingUsers[tripId]),
    });
  });

  socket.on("chat:typing_stop", ({ tripId }) => {
    clearTyping(io, tripId, socket.id);
    socket.to(`trip:${tripId}:chat`).emit("chat:typing_update", {
      users: Object.values(typingUsers[tripId] || {}),
    });
  });

  socket.on("chat:delete", ({ tripId, messageId }) => {
    io.to(`trip:${tripId}:chat`).emit("chat:message_deleted", { messageId });
  });

  // ─── CHECKLIST EVENTS ─────────────────────────────────────────────────────
  socket.on("checklist:join", ({ tripId }) => {
    socket.join(`trip:${tripId}:checklist`);
  });

  socket.on("checklist:item_added", ({ tripId, item }) => {
    socket
      .to(`trip:${tripId}:checklist`)
      .emit("checklist:item_added", { item });
  });

  socket.on("checklist:item_updated", ({ tripId, item }) => {
    socket
      .to(`trip:${tripId}:checklist`)
      .emit("checklist:item_updated", { item });
  });

  socket.on("checklist:item_deleted", ({ tripId, itemId }) => {
    socket
      .to(`trip:${tripId}:checklist`)
      .emit("checklist:item_deleted", { itemId });
  });

  // ─── DISCONNECT ───────────────────────────────────────────────────────────
  socket.on("disconnect", () => {
    const tripId = socket.data.chatTripId;
    const user = socket.data.chatUser;
    if (tripId) {
      clearTyping(io, tripId, socket.id);
      if (typingUsers[tripId]) {
        socket.to(`trip:${tripId}:chat`).emit("chat:typing_update", {
          users: Object.values(typingUsers[tripId]),
        });
      }
      if (user) {
        socket.to(`trip:${tripId}:chat`).emit("chat:user_left", {
          name: user.name,
          timestamp: new Date().toISOString(),
        });
      }
    }
  });
};

const clearTyping = (io, tripId, socketId) => {
  if (typingUsers[tripId]) {
    delete typingUsers[tripId][socketId];
    if (Object.keys(typingUsers[tripId]).length === 0) {
      delete typingUsers[tripId];
    }
  }
};

module.exports = { registerChatEvents };
