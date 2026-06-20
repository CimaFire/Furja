const db = require('../database/db');
const asyncHandler = require('../utils/asyncHandler');
const { findOneOrFail, findMany, requireSelfOrFail } = require('../utils/db.helpers');
const { ValidationError } = require('../utils/errors');

// Get user by ID
const getUserById = asyncHandler(async (req, res) => {
  const user = await findOneOrFail(
    'SELECT id, username, email, first_name, last_name, bio, avatar_url, is_broadcaster, created_at FROM users WHERE id = $1',
    [req.params.id],
    'User'
  );

  res.json(user);
});

// Update user
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, bio, avatar_url } = req.body;

  requireSelfOrFail(req.user.id, id);

  const result = await db.query(
    'UPDATE users SET first_name = $1, last_name = $2, bio = $3, avatar_url = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
    [first_name, last_name, bio, avatar_url, id]
  );

  res.json(result.rows[0]);
});

// Get user streams
const getUserStreams = asyncHandler(async (req, res) => {
  const streams = await findMany(
    'SELECT * FROM streams WHERE user_id = $1 ORDER BY created_at DESC',
    [req.params.id]
  );

  res.json(streams);
});

// Get user followers
const getUserFollowers = asyncHandler(async (req, res) => {
  const followers = await findMany(
    'SELECT u.* FROM users u JOIN follows f ON u.id = f.follower_id WHERE f.following_id = $1',
    [req.params.id]
  );

  res.json(followers);
});

// Follow user
const followUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const followerId = req.user.id;

  if (followerId === parseInt(id)) {
    throw new ValidationError('Cannot follow yourself');
  }

  const existing = await db.query(
    'SELECT * FROM follows WHERE follower_id = $1 AND following_id = $2',
    [followerId, id]
  );

  if (existing.rows.length > 0) {
    throw new ValidationError('Already following this user');
  }

  await db.query(
    'INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)',
    [followerId, id]
  );

  res.json({ message: 'Followed successfully' });
});

// Unfollow user
const unfollowUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await db.query(
    'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2',
    [req.user.id, id]
  );

  res.json({ message: 'Unfollowed successfully' });
});

module.exports = { getUserById, updateUser, getUserStreams, getUserFollowers, followUser, unfollowUser };
