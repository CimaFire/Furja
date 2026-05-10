const db = require('../database/db');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Register agency
const registerAgency = async (req, res) => {
  try {
    const { agencyName, agencyType, businessRegistration, contactEmail } = req.body;
    const userId = req.user.id;

    // Check if user already has agency
    const existingAgency = await db.query(
      'SELECT * FROM agencies WHERE admin_id = $1',
      [userId]
    );

    if (existingAgency.rows.length > 0) {
      return res.status(400).json({ error: 'User already has an agency' });
    }

    // Create agency
    const result = await db.query(
      `INSERT INTO agencies (admin_id, name, type, business_registration, contact_email, status, commission_rate) 
       VALUES ($1, $2, $3, $4, $5, 'pending', 0.15) 
       RETURNING *`,
      [userId, agencyName, agencyType, businessRegistration, contactEmail]
    );

    res.status(201).json({
      message: 'Agency registered successfully',
      agency: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to register agency' });
  }
};

// Get agency
const getAgency = async (req, res) => {
  try {
    const { agencyId } = req.params;

    const result = await db.query(
      'SELECT * FROM agencies WHERE id = $1',
      [agencyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Agency not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get agency' });
  }
};

// Add broadcaster to agency
const addBroadcaster = async (req, res) => {
  try {
    const { agencyId, broadcasterId, contractType } = req.body;
    const userId = req.user.id;

    // Check if user is agency admin
    const agencyResult = await db.query(
      'SELECT * FROM agencies WHERE id = $1 AND admin_id = $2',
      [agencyId, userId]
    );

    if (agencyResult.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized to add broadcasters' });
    }

    // Add broadcaster
    const result = await db.query(
      `INSERT INTO agency_broadcasters (agency_id, broadcaster_id, contract_type, status, joined_at) 
       VALUES ($1, $2, $3, 'active', NOW()) 
       RETURNING *`,
      [agencyId, broadcasterId, contractType]
    );

    res.status(201).json({
      message: 'Broadcaster added to agency',
      broadcasterAgency: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add broadcaster' });
  }
};

// Get agency broadcasters
const getAgencyBroadcasters = async (req, res) => {
  try {
    const { agencyId } = req.params;

    const result = await db.query(
      `SELECT ab.*, u.username, u.avatar_url, s.title as last_stream
       FROM agency_broadcasters ab
       JOIN users u ON ab.broadcaster_id = u.id
       LEFT JOIN streams s ON u.id = s.user_id
       WHERE ab.agency_id = $1 AND ab.status = 'active'
       ORDER BY ab.joined_at DESC`,
      [agencyId]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get broadcasters' });
  }
};

// Get agency earnings
const getAgencyEarnings = async (req, res) => {
  try {
    const { agencyId } = req.params;
    const userId = req.user.id;

    // Check if user is agency admin
    const agencyResult = await db.query(
      'SELECT * FROM agencies WHERE id = $1 AND admin_id = $2',
      [agencyId, userId]
    );

    if (agencyResult.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const earnings = await db.query(
      `SELECT 
        DATE(p.created_at) as date,
        COUNT(*) as transactions,
        SUM(p.amount) as total_amount,
        SUM(p.amount * ae.commission_rate) as agency_earnings
       FROM payments p
       JOIN agency_earnings ae ON p.user_id = ae.user_id
       WHERE ae.agency_id = $1
       GROUP BY DATE(p.created_at)
       ORDER BY date DESC`,
      [agencyId]
    );

    res.json(earnings.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get earnings' });
  }
};

// Withdraw agency earnings
const withdrawEarnings = async (req, res) => {
  try {
    const { agencyId, amount } = req.body;
    const userId = req.user.id;

    // Check if user is agency admin
    const agencyResult = await db.query(
      'SELECT * FROM agencies WHERE id = $1 AND admin_id = $2',
      [agencyId, userId]
    );

    if (agencyResult.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Get total earnings
    const earningsResult = await db.query(
      `SELECT COALESCE(SUM(commission_amount), 0) as total
       FROM agency_earnings
       WHERE agency_id = $1 AND withdrawn = false`,
      [agencyId]
    );

    const totalEarnings = earningsResult.rows[0].total;

    if (amount > totalEarnings) {
      return res.status(400).json({ error: 'Insufficient earnings' });
    }

    // Create payout
    const payout = await stripe.payouts.create({
      amount: Math.floor(amount * 100),
      currency: 'usd'
    });

    // Mark as withdrawn
    await db.query(
      `UPDATE agency_earnings SET withdrawn = true WHERE agency_id = $1 AND withdrawn = false LIMIT $2`,
      [agencyId, Math.floor(amount)]
    );

    res.json({
      message: 'Withdrawal successful',
      payout: payout
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to withdraw earnings' });
  }
};

module.exports = {
  registerAgency,
  getAgency,
  addBroadcaster,
  getAgencyBroadcasters,
  getAgencyEarnings,
  withdrawEarnings
};
