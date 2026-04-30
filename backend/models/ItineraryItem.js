const mongoose = require("mongoose");

const itineraryItemSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    startTime: {
      type: String, // "HH:MM" format
      default: "",
    },
    endTime: {
      type: String, // "HH:MM" format
      default: "",
    },
    location: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
    category: {
      type: String,
      enum: ["explore", "food", "stay", "transport", "other"],
      default: "explore",
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    image: {
      type: String, // URL or base64
      default: "",
    },
    // orderIndex controls sort order within a day
    orderIndex: {
      type: Number,
      default: 0,
      index: true,
    },
    // Optional color label for visual grouping
    color: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Compound index for efficient per-trip, per-date queries
itineraryItemSchema.index({ tripId: 1, date: 1, orderIndex: 1 });

module.exports = mongoose.model("ItineraryItem", itineraryItemSchema);