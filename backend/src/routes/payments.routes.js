const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/payments.controller');
const { validateToken } = require('../middleware/auth.middleware');

// Create payment intent (protected)
router.post('/create-intent', validateToken, paymentsController.createPaymentIntent);

// Confirm payment (protected)
router.post('/confirm', validateToken, paymentsController.confirmPayment);

// Get user payment history
router.get('/history/:userId', validateToken, paymentsController.getPaymentHistory);

// Webhook from Stripe
router.post('/webhook', paymentsController.handleWebhook);

module.exports = router;
