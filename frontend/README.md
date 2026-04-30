# Frontend README

## الملفات المضافة:

### 📁 src/

#### Pages (الصفحات)
- `Home.js` - الصفحة الرئيسية مع قائمة البث
- `StreamPage.js` - صفحة مشاهدة البث
- `ProfilePage.js` - ملف المستخدم الشخصي
- `Dashboard.js` - لوحة تحكم المستخدم
- `AdminPanel.js` - لوحة الإدارة
- `Login.js` - صفحة تسجيل الدخول
- `Register.js` - صفحة التسجيل

#### Components (المكونات)
- `Navigation.js` - شريط التنقل العلوي
- `Footer.js` - تذييل الصفحة
- `StreamCard.js` - بطاقة البث
- `VideoPlayer.js` - مشغل الفيديو
- `ChatBox.js` - صندوق الدردشة

#### Store (Redux)
- `authSlice.js` - حالة المصادقة
- `streamsSlice.js` - حالة البث
- `chatSlice.js` - حالة الدردشة

#### Services (الخدمات)
- `api.js` - اتصالات API

#### Styles
- `index.css` - تنسيقات عامة

## التشغيل:

```bash
cd frontend
npm install
npm start
```

## الميزات:

✅ صفحة رئيسية مع قائمة البث
✅ مشاهدة البث المباشر
✅ نظام الدردشة في الوقت الفعلي
✅ ملفات شخصية
✅ لوحة تحكم المستخدم
✅ لوحة إدارة
✅ نظام المصادقة
