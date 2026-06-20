const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../database/db');

// 2FA - Send Code
const send2FACode = async (req, res) => {
  try {
    const { userId } = req.body;
    const code = crypto.randomInt(100000, 999999);
    const expiresAt = new Date(Date.now() + 10 * 60000); // 10 minutes

    await db.query(
      'INSERT INTO two_factor_auth (user_id, code, expires_at) VALUES ($1, $2, $3)',
      [userId, code, expiresAt]
    );

    // TODO: Send code via SMS/Email service

    res.json({ message: '2FA code sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send 2FA code' });
  }
};

// Verify 2FA Code
const verify2FACode = async (req, res) => {
  try {
    const { userId, code } = req.body;

    const result = await db.query(
      'SELECT * FROM two_factor_auth WHERE user_id = $1 AND code = $2 AND expires_at > NOW()',
      [userId, code]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }

    // Delete used code
    await db.query('DELETE FROM two_factor_auth WHERE user_id = $1', [userId]);

    res.json({ message: '2FA verified successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify 2FA' });
  }
};

// Login with OAuth (Google/Facebook)
const loginWithOAuth = async (req, res) => {
  try {
    const { email, name, provider, providerUserId } = req.body;

    // Check if user exists
    let userResult = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    let user;
    if (userResult.rows.length === 0) {
      // Create new user
      const createResult = await db.query(
        `INSERT INTO users (username, email, first_name, is_verified) 
         VALUES ($1, $2, $3, true) 
         RETURNING *`,
        [email.split('@')[0], email, name]
      );
      user = createResult.rows[0];
    } else {
      user = userResult.rows[0];
    }

    // Store OAuth credentials
    await db.query(
      `INSERT INTO oauth_providers (user_id, provider, provider_user_id) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (user_id, provider) DO UPDATE SET provider_user_id = $3`,
      [user.id, provider, providerUserId]
    );

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'OAuth login successful',
      user: { id: user.id, email: user.email, name: user.first_name },
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'OAuth login failed' });
  }
};

// Change Password
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    const userResult = await db.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(
      oldPassword,
      userResult.rows[0].password_hash
    );

    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Old password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [hashedPassword, userId]
    );

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to change password' });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60000); // 1 hour

    await db.query(
      `INSERT INTO password_resets (email, token_hash, expires_at) 
       VALUES ($1, $2, $3)`,
      [email, resetTokenHash, expiresAt]
    );

    // TODO: Send reset email via email service

    res.json({ message: 'Reset password email sent' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

module.exports = {
  send2FACode,
  verify2FACode,
  loginWithOAuth,
  changePassword,
  resetPassword
};
