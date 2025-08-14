# راهنمای کامل استقرار - روش‌های جایگزین

## روش 1: Manual Render.com (توصیه شده)

### مزایا:
- ✅ رایگان
- ✅ PostgreSQL رایگان
- ✅ آسان برای تنظیم
- ✅ Auto-scaling

### مراحل:
1. **Database**: PostgreSQL ایجاد کنید
2. **Backend**: Web Service ایجاد کنید
3. **Frontend**: Static Site ایجاد کنید
4. **Environment Variables**: تنظیم کنید

## روش 2: Railway.app

### مزایا:
- ✅ رایگان (500 ساعت/ماه)
- ✅ PostgreSQL رایگان
- ✅ Auto-deploy از GitHub
- ✅ آسان‌تر از Render

### مراحل:
1. به [Railway.app](https://railway.app) بروید
2. GitHub connect کنید
3. "Deploy from GitHub repo" انتخاب کنید
4. PostgreSQL service اضافه کنید
5. Environment variables تنظیم کنید

## روش 3: Heroku

### مزایا:
- ❌ رایگان نیست (از $7/ماه)
- ✅ بسیار آسان
- ✅ PostgreSQL addon
- ✅ Auto-deploy

### مراحل:
1. به [Heroku.com](https://heroku.com) بروید
2. "Create new app" کلیک کنید
3. GitHub connect کنید
4. PostgreSQL addon اضافه کنید
5. Deploy کنید

## روش 4: Vercel + Railway

### مزایا:
- ✅ Vercel رایگان
- ✅ Railway رایگان
- ✅ بهترین performance
- ✅ CDN برای frontend

### مراحل:
1. **Backend**: Railway.app
2. **Frontend**: Vercel.com
3. **CORS**: تنظیم کنید
4. **Environment**: متغیرها را تنظیم کنید

## روش 5: Docker + Any Platform

### مزایا:
- ✅ قابل حمل
- ✅ هر platform
- ✅ Consistent environment
- ✅ Easy scaling

### مراحل:
1. Docker image بسازید
2. Container registry push کنید
3. هر platform که Docker support می‌کند

## مقایسه روش‌ها:

| Platform | رایگان | PostgreSQL | آسانی | Performance |
|----------|--------|------------|-------|-------------|
| Render.com | ✅ | ✅ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Railway.app | ✅ | ✅ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Heroku | ❌ | ✅ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Vercel+Railway | ✅ | ✅ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Docker | متغیر | متغیر | ⭐ | ⭐⭐⭐⭐⭐ |

## توصیه نهایی:

### برای شروع سریع:
**Railway.app** - آسان‌ترین و سریع‌ترین

### برای production:
**Render.com Manual** - بهترین balance

### برای scale:
**Vercel + Railway** - بهترین performance

## Environment Variables برای همه روش‌ها:

```env
# Backend
DATABASE_URL=postgresql://...
ADMIN_TOKEN=1535264
FLASK_ENV=production
FRONTEND_ORIGIN=https://your-frontend-url.com

# Frontend
VITE_API_BASE_URL=https://your-backend-url.com
```

## Troubleshooting:

### مشکلات رایج:
1. **Database Connection**: DATABASE_URL را بررسی کنید
2. **Build Fail**: Dependencies را بررسی کنید
3. **CORS Error**: FRONTEND_ORIGIN را تنظیم کنید
4. **Migration Fail**: SQLite file موجود باشد

### Logs:
- همه platform ها logs دارند
- Error messages را بررسی کنید
- Build logs را چک کنید
