// checklistController.js - REST handlers for packing checklist
const ChecklistItem = require("../models/ChecklistItem");
const Trip = require("../models/Trip");

// GET /api/trips/:tripId/checklist
const getChecklist = async (req, res) => {
  try {
    const { tripId } = req.params;
    const items = await ChecklistItem.find({ tripId })
      .sort({ createdAt: 1 })
      .lean();
    res.json({ items });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/trips/:tripId/checklist
const addItem = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { text, category, assignedTo } = req.body;

    if (!text?.trim())
      return res.status(400).json({ message: "Text required" });

    const userId = req.user?._id;
    const senderName = req.user?.name || req.guestSession?.nickname || "Guest";

    const item = await ChecklistItem.create({
      tripId,
      text: text.trim(),
      category: category || "other",
      assignedTo: assignedTo || { userId: null, name: null },
      createdBy: { userId: userId || null, name: senderName, isGuest: !userId },
    });

    const io = req.app.get("io");
    if (io) {
      io.to(`trip:${tripId}`).emit("packing:item-added", { item });
    }

    res.status(201).json({ item });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/trips/:tripId/checklist/:itemId
// Toggle complete, rename, reassign
const updateItem = async (req, res) => {
  try {
    const { tripId, itemId } = req.params;
    const { text, completed, category, assignedTo } = req.body;
    const senderName = req.user?.name || req.guestSession?.nickname || "Guest";

    const item = await ChecklistItem.findOne({ _id: itemId, tripId });
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (text !== undefined) item.text = text.trim();
    if (category !== undefined) item.category = category;
    if (assignedTo !== undefined) item.assignedTo = assignedTo;

    // Track completion metadata
    if (completed !== undefined) {
      item.completed = completed;
      item.completedAt = completed ? new Date() : null;
      item.completedBy = completed ? senderName : null;
    }

    await item.save();

    const io = req.app.get("io");
    if (io) {
      io.to(`trip:${tripId}`).emit("packing:item-toggled", { item });
    }

    res.json({ item });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/trips/:tripId/checklist/:itemId
const deleteItem = async (req, res) => {
  try {
    const { tripId, itemId } = req.params;
    const item = await ChecklistItem.findOneAndDelete({ _id: itemId, tripId });
    if (!item) return res.status(404).json({ message: "Item not found" });

    // Broadcast deletion to all trip members in real time
    const io = req.app.get("io");
    if (io) {
      io.to(`trip:${tripId}`).emit("packing:item-deleted", { itemId });
    }

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getChecklist, addItem, updateItem, deleteItem };
