const db = require('../database/db');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create payment intent
const createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency } = req.body;
    const userId = req.user.id;

    if (!amount || !currency) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata: { userId }
    });

    // Save to database
    await db.query(
      `INSERT INTO payments (user_id, amount, currency, transaction_id, status) 
       VALUES ($1, $2, $3, $4, 'pending')`,
      [userId, amount, currency, paymentIntent.id]
    );

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
};

// Confirm payment
const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const userId = req.user.id;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      await db.query(
        `UPDATE payments SET status = 'completed' WHERE transaction_id = $1`,
        [paymentIntentId]
      );

      res.json({ message: 'Payment confirmed', status: 'succeeded' });
    } else {
      res.status(400).json({ error: 'Payment not completed' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
};

// Get payment history
const getPaymentHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user is viewing their own history
    if (req.user.id !== parseInt(userId)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const result = await db.query(
      'SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Handle Stripe webhook
const handleWebhook = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(400).json({ error: 'Webhook error' });
  }
};

module.exports = {
  createPaymentIntent,
  confirmPayment,
  getPaymentHistory,
  handleWebhook
};
