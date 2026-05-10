-- Add agencies table
CREATE TABLE IF NOT EXISTS agencies (
  id SERIAL PRIMARY KEY,
  admin_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL, -- 'talent', 'entertainment', 'streaming'
  business_registration VARCHAR(255),
  contact_email VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  commission_rate DECIMAL(5, 2) DEFAULT 15.00,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Agency broadcasters table
CREATE TABLE IF NOT EXISTS agency_broadcasters (
  id SERIAL PRIMARY KEY,
  agency_id INT NOT NULL,
  broadcaster_id INT NOT NULL,
  contract_type VARCHAR(100) NOT NULL, -- 'exclusive', 'non-exclusive'
  status VARCHAR(50) DEFAULT 'active',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  left_at TIMESTAMP,
  UNIQUE(agency_id, broadcaster_id),
  FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE,
  FOREIGN KEY (broadcaster_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Agency earnings table
CREATE TABLE IF NOT EXISTS agency_earnings (
  id SERIAL PRIMARY KEY,
  agency_id INT NOT NULL,
  user_id INT NOT NULL,
  commission_amount DECIMAL(10, 2),
  transaction_type VARCHAR(100), -- 'gift', 'subscription', 'stream'
  withdrawn BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Currency exchange table
CREATE TABLE IF NOT EXISTS currency_exchange (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) UNIQUE NOT NULL, -- 'USD', 'EUR', 'GBP', 'SAR', 'AED', etc.
  name VARCHAR(100) NOT NULL,
  symbol VARCHAR(10),
  rate DECIMAL(15, 6) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User wallets table
CREATE TABLE IF NOT EXISTS user_wallets (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  balance DECIMAL(15, 2) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, currency),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Currency transactions table
CREATE TABLE IF NOT EXISTS currency_transactions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  from_currency VARCHAR(10),
  to_currency VARCHAR(10),
  from_amount DECIMAL(15, 2),
  to_amount DECIMAL(15, 2),
  rate DECIMAL(15, 6),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Games table
CREATE TABLE IF NOT EXISTS games (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon_url VARCHAR(255),
  rules TEXT,
  min_bet DECIMAL(10, 2) DEFAULT 1.00,
  max_bet DECIMAL(10, 2) DEFAULT 1000.00,
  win_multiplier DECIMAL(5, 2) DEFAULT 2.0, -- Winning multiplier
  house_edge DECIMAL(5, 2) DEFAULT 2.0, -- Platform edge percentage
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Game sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
  id SERIAL PRIMARY KEY,
  game_id INT NOT NULL,
  user_id INT NOT NULL,
  stream_id INT,
  bet_amount DECIMAL(10, 2) NOT NULL,
  win_amount DECIMAL(10, 2) DEFAULT 0,
  result VARCHAR(50), -- 'win', 'lost'
  status VARCHAR(50) DEFAULT 'playing', -- 'playing', 'won', 'lost'
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (stream_id) REFERENCES streams(id) ON DELETE SET NULL
);

-- Game leaderboard cache table
CREATE TABLE IF NOT EXISTS game_leaderboard (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  total_games INT DEFAULT 0,
  wins INT DEFAULT 0,
  losses INT DEFAULT 0,
  total_winnings DECIMAL(15, 2) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_agencies_admin_id ON agencies(admin_id);
CREATE INDEX idx_agency_broadcasters_agency_id ON agency_broadcasters(agency_id);
CREATE INDEX idx_agency_broadcasters_broadcaster_id ON agency_broadcasters(broadcaster_id);
CREATE INDEX idx_agency_earnings_agency_id ON agency_earnings(agency_id);
CREATE INDEX idx_user_wallets_user_id ON user_wallets(user_id);
CREATE INDEX idx_currency_transactions_user_id ON currency_transactions(user_id);
CREATE INDEX idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX idx_game_sessions_game_id ON game_sessions(game_id);
CREATE INDEX idx_game_leaderboard_total_winnings ON game_leaderboard(total_winnings);
