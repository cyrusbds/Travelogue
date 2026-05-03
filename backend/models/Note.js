// models/Note.js
const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    content: { type: String, default: "" },
    tag: {
      type: String,
      enum: ["idea", "reminder", "important", "general"],
      default: "general",
    },
    pinned: { type: Boolean, default: false },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Note", noteSchema);
