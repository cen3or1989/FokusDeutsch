# TELC Exam System - Local Development Setup

## مشکل شما حل شد! 🎉

حالا backend شما محلی اجرا می‌شود و فقط SQL در Docker است.

## راه‌اندازی سریع

### مرحله 1: شروع PostgreSQL در Docker
```bash
docker-compose up -d postgres
```

### مرحله 2: نصب وابستگی‌های Python
```bash
cd telc_exam_backend
pip install -r requirements.txt
```

### مرحله 3: راه‌اندازی دیتابیس
```bash
python init_database.py
```

### مرحله 4: شروع Backend
```bash
cd telc_exam_backend
python run_local.py
```

### مرحله 5: شروع Frontend
```bash
cd telc_exam_frontend
npm install
npm run dev
```

## یا استفاده از اسکریپت‌های آماده

### Windows:
```bash
start_local_dev.bat
```

### Linux/Mac:
```bash
chmod +x start_local_dev.sh
./start_local_dev.sh
```

## تست اتصال

برای اطمینان از کارکرد صحیح:
```bash
python test_connection.py
```

## آدرس‌های دسترسی

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Database:** localhost:5432

## تنظیمات

### دیتابیس PostgreSQL (Docker)
- **Host:** localhost:5432
- **Database:** telc_exam_db
- **Username:** telc_user
- **Password:** telc_password

### Backend (محلی)
- **Port:** 5000
- **Host:** 127.0.0.1
- **Debug:** فعال

## عیب‌یابی

### مشکل اتصال دیتابیس
```bash
# بررسی وضعیت PostgreSQL
docker-compose ps

# مشاهده لاگ‌ها
docker-compose logs postgres

# تست اتصال
docker exec -it telc_exam_postgres psql -U telc_user -d telc_exam_db
```

### مشکل Backend
```bash
# بررسی وابستگی‌ها
cd telc_exam_backend
pip list

# بررسی متغیرهای محیطی
python -c "import os; print('DATABASE_URL:', os.getenv('DATABASE_URL'))"
```

### مشکل Frontend
1. اطمینان از اجرای Backend روی پورت 5000
2. بررسی کنسول مرورگر برای خطاهای CORS
3. بررسی `API_BASE_URL` در `src/lib/api.js`

## توقف سرویس‌ها

```bash
# توقف PostgreSQL
docker-compose down

# توقف Backend (Ctrl+C در ترمینال مربوطه)
# توقف Frontend (Ctrl+C در ترمینال مربوطه)
```

## مزایای این تنظیمات

✅ **Backend محلی:** توسعه و دیباگ آسان‌تر
✅ **دیتابیس Docker:** مدیریت آسان و ایزوله
✅ **تنظیمات ساده:** فقط یک دستور برای شروع
✅ **عیب‌یابی آسان:** لاگ‌های جداگانه و واضح

## فایل‌های جدید ایجاد شده

- `docker-compose.yml` - فقط PostgreSQL
- `telc_exam_backend/run_local.py` - اجرای محلی Backend
- `telc_exam_backend/env.local` - تنظیمات محیطی
- `init_database.py` - راه‌اندازی دیتابیس
- `test_connection.py` - تست اتصالات
- `start_local_dev.bat` - اسکریپت Windows
- `start_local_dev.sh` - اسکریپت Linux/Mac
- `LOCAL_DEVELOPMENT.md` - راهنمای کامل

حالا می‌توانید به راحتی توسعه دهید! 🚀
