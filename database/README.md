# Database README

## الملفات:

### init.sql
يحتوي على:
- جميع جداول البيانات الأساسية
- الفهارس للأداء
- العلاقات بين الجداول

### seeds.sql
بيانات أولية للاختبار

## التشغيل:

### إنشاء قاعدة البيانات
```bash
psql -U postgres -c "CREATE DATABASE furja_db;"
```

### تطبيق الإنشاءات
```bash
psql -U furja_user -d furja_db -f database/init.sql
```

### إضافة البيانات الأولية
```bash
psql -U furja_user -d furja_db -f database/seeds.sql
```

### مع Docker
```bash
docker-compose up -d
```

## الجداول الرئيسية:

1. **users** - المستخدمون
2. **streams** - البث المباشر
3. **messages** - الرسائل والدردشة
4. **gifts** - الهدايا
5. **payments** - المدفوعات
6. **analytics** - الإحصائيات
7. **follows** - المتابعة
