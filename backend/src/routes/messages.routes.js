const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messages.controller');
const { validateToken } = require('../middleware/auth.middleware');

// Get stream messages
router.get('/stream/:streamId', messagesController.getStreamMessages);

// Send message (protected - via WebSocket, this is for history)
router.post('/', validateToken, messagesController.sendMessage);

// Delete message (protected)
router.delete('/:id', validateToken, messagesController.deleteMessage);

module.exports = router;
