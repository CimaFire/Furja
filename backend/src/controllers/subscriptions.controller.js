const db = require('../database/db');
const stripe = require('../utils/stripe');
const asyncHandler = require('../utils/asyncHandler');
const { findOneOrFail } = require('../utils/db.helpers');
const { NotFoundError } = require('../utils/errors');

// Create subscription
const createSubscription = asyncHandler(async (req, res) => {
  const { planId, paymentMethodId } = req.body;
  const userId = req.user.id;

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

  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: planId }],
    default_payment_method: paymentMethodId,
    payment_behavior: 'default_incomplete'
  });

  await db.query(
    `INSERT INTO subscriptions (user_id, stripe_subscription_id, plan_id, status) 
     VALUES ($1, $2, $3, $4)`,
    [userId, subscription.id, planId, subscription.status]
  );

  res.json({ subscription });
});

// Cancel subscription
const cancelSubscription = asyncHandler(async (req, res) => {
  const { subscriptionId } = req.body;
  const userId = req.user.id;

  const sub = await findOneOrFail(
    'SELECT stripe_subscription_id FROM subscriptions WHERE id = $1 AND user_id = $2',
    [subscriptionId, userId],
    'Subscription'
  );

  await stripe.subscriptions.cancel(sub.stripe_subscription_id);

  await db.query(
    'UPDATE subscriptions SET status = $1 WHERE id = $2',
    ['cancelled', subscriptionId]
  );

  res.json({ message: 'Subscription cancelled' });
});

// Get subscription
const getSubscription = asyncHandler(async (req, res) => {
  const result = await db.query(
    'SELECT * FROM subscriptions WHERE user_id = $1 AND status != $2',
    [req.user.id, 'cancelled']
  );

  if (result.rows.length === 0) {
    return res.json({ subscription: null });
  }

  res.json({ subscription: result.rows[0] });
});

module.exports = { createSubscription, cancelSubscription, getSubscription };
