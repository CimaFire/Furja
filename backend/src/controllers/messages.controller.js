const db = require('../database/db');

// Get stream messages
const getStreamMessages = async (req, res) => {
  try {
    const { streamId } = req.params;
    const limit = req.query.limit || 50;
    const offset = req.query.offset || 0;

    const result = await db.query(
      `SELECT m.*, u.username, u.avatar_url 
       FROM messages m 
       JOIN users u ON m.user_id = u.id 
       WHERE m.stream_id = $1 
       ORDER BY m.created_at DESC 
       LIMIT $2 OFFSET $3`,
      [streamId, limit, offset]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('getStreamMessages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Send message
const sendMessage = async (req, res) => {
  try {
    const { stream_id, content } = req.body;
    const user_id = req.user.id;

    if (!stream_id || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await db.query(
      `INSERT INTO messages (stream_id, user_id, content) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [stream_id, user_id, content]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('sendMessage error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete message
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check ownership
    const messageCheck = await db.query(
      'SELECT user_id FROM messages WHERE id = $1',
      [id]
    );

    if (messageCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (messageCheck.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await db.query('DELETE FROM messages WHERE id = $1', [id]);

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('deleteMessage error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getStreamMessages,
  sendMessage,
  deleteMessage
};
