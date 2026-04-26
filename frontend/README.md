# Frontend Setup - فُرجه

## المجلد: `/frontend`

هذه هي واجهة الويب للتطبيق (React + Redux + Tailwind)

## البنية

```
frontend/
├── src/
│   ├── components/         # مكونات React
│   │   ├── Common/         # مكونات مشتركة
│   │   ├── Layout/         # تخطيط الصفحات
│   │   ├── Stream/         # مكونات البث
│   │   └── Chat/           # مكونات الدردشة
│   ├── pages/              # صفحات التطبيق
│   │   ├── Home.js
│   │   ├── StreamPage.js
│   │   ├── ProfilePage.js
│   │   ├── Dashboard.js
│   │   └── AdminPanel.js
│   ├── services/           # خدمات API
│   ├── store/              # Redux Store
│   │   ├── actions/
│   │   ├── reducers/
│   │   └── slices/
│   ├── hooks/              # Custom Hooks
│   ├── utils/              # دوال مساعدة
│   ├── styles/             # ملفات CSS/Tailwind
│   ├── App.js
│   └── index.js
├── public/                 # ملفات ثابتة
├── Dockerfile
├── package.json
└── README.md
```

## المميزات الرئيسية

### 1. الصفحات الرئيسية
- **الرئيسية** - قائمة البث النشطة
- **صفحة البث** - مشاهدة البث والدردشة
- **الملف الشخصي** - معلومات المستخدم
- **لوحة التحكم** - إدارة البث
- **لوحة الإدارة** - التحكم الكامل (للمسؤولين)

### 2. مكونات البث
- عرض الفيديو (HLS Player)
- جودة متعددة
- ملء الشاشة
- التحكم في الصوت

### 3. نظام الدردشة
- رسائل فورية
- تفاعلات (Like, Emoji)
- إرسال الهدايا
- قائمة المشاهدين

### 4. المصادقة
- تسجيل الدخول / التسجيل
- حفظ الجلسة
- إدارة التوكن

### 5. إدارة الحالة
- Redux
- Redux Thunk
- Redux DevTools

## الإعدادات المطلوبة

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_WS_URL=ws://localhost:5000
```

## التشغيل

```bash
# تثبيت الحزم
cd frontend
npm install

# التطوير
npm start

# البناء للإنتاج
npm run build

# الاختبارات
npm test

# Linting
npm run lint
```

## المكتبات المستخدمة

- **React** - مكتبة الواجهة
- **Redux** - إدارة الحالة
- **React Router** - توجيه الصفحات
- **Axios** - طلبات HTTP
- **Socket.io-client** - الاتصالات المباشرة
- **HLS.js** - عرض البث
- **Tailwind CSS** - التصميم
- **React Icons** - الأيقونات

## الصفحات الرئيسية

### `/` - الصفحة الرئيسية
- قائمة البث النشطة
- البحث والتصفية
- الفئات

### `/stream/:id` - صفحة البث
- عرض الفيديو
- الدردشة المباشرة
- معلومات المنشئ
- الهدايا

### `/profile/:id` - الملف الشخصي
- بيانات المستخدم
- سجل البث
- الإحصائيات

### `/dashboard` - لوحة التحكم
- إدارة البث
- الإحصائيات
- الإعدادات

### `/admin` - لوحة الإدارة
- إدارة المستخدمين
- الإبلاغات
- الإعدادات العامة

## المزيد من المعلومات

انظر `./README.md` في مجلد frontend
