# Backend README

## الملفات المضافة:

### 1. **src/index.js**
ملف البداية الرئيسي للتطبيق:
- إعداد Express Server
- تفعيل Socket.io
- تسجيل جميع الـ Routes
- تفعيل Middleware

### 2. **Routes** (/src/routes/)
- `auth.routes.js` - التسجيل والدخول
- `users.routes.js` - إدارة المستخدمين
- `streams.routes.js` - إدارة البث
- `messages.routes.js` - الرسائل
- `gifts.routes.js` - الهدايا
- `payments.routes.js` - المدفوعات
- `analytics.routes.js` - الإحصائيات

### 3. **Controllers** (/src/controllers/)
كل Controller يتولى منطق معين:
- `auth.controller.js` - المصادقة
- `users.controller.js` - المستخدمين
- `streams.controller.js` - البث
- `messages.controller.js` - الدردشة
- `gifts.controller.js` - الهدايا
- `payments.controller.js` - الدفع
- `analytics.controller.js` - التحليل

### 4. **Middleware** (/src/middleware/)
- `auth.middleware.js` - التحقق من JWT والتوثيق

### 5. **WebSocket** (/src/websocket/)
- `stream.socket.js` - أحداث البث
- `chat.socket.js` - الدردشة المباشرة
- `notification.socket.js` - الإشعارات

### 6. **Database** (/src/database/)
- `db.js` - اتصال PostgreSQL

## التشغيل:

```bash
cd backend
npm install
npm run dev
```

## الـ API Endpoints:

### Auth
- `POST /api/auth/register` - تسجيل
- `POST /api/auth/login` - دخول
- `GET /api/auth/me` - البيانات الحالية

### Streams
- `GET /api/streams` - البث النشط
- `POST /api/streams` - إنشاء بث
- `GET /api/streams/:id` - تفاصيل البث

### Users
- `GET /api/users/:id` - بيانات المستخدم
- `POST /api/users/:id/follow` - متابعة

والمزيد...
