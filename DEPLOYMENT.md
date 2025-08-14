# راهنمای استقرار (Deployment Guide)

## استقرار روی Render.com

### 1. استقرار Backend (Flask API)

#### مرحله 1: ایجاد Web Service
1. به [Render.com](https://render.com) بروید و ثبت‌نام کنید
2. روی "New +" کلیک کنید
3. "Web Service" را انتخاب کنید
4. Repository GitHub خود را connect کنید

#### مرحله 2: تنظیمات Backend
- **Name**: `telc-b2-backend`
- **Environment**: `Python 3`
- **Build Command**: `pip install -r telc_exam_backend/requirements.txt`
- **Start Command**: `cd telc_exam_backend && python src/main.py`
- **Root Directory**: `/` (خالی بگذارید)

#### مرحله 3: متغیرهای محیطی
در بخش "Environment Variables" اضافه کنید:
```
ADMIN_TOKEN=your_admin_token_here
FLASK_ENV=production
```

#### مرحله 4: Database (اختیاری)
برای production، PostgreSQL توصیه می‌شود:
1. "New +" → "PostgreSQL"
2. نام: `telc-b2-database`
3. در Environment Variables اضافه کنید:
```
DATABASE_URL=postgresql://...
```

### 2. استقرار Frontend (React App)

#### مرحله 1: ایجاد Static Site
1. "New +" → "Static Site"
2. Repository GitHub خود را connect کنید

#### مرحله 2: تنظیمات Frontend
- **Name**: `telc-b2-frontend`
- **Build Command**: `cd telc_exam_frontend && npm install && npm run build`
- **Publish Directory**: `telc_exam_frontend/dist`
- **Root Directory**: `/` (خالی بگذارید)

#### مرحله 3: متغیرهای محیطی
```
VITE_API_BASE_URL=https://your-backend-url.onrender.com
```

### 3. تنظیم CORS

در backend، فایل `src/main.py` را ویرایش کنید:

```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=[
    "https://your-frontend-url.onrender.com",
    "http://localhost:5173"  # برای development
])
```

### 4. استقرار روی Vercel (جایگزین)

#### Backend (Vercel Functions)
1. فایل `vercel.json` در root ایجاد کنید:
```json
{
  "functions": {
    "telc_exam_backend/src/main.py": {
      "runtime": "python3.9"
    }
  }
}
```

#### Frontend
1. به [Vercel.com](https://vercel.com) بروید
2. Repository را import کنید
3. Framework Preset: `Vite`
4. Root Directory: `telc_exam_frontend`

### 5. استقرار روی Heroku

#### Backend
1. فایل `Procfile` در `telc_exam_backend/` ایجاد کنید:
```
web: python src/main.py
```

2. فایل `runtime.txt` در `telc_exam_backend/` ایجاد کنید:
```
python-3.9.18
```

#### Frontend
1. فایل `static.json` در `telc_exam_frontend/` ایجاد کنید:
```json
{
  "root": "dist",
  "clean_urls": true,
  "routes": {
    "/**": "index.html"
  }
}
```

### 6. نکات مهم استقرار

#### امنیت
- ✅ Admin token را در Environment Variables قرار دهید
- ✅ CORS را فقط برای domain های مجاز تنظیم کنید
- ✅ Rate limiting را فعال نگه دارید

#### عملکرد
- ✅ Database connection pooling استفاده کنید
- ✅ Static files را CDN کنید
- ✅ Compression را فعال کنید

#### Monitoring
- ✅ Logs را monitor کنید
- ✅ Error tracking اضافه کنید
- ✅ Performance metrics جمع‌آوری کنید

### 7. تست پس از استقرار

1. **Backend API Test**:
```bash
curl https://your-backend-url.onrender.com/api/exams
```

2. **Frontend Test**:
- Landing page بارگذاری می‌شود
- Navigation کار می‌کند
- API calls موفق هستند

3. **Admin Panel Test**:
- Login با admin token
- ایجاد/ویرایش آزمون‌ها
- مشاهده نتایج

### 8. Troubleshooting

#### مشکلات رایج
- **CORS Error**: Origin را در CORS تنظیمات اضافه کنید
- **Database Connection**: DATABASE_URL را بررسی کنید
- **Build Fail**: Dependencies را بررسی کنید
- **Environment Variables**: همه متغیرها را تنظیم کنید

#### Logs
- Backend logs را در Render dashboard بررسی کنید
- Frontend build logs را چک کنید
- Network requests را در browser dev tools بررسی کنید
