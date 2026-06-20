const db = require('../database/db');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Send gift
const sendGift = async (req, res) => {
  try {
    const { stream_id, gift_type, amount } = req.body;
    const senderId = req.user.id;

    if (!stream_id || !gift_type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get gift points
    const giftConfig = {
      'rose': 100,
      'diamond': 500,
      'crown': 1000,
      'airplane': 5000
    };

    const points = giftConfig[gift_type] || 100;

    const result = await db.query(
      `INSERT INTO gifts (stream_id, sender_id, gift_type, amount, points) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [stream_id, senderId, gift_type, amount, points]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('sendGift error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get stream gifts
const getStreamGifts = async (req, res) => {
  try {
    const { streamId } = req.params;

    const result = await db.query(
      `SELECT g.*, u.username, u.avatar_url 
       FROM gifts g 
       JOIN users u ON g.sender_id = u.id 
       WHERE g.stream_id = $1 
       ORDER BY g.created_at DESC 
       LIMIT 100`,
      [streamId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('getStreamGifts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user gift history
const getUserGiftHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await db.query(
      `SELECT g.*, s.title as stream_title 
       FROM gifts g 
       JOIN streams s ON g.stream_id = s.id 
       WHERE g.sender_id = $1 
       ORDER BY g.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('getUserGiftHistory error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  sendGift,
  getStreamGifts,
  getUserGiftHistory
};
