const express = require('express');
const router = express.Router();
const giftsController = require('../controllers/gifts.controller');
const { validateToken } = require('../middleware/auth.middleware');

// Get stream gifts
router.get('/stream/:streamId', giftsController.getStreamGifts);

// Send gift (protected)
router.post('/', validateToken, giftsController.sendGift);

// Get user gift history (protected)
router.get('/user/:userId/history', validateToken, giftsController.getUserGiftHistory);

module.exports = router;
