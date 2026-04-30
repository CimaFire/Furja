# Backend Setup - فُرجه

## المجلد: `/backend`

هذا هو الخادم الرئيسي للتطبيق (Node.js + Express)

## البنية

```
backend/
├── src/
│   ├── config/              # الإعدادات
│   ├── controllers/         # معالجات الطلبات
│   ├── models/              # نماذج البيانات
│   ├── routes/              # المسارات
│   ├── middleware/          # وسيطات Express
│   ├── services/            # الخدمات
│   ├── utils/               # دوال مساعدة
│   ├── websocket/           # معالجات WebSocket
│   ├── database/            # اتصالات قاعدة البيانات
│   └── index.js             # نقطة الدخول
├── migrations/              # Migrations قاعدة البيانات
├── seeds/                   # البيانات الأولية
├── tests/                   # الاختبارات
├── Dockerfile               # صورة Docker
├── package.json
└── README.md
```

## المميزات الرئيسية

### 1. REST API
- المستخدمين (تسجيل، تسجيل الدخول)
- البث (إنشاء، إنهاء، الحصول على البيانات)
- الدردشة (الرسائل المباشرة)
- الهدايا والدفع
- الإحصائيات

### 2. WebSocket (Real-time)
- البث المباشر
- الدردشة المباشرة
- الإشعارات الفورية
- التفاعلات الحية

### 3. المصادقة
- JWT Tokens
- Refresh Tokens
- Role-based Access Control (RBAC)

### 4. قاعدة البيانات
- PostgreSQL
- ORM: Sequelize أو TypeORM
- Migrations: Knex.js

### 5. التخزين المؤقت
- Redis
- جلسات المستخدمين
- قوائم الانتظار

### 6. معالجة الملفات
- AWS S3 (تخزين الفيديوهات)
- رفع الصور
- معالجة الفيديو (FFmpeg)

### 7. المدفوعات
- Stripe Integration
- معالجة الدفع
- إدارة الفواتير

## الإعدادات المطلوبة

انظر `.env.example` للمتغيرات المطلوبة:

```env
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=furja_db
DB_USER=furja_user
DB_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...

# AWS S3
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=furja-videos
```

## التشغيل

```bash
# تثبيت الحزم
cd backend
npm install

# التطوير
npm run dev

# الإنتاج
npm run build
npm start

# الاختبارات
npm test
```

## الـ API الرئيسية

### المستخدمين
- `POST /api/auth/register` - التسجيل
- `POST /api/auth/login` - تسجيل الدخول
- `GET /api/users/:id` - الحصول على بيانات المستخدم
- `PUT /api/users/:id` - تحديث البيانات

### البث
- `POST /api/streams` - إنشاء بث
- `GET /api/streams` - قائمة البث النشطة
- `GET /api/streams/:id` - تفاصيل البث
- `PUT /api/streams/:id` - تحديث البث
- `DELETE /api/streams/:id` - إنهاء البث

### الهدايا
- `POST /api/gifts` - إرسال هدية
- `GET /api/gifts/:streamId` - الهدايا المستلمة

### الإحصائيات
- `GET /api/analytics/streams/:id` - إحصائيات البث
- `GET /api/analytics/user/:id` - إحصائيات المستخدم

## المزيد من المعلومات

انظر `./README.md` في مجلد backend
