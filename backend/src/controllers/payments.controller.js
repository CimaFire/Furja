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

    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata: { userId: String(userId) }
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
    console.error('createPaymentIntent error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
};

// Confirm payment
const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const userId = req.user.id;

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID is required' });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      await db.query(
        `UPDATE payments SET status = 'completed' WHERE transaction_id = $1`,
        [paymentIntentId]
      );

      res.json({ message: 'Payment confirmed', status: 'succeeded' });
    } else {
      res.status(400).json({ error: 'Payment not completed', status: paymentIntent.status });
    }
  } catch (error) {
    console.error('confirmPayment error:', error);
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
    console.error('getPaymentHistory error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Handle Stripe webhook
const handleWebhook = async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];

    if (!sig) {
      return res.status(400).json({ error: 'Missing stripe-signature header' });
    }

    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      await db.query(
        "UPDATE payments SET status = 'completed' WHERE transaction_id = $1",
        [paymentIntent.id]
      );
    }

    res.json({ received: true });
  } catch (error) {
    console.error('handleWebhook error:', error);
    res.status(400).json({ error: 'Webhook signature verification failed' });
  }
};

module.exports = {
  createPaymentIntent,
  confirmPayment,
  getPaymentHistory,
  handleWebhook
};
