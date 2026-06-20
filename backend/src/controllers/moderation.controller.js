const db = require('../database/db');
const asyncHandler = require('../utils/asyncHandler');
const { findMany } = require('../utils/db.helpers');

// Report content
const reportContent = asyncHandler(async (req, res) => {
  const { contentType, contentId, reason, description } = req.body;

  const result = await db.query(
    `INSERT INTO reports (user_id, content_type, content_id, reason, description, status) 
     VALUES ($1, $2, $3, $4, $5, 'pending') 
     RETURNING *`,
    [req.user.id, contentType, contentId, reason, description]
  );

  res.status(201).json(result.rows[0]);
});

// Get reports (admin only)
const getReports = asyncHandler(async (req, res) => {
  const reports = await findMany(
    `SELECT r.*, u.username, u.email 
     FROM reports r 
     JOIN users u ON r.user_id = u.id 
     WHERE r.status = 'pending' 
     ORDER BY r.created_at DESC`
  );

  res.json(reports);
});

// Handle report (admin only)
const handleReport = asyncHandler(async (req, res) => {
  const { reportId, action, notes } = req.body;

  await db.query(
    `UPDATE reports SET status = $1, admin_notes = $2, handled_at = NOW() WHERE id = $3`,
    [action === 'approved' ? 'approved' : 'rejected', notes, reportId]
  );

  if (action === 'approved') {
    const reportResult = await db.query(
      'SELECT * FROM reports WHERE id = $1',
      [reportId]
    );

    const report = reportResult.rows[0];

    if (report.content_type === 'stream') {
      await db.query(
        'UPDATE streams SET status = $1 WHERE id = $2',
        ['suspended', report.content_id]
      );
    } else if (report.content_type === 'user') {
      await db.query(
        'UPDATE users SET is_banned = true WHERE id = $1',
        [report.content_id]
      );
    }
  }

  res.json({ message: 'Report handled successfully' });
});

// Ban user (admin only)
const banUser = asyncHandler(async (req, res) => {
  const { userId, reason, duration } = req.body;
  const banUntil = new Date(Date.now() + duration * 24 * 60 * 60000);

  await db.query(
    `INSERT INTO bans (user_id, reason, ban_until) VALUES ($1, $2, $3)`,
    [userId, reason, banUntil]
  );

  await db.query(
    'UPDATE users SET is_banned = true WHERE id = $1',
    [userId]
  );

  res.json({ message: 'User banned successfully' });
});

module.exports = { reportContent, getReports, handleReport, banUser };
