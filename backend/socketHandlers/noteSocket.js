const Note = require("../models/Note");
const Trip = require("../models/Trip");

module.exports = function registerNoteSocket(socket, io) {
  /* ── helper: is this socket's user a member of the trip? ── */
  async function isMember(tripId) {
    const trip = await Trip.findById(tripId);
    if (!trip) return false;
    const uid = socket.user?._id?.toString();
    return (
      trip.owner.toString() === uid ||
      trip.members.some((m) => m.toString() === uid)
    );
  }

  /* ── note:pin  (quick toggle without full PATCH round-trip) ── */
  socket.on("note:pin", async ({ tripId, noteId, pinned }) => {
    try {
      if (!(await isMember(tripId))) return;
      const note = await Note.findOneAndUpdate(
        { _id: noteId, trip: tripId },
        { pinned: !!pinned },
        { new: true },
      ).populate("createdBy", "name email");
      if (!note) return;
      io.to(tripId).emit("noteUpdated", { note });
    } catch (err) {
      socket.emit("note:error", { message: err.message });
    }
  });

  /* ── note:typing  (optional: show "X is editing a note") ── */
  socket.on("note:typing", ({ tripId, name }) => {
    socket.to(tripId).emit("note:typing_update", { name });
  });
};
