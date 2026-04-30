// controllers/pollController.js
// Follows the same style as tripController.js — no magic, just clear logic.

const Poll = require('../models/Poll');
const Trip = require('../models/Trip');

// ── Helper: verify caller is a trip member ────────────────────────────────────
async function assertMember(tripId, userId) {
  const trip = await Trip.findById(tripId).select('owner members');
  if (!trip) return null;
  const isMember =
    trip.owner.toString() === userId ||
    trip.members.map(m => m.toString()).includes(userId);
  return isMember ? trip : false;
}

// ── Helper: serialise a poll for the client ───────────────────────────────────
// When anonymous=true we strip the voters arrays from options.
function serialisePoll(poll, requestingUserId) {
  const obj = poll.toObject({ virtuals: true });

  if (poll.anonymous) {
    obj.options = obj.options.map(opt => ({
      ...opt,
      votes: [],            // hide individual voter IDs
      voteCount: opt.votes.length,
    }));
  } else {
    obj.options = obj.options.map(opt => ({
      ...opt,
      voteCount: opt.votes.length,
    }));
  }

  // Tell the client whether THIS user has already voted
  obj.hasVoted = poll.voters.map(v => v.toString()).includes(requestingUserId);

  // Which option(s) did this user vote for?
  obj.myVotes = poll.options.reduce((acc, opt, idx) => {
    if (opt.votes.map(v => v.toString()).includes(requestingUserId)) acc.push(idx);
    return acc;
  }, []);

  obj.totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes.length, 0);

  return obj;
}

