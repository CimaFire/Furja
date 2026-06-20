const db = require('../database/db');
const asyncHandler = require('../utils/asyncHandler');
const { requireFields, findMany } = require('../utils/db.helpers');

// Send gift
const sendGift = asyncHandler(async (req, res) => {
  const { stream_id, gift_type, amount } = req.body;

  requireFields(req.body, ['stream_id', 'gift_type']);

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
    [stream_id, req.user.id, gift_type, amount, points]
  );

  res.status(201).json(result.rows[0]);
});

// Get stream gifts
const getStreamGifts = asyncHandler(async (req, res) => {
  const gifts = await findMany(
    `SELECT g.*, u.username, u.avatar_url 
     FROM gifts g 
     JOIN users u ON g.sender_id = u.id 
     WHERE g.stream_id = $1 
     ORDER BY g.created_at DESC 
     LIMIT 100`,
    [req.params.streamId]
  );

  res.json(gifts);
});

// Get user gift history
const getUserGiftHistory = asyncHandler(async (req, res) => {
  const gifts = await findMany(
    `SELECT g.*, s.title as stream_title 
     FROM gifts g 
     JOIN streams s ON g.stream_id = s.id 
     WHERE g.sender_id = $1 
     ORDER BY g.created_at DESC`,
    [req.params.userId]
  );

  res.json(gifts);
});

module.exports = { sendGift, getStreamGifts, getUserGiftHistory };
