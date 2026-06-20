-- Create users (password: 'password123' hashed with bcrypt)
INSERT INTO users (username, email, password_hash, first_name, last_name, is_broadcaster) VALUES
('ahmed_streamer', 'ahmed@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ahmed', 'Streamer', true),
('sara_viewer', 'sara@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sara', 'Viewer', false),
('omar_creator', 'omar@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Omar', 'Creator', true);

-- Create sample streams
INSERT INTO streams (user_id, title, description, stream_key, status, started_at) VALUES
(1, 'جولة في الرياض', 'جولة تفاعلية في مدينة الرياض', 'sk_live_abc123def456', 'live', CURRENT_TIMESTAMP),
(3, 'بث غيتار مباشر', 'عزف موسيقي حي', 'sk_live_xyz789ghi012', 'scheduled', NULL);

-- Create sample messages
INSERT INTO messages (stream_id, user_id, content) VALUES
(1, 2, 'الحمد لله، الجودة ممتازة!');

-- Create user wallets
INSERT INTO user_wallets (user_id, currency, balance) VALUES
(1, 'USD', 100.00),
(2, 'USD', 50.00),
(3, 'USD', 200.00);

-- Create sample games
INSERT INTO games (name, description, rules, min_bet, max_bet, win_multiplier) VALUES
('حظ الأرقام', 'اختر رقم من 1 إلى 10 وشوف حظك', 'اختر رقم وإذا طلع نفس الرقم تفوز', 1, 100, 2.5),
('عجلة الحظ', 'دور العجلة واربح جوائز', 'دور العجلة وشوف وين توقف', 5, 500, 3.0),
('تخمين اللون', 'خمن اللون الصحيح', 'اختر بين أحمر أو أسود', 1, 50, 2.0);

-- Create currency exchange rates
INSERT INTO currency_exchange (code, name, symbol, rate) VALUES
('USD', 'US Dollar', '$', 1.000000),
('EUR', 'Euro', '€', 0.920000),
('GBP', 'British Pound', '£', 0.790000),
('SAR', 'Saudi Riyal', 'ر.س', 3.750000),
('AED', 'UAE Dirham', 'د.إ', 3.670000),
('EGP', 'Egyptian Pound', 'ج.م', 30.900000),
('KWD', 'Kuwaiti Dinar', 'د.ك', 0.310000);