// ── CREATE POLL ───────────────────────────────────────────────────────────────
// POST /api/trips/:tripId/polls
exports.createPoll = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user.id;

    const trip = await assertMember(tripId, userId);
    if (trip === null)  return res.status(404).json({ message: 'Trip not found' });
    if (trip === false) return res.status(403).json({ message: 'Not a trip member' });

    const { question, description, options, expiresAt, anonymous, multipleSelection } = req.body;

    if (!question?.trim()) return res.status(400).json({ message: 'Question is required' });
    if (!Array.isArray(options) || options.length < 2)
      return res.status(400).json({ message: 'At least 2 options required' });

    // Validate expiry date (must be in the future)
    let parsedExpiry = null;
    if (expiresAt) {
      parsedExpiry = new Date(expiresAt);
      if (isNaN(parsedExpiry) || parsedExpiry <= new Date())
        return res.status(400).json({ message: 'Expiry date must be in the future' });
    }

    const poll = await Poll.create({
      tripId,
      creatorId: userId,
      question: question.trim(),
      description: description?.trim() || '',
      options: options.map(label => ({ label: String(label).trim(), votes: [] })),
      expiresAt: parsedExpiry,
      anonymous:         Boolean(anonymous),
      multipleSelection: Boolean(multipleSelection),
    });

    // Broadcast to all other trip members in real time
    // (req.io is attached by server.js — see integration instructions)
    if (req.io) {
      req.io.to(`trip:${tripId}:polls`).emit('poll:created', {
        poll: serialisePoll(poll, userId),
      });
    }

    return res.status(201).json({ poll: serialisePoll(poll, userId) });
  } catch (err) {
    console.error('createPoll error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── GET ALL POLLS FOR A TRIP ──────────────────────────────────────────────────
// GET /api/trips/:tripId/polls
exports.getTripPolls = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user.id;

    const trip = await assertMember(tripId, userId);
    if (trip === null)  return res.status(404).json({ message: 'Trip not found' });
    if (trip === false) return res.status(403).json({ message: 'Not a trip member' });

    const polls = await Poll.find({ tripId }).sort({ createdAt: -1 });

    // Auto-expire on read (no cron needed for MVP)
    const saves = [];
    polls.forEach(p => {
      p.checkExpiry();
      if (p.isModified('status')) saves.push(p.save());
    });
    if (saves.length) await Promise.all(saves);

    return res.json({ polls: polls.map(p => serialisePoll(p, userId)) });
  } catch (err) {
    console.error('getTripPolls error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── CAST / CHANGE A VOTE ──────────────────────────────────────────────────────
// POST /api/trips/:tripId/polls/:pollId/vote
// Body: { optionIndexes: [0] }  or  { optionIndexes: [0, 2] } for multiSelect
exports.votePoll = async (req, res) => {
  try {
    const { tripId, pollId } = req.params;
    const userId = req.user.id;

    const trip = await assertMember(tripId, userId);
    if (trip === null)  return res.status(404).json({ message: 'Trip not found' });
    if (trip === false) return res.status(403).json({ message: 'Not a trip member' });

    const poll = await Poll.findOne({ _id: pollId, tripId });
    if (!poll) return res.status(404).json({ message: 'Poll not found' });

    poll.checkExpiry();
    if (poll.status !== 'active')
      return res.status(400).json({ message: 'Poll is no longer active' });

    const { optionIndexes } = req.body;
    if (!Array.isArray(optionIndexes) || optionIndexes.length === 0)
      return res.status(400).json({ message: 'optionIndexes array required' });

    // Single-selection enforcement
    if (!poll.multipleSelection && optionIndexes.length > 1)
      return res.status(400).json({ message: 'This poll only allows one choice' });

    // Validate indexes
    for (const idx of optionIndexes) {
      if (idx < 0 || idx >= poll.options.length)
        return res.status(400).json({ message: `Invalid option index: ${idx}` });
    }

    // ── Remove existing votes from this user (allows vote change) ──
    poll.options.forEach(opt => {
      opt.votes = opt.votes.filter(v => v.toString() !== userId);
    });
    poll.voters = poll.voters.filter(v => v.toString() !== userId);

    // ── Cast new votes ──
    optionIndexes.forEach(idx => {
      poll.options[idx].votes.push(userId);
    });
    poll.voters.push(userId);

    await poll.save();

    const serialised = serialisePoll(poll, userId);

    // Broadcast live update to the trip room
    if (req.io) {
      req.io.to(`trip:${tripId}:polls`).emit('poll:vote_cast', { poll: serialised });
    }

    return res.json({ poll: serialised });
  } catch (err) {
    console.error('votePoll error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── UPDATE POLL (only before any votes) ──────────────────────────────────────
// PATCH /api/trips/:tripId/polls/:pollId
exports.updatePoll = async (req, res) => {
  try {
    const { tripId, pollId } = req.params;
    const userId = req.user.id;

    const poll = await Poll.findOne({ _id: pollId, tripId });
    if (!poll) return res.status(404).json({ message: 'Poll not found' });

    // Only creator can edit
    if (poll.creatorId.toString() !== userId)
      return res.status(403).json({ message: 'Only the poll creator can edit it' });

    // Can't edit once someone has voted
    if (poll.voters.length > 0)
      return res.status(400).json({ message: 'Cannot edit a poll that has votes' });

    const { question, description, options, expiresAt } = req.body;
    if (question?.trim())  poll.question    = question.trim();
    if (description != null) poll.description = description.trim();
    if (Array.isArray(options) && options.length >= 2)
      poll.options = options.map(label => ({ label: String(label).trim(), votes: [] }));
    if (expiresAt !== undefined) {
      const d = expiresAt ? new Date(expiresAt) : null;
      poll.expiresAt = d && !isNaN(d) ? d : null;
    }

    await poll.save();

    if (req.io) {
      req.io.to(`trip:${tripId}:polls`).emit('poll:updated', {
        poll: serialisePoll(poll, userId),
      });
    }

    return res.json({ poll: serialisePoll(poll, userId) });
  } catch (err) {
    console.error('updatePoll error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── CLOSE POLL MANUALLY ───────────────────────────────────────────────────────
// POST /api/trips/:tripId/polls/:pollId/close
exports.closePoll = async (req, res) => {
  try {
    const { tripId, pollId } = req.params;
    const userId = req.user.id;

    const trip = await assertMember(tripId, userId);
    if (trip === null)  return res.status(404).json({ message: 'Trip not found' });

    const poll = await Poll.findOne({ _id: pollId, tripId });
    if (!poll) return res.status(404).json({ message: 'Poll not found' });

    // Creator OR trip owner can close
    const isCreator = poll.creatorId.toString() === userId;
    const isOwner   = trip && trip.owner.toString() === userId;
    if (!isCreator && !isOwner)
      return res.status(403).json({ message: 'Not authorised to close this poll' });

    poll.status = 'closed';
    await poll.save();

    if (req.io) {
      req.io.to(`trip:${tripId}:polls`).emit('poll:closed', { pollId });
    }

    return res.json({ poll: serialisePoll(poll, userId) });
  } catch (err) {
    console.error('closePoll error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── DELETE POLL ───────────────────────────────────────────────────────────────
// DELETE /api/trips/:tripId/polls/:pollId
exports.deletePoll = async (req, res) => {
  try {
    const { tripId, pollId } = req.params;
    const userId = req.user.id;

    const trip = await assertMember(tripId, userId);
    if (trip === null)  return res.status(404).json({ message: 'Trip not found' });

    const poll = await Poll.findOne({ _id: pollId, tripId });
    if (!poll) return res.status(404).json({ message: 'Poll not found' });

    const isCreator = poll.creatorId.toString() === userId;
    const isOwner   = trip && trip.owner.toString() === userId;
    if (!isCreator && !isOwner)
      return res.status(403).json({ message: 'Not authorised to delete this poll' });

    await poll.deleteOne();

    if (req.io) {
      req.io.to(`trip:${tripId}:polls`).emit('poll:deleted', { pollId });
    }

    return res.json({ message: 'Poll deleted' });
  } catch (err) {
    console.error('deletePoll error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};