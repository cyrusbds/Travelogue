const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams lets us read :tripId from parent

const { protect, optionalAuth } = require('../middleware/authMiddleware');

const { getMessages, createMessage, deleteMessage } = require('../controllers/chatController');
const { getChecklist, addItem, updateItem, deleteItem } = require('../controllers/checklistController');

// ─── CHAT ─────────────────────────────────────────────────────────────────────
// GET uses optionalAuth — logged-in users get access check, guests still get 
// a chance to pass via guestId. Using protect here was causing the 401.
router.get('/chat/messages',              optionalAuth, getMessages);
router.post('/chat/messages',             protect,      createMessage);
router.delete('/chat/messages/:messageId',protect,      deleteMessage);

// ─── CHECKLIST ────────────────────────────────────────────────────────────────
router.get('/checklist',           optionalAuth, getChecklist);
router.post('/checklist',          protect,      addItem);
router.patch('/checklist/:itemId', protect,      updateItem);
router.delete('/checklist/:itemId',protect,      deleteItem);

module.exports = router;