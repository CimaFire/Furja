const db = require('../database/db');

// Get real-time stream analytics
const getStreamLiveAnalytics = async (req, res) => {
  try {
    const { streamId } = req.params;

    const result = await db.query(
      `SELECT 
        s.id,
        s.title,
        s.viewer_count,
        COUNT(DISTINCT m.id) as total_messages,
        COUNT(DISTINCT g.id) as total_gifts,
        COALESCE(SUM(g.points), 0) as total_points
       FROM streams s
       LEFT JOIN messages m ON s.id = m.stream_id AND m.created_at > NOW() - INTERVAL '5 minutes'
       LEFT JOIN gifts g ON s.id = g.stream_id AND g.created_at > NOW() - INTERVAL '5 minutes'
       WHERE s.id = $1
       GROUP BY s.id, s.title, s.viewer_count`,
      [streamId]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Stream not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('getStreamLiveAnalytics error:', error);
    res.status(500).json({ error: 'Failed to get live analytics' });
  }
};

// Get user engagement metrics
const getUserEngagement = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await db.query(
      `SELECT 
        COUNT(DISTINCT s.id) as streams_count,
        SUM(s.viewer_count) as total_views,
        COUNT(DISTINCT m.id) as total_messages,
        COUNT(DISTINCT g.id) as total_gifts_sent,
        COALESCE(SUM(g.points), 0) as total_points_spent,
        AVG(s.duration) as avg_stream_duration
       FROM users u
       LEFT JOIN streams s ON u.id = s.user_id
       LEFT JOIN messages m ON u.id = m.user_id
       LEFT JOIN gifts g ON u.id = g.sender_id
       WHERE u.id = $1`,
      [userId]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('getUserEngagement error:', error);
    res.status(500).json({ error: 'Failed to get engagement metrics' });
  }
};

// Get top streams
const getTopStreams = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const result = await db.query(
      `SELECT s.*, u.username, u.avatar_url
       FROM streams s
       JOIN users u ON s.user_id = u.id
       WHERE s.status = 'live'
       ORDER BY s.viewer_count DESC
       LIMIT $1`,
      [limit]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('getTopStreams error:', error);
    res.status(500).json({ error: 'Failed to get top streams' });
  }
};

// Get trending topics
const getTrendingTopics = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
        SUBSTRING(m.content FROM '#(\\w+)') as topic,
        COUNT(*) as count
       FROM messages m
       WHERE m.content LIKE '%#%' AND m.created_at > NOW() - INTERVAL '1 hour'
       GROUP BY topic
       ORDER BY count DESC
       LIMIT 20`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('getTrendingTopics error:', error);
    res.status(500).json({ error: 'Failed to get trending topics' });
  }
};

module.exports = {
  getStreamLiveAnalytics,
  getUserEngagement,
  getTopStreams,
  getTrendingTopics
};
