const Note = require("../models/Note");
const Trip = require("../models/Trip");

/* ── helper: verify requesting user is a trip member or owner ── */
async function assertMember(tripId, userId) {
  const trip = await Trip.findById(tripId);
  if (!trip) throw Object.assign(new Error("Trip not found"), { status: 404 });

  const members = trip.members.map((m) =>
    typeof m === "object" && m.user ? m.user.toString() : m.toString(),
  );
  const uid = userId.toString();
  const isOwner = trip.owner?.toString() === uid;
  const isMember = members.includes(uid);

  if (!isOwner && !isMember)
    throw Object.assign(new Error("Not a trip member"), { status: 403 });

  return trip;
}

// GET /api/trips/:tripId/notes
exports.getNotes = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    await assertMember(req.params.tripId, userId);

    const notes = await Note.find({ trip: req.params.tripId })
      .populate("createdBy", "name")
      .sort({ pinned: -1, updatedAt: -1 });

    res.json({ notes });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

// POST /api/trips/:tripId/notes
exports.createNote = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    await assertMember(req.params.tripId, userId);

    const { title, content, tag, pinned } = req.body;

    const note = await Note.create({
      trip: req.params.tripId,
      title,
      content,
      tag,
      pinned,
      createdBy: userId,
    });

    await note.populate("createdBy", "name");

    req.io.to(`trip:${req.params.tripId}:notes`).emit("noteCreated", { note });

    res.status(201).json({ note });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

// PUT /api/trips/:tripId/notes/:noteId
exports.updateNote = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    await assertMember(req.params.tripId, userId);

    const { title, content, tag, pinned } = req.body;

    const note = await Note.findOneAndUpdate(
      { _id: req.params.noteId, trip: req.params.tripId },
      { title, content, tag, pinned },
      { new: true, runValidators: true },
    ).populate("createdBy", "name");

    if (!note) return res.status(404).json({ message: "Note not found" });

    req.io.to(`trip:${req.params.tripId}:notes`).emit("noteUpdated", { note });

    res.json({ note });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

// DELETE /api/trips/:tripId/notes/:noteId
exports.deleteNote = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    await assertMember(req.params.tripId, userId);

    const note = await Note.findOneAndDelete({
      _id: req.params.noteId,
      trip: req.params.tripId,
    });

    if (!note) return res.status(404).json({ message: "Note not found" });

    req.io
      .to(`trip:${req.params.tripId}:notes`)
      .emit("noteDeleted", { noteId: note._id });

    res.json({ message: "Note deleted" });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};
