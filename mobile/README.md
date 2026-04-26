# Mobile Setup - فُرجه

## المجلد: `/mobile`

هذا هو تطبيق الهاتف الذكي (React Native + Expo)

## البنية

```
mobile/
├── src/
│   ├── screens/            # شاشات التطبيق
│   │   ├── HomeScreen.js
│   │   ├── StreamScreen.js
│   │   ├── ProfileScreen.js
│   │   └── DashboardScreen.js
│   ├── components/         # مكونات React Native
│   ├── navigation/         # نظام التنقل
│   ├── services/           # خدمات API
│   ├── store/              # Redux Store
│   ├── utils/              # دوال مساعدة
│   ├── hooks/              # Custom Hooks
│   └── App.js
├── assets/                 # الصور والأيقونات
├── app.json
├── package.json
└── README.md
```

## المميزات الرئيسية

### 1. الشاشات الرئيسية
- **الرئيسية** - قائمة البث
- **البث** - مشاهدة البث والدردشة
- **الملف الشخصي** - معلومات المستخدم
- **لوحة التحكم** - إدارة البث

### 2. البث المباشر
- الكاميرا الخلفية والأمامية
- التبديل بين الكاميرات
- التحكم في الصوت
- الفلاش والإضاءة

### 3. نظام الدردشة
- رسائل فورية
- التفاعلات
- الهدايا

### 4. الإخطارات
- إخطارات البث
- إخطارات الرسائل
- إخطارات الهدايا

## الإعدادات المطلوبة

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_WS_URL=ws://localhost:5000
EXPO_PUBLIC_API_URL=http://localhost:5000
```

## التشغيل

```bash
# تثبيت الحزم
cd mobile
npm install

# تشغيل مع Expo
npm start

# على جهاز iOS
npm run ios

# على جهاز Android
npm run android

# على الويب (للاختبار)
npm run web
```

## المكتبات المستخدمة

- **React Native** - إطار العمل
- **Expo** - البيئة السريعة
- **React Navigation** - التنقل
- **Redux** - إدارة الحالة
- **Axios** - طلبات HTTP
- **React Native Camera** - الكاميرا
- **React Native Permissions** - الأذونات

## المزيد من المعلومات

انظر `./README.md` في مجلد mobile
