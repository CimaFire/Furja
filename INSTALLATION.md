# 🎬 فُرجه - INSTALLATION GUIDE

## الخطوات السريعة للتثبيت

### 1. المتطلبات
- Docker و Docker Compose
- Node.js 16+
- Git

### 2. الاستنساخ
```bash
git clone https://github.com/CimaFire/furja.git
cd furja
```

### 3. التشغيل الكامل

#### مع Docker (الأسهل):
```bash
docker-compose up -d
```

#### بدون Docker:

##### Backend:
```bash
cd backend
npm install
npm run dev
```

##### Frontend:
```bash
cd frontend
npm install
npm start
```

##### Mobile:
```bash
cd mobile
npm install
npm start
```

### 4. إعداد قاعدة البيانات

#### مع Docker:
سيتم تشغيل قاعدة البيانات تلقائياً

#### بدون Docker:
```bash
# إنشاء قاعدة البيانات
psql -U postgres -c "CREATE DATABASE furja_db;"

# تطبيق الجداول
psql -U furja_user -d furja_db -f database/init.sql

# إضافة البيانات الأولية
psql -U furja_user -d furja_db -f database/seeds.sql
```

### 5. الدخول إلى التطبيق

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **Database:** localhost:5432
- **Redis:** localhost:6379

## الملفات الرئيسية:

```
furja/
├── backend/          # Node.js + Express
├── frontend/         # React
├── mobile/           # React Native + Expo
├── database/         # SQL Scripts
├── docker-compose.yml
└── README.md
```

## الأوامر المفيدة:

```bash
# إيقاف جميع الخدمات
docker-compose down

# عرض السجلات
docker-compose logs -f backend

# إعادة تشغيل
docker-compose restart

# حذف كل شيء
docker-compose down -v
```

## استكشاف الأخطاء:

### Backend لا يعمل:
```bash
# تحقق من المتغيرات
cat backend/.env

# أعد تثبيت الحزم
cd backend && rm -rf node_modules && npm install
```

### قاعدة البيانات لا تتصل:
```bash
# تحقق من Docker
docker ps

# أعد البناء
docker-compose build postgres
```

## المساعدة:

للمزيد من المعلومات:
- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)
- [Mobile Documentation](./mobile/README.md)
- [Database Documentation](./database/README.md)
