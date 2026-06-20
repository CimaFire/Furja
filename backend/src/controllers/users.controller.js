const db = require('../database/db');

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'SELECT id, username, email, first_name, last_name, bio, avatar_url, is_broadcaster, created_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, bio, avatar_url } = req.body;

    // Check if user is updating their own profile
    if (req.user.id !== parseInt(id)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const result = await db.query(
      'UPDATE users SET first_name = $1, last_name = $2, bio = $3, avatar_url = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING id, username, email, first_name, last_name, bio, avatar_url',
      [first_name, last_name, bio, avatar_url, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user streams
const getUserStreams = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'SELECT * FROM streams WHERE user_id = $1 ORDER BY created_at DESC',
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user followers
const getUserFollowers = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'SELECT u.id, u.username, u.avatar_url, u.first_name, u.last_name FROM users u JOIN follows f ON u.id = f.follower_id WHERE f.following_id = $1',
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Follow user
const followUser = async (req, res) => {
  try {
    const { id } = req.params;
    const followerId = req.user.id;

    if (followerId === parseInt(id)) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    // Check if already following
    const existing = await db.query(
      'SELECT * FROM follows WHERE follower_id = $1 AND following_id = $2',
      [followerId, id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Already following this user' });
    }

    // Add follow relationship
    await db.query(
      'INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)',
      [followerId, id]
    );

    res.json({ message: 'Followed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Unfollow user
const unfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const followerId = req.user.id;

    await db.query(
      'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2',
      [followerId, id]
    );

    res.json({ message: 'Unfollowed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getUserById,
  updateUser,
  getUserStreams,
  getUserFollowers,
  followUser,
  unfollowUser
};
