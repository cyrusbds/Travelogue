const ItineraryItem = require("../models/ItineraryItem");
const Trip = require("../models/Trip");

/* ── helpers ─────────────────────────────────────────────── */

// Verify the requesting user is a member (or owner) of the trip
async function assertMember(tripId, userId) {
  const trip = await Trip.findById(tripId);
  if (!trip) throw Object.assign(new Error("Trip not found"), { status: 404 });

  const members = (trip.members || []).map((m) =>
    typeof m === "object" ? m._id?.toString() : m?.toString()
  );
  const owner = trip.owner?.toString();
  const uid = userId?.toString();

  if (uid !== owner && !members.includes(uid)) {
    throw Object.assign(new Error("Not a trip member"), { status: 403 });
  }
  return trip;
}

function handleError(res, err) {
  console.error("[Itinerary]", err.message);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
}

/* ── CREATE ──────────────────────────────────────────────── */
exports.createItineraryItem = async (req, res) => {
  try {
    const { tripId } = req.params;
    await assertMember(tripId, req.user._id);

    const {
      title, description, date, startTime, endTime,
      location, category, notes, image, color,
    } = req.body;

    if (!title?.trim()) return res.status(400).json({ message: "Title is required" });
    if (!date) return res.status(400).json({ message: "Date is required" });

    // Place new item at end of that day's list
    const lastItem = await ItineraryItem.findOne({ tripId, date: new Date(date) })
      .sort({ orderIndex: -1 });
    const orderIndex = lastItem ? lastItem.orderIndex + 1 : 0;

    const item = await ItineraryItem.create({
      tripId,
      createdBy: req.user._id,
      title: title.trim(),
      description: description?.trim() || "",
      date: new Date(date),
      startTime: startTime || "",
      endTime: endTime || "",
      location: location?.trim() || "",
      category: category || "explore",
      notes: notes?.trim() || "",
      image: image || "",
      color: color || "",
      orderIndex,
    });

    const populated = await item.populate("createdBy", "name email");

    // Emit real-time event to all trip members
    const io = req.app.get("io");
    if (io) {
      io.to(`trip:${tripId}`).emit("itineraryCreated", { item: populated });
    }

    res.status(201).json({ item: populated });
  } catch (err) {
    handleError(res, err);
  }
};

/* ── GET ALL FOR TRIP ────────────────────────────────────── */
exports.getTripItinerary = async (req, res) => {
  try {
    const { tripId } = req.params;
    await assertMember(tripId, req.user._id);

    const items = await ItineraryItem.find({ tripId })
      .sort({ date: 1, orderIndex: 1, startTime: 1 })
      .populate("createdBy", "name email");

    res.json({ items });
  } catch (err) {
    handleError(res, err);
  }
};

/* ── UPDATE ──────────────────────────────────────────────── */
exports.updateItineraryItem = async (req, res) => {
  try {
    const { tripId, itemId } = req.params;
    await assertMember(tripId, req.user._id);

    const item = await ItineraryItem.findOne({ _id: itemId, tripId });
    if (!item) return res.status(404).json({ message: "Item not found" });

    const allowed = [
      "title", "description", "date", "startTime", "endTime",
      "location", "category", "notes", "image", "color",
    ];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        item[field] = field === "date" ? new Date(req.body[field]) : req.body[field];
      }
    });

    await item.save();
    const populated = await item.populate("createdBy", "name email");

    const io = req.app.get("io");
    if (io) {
      io.to(`trip:${tripId}`).emit("itineraryUpdated", { item: populated });
    }

    res.json({ item: populated });
  } catch (err) {
    handleError(res, err);
  }
};

/* ── DELETE ──────────────────────────────────────────────── */
exports.deleteItineraryItem = async (req, res) => {
  try {
    const { tripId, itemId } = req.params;
    await assertMember(tripId, req.user._id);

    const item = await ItineraryItem.findOneAndDelete({ _id: itemId, tripId });
    if (!item) return res.status(404).json({ message: "Item not found" });

    const io = req.app.get("io");
    if (io) {
      io.to(`trip:${tripId}`).emit("itineraryDeleted", { itemId });
    }

    res.json({ message: "Deleted", itemId });
  } catch (err) {
    handleError(res, err);
  }
};

/* ── REORDER ─────────────────────────────────────────────── */
// Body: { updates: [{ id, date, orderIndex }, ...] }
exports.reorderItineraryItems = async (req, res) => {
  try {
    const { tripId } = req.params;
    await assertMember(tripId, req.user._id);

    const { updates } = req.body;
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ message: "updates array required" });
    }

    // Bulk write for performance
    const ops = updates.map(({ id, date, orderIndex }) => ({
      updateOne: {
        filter: { _id: id, tripId },
        update: {
          $set: {
            ...(date !== undefined ? { date: new Date(date) } : {}),
            orderIndex: Number(orderIndex),
          },
        },
      },
    }));

    await ItineraryItem.bulkWrite(ops);

    const items = await ItineraryItem.find({ tripId })
      .sort({ date: 1, orderIndex: 1 })
      .populate("createdBy", "name email");

    const io = req.app.get("io");
    if (io) {
      io.to(`trip:${tripId}`).emit("itineraryReordered", { items });
    }

    res.json({ items });
  } catch (err) {
    handleError(res, err);
  }
};