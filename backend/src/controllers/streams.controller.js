const db = require('../database/db');
const crypto = require('crypto');
const asyncHandler = require('../utils/asyncHandler');
const { requireFields, findOneOrFail, findMany, checkOwnership } = require('../utils/db.helpers');

// Get all active streams
const getAllStreams = asyncHandler(async (req, res) => {
  const streams = await findMany(
    `SELECT s.*, u.username, u.avatar_url 
     FROM streams s 
     JOIN users u ON s.user_id = u.id 
     WHERE s.status = 'live' 
     ORDER BY s.viewer_count DESC`
  );

  res.json(streams);
});

// Get single stream
const getStreamById = asyncHandler(async (req, res) => {
  const stream = await findOneOrFail(
    `SELECT s.*, u.username, u.avatar_url 
     FROM streams s 
     JOIN users u ON s.user_id = u.id 
     WHERE s.id = $1`,
    [req.params.id],
    'Stream'
  );

  res.json(stream);
});

// Create stream
const createStream = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  requireFields(req.body, ['title']);

  const streamKey = crypto.randomBytes(16).toString('hex');

  const result = await db.query(
    `INSERT INTO streams (user_id, title, description, stream_key, status) 
     VALUES ($1, $2, $3, $4, 'scheduled') 
     RETURNING *`,
    [req.user.id, title, description, streamKey]
  );

  res.status(201).json(result.rows[0]);
});

// Update stream
const updateStream = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, thumbnail_url } = req.body;

  await checkOwnership('streams', id, req.user.id, 'Stream');

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
});

// End stream
const endStream = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const stream = await findOneOrFail(
    'SELECT user_id, started_at FROM streams WHERE id = $1',
    [id],
    'Stream'
  );

  await checkOwnership('streams', id, req.user.id, 'Stream');

  const startTime = new Date(stream.started_at);
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
});

// Get stream analytics
const getStreamAnalytics = asyncHandler(async (req, res) => {
  const analytics = await findOneOrFail(
    `SELECT a.* FROM analytics a WHERE a.stream_id = $1`,
    [req.params.id],
    'No analytics'
  );

  res.json(analytics);
});

module.exports = { getAllStreams, getStreamById, createStream, updateStream, endStream, getStreamAnalytics };
