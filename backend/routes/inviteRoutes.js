const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/inviteController");
const { protect, optionalAuth } = require("../middleware/authMiddleware");

// Trip owner manages links
router.get("/:tripId",                        protect, ctrl.getTripInviteLinks);
router.post("/:tripId",                       protect, ctrl.generateInviteLink);
router.delete("/:tripId/:linkId",             protect, ctrl.revokeInviteLink);
router.delete("/:tripId/members/:memberId",   protect, ctrl.removeMember);

// Public join routes (optionalAuth = works logged-in or as guest)
router.get("/join/:token",                    optionalAuth, ctrl.validateInviteLink);
router.post("/join/:token",                   optionalAuth, ctrl.joinTripViaInvite);

module.exports = router;