const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Helper: generate JWT
const generateToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

// Helper: safe user payload (no password)
const userPayload = (user) => ({
  id:             user._id,
  name:           user.name,
  email:          user.email,
  role:           user.role,
  plan:           user.plan,
  trialStartedAt: user.trialStartedAt,
  trialEndsAt:    user.trialEndsAt,
  billingCycle:   user.billingCycle,
});

// POST /api/auth/signup
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: "Email already in use" });

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashed });
    const token = generateToken(user);

    res.status(201).json({
      message: "Account created successfully",
      token,
      user: userPayload(user),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      user: userPayload(user),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// POST /api/auth/trial  (protected)
// Starts a 14-day free trial for the logged-in user
exports.startTrial = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Don't allow starting a second trial
    if (user.plan === "trial" || user.plan === "premium")
      return res.status(400).json({ message: "Trial already used or already on premium" });

    const now = new Date();
    const trialEndsAt = new Date(now);
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    user.plan           = "trial";
    user.trialStartedAt = now;
    user.trialEndsAt    = trialEndsAt;
    user.billingCycle   = req.body.annual ? "annual" : "monthly";
    await user.save();

    res.json({
      message: "Trial started",
      user: userPayload(user),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/auth/users  (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ count: users.length, users });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// PATCH /api/auth/users/:id/role  (admin only)
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role))
      return res.status(400).json({ message: "Invalid role" });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Role updated", user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};