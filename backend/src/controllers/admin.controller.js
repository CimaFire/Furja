const db = require('../database/db');

// Get platform statistics
const getPlatformStats = async (req, res) => {
  try {
    const stats = await db.query(
      `SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE is_broadcaster = true) as total_broadcasters,
        (SELECT COUNT(*) FROM streams WHERE status = 'live') as live_streams,
        (SELECT SUM(viewer_count) FROM streams WHERE status = 'live') as total_viewers,
        (SELECT COUNT(*) FROM streams WHERE created_at > NOW() - INTERVAL '24 hours') as streams_24h,
        (SELECT SUM(amount) FROM payments WHERE status = 'completed' AND created_at > NOW() - INTERVAL '30 days') as revenue_30d`
    );

    res.json(stats.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get platform stats' });
  }
};

// Get user statistics
const getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const stats = await db.query(
      `SELECT 
        u.id,
        u.username,
        COUNT(DISTINCT s.id) as total_streams,
        COUNT(DISTINCT f.follower_id) as followers,
        COALESCE(SUM(s.viewer_count), 0) as total_views,
        (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE user_id = u.id AND status = 'completed') as total_earnings
       FROM users u
       LEFT JOIN streams s ON u.id = s.user_id
       LEFT JOIN follows f ON u.id = f.following_id
       WHERE u.id = $1
       GROUP BY u.id, u.username`,
      [userId]
    );

    res.json(stats.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user stats' });
  }
};

// Get revenue report
const getRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const report = await db.query(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as transactions,
        SUM(amount) as total_amount,
        AVG(amount) as average_amount
       FROM payments
       WHERE status = 'completed'
       AND created_at >= $1 AND created_at <= $2
       GROUP BY DATE(created_at)
       ORDER BY date DESC`,
      [startDate, endDate]
    );

    res.json(report.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get revenue report' });
  }
};

module.exports = {
  getPlatformStats,
  getUserStats,
  getRevenueReport
};
