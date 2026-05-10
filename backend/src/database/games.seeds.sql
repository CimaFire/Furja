-- Insert sample currencies
INSERT INTO currency_exchange (code, name, symbol, rate) VALUES
('USD', 'United States Dollar', '$', 1.0),
('EUR', 'Euro', '€', 0.92),
('GBP', 'British Pound', '£', 0.79),
('AED', 'United Arab Emirates Dirham', 'د.إ', 3.67),
('SAR', 'Saudi Riyal', '﷼', 3.75),
('EGP', 'Egyptian Pound', '£', 30.50),
('KWD', 'Kuwaiti Dinar', 'د.ك', 0.31),
('QAR', 'Qatari Riyal', 'ر.ق', 3.64),
('JPY', 'Japanese Yen', '¥', 150.00),
('CNY', 'Chinese Yuan', '¥', 7.24),
('INR', 'Indian Rupee', '₹', 83.12),
('TRY', 'Turkish Lira', '₺', 32.50);

-- Insert sample games
INSERT INTO games (name, description, rules, min_bet, max_bet, win_multiplier, house_edge) VALUES
('Lucky Dice', 'Roll the dice and win up to 6x', 'Roll two dice, get highest number for biggest win', 1.0, 1000.0, 6.0, 2.5),
('Card Game', 'Guess the card suit', 'Pick a suit and see if the card matches', 1.0, 500.0, 4.0, 2.0),
('Coin Flip', 'Simple heads or tails', 'Choose heads or tails for 50/50 chance', 0.5, 100.0, 2.0, 1.0),
('Spin Wheel', 'Spin the wheel to win', 'Land on the golden section for big wins', 1.0, 2000.0, 10.0, 3.0),
('Number Pick', 'Pick a number between 1-10', 'Guess the correct number for instant win', 2.0, 500.0, 10.0, 2.0),
('Color Match', 'Match the color', 'Red, Black, or Gold - choose wisely', 1.0, 750.0, 3.0, 2.5);
