const db = require('../database/db');
const asyncHandler = require('../utils/asyncHandler');
const { findMany } = require('../utils/db.helpers');

// Search streams
const searchStreams = asyncHandler(async (req, res) => {
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

  if (query) {
    sqlQuery += ` AND (s.title ILIKE $${params.length + 1} OR s.description ILIKE $${params.length + 1})`;
    params.push(`%${query}%`);
  }

  sqlQuery += ` AND s.status = 'live'`;

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
});

// Search users
const searchUsers = asyncHandler(async (req, res) => {
  const { query } = req.query;
  const limit = parseInt(req.query.limit) || 20;

  const users = await findMany(
    `SELECT id, username, email, first_name, last_name, avatar_url
     FROM users
     WHERE (username ILIKE $1 OR first_name ILIKE $1 OR last_name ILIKE $1)
     AND is_banned = false
     LIMIT $2`,
    [`%${query}%`, limit]
  );

  res.json(users);
});

// Get trending categories
const getTrendingCategories = asyncHandler(async (req, res) => {
  const categories = await findMany(
    `SELECT category, COUNT(*) as count
     FROM streams
     WHERE status = 'live' AND created_at > NOW() - INTERVAL '24 hours'
     GROUP BY category
     ORDER BY count DESC
     LIMIT 15`
  );

  res.json(categories);
});

module.exports = { searchStreams, searchUsers, getTrendingCategories };
