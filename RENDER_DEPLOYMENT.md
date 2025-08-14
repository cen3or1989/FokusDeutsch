# راهنمای استقرار روی Render.com با PostgreSQL

## مشکل SQLite در Render.com

در Render.com، فایل‌های SQLite در `/tmp` ذخیره می‌شوند که ephemeral هستند و با هر restart پاک می‌شوند. برای حل این مشکل از PostgreSQL استفاده می‌کنیم.

## مراحل استقرار

### 1. ایجاد Repository در Render.com

1. به [Render.com](https://render.com) بروید
2. روی "New +" کلیک کنید
3. "Blueprint" را انتخاب کنید
4. Repository GitHub خود را connect کنید

### 2. تنظیمات Blueprint

فایل `render.yaml` در root پروژه تنظیم شده است که شامل:

- **PostgreSQL Database**: `telc-b2-database`
- **Backend Service**: `telc-b2-backend` (Python/Flask)
- **Frontend Service**: `telc-b2-frontend` (Static Site)

### 3. متغیرهای محیطی

Backend به‌طور خودکار این متغیرها را تنظیم می‌کند:

```env
DATABASE_URL=postgresql://... (از Render Database)
ADMIN_TOKEN=1535264
FLASK_ENV=production
FRONTEND_ORIGIN=https://telc-b2-frontend.onrender.com
```

### 4. Migration خودکار

Backend به‌طور خودکار:
1. Tables را در PostgreSQL ایجاد می‌کند
2. داده‌های SQLite را به PostgreSQL منتقل می‌کند
3. از PostgreSQL برای عملیات استفاده می‌کند

### 5. مراحل دستی (اگر Blueprint کار نکرد)

#### ایجاد Database
1. "New +" → "PostgreSQL"
2. نام: `telc-b2-database`
3. Plan: Free

#### ایجاد Backend Service
1. "New +" → "Web Service"
2. Repository: `cen3or1989/FokusDeutsch`
3. تنظیمات:
   - **Name**: `telc-b2-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r telc_exam_backend/requirements.txt`
   - **Start Command**: `cd telc_exam_backend && python src/main.py`
   - **Root Directory**: `/` (خالی)

#### Environment Variables برای Backend
```
DATABASE_URL=postgresql://... (از Database)
ADMIN_TOKEN=1535264
FLASK_ENV=production
FRONTEND_ORIGIN=https://your-frontend-url.onrender.com
```

#### ایجاد Frontend Service
1. "New +" → "Static Site"
2. Repository: `cen3or1989/FokusDeutsch`
3. تنظیمات:
   - **Name**: `telc-b2-frontend`
   - **Build Command**: `cd telc_exam_frontend && npm install && npm run build`
   - **Publish Directory**: `telc_exam_frontend/dist`
   - **Root Directory**: `/` (خالی)

#### Environment Variables برای Frontend
```
VITE_API_BASE_URL=https://your-backend-url.onrender.com
```

### 6. تست پس از استقرار

1. **Backend Health Check**:
   ```
   https://telc-b2-backend.onrender.com/
   ```

2. **API Test**:
   ```
   https://telc-b2-backend.onrender.com/api/exams
   ```

3. **Frontend**:
   ```
   https://telc-b2-frontend.onrender.com/
   ```

### 7. نکات مهم

#### امنیت
- ✅ Admin token در Environment Variables
- ✅ CORS برای domain های مجاز
- ✅ Rate limiting فعال

#### عملکرد
- ✅ PostgreSQL برای production
- ✅ Auto-migration از SQLite
- ✅ Persistent data storage

#### Monitoring
- ✅ Render logs
- ✅ Database monitoring
- ✅ Health checks

### 8. Troubleshooting

#### مشکلات رایج
- **Migration Failed**: بررسی کنید که SQLite file موجود باشد
- **Database Connection**: DATABASE_URL را بررسی کنید
- **Build Fail**: Dependencies را بررسی کنید
- **CORS Error**: FRONTEND_ORIGIN را تنظیم کنید

#### Logs
- Backend logs در Render dashboard
- Database logs در PostgreSQL service
- Build logs در deployment history

### 9. مزایای PostgreSQL

- ✅ **Persistent Storage**: داده‌ها با restart پاک نمی‌شوند
- ✅ **Better Performance**: برای production مناسب‌تر
- ✅ **Scalability**: قابلیت مقیاس‌پذیری
- ✅ **Backup**: امکان backup خودکار
- ✅ **Monitoring**: ابزارهای monitoring بهتر
