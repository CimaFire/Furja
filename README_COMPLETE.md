# 🎬 FURJA - Live Streaming Platform

**Complete Full-Stack Live Streaming Application**

## ✨ مميزات

### 🎥 البث المباشر
- بث عالي الجودة (720p, 1080p, 4K)
- نظام التبديل بين الكاميرات
- فلاتر وتأثيرات بصرية
- جودة تكيفية (Adaptive Bitrate)

### 💬 التفاعل المباشر
- دردشة حية في الوقت الفعلي
- تفاعلات فورية (Like, Emoji)
- نظام الهدايا والمكافآت
- قائمة المشاهدين

### 💰 نظام الدفع
- شراء الهدايا الافتراضية
- تحويل النقاط إلى أموال
- نظام العمولات
- دعم طرق الدفع المتعددة (Stripe)

### 👤 المستخدمون
- ملفات شخصية متقدمة
- نظام المتابعة
- سجل البث والإحصائيات
- إعدادات الخصوصية والأمان

### 📊 التحليلات والإحصائيات
- إحصائيات البث في الوقت الفعلي
- تحليل المشاهدين
- الدخل والإحصائيات المالية
- تقارير الأداء

### 🔔 الإخطارات
- إشعارات البث المباشر
- تنبيهات التفاعلات
- رسائل شخصية
- إشعارات النظام

## 🛠️ المكدس التقني

### Backend
- **Node.js** + Express.js
- **Socket.io** - للبث المباشر والدردشة
- **PostgreSQL** - قاعدة البيانات الرئيسية
- **Redis** - التخزين المؤقت والجلسات
- **JWT** - المصادقة والتوثيق
- **Stripe** - معالجة الدفع
- **Docker** - التسليم والنشر

### Frontend
- **React.js** - مكتبة الواجهة
- **Redux** - إدارة الحالة
- **Tailwind CSS** - التصميم
- **Socket.io-client** - الاتصالات المباشرة
- **Axios** - طلبات HTTP
- **HLS.js** - عرض البث

### Mobile
- **React Native** - تطبيق متعدد المنصات
- **Expo** - بيئة التطوير السريعة
- **Redux** - إدارة الحالة
- **Expo Camera** - الكاميرا

### DevOps
- **Docker** - Containerization
- **Docker Compose** - تنسيق الخدمات
- **PostgreSQL** - قاعدة البيانات
- **Redis** - التخزين المؤقت

## 🚀 البدء السريع

### مع Docker (الأسهل)

```bash
git clone https://github.com/CimaFire/furja.git
cd furja
docker-compose up -d
```

### بدون Docker

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend (في terminal جديد)
cd frontend && npm install && npm start

# Mobile (في terminal جديد)
cd mobile && npm install && npm start
```

## 📍 الروابط

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/health
- **Database:** localhost:5432
- **Redis:** localhost:6379

## 📁 البنية

```
furja/
├── backend/              # Node.js Server
│   ├── src/
│   │   ├── controllers/  # 7 Controllers
│   │   ├── routes/       # 7 Routes
│   │   ├── middleware/   # Authentication
│   │   ├── websocket/    # 3 Handlers
│   │   └── database/     # DB Connection
│   ├── package.json
│   └── Dockerfile
│
├── frontend/             # React App
│   ├── src/
│   │   ├── pages/        # 7 Pages
│   │   ├── components/   # 5 Components
│   │   ├── store/        # Redux Store
│   │   ├── services/     # API Services
│   │   └── styles/       # CSS/Tailwind
│   ├── package.json
│   └── Dockerfile
│
├── mobile/               # React Native
│   ├── src/
│   │   ├── screens/      # 4 Screens
│   │   ├── store/        # Redux Store
│   │   ├── services/     # API Services
│   │   └── App.js        # Navigation
│   ├── package.json
│   └── app.json
│
├── database/             # SQL Scripts
│   ├── init.sql          # Schema & Tables
│   ├── seeds.sql         # Sample Data
│   └── README.md
│
├── docker-compose.yml    # Docker Config
├── INSTALLATION.md       # Setup Guide
└── README.md            # This File
```

## 📚 التوثيق

- [Backend Setup](./backend/README.md)
- [Frontend Setup](./frontend/README.md)
- [Mobile Setup](./mobile/README.md)
- [Database Setup](./database/README.md)
- [Installation Guide](./INSTALLATION.md)

## 🤝 المساهمة

المساهمات مرحب بها! يرجى اتباع:

1. Fork المشروع
2. إنشاء فرع جديد (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات (`git commit -m 'Add amazing feature'`)
4. Push للفرع (`git push origin feature/amazing-feature`)
5. فتح Pull Request

## 📄 الترخيص

هذا المشروع مرخص تحت MIT License - انظر [LICENSE](./LICENSE)

## 📧 التواصل

- **Author:** CimaFire
- **Email:** support@furja.app
- **GitHub:** [@CimaFire](https://github.com/CimaFire)

---

**جعل البث المباشر سهلاً وممتعاً!** 🎬✨
