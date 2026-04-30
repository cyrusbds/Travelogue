// chatController.js - REST handlers for chat messages
const Message = require('../models/Message');
const Trip = require('../models/Trip');

// Helper: verify user has access to the trip (member or guest)
// IMPORTANT: JWT payload uses `id` (set in generateToken), NOT `_id`.
// Always use req.user?.id — never req.user?._id — or access checks will
// silently fail and return 403 even for valid logged-in users.
const verifyTripAccess = async (tripId, userId, guestId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) return false;

  if (userId) {
    const uid = userId.toString();
    if (trip.owner.toString() === uid) return true;
    if (trip.members.map(m => m.toString()).includes(uid)) return true;
  }

  if (guestId) return true;

  return false;
};

// GET /api/trips/:tripId/chat/messages
// Fetch paginated message history
const getMessages = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { before, limit = 50 } = req.query;

    // FIX: JWT payload uses `id` not `_id`
    const userId = req.user?.id;
    const guestId = req.guestSession?.guestId;

    const hasAccess = await verifyTripAccess(tripId, userId, guestId);
    if (!hasAccess) return res.status(403).json({ message: 'Access denied' });

    const query = { tripId };
    if (before) query.createdAt = { $lt: new Date(before) };

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    // Return in chronological order for the UI
    res.json({ messages: messages.reverse() });
  } catch (err) {
    console.error('getMessages error:', err);
    res.status(500).json({ message: 'Server error fetching messages' });
  }
};

// POST /api/trips/:tripId/chat/messages
const createMessage = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { content } = req.body;

    if (!content?.trim()) return res.status(400).json({ message: 'Content required' });

    // FIX: JWT payload uses `id` not `_id`
    const userId = req.user?.id;
    const guestId = req.guestSession?.guestId;
    const senderName = req.user?.name || req.guestSession?.nickname || 'Guest';

    const hasAccess = await verifyTripAccess(tripId, userId, guestId);
    if (!hasAccess) return res.status(403).json({ message: 'Access denied' });

    const message = await Message.create({
      tripId,
      sender: {
        userId: userId || null,
        name: senderName,
        isGuest: !userId,
        guestId: guestId || null,
      },
      content: content.trim(),
    });

    res.status(201).json({ message });
  } catch (err) {
    console.error('createMessage error:', err);
    res.status(500).json({ message: 'Server error saving message' });
  }
};

// DELETE /api/trips/:tripId/chat/messages/:messageId
const deleteMessage = async (req, res) => {
  try {
    const { tripId, messageId } = req.params;

    // FIX: JWT payload uses `id` not `_id`
    const userId = req.user?.id;

    const message = await Message.findOne({ _id: messageId, tripId });
    if (!message) return res.status(404).json({ message: 'Message not found' });

    const trip = await Trip.findById(tripId);
    const isOwner = trip?.owner.toString() === userId?.toString();
    const isSender = message.sender.userId?.toString() === userId?.toString();

    if (!isOwner && !isSender) return res.status(403).json({ message: 'Not authorized' });

    await message.deleteOne();
    res.json({ message: 'Message deleted' });
  } catch (err) {
    console.error('deleteMessage error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getMessages, createMessage, deleteMessage };