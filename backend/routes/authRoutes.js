const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  startTrial,
  getAllUsers,
  updateUserRole,
} = require("../controllers/authController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Public
router.post("/signup", signup);
router.post("/login",  login);

// Protected
router.get("/me",       protect, (req, res) => res.json({ user: req.user }));
router.post("/trial",   protect, startTrial);   // ← new

// Admin only
router.get("/users",             protect, adminOnly, getAllUsers);
router.patch("/users/:id/role",  protect, adminOnly, updateUserRole);

module.exports = router;