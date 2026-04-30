const mongoose = require("mongoose");
const crypto   = require("crypto");

const inviteLinkSchema = new mongoose.Schema({
  tripId:      { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true, index: true },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  token:       { type: String, unique: true, default: () => crypto.randomBytes(20).toString("hex") },
  role:        { type: String, enum: ["member", "viewer"], default: "member" },
  guestAccess: { type: Boolean, default: false },
  maxUses:     { type: Number, default: null }, // null = unlimited
  currentUses: { type: Number, default: 0 },
  expiresAt:   { type: Date, default: null },   // null = never expires
  active:      { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("InviteLink", inviteLinkSchema);