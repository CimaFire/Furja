const db = require('../database/db');

// Search streams
const searchStreams = async (req, res) => {
  try {
    const { query, category, sort = 'latest' } = req.query;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    let sqlQuery = `
      SELECT s.*, u.username, u.avatar_url
      FROM streams s
      JOIN users u ON s.user_id = u.id
      WHERE 1=1
    `;

    const params = [];

    // Search by title or description
    if (query) {
      sqlQuery += ` AND (s.title ILIKE $${params.length + 1} OR s.description ILIKE $${params.length + 1})`;
      params.push(`%${query}%`);
    }

    // Filter by status
    sqlQuery += ` AND s.status = 'live'`;

    // Sort
    if (sort === 'popular') {
      sqlQuery += ` ORDER BY s.viewer_count DESC`;
    } else if (sort === 'trending') {
      sqlQuery += ` ORDER BY s.created_at DESC, s.viewer_count DESC`;
    } else {
      sqlQuery += ` ORDER BY s.created_at DESC`;
    }

    sqlQuery += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await db.query(sqlQuery, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
};

// Search users
const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const limit = parseInt(req.query.limit) || 20;

    const result = await db.query(
      `SELECT id, username, email, first_name, last_name, avatar_url
       FROM users
       WHERE (username ILIKE $1 OR first_name ILIKE $1 OR last_name ILIKE $1)
       AND is_banned = false
       LIMIT $2`,
      [`%${query}%`, limit]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
};

// Get trending categories
const getTrendingCategories = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT category, COUNT(*) as count
       FROM streams
       WHERE status = 'live' AND created_at > NOW() - INTERVAL '24 hours'
       GROUP BY category
       ORDER BY count DESC
       LIMIT 15`
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get categories' });
  }
};

module.exports = {
  searchStreams,
  searchUsers,
  getTrendingCategories
};
