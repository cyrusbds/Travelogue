// routes/pollRoutes.js
// Mounted inside tripRoutes.js as: router.use('/:tripId/polls', pollRoutes)
// Uses mergeParams: true so :tripId is visible here.

const express = require('express');
const router  = express.Router({ mergeParams: true });
const ctrl    = require('../controllers/pollController');
const { protect } = require('../middleware/authMiddleware');

router.get('/',                  protect, ctrl.getTripPolls);  // GET  all polls for a trip
router.post('/',                 protect, ctrl.createPoll);    // POST create poll
router.patch('/:pollId',         protect, ctrl.updatePoll);    // PATCH edit poll (pre-vote only)
router.post('/:pollId/vote',     protect, ctrl.votePoll);      // POST cast/change vote
router.post('/:pollId/close',    protect, ctrl.closePoll);     // POST close poll manually
router.delete('/:pollId',        protect, ctrl.deletePoll);    // DELETE remove poll

module.exports = router;