-- Create users
INSERT INTO users (username, email, password_hash, first_name, last_name, is_broadcaster) VALUES
('ahmed_streamer', 'ahmed@example.com', '$2a$10$...', 'Ahmed', 'Streamer', true),
('sara_viewer', 'sara@example.com', '$2a$10$...', 'Sara', 'Viewer', false),
('omar_creator', 'omar@example.com', '$2a$10$...', 'Omar', 'Creator', true);

-- Create sample streams
INSERT INTO streams (user_id, title, description, status) VALUES
(1, 'جولة في الرياض', 'جولة تفاعلية في مدينة الرياض', 'live'),
(3, 'بث غيتار مباشر', 'عزف موسيقي حي', 'scheduled');

-- Create sample messages
INSERT INTO messages (stream_id, user_id, content) VALUES
(1, 2, 'الحمد لله، الجودة ممتازة!');
