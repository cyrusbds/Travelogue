// models/Poll.js
// Standalone Poll model (separate collection for scalability).
// References Trip and User — exactly like Message.js does.

const mongoose = require('mongoose');

// ── Sub-schema: individual option ────────────────────────────────────────────
const pollOptionSchema = new mongoose.Schema({
  label: { type: String, required: true, trim: true },
  votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // who voted here
});

// ── Main Poll Schema ──────────────────────────────────────────────────────────
const pollSchema = new mongoose.Schema(
  {
    tripId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true, index: true },
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    question:    { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },

    options: { type: [pollOptionSchema], validate: v => v.length >= 2 }, // min 2 options

    // Voters who have submitted at least one vote (for duplicate prevention)
    voters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    anonymous:         { type: Boolean, default: false }, // hide who voted for what
    multipleSelection: { type: Boolean, default: false }, // allow picking > 1 option

    expiresAt: { type: Date, default: null }, // null = no expiry

    // active  → open for voting
    // closed  → manually closed by creator/admin
    // expired → expiresAt has passed (set by a job or on-read)
    status: { type: String, enum: ['active', 'closed', 'expired'], default: 'active' },
  },
  { timestamps: true }
);

// ── Compound index for fast "get all polls for this trip" queries ─────────────
pollSchema.index({ tripId: 1, createdAt: -1 });

// ── Virtual: total vote count across all options ──────────────────────────────
pollSchema.virtual('totalVotes').get(function () {
  return this.options.reduce((sum, opt) => sum + opt.votes.length, 0);
});

// ── Auto-expire: mark as expired when fetched past expiresAt ─────────────────
pollSchema.methods.checkExpiry = function () {
  if (this.status === 'active' && this.expiresAt && new Date() > this.expiresAt) {
    this.status = 'expired';
  }
};

module.exports = mongoose.model('Poll', pollSchema);