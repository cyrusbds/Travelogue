// Message.js - MongoDB schema for group chat messages
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      index: true, // Index for fast trip-based queries
    },
    sender: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null, // null for guest users
      },
      name: { type: String, required: true, trim: true },
      isGuest: { type: Boolean, default: false },
      guestId: { type: String, default: null }, // guest session id
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    type: {
      type: String,
      enum: ['text', 'system'], // system = join/leave messages
      default: 'text',
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

// Compound index: fetch all messages for a trip sorted by time
messageSchema.index({ tripId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);