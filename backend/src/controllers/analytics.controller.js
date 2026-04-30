const db = require('../database/db');

// Get stream analytics
const getStreamAnalytics = async (req, res) => {
  try {
    const { streamId } = req.params;
    const userId = req.user.id;

    // Verify ownership
    const streamCheck = await db.query(
      'SELECT user_id FROM streams WHERE id = $1',
      [streamId]
    );

    if (streamCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Stream not found' });
    }

    if (streamCheck.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const result = await db.query(
      `SELECT a.* FROM analytics a WHERE a.stream_id = $1`,
      [streamId]
    );

    res.json(result.rows[0] || { message: 'No analytics available' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user analytics
const getUserAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify ownership
    if (req.user.id !== parseInt(userId)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

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
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get platform statistics (admin only)
const getPlatformStats = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getStreamAnalytics,
  getUserAnalytics,
  getPlatformStats
};
