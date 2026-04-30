const mongoose = require("mongoose");

// ── Sub-schemas ──────────────────────────────────────────────────────────────

const activitySchema = new mongoose.Schema({
  name:    { type: String, required: true },
  day:     { type: String, required: true },   // "Day 1 — Mar 12"
  time:    { type: String, default: "10:00" },
  type:    { type: String, enum: ["explore","food","stay","transport"], default: "explore" },
  location:{ type: String },
  notes:   { type: String },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

const pinSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  desc:     { type: String },
  day:      { type: String },
  category: { type: String, enum: ["explore","food","stay","transport"], default: "explore" },
  lat:      { type: Number },   // real coordinates from geocoding
  lng:      { type: Number },
  photos:   [{ type: String }], // URLs to uploaded photos
  notes:    { type: String },
  addedBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

const expenseSchema = new mongoose.Schema({
  desc:     { type: String, required: true },
  amount:   { type: Number, required: true },
  paidBy:   { type: String, required: true },   // member name (simple string for now)
  category: { type: String, default: "Other" },
  addedBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

const voteOptionSchema = new mongoose.Schema({
  label:  { type: String, required: true },
  count:  { type: Number, default: 0 },
});

const voteSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options:  [voteOptionSchema],
  open:     { type: Boolean, default: true },
  voters:   [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // track who voted
  createdBy:{ type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

const messageSchema = new mongoose.Schema({
  author:    { type: String, required: true },  // display name
  authorColor:{ type: String, default: "#C8623A" },
  text:      { type: String, required: true },
  reactions: [{ emoji: String, count: Number }],
  senderId:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

const packItemSchema = new mongoose.Schema({
  name:    { type: String, required: true },
  who:     { type: String, default: "Everyone" },
  done:    { type: Boolean, default: false },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

// ── Main Trip Schema ─────────────────────────────────────────────────────────

const tripSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  vibe:      { type: String, default: "sunrise" },  // matches VIBES in Dashboard
  emoji:     { type: String, default: "🌅" },
  dest:      { type: String },
  startDate: { type: String },
  endDate:   { type: String },
  status:    { type: String, enum: ["Planning","Active","Upcoming","Completed"], default: "Planning" },
  currency:  { type: String, default: "AED" },
  budget:    { type: Number, default: null },
  shareToken:{ type: String, unique: true, sparse: true }, // for public share link
  owner:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  members:   [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  // ── Notebook data ──
  activities:  [activitySchema],
  pins:        [pinSchema],
  expenses:    [expenseSchema],
  votes:       [voteSchema],
  messages:    [messageSchema],
  packItems:   [packItemSchema],
}, { timestamps: true });

// Auto-generate share token on creation
tripSchema.pre("save", function(next) {
  if (!this.shareToken) {
    this.shareToken = this.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
      + "-" + Math.random().toString(36).slice(2, 7);
  }
  next();
});

module.exports = mongoose.model("Trip", tripSchema);