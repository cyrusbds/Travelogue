// Checklist.js - MongoDB schema for shared packing checklist
const mongoose = require('mongoose');

const checklistItemSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    assignedTo: {
      // Optional: assign item to a member
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      name: { type: String, default: null },
    },
    createdBy: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      name: { type: String, required: true },
      isGuest: { type: Boolean, default: false },
    },
    category: {
      type: String,
      enum: ['clothing', 'toiletries', 'documents', 'electronics', 'medical', 'other'],
      default: 'other',
    },
    completedAt: { type: Date, default: null },
    completedBy: { type: String, default: null },
  },
  { timestamps: true }
);

checklistItemSchema.index({ tripId: 1, createdAt: 1 });

module.exports = mongoose.model('ChecklistItem', checklistItemSchema);