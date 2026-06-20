const db = require('../database/db');
const asyncHandler = require('../utils/asyncHandler');
const { findMany } = require('../utils/db.helpers');

// Get real-time stream analytics
const getStreamLiveAnalytics = asyncHandler(async (req, res) => {
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
    [req.params.streamId]
  );

  res.json(result.rows[0]);
});

// Get user engagement metrics
const getUserEngagement = asyncHandler(async (req, res) => {
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
    [req.params.userId]
  );

  res.json(result.rows[0]);
});

// Get top streams
const getTopStreams = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const streams = await findMany(
    `SELECT s.*, u.username, u.avatar_url
     FROM streams s
     JOIN users u ON s.user_id = u.id
     WHERE s.status = 'live'
     ORDER BY s.viewer_count DESC
     LIMIT $1`,
    [limit]
  );

  res.json(streams);
});

// Get trending topics
const getTrendingTopics = asyncHandler(async (req, res) => {
  const topics = await findMany(
    `SELECT 
      SUBSTRING(m.content FROM '#(\\w+)') as topic,
      COUNT(*) as count
     FROM messages m
     WHERE m.content LIKE '%#%' AND m.created_at > NOW() - INTERVAL '1 hour'
     GROUP BY topic
     ORDER BY count DESC
     LIMIT 20`
  );

  res.json(topics);
});

module.exports = { getStreamLiveAnalytics, getUserEngagement, getTopStreams, getTrendingTopics };
