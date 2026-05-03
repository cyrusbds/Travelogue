const express = require("express");
const router = express.Router({ mergeParams: true }); // mergeParams to access :tripId
const auth = require("../middleware/auth");
const {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
} = require("../controllers/noteController");

router.get("/", auth, getNotes);
router.post("/", auth, createNote);
router.put("/:noteId", auth, updateNote);
router.delete("/:noteId", auth, deleteNote);

module.exports = router;
