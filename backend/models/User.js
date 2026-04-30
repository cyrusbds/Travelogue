const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Invalid email format"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // ── Subscription / Trial ──────────────────────────────────────────
    plan: {
      type: String,
      enum: ["free", "trial", "premium"],
      default: "free",
    },
    trialStartedAt: {
      type: Date,
      default: null,
    },
    trialEndsAt: {
      type: Date,
      default: null,
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "annual", null],
      default: null,
    },
  },
  { timestamps: true }
);

// Virtual: is the trial still active?
userSchema.virtual("trialActive").get(function () {
  if (this.plan !== "trial" || !this.trialEndsAt) return false;
  return new Date() < this.trialEndsAt;
});

module.exports = mongoose.model("User", userSchema);