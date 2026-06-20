const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

const verifyToken = (token, secret) => {
  return jwt.verify(token, secret || process.env.JWT_SECRET);
};

module.exports = { generateToken, verifyToken };
