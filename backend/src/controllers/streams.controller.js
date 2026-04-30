const db = require('../database/db');
const crypto = require('crypto');

// Get all active streams
const getAllStreams = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT s.*, u.username, u.avatar_url 
       FROM streams s 
       JOIN users u ON s.user_id = u.id 
       WHERE s.status = 'live' 
       ORDER BY s.viewer_count DESC`
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get single stream
const getStreamById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT s.*, u.username, u.avatar_url 
       FROM streams s 
       JOIN users u ON s.user_id = u.id 
       WHERE s.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Stream not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create stream
const createStream = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.id;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Generate unique stream key
    const streamKey = crypto.randomBytes(16).toString('hex');

    const result = await db.query(
      `INSERT INTO streams (user_id, title, description, stream_key, status) 
       VALUES ($1, $2, $3, $4, 'scheduled') 
       RETURNING *`,
      [userId, title, description, streamKey]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update stream
const updateStream = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, thumbnail_url } = req.body;
    const userId = req.user.id;

    // Check ownership
    const streamCheck = await db.query(
      'SELECT user_id FROM streams WHERE id = $1',
      [id]
    );

    if (streamCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Stream not found' });
    }

    if (streamCheck.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const result = await db.query(
      `UPDATE streams 
       SET title = COALESCE($1, title), 
           description = COALESCE($2, description),
           thumbnail_url = COALESCE($3, thumbnail_url),
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $4 
       RETURNING *`,
      [title, description, thumbnail_url, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// End stream
const endStream = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check ownership
    const streamCheck = await db.query(
      'SELECT user_id, started_at FROM streams WHERE id = $1',
      [id]
    );

    if (streamCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Stream not found' });
    }

    if (streamCheck.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Calculate duration
    const startTime = new Date(streamCheck.rows[0].started_at);
    const duration = Math.floor((Date.now() - startTime) / 1000);

    const result = await db.query(
      `UPDATE streams 
       SET status = 'ended', 
           ended_at = CURRENT_TIMESTAMP,
           duration = $1,
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
      [duration, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get stream analytics
const getStreamAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT a.* FROM analytics a 
       WHERE a.stream_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No analytics found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllStreams,
  getStreamById,
  createStream,
  updateStream,
  endStream,
  getStreamAnalytics
};
