const Note = require("../models/Note");
const Trip = require("../models/Trip");

/* helper – make sure the requesting user is a member of the trip */
async function assertMember(tripId, userId) {
  const trip = await Trip.findById(tripId);
  if (!trip) throw Object.assign(new Error("Trip not found"), { status: 404 });

  const isMember = trip.members.some((m) => m.toString() === userId.toString());
  const isOwner = trip.owner?.toString() === userId.toString();

  if (!isMember && !isOwner)
    throw Object.assign(new Error("Not a trip member"), { status: 403 });

  return trip;
}

// GET /api/trips/:tripId/notes
exports.getNotes = async (req, res) => {
  try {
    await assertMember(req.params.tripId, req.user.id);

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
    await assertMember(req.params.tripId, req.user.id);

    const { title, content, tag, pinned } = req.body;

    const note = await Note.create({
      trip: req.params.tripId,
      title,
      content,
      tag,
      pinned,
      createdBy: req.user.id,
    });

    await note.populate("createdBy", "name");

    // emit to everyone in the trip room
    req.io.to(req.params.tripId).emit("noteCreated", { note });

    res.status(201).json({ note });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

// PUT /api/trips/:tripId/notes/:noteId
exports.updateNote = async (req, res) => {
  try {
    await assertMember(req.params.tripId, req.user.id);

    const { title, content, tag, pinned } = req.body;

    const note = await Note.findOneAndUpdate(
      { _id: req.params.noteId, trip: req.params.tripId },
      { title, content, tag, pinned },
      { new: true, runValidators: true },
    ).populate("createdBy", "name");

    if (!note) return res.status(404).json({ message: "Note not found" });

    req.io.to(req.params.tripId).emit("noteUpdated", { note });

    res.json({ note });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

// DELETE /api/trips/:tripId/notes/:noteId
exports.deleteNote = async (req, res) => {
  try {
    await assertMember(req.params.tripId, req.user.id);

    const note = await Note.findOneAndDelete({
      _id: req.params.noteId,
      trip: req.params.tripId,
    });

    if (!note) return res.status(404).json({ message: "Note not found" });

    req.io.to(req.params.tripId).emit("noteDeleted", { noteId: note._id });

    res.json({ message: "Note deleted" });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};
