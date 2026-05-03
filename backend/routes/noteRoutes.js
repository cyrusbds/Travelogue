const express = require("express");
const router = express.Router({ mergeParams: true });
const auth = require("../middleware/authMiddleware");
const {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
} = require("../controllers/noteController");

router.get("/", auth, getNotes);
router.post("/", auth, createNote);
router.patch("/:noteId", auth, updateNote);
router.delete("/:noteId", auth, deleteNote);

module.exports = router;
