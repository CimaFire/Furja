const db = require('../database/db');
const stripe = require('../utils/stripe');
const asyncHandler = require('../utils/asyncHandler');
const { requireFields, findMany, requireSelfOrFail } = require('../utils/db.helpers');
const { ValidationError } = require('../utils/errors');

// Create payment intent
const createPaymentIntent = asyncHandler(async (req, res) => {
  const { amount, currency } = req.body;
  const userId = req.user.id;

  requireFields(req.body, ['amount', 'currency']);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    metadata: { userId }
  });

  await db.query(
    `INSERT INTO payments (user_id, amount, currency, transaction_id, status) 
     VALUES ($1, $2, $3, $4, 'pending')`,
    [userId, amount, currency, paymentIntent.id]
  );

  res.json({
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id
  });
});

// Confirm payment
const confirmPayment = asyncHandler(async (req, res) => {
  const { paymentIntentId } = req.body;

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status === 'succeeded') {
    await db.query(
      `UPDATE payments SET status = 'completed' WHERE transaction_id = $1`,
      [paymentIntentId]
    );

    res.json({ message: 'Payment confirmed', status: 'succeeded' });
  } else {
    throw new ValidationError('Payment not completed');
  }
});

// Get payment history
const getPaymentHistory = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  requireSelfOrFail(req.user.id, userId);

  const payments = await findMany(
    'SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );

  res.json(payments);
});

// Handle Stripe webhook
const handleWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(
    req.body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    await db.query(
      'UPDATE payments SET status = "completed" WHERE transaction_id = $1',
      [paymentIntent.id]
    );
  }

  res.json({ received: true });
});

module.exports = { createPaymentIntent, confirmPayment, getPaymentHistory, handleWebhook };
