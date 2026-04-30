const InviteLink = require("../models/InviteLink");
const Trip       = require("../models/Trip");
const User       = require("../models/User");

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// ── Helper: is user the trip owner ──────────────────────────────────────────
function isOwner(trip, userId) {
  return trip.owner._id
    ? trip.owner._id.toString() === userId
    : trip.owner.toString() === userId;
}

// ── GET all invite links for a trip ─────────────────────────────────────────
// GET /api/invites/:tripId
exports.getTripInviteLinks = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    if (!isOwner(trip, req.user.id))
      return res.status(403).json({ message: "Only the trip owner can manage invite links" });

    const links = await InviteLink.find({ tripId: req.params.tripId })
      .sort({ createdAt: -1 });

    return res.json({ links: links.map(l => formatLink(l)) });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── GENERATE invite link ─────────────────────────────────────────────────────
// POST /api/invites/:tripId
exports.generateInviteLink = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    if (!isOwner(trip, req.user.id))
      return res.status(403).json({ message: "Only the trip owner can generate invite links" });

    const { role = "member", guestAccess = false, maxUses = null, expiresAt = null } = req.body;

    let parsedExpiry = null;
    if (expiresAt) {
      parsedExpiry = new Date(expiresAt);
      if (isNaN(parsedExpiry) || parsedExpiry <= new Date())
        return res.status(400).json({ message: "Expiry must be a future date" });
    }

    const link = await InviteLink.create({
      tripId: trip._id,
      createdBy: req.user.id,
      role,
      guestAccess,
      maxUses: maxUses ? parseInt(maxUses) : null,
      expiresAt: parsedExpiry,
    });

    return res.status(201).json({ link: formatLink(link) });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── VALIDATE invite link (public — no auth required) ────────────────────────
// GET /api/invites/join/:token
exports.validateInviteLink = async (req, res) => {
  try {
    const link = await InviteLink.findOne({ token: req.params.token })
      .populate("tripId", "name dest startDate endDate vibe emoji");

    if (!link || !link.active)
      return res.status(404).json({ message: "Invite link is invalid or has been revoked" });

    if (link.expiresAt && new Date() > link.expiresAt)
      return res.status(410).json({ message: "This invite link has expired" });

    if (link.maxUses && link.currentUses >= link.maxUses)
      return res.status(410).json({ message: "This invite link has reached its maximum uses" });

    return res.json({
      valid: true,
      trip: link.tripId,
      role: link.role,
      guestAccess: link.guestAccess,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── JOIN trip via invite link ────────────────────────────────────────────────
// POST /api/invites/join/:token
// Auth: optionalAuth (logged-in users join properly; guests get limited access)
exports.joinTripViaInvite = async (req, res) => {
  try {
    const link = await InviteLink.findOne({ token: req.params.token });

    if (!link || !link.active)
      return res.status(404).json({ message: "Invite link is invalid or has been revoked" });

    if (link.expiresAt && new Date() > link.expiresAt)
      return res.status(410).json({ message: "This invite link has expired" });

    if (link.maxUses && link.currentUses >= link.maxUses)
      return res.status(410).json({ message: "This invite link has reached its maximum uses" });

    const trip = await Trip.findById(link.tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    // ── Logged-in user ───────────────────────────────────────────────────────
    if (req.user) {
      const userId = req.user.id;
      const alreadyMember = trip.members.map(m => m.toString()).includes(userId)
        || trip.owner.toString() === userId;

      if (!alreadyMember) {
        trip.members.push(userId);
        await trip.save();
      }

      link.currentUses += 1;
      await link.save();

      // Notify existing members via socket
      if (req.io) {
        const joiner = await User.findById(userId).select("name");
        req.io.to(`trip:${trip._id}:chat`).emit("trip:member_joined", {
          tripId: trip._id,
          user: { id: userId, name: joiner?.name },
        });
      }

      return res.json({ tripId: trip._id, alreadyMember });
    }

    // ── Guest user ───────────────────────────────────────────────────────────
    if (!link.guestAccess)
      return res.status(403).json({ message: "This invite link requires a registered account" });

    const { nickname } = req.body;
    if (!nickname?.trim())
      return res.status(400).json({ message: "Nickname is required for guest access" });

    link.currentUses += 1;
    await link.save();

    // Return a guest token (just the trip info — no DB user created)
    return res.json({
      tripId: trip._id,
      guest: true,
      nickname: nickname.trim(),
    });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── REVOKE invite link ───────────────────────────────────────────────────────
// DELETE /api/invites/:tripId/:linkId
exports.revokeInviteLink = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    if (!isOwner(trip, req.user.id))
      return res.status(403).json({ message: "Only the trip owner can revoke invite links" });

    const link = await InviteLink.findOne({ _id: req.params.linkId, tripId: req.params.tripId });
    if (!link) return res.status(404).json({ message: "Invite link not found" });

    link.active = false;
    await link.save();

    return res.json({ message: "Invite link revoked" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── REMOVE a member from a trip ──────────────────────────────────────────────
// DELETE /api/invites/:tripId/members/:memberId
exports.removeMember = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    if (!isOwner(trip, req.user.id))
      return res.status(403).json({ message: "Only the trip owner can remove members" });

    trip.members = trip.members.filter(m => m.toString() !== req.params.memberId);
    await trip.save();

    return res.json({ message: "Member removed" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── Format link for client ───────────────────────────────────────────────────
function formatLink(link) {
  return {
    _id: link._id,
    token: link.token,
    url: `${CLIENT_URL}/join/${link.token}`,
    role: link.role,
    guestAccess: link.guestAccess,
    maxUses: link.maxUses,
    currentUses: link.currentUses,
    expiresAt: link.expiresAt,
    active: link.active,
    createdAt: link.createdAt,
  };
}