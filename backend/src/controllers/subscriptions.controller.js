const db = require('../database/db');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create subscription
const createSubscription = async (req, res) => {
  try {
    const { planId, paymentMethodId } = req.body;
    const userId = req.user.id;

    // Get or create Stripe customer
    let customer;
    const userResult = await db.query(
      'SELECT stripe_customer_id FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows[0]?.stripe_customer_id) {
      customer = { id: userResult.rows[0].stripe_customer_id };
    } else {
      customer = await stripe.customers.create({
        email: req.user.email
      });

      await db.query(
        'UPDATE users SET stripe_customer_id = $1 WHERE id = $2',
        [customer.id, userId]
      );
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: planId }],
      default_payment_method: paymentMethodId,
      payment_behavior: 'default_incomplete'
    });

    // Save subscription to DB
    await db.query(
      `INSERT INTO subscriptions (user_id, stripe_subscription_id, plan_id, status) 
       VALUES ($1, $2, $3, $4)`,
      [userId, subscription.id, planId, subscription.status]
    );

    res.json({ subscription });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create subscription' });
  }
};

// Cancel subscription
const cancelSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    const userId = req.user.id;

    const subResult = await db.query(
      'SELECT stripe_subscription_id FROM subscriptions WHERE id = $1 AND user_id = $2',
      [subscriptionId, userId]
    );

    if (subResult.rows.length === 0) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    await stripe.subscriptions.cancel(subResult.rows[0].stripe_subscription_id);

    await db.query(
      'UPDATE subscriptions SET status = $1 WHERE id = $2',
      ['cancelled', subscriptionId]
    );

    res.json({ message: 'Subscription cancelled' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
};

// Get subscription
const getSubscription = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      'SELECT * FROM subscriptions WHERE user_id = $1 AND status != $2',
      [userId, 'cancelled']
    );

    if (result.rows.length === 0) {
      return res.json({ subscription: null });
    }

    res.json({ subscription: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get subscription' });
  }
};

module.exports = {
  createSubscription,
  cancelSubscription,
  getSubscription
};
