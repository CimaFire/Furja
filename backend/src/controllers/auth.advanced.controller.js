const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../database/db');
const asyncHandler = require('../utils/asyncHandler');
const { generateToken } = require('../utils/jwt');
const { ValidationError, NotFoundError } = require('../utils/errors');
const { findOneOrFail } = require('../utils/db.helpers');

// 2FA - Send Code
const send2FACode = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const code = crypto.randomInt(100000, 999999);
  const expiresAt = new Date(Date.now() + 10 * 60000);

  await db.query(
    'INSERT INTO two_factor_auth (user_id, code, expires_at) VALUES ($1, $2, $3)',
    [userId, code, expiresAt]
  );

  console.log('2FA Code:', code);

  res.json({ message: '2FA code sent successfully' });
});

// Verify 2FA Code
const verify2FACode = asyncHandler(async (req, res) => {
  const { userId, code } = req.body;

  const result = await db.query(
    'SELECT * FROM two_factor_auth WHERE user_id = $1 AND code = $2 AND expires_at > NOW()',
    [userId, code]
  );

  if (result.rows.length === 0) {
    throw new ValidationError('Invalid or expired code');
  }

  await db.query('DELETE FROM two_factor_auth WHERE user_id = $1', [userId]);

  res.json({ message: '2FA verified successfully' });
});

// Login with OAuth (Google/Facebook)
const loginWithOAuth = asyncHandler(async (req, res) => {
  const { email, name, provider, providerUserId } = req.body;

  let userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);

  let user;
  if (userResult.rows.length === 0) {
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

  await db.query(
    `INSERT INTO oauth_providers (user_id, provider, provider_user_id) 
     VALUES ($1, $2, $3) 
     ON CONFLICT (user_id, provider) DO UPDATE SET provider_user_id = $3`,
    [user.id, provider, providerUserId]
  );

  const token = generateToken(user);

  res.json({
    message: 'OAuth login successful',
    user: { id: user.id, email: user.email, name: user.first_name },
    token
  });
});

// Change Password
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id;

  const user = await findOneOrFail(
    'SELECT password_hash FROM users WHERE id = $1',
    [userId],
    'User'
  );

  const isPasswordValid = await bcrypt.compare(oldPassword, user.password_hash);

  if (!isPasswordValid) {
    throw new ValidationError('Old password is incorrect');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await db.query(
    'UPDATE users SET password_hash = $1 WHERE id = $2',
    [hashedPassword, userId]
  );

  res.json({ message: 'Password changed successfully' });
});

// Reset Password
const resetPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
  const expiresAt = new Date(Date.now() + 60 * 60000);

  await db.query(
    `INSERT INTO password_resets (email, token_hash, expires_at) 
     VALUES ($1, $2, $3)`,
    [email, resetTokenHash, expiresAt]
  );

  console.log('Reset token:', resetToken);

  res.json({ message: 'Reset password email sent' });
});

module.exports = { send2FACode, verify2FACode, loginWithOAuth, changePassword, resetPassword };
