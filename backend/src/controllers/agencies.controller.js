const db = require('../database/db');
const stripe = require('../utils/stripe');
const asyncHandler = require('../utils/asyncHandler');
const { findOneOrFail, findMany, checkAgencyAdmin } = require('../utils/db.helpers');
const { ValidationError } = require('../utils/errors');

// Register agency
const registerAgency = asyncHandler(async (req, res) => {
  const { agencyName, agencyType, businessRegistration, contactEmail } = req.body;
  const userId = req.user.id;

  const existingAgency = await db.query(
    'SELECT * FROM agencies WHERE admin_id = $1',
    [userId]
  );

  if (existingAgency.rows.length > 0) {
    throw new ValidationError('User already has an agency');
  }

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
});

// Get agency
const getAgency = asyncHandler(async (req, res) => {
  const agency = await findOneOrFail(
    'SELECT * FROM agencies WHERE id = $1',
    [req.params.agencyId],
    'Agency'
  );

  res.json(agency);
});

// Add broadcaster to agency
const addBroadcaster = asyncHandler(async (req, res) => {
  const { agencyId, broadcasterId, contractType } = req.body;

  await checkAgencyAdmin(agencyId, req.user.id);

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
});

// Get agency broadcasters
const getAgencyBroadcasters = asyncHandler(async (req, res) => {
  const broadcasters = await findMany(
    `SELECT ab.*, u.username, u.avatar_url, s.title as last_stream
     FROM agency_broadcasters ab
     JOIN users u ON ab.broadcaster_id = u.id
     LEFT JOIN streams s ON u.id = s.user_id
     WHERE ab.agency_id = $1 AND ab.status = 'active'
     ORDER BY ab.joined_at DESC`,
    [req.params.agencyId]
  );

  res.json(broadcasters);
});

// Get agency earnings
const getAgencyEarnings = asyncHandler(async (req, res) => {
  const { agencyId } = req.params;

  await checkAgencyAdmin(agencyId, req.user.id);

  const earnings = await findMany(
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

  res.json(earnings);
});

// Withdraw agency earnings
const withdrawEarnings = asyncHandler(async (req, res) => {
  const { agencyId, amount } = req.body;

  await checkAgencyAdmin(agencyId, req.user.id);

  const earningsResult = await db.query(
    `SELECT COALESCE(SUM(commission_amount), 0) as total
     FROM agency_earnings
     WHERE agency_id = $1 AND withdrawn = false`,
    [agencyId]
  );

  const totalEarnings = earningsResult.rows[0].total;

  if (amount > totalEarnings) {
    throw new ValidationError('Insufficient earnings');
  }

  const payout = await stripe.payouts.create({
    amount: Math.floor(amount * 100),
    currency: 'usd'
  });

  await db.query(
    `UPDATE agency_earnings SET withdrawn = true WHERE agency_id = $1 AND withdrawn = false LIMIT $2`,
    [agencyId, Math.floor(amount)]
  );

  res.json({
    message: 'Withdrawal successful',
    payout: payout
  });
});

module.exports = { registerAgency, getAgency, addBroadcaster, getAgencyBroadcasters, getAgencyEarnings, withdrawEarnings };
