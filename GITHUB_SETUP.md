# راهنمای ایجاد Repository در GitHub

## مراحل ایجاد Repository در GitHub

### 1. ایجاد Repository جدید
1. به [GitHub.com](https://github.com) بروید
2. روی دکمه "+" در گوشه بالا سمت راست کلیک کنید
3. "New repository" را انتخاب کنید

### 2. تنظیمات Repository
- **Repository name**: `telc-b2-exam-system`
- **Description**: `TELC B2 Exam System - React frontend with Flask backend`
- **Visibility**: Public یا Private (طبق انتخاب شما)
- **Initialize with**: هیچ کدام را انتخاب نکنید (چون قبلاً فایل‌ها را اضافه کرده‌ایم)

### 3. ایجاد Repository
روی "Create repository" کلیک کنید

### 4. اتصال به Repository محلی
پس از ایجاد repository، دستورات زیر را اجرا کنید:

```bash
# تغییر URL remote به repository شما
git remote set-url origin https://github.com/YOUR_USERNAME/telc-b2-exam-system.git

# Push کردن کدها
git push -u origin master
```

### 5. اطلاعات Repository
- **نام**: telc-b2-exam-system
- **توضیحات**: سیستم آزمون TELC B2 با React frontend و Flask backend
- **زبان‌های اصلی**: JavaScript (React), Python (Flask)
- **تکنولوژی‌ها**: React, Flask, SQLAlchemy, Tailwind CSS, Shadcn UI

### 6. ویژگی‌های کلیدی
- ✅ سیستم آزمون کامل TELC B2
- ✅ پنل مدیریت برای ایجاد و ویرایش آزمون‌ها
- ✅ ترجمه فارسی برای تمام محتوا
- ✅ رابط کاربری مدرن و responsive
- ✅ سیستم امنیتی با rate limiting
- ✅ پشتیبانی از dark mode
- ✅ تایمر و پاسخنامه تعاملی

### 7. ساختار پروژه
```
├── telc_exam_backend/          # Flask backend
│   ├── src/
│   │   ├── main.py            # Main application
│   │   ├── models/            # Database models
│   │   ├── routes/            # API endpoints
│   │   └── security.py        # Authentication
│   └── requirements.txt       # Python dependencies
├── telc_exam_frontend/        # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── context/           # React context
│   │   ├── hooks/             # Custom hooks
│   │   └── lib/               # Utilities
│   └── package.json           # Node.js dependencies
└── README.md                  # Documentation
```

### 8. نحوه اجرا
```bash
# Backend
cd telc_exam_backend
pip install -r requirements.txt
python src/main.py

# Frontend
cd telc_exam_frontend
npm install
npm run dev
```

### 9. متغیرهای محیطی
فایل `.env` در backend ایجاد کنید:
```env
ADMIN_TOKEN=your_admin_token_here
FLASK_ENV=development
```

### 10. نکات مهم
- پروژه مستقل از telc gGmbH است
- تمام محتوا برای اهداف آموزشی ایجاد شده
- از فونت‌های محلی برای فارسی استفاده می‌شود
- سیستم ترجمه با کیفیت بالا پیاده‌سازی شده
