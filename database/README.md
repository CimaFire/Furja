# Database Setup - فُرجه

## المجلد: `/database`

جميع ملفات قاعدة البيانات والـ Schema

## البنية

```
database/
├── migrations/             # Migrations
│   ├── 001_create_users_table.sql
│   ├── 002_create_streams_table.sql
│   ├── 003_create_messages_table.sql
│   ├── 004_create_gifts_table.sql
│   ├── 005_create_payments_table.sql
│   ├── 006_create_analytics_table.sql
│   └── ...
├── seeds/                  # البيانات الأولية
│   ├── users.sql
│   ├── categories.sql
│   └── ...
├── schemas/                # تعريفات الجداول
│   ├── users.sql
│   ├── streams.sql
│   ├── messages.sql
│   ├── gifts.sql
│   ├── payments.sql
│   └── analytics.sql
├── init.sql                # ملف التهيئة الأساسي
└── README.md
```

## الجداول الرئيسية

### 1. Users (المستخدمون)
```sql
CREATE TABLE users (
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Streams (البث)
```sql
CREATE TABLE streams (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url VARCHAR(255),
  stream_key VARCHAR(255) UNIQUE NOT NULL,
  rtmp_url VARCHAR(255),
  hls_url VARCHAR(255),
  status ENUM('scheduled', 'live', 'ended') DEFAULT 'scheduled',
  viewer_count INT DEFAULT 0,
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  duration INT DEFAULT 0,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 3. Messages (الرسائل)
```sql
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  stream_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (stream_id) REFERENCES streams(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 4. Gifts (الهدايا)
```sql
CREATE TABLE gifts (
  id SERIAL PRIMARY KEY,
  stream_id INT NOT NULL,
  sender_id INT NOT NULL,
  gift_type VARCHAR(100) NOT NULL,
  amount INT DEFAULT 1,
  points INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (stream_id) REFERENCES streams(id),
  FOREIGN KEY (sender_id) REFERENCES users(id)
);
```

### 5. Payments (المدفوعات)
```sql
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  payment_method VARCHAR(50) NOT NULL,
  transaction_id VARCHAR(255) UNIQUE,
  status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 6. Analytics (الإحصائيات)
```sql
CREATE TABLE analytics (
  id SERIAL PRIMARY KEY,
  stream_id INT NOT NULL,
  total_viewers INT DEFAULT 0,
  peak_viewers INT DEFAULT 0,
  average_duration INT DEFAULT 0,
  total_gifts_amount DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (stream_id) REFERENCES streams(id)
);
```

## الإعدادات

### إنشاء قاعدة البيانات

```bash
# مع PostgreSQL
createdb furja_db

# أو مع psql
psql -U postgres -c "CREATE DATABASE furja_db;"
```

### تطبيق الـ Migrations

```bash
# مع Knex.js
knex migrate:latest

# أو يدويًا
psql -U furja_user -d furja_db -f database/init.sql
```

### إضافة البيانات الأولية (Seeds)

```bash
# مع Knex.js
knex seed:run

# أو يدويًا
psql -U furja_user -d furja_db -f database/seeds/users.sql
```

## الفهارس والعلاقات

```sql
-- فهارس للأداء
CREATE INDEX idx_streams_user_id ON streams(user_id);
CREATE INDEX idx_messages_stream_id ON messages(stream_id);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_gifts_stream_id ON gifts(stream_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
```

## النسخ الاحتياطي والاستعادة

```bash
# النسخ الاحتياطي
pg_dump -U furja_user -d furja_db > backup.sql

# الاستعادة
psql -U furja_user -d furja_db < backup.sql
```

## المزيد من المعلومات

انظر `./README.md` في مجلد database
