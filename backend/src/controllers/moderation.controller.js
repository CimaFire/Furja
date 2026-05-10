const db = require('../database/db');

// Report content
const reportContent = async (req, res) => {
  try {
    const { contentType, contentId, reason, description } = req.body;
    const userId = req.user.id;

    const result = await db.query(
      `INSERT INTO reports (user_id, content_type, content_id, reason, description, status) 
       VALUES ($1, $2, $3, $4, $5, 'pending') 
       RETURNING *`,
      [userId, contentType, contentId, reason, description]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to report content' });
  }
};

// Get reports (admin only)
const getReports = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT r.*, u.username, u.email 
       FROM reports r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.status = 'pending' 
       ORDER BY r.created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};

// Handle report (admin only)
const handleReport = async (req, res) => {
  try {
    const { reportId, action, notes } = req.body;

    // Update report status
    await db.query(
      `UPDATE reports SET status = $1, admin_notes = $2, handled_at = NOW() WHERE id = $3`,
      [action === 'approved' ? 'approved' : 'rejected', notes, reportId]
    );

    // If approved, take action
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
  } catch (error) {
    res.status(500).json({ error: 'Failed to handle report' });
  }
};

// Ban user (admin only)
const banUser = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ error: 'Failed to ban user' });
  }
};

module.exports = {
  reportContent,
  getReports,
  handleReport,
  banUser
};
