const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/inviteController");
const { protect, optionalAuth } = require("../middleware/authMiddleware");

// Public join routes — must come before /:tripId wildcards
router.get("/join/:token", optionalAuth, ctrl.validateInviteLink);
router.post("/join/:token", optionalAuth, ctrl.joinTripViaInvite);

// Trip owner manages links
router.get("/:tripId", protect, ctrl.getTripInviteLinks);
router.post("/:tripId", protect, ctrl.generateInviteLink);

// Specific named DELETE routes BEFORE the wildcard /:tripId/:linkId
router.delete("/:tripId/leave", protect, ctrl.leaveTrip);
router.delete("/:tripId/members/:memberId", protect, ctrl.removeMember);
router.delete("/:tripId/:linkId", protect, ctrl.revokeInviteLink);

module.exports = router;
