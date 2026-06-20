const db = require('../database/db');
const asyncHandler = require('../utils/asyncHandler');
const { requireFields, findMany, checkOwnership } = require('../utils/db.helpers');

// Get stream messages
const getStreamMessages = asyncHandler(async (req, res) => {
  const { streamId } = req.params;
  const limit = req.query.limit || 50;
  const offset = req.query.offset || 0;

  const messages = await findMany(
    `SELECT m.*, u.username, u.avatar_url 
     FROM messages m 
     JOIN users u ON m.user_id = u.id 
     WHERE m.stream_id = $1 
     ORDER BY m.created_at DESC 
     LIMIT $2 OFFSET $3`,
    [streamId, limit, offset]
  );

  res.json(messages);
});

// Send message
const sendMessage = asyncHandler(async (req, res) => {
  const { stream_id, content } = req.body;

  requireFields(req.body, ['stream_id', 'content']);

  const result = await db.query(
    `INSERT INTO messages (stream_id, user_id, content) 
     VALUES ($1, $2, $3) 
     RETURNING *`,
    [stream_id, req.user.id, content]
  );

  res.status(201).json(result.rows[0]);
});

// Delete message
const deleteMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await checkOwnership('messages', id, req.user.id, 'Message');

  await db.query('DELETE FROM messages WHERE id = $1', [id]);

  res.json({ message: 'Message deleted successfully' });
});

module.exports = { getStreamMessages, sendMessage, deleteMessage };
