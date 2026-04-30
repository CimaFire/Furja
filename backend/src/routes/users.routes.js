const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const { validateToken } = require('../middleware/auth.middleware');

// Get user by ID
router.get('/:id', usersController.getUserById);

// Update user (protected)
router.put('/:id', validateToken, usersController.updateUser);

// Get user streams
router.get('/:id/streams', usersController.getUserStreams);

// Get user followers
router.get('/:id/followers', usersController.getUserFollowers);

// Follow user (protected)
router.post('/:id/follow', validateToken, usersController.followUser);

// Unfollow user (protected)
router.delete('/:id/follow', validateToken, usersController.unfollowUser);

module.exports = router;
