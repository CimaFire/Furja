const db = require('../database/db');
const asyncHandler = require('../utils/asyncHandler');
const { checkOwnership, requireSelfOrFail } = require('../utils/db.helpers');

// Get stream analytics
const getStreamAnalytics = asyncHandler(async (req, res) => {
  const { streamId } = req.params;

  await checkOwnership('streams', streamId, req.user.id, 'Stream');

  const result = await db.query(
    `SELECT a.* FROM analytics a WHERE a.stream_id = $1`,
    [streamId]
  );

  res.json(result.rows[0] || { message: 'No analytics available' });
});

// Get user analytics
const getUserAnalytics = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  requireSelfOrFail(req.user.id, userId);

  const result = await db.query(
    `SELECT 
      COUNT(DISTINCT s.id) as total_streams,
      SUM(a.total_viewers) as total_viewers,
      SUM(a.total_gifts_amount) as total_earnings,
      AVG(s.duration) as average_duration
     FROM streams s
     LEFT JOIN analytics a ON s.id = a.stream_id
     WHERE s.user_id = $1`,
    [userId]
  );

  res.json(result.rows[0]);
});

// Get platform statistics (admin only)
const getPlatformStats = asyncHandler(async (req, res) => {
  const result = await db.query(
    `SELECT 
      COUNT(DISTINCT u.id) as total_users,
      COUNT(DISTINCT s.id) as total_streams,
      SUM(a.total_viewers) as total_viewers,
      SUM(a.total_gifts_amount) as total_revenue
     FROM users u
     LEFT JOIN streams s ON u.id = s.user_id
     LEFT JOIN analytics a ON s.id = a.stream_id`
  );

  res.json(result.rows[0]);
});

module.exports = { getStreamAnalytics, getUserAnalytics, getPlatformStats };
