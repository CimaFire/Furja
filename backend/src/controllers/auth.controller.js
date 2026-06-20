const bcrypt = require('bcryptjs');
const db = require('../database/db');
const asyncHandler = require('../utils/asyncHandler');
const { generateToken } = require('../utils/jwt');
const { ValidationError, AuthenticationError, NotFoundError } = require('../utils/errors');
const { requireFields, findOneOrFail } = require('../utils/db.helpers');

// Register
const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  requireFields(req.body, ['username', 'email', 'password']);

  const existingUser = await db.query(
    'SELECT * FROM users WHERE email = $1 OR username = $2',
    [email, username]
  );

  if (existingUser.rows.length > 0) {
    throw new ValidationError('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await db.query(
    'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
    [username, email, hashedPassword]
  );

  const user = result.rows[0];
  const token = generateToken(user);

  res.status(201).json({ message: 'User registered successfully', user, token });
});

// Login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  requireFields(req.body, ['email', 'password']);

  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);

  if (result.rows.length === 0) {
    throw new AuthenticationError();
  }

  const user = result.rows[0];
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    throw new AuthenticationError();
  }

  const token = generateToken(user);

  res.json({
    message: 'Login successful',
    user: { id: user.id, username: user.username, email: user.email },
    token
  });
});

// Refresh Token
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  requireFields(req.body, ['refreshToken']);

  const { verifyToken } = require('../utils/jwt');
  try {
    const decoded = verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const newToken = generateToken(decoded);
    res.json({ token: newToken });
  } catch (error) {
    throw new AuthenticationError('Invalid refresh token');
  }
});

// Logout
const logout = asyncHandler(async (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Get Current User
const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await findOneOrFail(
    'SELECT id, username, email, first_name, last_name, avatar_url FROM users WHERE id = $1',
    [req.user.id],
    'User'
  );

  res.json(user);
});

module.exports = { register, login, refreshToken, logout, getCurrentUser };
