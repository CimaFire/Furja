const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validateToken } = require('../middleware/auth.middleware');

// Public Routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);

// Protected Routes
router.post('/logout', validateToken, authController.logout);
router.get('/me', validateToken, authController.getCurrentUser);

module.exports = router;
