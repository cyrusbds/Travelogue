// routes/tripRoutes.js — UPDATED version
// Only change: mount pollRoutes before the chatRoutes wildcard at the bottom.

const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/tripController");
const { protect } = require("../middleware/authMiddleware");

// ── Trips ────────────────────────────────────────────────────────────────────
router.get("/",       protect, ctrl.getTrips);
router.post("/",      protect, ctrl.createTrip);
router.get("/:id",    protect, ctrl.getTrip);
router.delete("/:id", protect, ctrl.deleteTrip);

// ── Activities ───────────────────────────────────────────────────────────────
router.post("/:id/activities",           protect, ctrl.addActivity);
router.delete("/:id/activities/:actId",  protect, ctrl.deleteActivity);

// ── Map Pins ─────────────────────────────────────────────────────────────────
router.post("/:id/pins",            protect, ctrl.addPin);
router.delete("/:id/pins/:pinId",   protect, ctrl.deletePin);

// ── Budget & Expenses ────────────────────────────────────────────────────────
router.patch("/:id/budget",              protect, ctrl.setBudget);
router.post("/:id/expenses",             protect, ctrl.addExpense);
router.delete("/:id/expenses/:expId",    protect, ctrl.deleteExpense);

// ── Legacy Votes (embedded in Trip doc — kept for backward compat) ────────────
router.post("/:id/votes",                    protect, ctrl.addVote);
router.post("/:id/votes/:voteId/cast",       protect, ctrl.castVote);

// ── Legacy Messages ───────────────────────────────────────────────────────────
router.get("/:id/messages",   protect, ctrl.getMessages);
router.post("/:id/messages",  protect, ctrl.addMessage);

// ── Packing ──────────────────────────────────────────────────────────────────
router.post("/:id/pack",                 protect, ctrl.addPackItem);
router.patch("/:id/pack/:itemId/toggle", protect, ctrl.togglePackItem);
router.delete("/:id/pack/:itemId",       protect, ctrl.deletePackItem);

// ── Polls (new standalone collection) ────────────────────────────────────────
// IMPORTANT: mount BEFORE the chatRoutes wildcard below!
const pollRoutes = require("./pollRoutes"); // ← NEW
router.use("/:tripId/polls", pollRoutes);   // ← NEW

// ── Chat & Checklist ─────────────────────────────────────────────────────────
const chatRoutes = require("./chatRoutes");
router.use("/:tripId", chatRoutes);

module.exports = router;