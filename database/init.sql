-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  bio TEXT,
  avatar_url VARCHAR(255),
  is_verified BOOLEAN DEFAULT FALSE,
  is_broadcaster BOOLEAN DEFAULT FALSE,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Streams Table
CREATE TABLE IF NOT EXISTS streams (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url VARCHAR(255),
  stream_key VARCHAR(255) UNIQUE NOT NULL,
  rtmp_url VARCHAR(255),
  hls_url VARCHAR(255),
  status VARCHAR(50) DEFAULT 'scheduled',
  viewer_count INT DEFAULT 0,
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  duration INT DEFAULT 0,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  stream_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (stream_id) REFERENCES streams(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Gifts Table
CREATE TABLE IF NOT EXISTS gifts (
  id SERIAL PRIMARY KEY,
  stream_id INT NOT NULL,
  sender_id INT NOT NULL,
  gift_type VARCHAR(100) NOT NULL,
  amount INT DEFAULT 1,
  points INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (stream_id) REFERENCES streams(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  payment_method VARCHAR(50) DEFAULT 'stripe',
  transaction_id VARCHAR(255) UNIQUE,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Analytics Table
CREATE TABLE IF NOT EXISTS analytics (
  id SERIAL PRIMARY KEY,
  stream_id INT NOT NULL,
  total_viewers INT DEFAULT 0,
  peak_viewers INT DEFAULT 0,
  average_duration INT DEFAULT 0,
  total_gifts_amount DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (stream_id) REFERENCES streams(id) ON DELETE CASCADE
);

-- Follows Table
CREATE TABLE IF NOT EXISTS follows (
  id SERIAL PRIMARY KEY,
  follower_id INT NOT NULL,
  following_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(follower_id, following_id),
  FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User Wallets Table
CREATE TABLE IF NOT EXISTS user_wallets (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  balance DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, currency),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Games Table
CREATE TABLE IF NOT EXISTS games (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  rules TEXT,
  min_bet DECIMAL(10, 2) DEFAULT 1,
  max_bet DECIMAL(10, 2) DEFAULT 1000,
  win_multiplier DECIMAL(5, 2) DEFAULT 2,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Game Sessions Table
CREATE TABLE IF NOT EXISTS game_sessions (
  id SERIAL PRIMARY KEY,
  game_id INT NOT NULL,
  user_id INT NOT NULL,
  stream_id INT,
  bet_amount DECIMAL(10, 2) NOT NULL,
  win_amount DECIMAL(10, 2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'playing',
  result VARCHAR(50),
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (stream_id) REFERENCES streams(id) ON DELETE SET NULL
);

-- Agencies Table
CREATE TABLE IF NOT EXISTS agencies (
  id SERIAL PRIMARY KEY,
  admin_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) DEFAULT 'talent',
  business_registration VARCHAR(255),
  contact_email VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  commission_rate DECIMAL(5, 4) DEFAULT 0.15,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Agency Broadcasters Table
CREATE TABLE IF NOT EXISTS agency_broadcasters (
  id SERIAL PRIMARY KEY,
  agency_id INT NOT NULL,
  broadcaster_id INT NOT NULL,
  contract_type VARCHAR(50) DEFAULT 'standard',
  status VARCHAR(50) DEFAULT 'active',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(agency_id, broadcaster_id),
  FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE,
  FOREIGN KEY (broadcaster_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Agency Earnings Table
CREATE TABLE IF NOT EXISTS agency_earnings (
  id SERIAL PRIMARY KEY,
  agency_id INT NOT NULL,
  user_id INT NOT NULL,
  commission_amount DECIMAL(10, 2) DEFAULT 0,
  commission_rate DECIMAL(5, 4) DEFAULT 0.15,
  withdrawn BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Currency Exchange Table
CREATE TABLE IF NOT EXISTS currency_exchange (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  rate DECIMAL(12, 6) NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Currency Transactions Table
CREATE TABLE IF NOT EXISTS currency_transactions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  from_currency VARCHAR(10) NOT NULL,
  to_currency VARCHAR(10) NOT NULL,
  from_amount DECIMAL(12, 2) NOT NULL,
  to_amount DECIMAL(12, 2) NOT NULL,
  rate DECIMAL(12, 6) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for Performance
CREATE INDEX idx_streams_user_id ON streams(user_id);
CREATE INDEX idx_streams_status ON streams(status);
CREATE INDEX idx_messages_stream_id ON messages(stream_id);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_gifts_stream_id ON gifts(stream_id);
CREATE INDEX idx_gifts_sender_id ON gifts(sender_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);
CREATE INDEX idx_user_wallets_user_id ON user_wallets(user_id);
CREATE INDEX idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX idx_game_sessions_game_id ON game_sessions(game_id);
CREATE INDEX idx_agency_broadcasters_agency_id ON agency_broadcasters(agency_id);
CREATE INDEX idx_agency_earnings_agency_id ON agency_earnings(agency_id);
CREATE INDEX idx_currency_transactions_user_id ON currency_transactions(user_id);
