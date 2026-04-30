const Trip = require("../models/Trip");

// ── Trips ────────────────────────────────────────────────────────────────────

exports.getTrips = async (req, res) => {
  try {
    const trips = await Trip.find({
      $or: [{ owner: req.user.id }, { members: req.user.id }]
    }).sort({ createdAt: -1 });
    res.json({ trips });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.createTrip = async (req, res) => {
  try {
    const { name, vibe, emoji, dest, startDate, endDate } = req.body;
    if (!name) return res.status(400).json({ message: "Trip name is required" });
    const trip = await Trip.create({
      name, vibe, emoji, dest, startDate, endDate,
      owner: req.user.id,
      members: [req.user.id],
    });
    res.status(201).json({ trip });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    if (trip.owner.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });
    await trip.deleteOne();
    res.json({ message: "Trip deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET single trip (for notebook)
exports.getTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate("owner", "name")
      .populate("members", "name");
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    const userId = req.user.id;
    const isMember =
      trip.owner._id.toString() === userId ||
      trip.members.map(m => m._id.toString()).includes(userId);
    if (!isMember) return res.status(403).json({ message: "Not authorized" });
    res.json({ trip });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
// ── Activities ───────────────────────────────────────────────────────────────

exports.addActivity = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    const { name, day, time, type, location, notes } = req.body;
    if (!name || !day) return res.status(400).json({ message: "Name and day required" });
    const activity = { name, day, time, type, location, notes, addedBy: req.user.id };
    trip.activities.push(activity);
    await trip.save();
    res.status(201).json({ activity: trip.activities[trip.activities.length - 1] });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.deleteActivity = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    trip.activities = trip.activities.filter(a => a._id.toString() !== req.params.actId);
    await trip.save();
    res.json({ message: "Activity removed" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── Map Pins ─────────────────────────────────────────────────────────────────

// ── ADD PIN ──────────────────────────────────────────────────────────────────
// POST /api/trips/:id/pins
// Body: { name, desc, day, category, lat, lng }
// Auth: JWT (protect middleware)
exports.addPin = async (req, res) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      $or: [{ owner: req.user.id }, { members: req.user.id }],
    });
 
    if (!trip) return res.status(404).json({ message: "Trip not found" });
 
    const { name, desc, day, category, lat, lng } = req.body;
 
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Pin name is required" });
    }
 
    // Build the pin subdocument (matches pinSchema in Trip.js)
    const newPin = {
      name:     name.trim(),
      desc:     desc?.trim() || "",
      day:      day || "Day 1",
      category: category || "explore",
      // Only store coordinates if they are valid numbers
      lat:  lat != null && !isNaN(lat) ? parseFloat(lat) : undefined,
      lng:  lng != null && !isNaN(lng) ? parseFloat(lng) : undefined,
      addedBy: req.user._id,
    };
 
    trip.pins.push(newPin);
    await trip.save();
 
    // Return the updated trip so the frontend can replace its local pins array
    // Populate addedBy so the frontend has user names if needed
    const populated = await Trip.findById(trip._id).populate("pins.addedBy", "name");
    res.status(201).json(populated);
 
  } catch (err) {
    console.error("addPin error:", err);
    res.status(500).json({ message: "Server error adding pin" });
  }
};
 
// ── DELETE PIN ────────────────────────────────────────────────────────────────
// DELETE /api/trips/:id/pins/:pinId
// Auth: JWT (protect middleware)
exports.deletePin = async (req, res) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      $or: [{ owner: req.user.id }, { members: req.user.id }],
    });

    if (!trip) return res.status(404).json({ message: "Trip not found" });

    const pin = trip.pins.id(req.params.pinId);
    if (!pin) return res.status(404).json({ message: "Pin not found" });

    const isAuthor = pin.addedBy?.toString() === req.user.id.toString();
    const isOwner  = trip.owner.toString() === req.user.id.toString();
    if (!isAuthor && !isOwner) {
      return res.status(403).json({ message: "Not authorised to delete this pin" });
    }

    trip.pins.pull({ _id: req.params.pinId }); // ✅ correct way
    await trip.save();

    res.json({ message: "Pin removed", pins: trip.pins });

  } catch (err) {
    console.error("deletePin error:", err);
    res.status(500).json({ message: "Server error deleting pin" });
  }
};

// ── Expenses ─────────────────────────────────────────────────────────────────

exports.setBudget = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    trip.budget = req.body.budget;
    await trip.save();
    res.json({ budget: trip.budget });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.addExpense = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    const { desc, amount, paidBy, category } = req.body;
    if (!desc || !amount || !paidBy) return res.status(400).json({ message: "desc, amount, paidBy required" });
    trip.expenses.push({ desc, amount, paidBy, category, addedBy: req.user.id });
    await trip.save();
    res.status(201).json({ expense: trip.expenses[trip.expenses.length - 1] });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    trip.expenses = trip.expenses.filter(e => e._id.toString() !== req.params.expId);
    await trip.save();
    res.json({ message: "Expense removed" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── Votes ────────────────────────────────────────────────────────────────────

exports.addVote = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    const { question, options } = req.body;
    if (!question || !options?.length) return res.status(400).json({ message: "question and options required" });
    trip.votes.push({
      question,
      options: options.map(label => ({ label, count: 0 })),
      createdBy: req.user.id,
    });
    await trip.save();
    res.status(201).json({ vote: trip.votes[trip.votes.length - 1] });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.castVote = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    const vote = trip.votes.id(req.params.voteId);
    if (!vote) return res.status(404).json({ message: "Vote not found" });
    // Prevent double voting
    if (vote.voters.map(v => v.toString()).includes(req.user.id))
      return res.status(400).json({ message: "Already voted" });
    const optionIndex = req.body.optionIndex;
    if (optionIndex === undefined || !vote.options[optionIndex])
      return res.status(400).json({ message: "Invalid option" });
    vote.options[optionIndex].count += 1;
    vote.voters.push(req.user.id);
    await trip.save();
    res.json({ vote });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── Messages ─────────────────────────────────────────────────────────────────

exports.getMessages = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id).select("messages");
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    res.json({ messages: trip.messages });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.addMessage = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    const { author, authorColor, text } = req.body;
    if (!text) return res.status(400).json({ message: "Text required" });
    trip.messages.push({ author: author || req.user.name, authorColor, text, senderId: req.user.id });
    await trip.save();
    res.status(201).json({ message: trip.messages[trip.messages.length - 1] });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── Packing ──────────────────────────────────────────────────────────────────

exports.addPackItem = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    const { name, who } = req.body;
    if (!name) return res.status(400).json({ message: "Name required" });
    trip.packItems.push({ name, who, addedBy: req.user.id });
    await trip.save();
    res.status(201).json({ item: trip.packItems[trip.packItems.length - 1] });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.togglePackItem = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    const item = trip.packItems.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });
    item.done = !item.done;
    await trip.save();
    res.json({ item });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.deletePackItem = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    trip.packItems = trip.packItems.filter(i => i._id.toString() !== req.params.itemId);
    await trip.save();
    res.json({ message: "Item removed" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
