const express = require("express");
const router = express.Router({ mergeParams: true });

const { protect } = require("../middleware/authMiddleware");

const {
  createItineraryItem,
  getTripItinerary,
  updateItineraryItem,
  deleteItineraryItem,
  reorderItineraryItems,
} = require("../controllers/itineraryController");

// All routes require authentication
router.use(protect);

// GET    /api/trips/:tripId/itinerary
// POST   /api/trips/:tripId/itinerary
router.route("/").get(getTripItinerary).post(createItineraryItem);

// PUT    /api/trips/:tripId/itinerary/reorder
router.put("/reorder", reorderItineraryItems);

// PUT    /api/trips/:tripId/itinerary/:itemId
// DELETE /api/trips/:tripId/itinerary/:itemId
router.route("/:itemId")
  .put(updateItineraryItem)
  .delete(deleteItineraryItem);

module.exports = router;