const Note = require("../models/Note");
const Trip = require("../models/Trip");

async function assertMember(tripId, userId) {
  const trip = await Trip.findById(tripId);
  if (!trip) throw Object.assign(new Error("Trip not found"), { status: 404 });
  const isMember =
    trip.members.some((m) => m.toString() === userId.toString()) ||
    trip.owner.toString() === userId.toString();
  if (!isMember)
    throw Object.assign(new Error("Not authorised"), { status: 403 });
  return trip;
}

exports.getNotes = async (req, res) => {
  try {
    await assertMember(req.params.tripId, req.user._id);
    const notes = await Note.find({ trip: req.params.tripId })
      .populate("createdBy", "name email")
      .sort({ pinned: -1, updatedAt: -1 });
    res.json({ notes });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

exports.createNote = async (req, res) => {
  try {
    await assertMember(req.params.tripId, req.user._id);
    const { title, content, tag, pinned } = req.body;
    if (!title?.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }
    const note = await Note.create({
      trip: req.params.tripId,
      title: title.trim(),
      content: content || "",
      tag: tag || "general",
      pinned: !!pinned,
      createdBy: req.user._id,
    });
    const populated = await note.populate("createdBy", "name email");
    req.io?.to(req.params.tripId).emit("noteCreated", { note: populated });
    res.status(201).json({ note: populated });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

exports.updateNote = async (req, res) => {
  try {
    await assertMember(req.params.tripId, req.user._id);
    const { title, content, tag, pinned } = req.body;
    const note = await Note.findOneAndUpdate(
      { _id: req.params.noteId, trip: req.params.tripId },
      {
        ...(title !== undefined && { title: title.trim() }),
        ...(content !== undefined && { content }),
        ...(tag !== undefined && { tag }),
        ...(pinned !== undefined && { pinned: !!pinned }),
      },
      { new: true, runValidators: true },
    ).populate("createdBy", "name email");
    if (!note) return res.status(404).json({ message: "Note not found" });
    req.io?.to(req.params.tripId).emit("noteUpdated", { note });
    res.json({ note });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    await assertMember(req.params.tripId, req.user._id);
    const note = await Note.findOneAndDelete({
      _id: req.params.noteId,
      trip: req.params.tripId,
    });
    if (!note) return res.status(404).json({ message: "Note not found" });
    req.io
      ?.to(req.params.tripId)
      .emit("noteDeleted", { noteId: req.params.noteId });
    res.json({ message: "Note deleted" });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};
