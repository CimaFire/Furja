const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { validateToken } = require('../middleware/auth.middleware');

// Get stream analytics (protected)
router.get('/stream/:streamId', validateToken, analyticsController.getStreamAnalytics);

// Get user analytics (protected)
router.get('/user/:userId', validateToken, analyticsController.getUserAnalytics);

// Get platform statistics (admin only)
router.get('/admin/stats', validateToken, analyticsController.getPlatformStats);

module.exports = router;
