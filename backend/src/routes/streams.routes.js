const express = require('express');
const router = express.Router();
const streamsController = require('../controllers/streams.controller');
const { validateToken } = require('../middleware/auth.middleware');

// Get all active streams
router.get('/', streamsController.getAllStreams);

// Get single stream
router.get('/:id', streamsController.getStreamById);

// Create stream (protected)
router.post('/', validateToken, streamsController.createStream);

// Update stream (protected)
router.put('/:id', validateToken, streamsController.updateStream);

// End stream (protected)
router.post('/:id/end', validateToken, streamsController.endStream);

// Get stream analytics (protected)
router.get('/:id/analytics', validateToken, streamsController.getStreamAnalytics);

module.exports = router;
