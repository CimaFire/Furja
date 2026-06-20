const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');
const http = require('http');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }
});

// WebSocket authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.username = decoded.username;
    } catch (err) {
      // Allow connection but mark as unauthenticated
    }
  }
  next();
});

// Middleware
app.use(helmet());

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.MOBILE_APP_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Stripe webhooks need raw body — mount before express.json()
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقائق
  max: 100 // 100 طلب
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/users.routes'));
app.use('/api/streams', require('./routes/streams.routes'));
app.use('/api/messages', require('./routes/messages.routes'));
app.use('/api/gifts', require('./routes/gifts.routes'));
app.use('/api/payments', require('./routes/payments.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/games', require('./routes/games.routes'));
app.use('/api/currency', require('./routes/currency.routes'));
app.use('/api/agencies', require('./routes/agencies.routes'));

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running ✅' });
});

// WebSocket Events
require('./websocket/stream.socket')(io);
require('./websocket/chat.socket')(io);
require('./websocket/notification.socket')(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
