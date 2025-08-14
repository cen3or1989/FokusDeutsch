# PostgreSQL Deployment Guide

This guide covers the complete migration from SQLite to PostgreSQL for both local development and production deployment.

## Prerequisites

1. **PostgreSQL Database**: Local or cloud PostgreSQL instance
2. **Python Dependencies**: Updated requirements with PostgreSQL support
3. **Environment Variables**: DATABASE_URL configured

## Step 1: Install Dependencies

```bash
cd telc_exam_backend
pip install -r requirements.txt
```

## Step 2: Set Up PostgreSQL Database

### Local Development
```bash
# Install PostgreSQL locally
# Create database and user
psql -U postgres
CREATE DATABASE telc_exam_system;
CREATE USER telc_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE telc_exam_system TO telc_user;
\q

# Set environment variable
export DATABASE_URL="postgresql://telc_user:your_password@localhost:5432/telc_exam_system"
```

### Cloud Deployment (Railway/Render/Heroku)
- Add PostgreSQL service to your project
- Environment variable `DATABASE_URL` will be automatically set

## Step 3: Run Complete Migration

```bash
cd telc_exam_backend
python migrate_to_postgres_complete.py
```

This script will:
1. ✅ Create SQLite backup
2. ✅ Initialize Alembic
3. ✅ Create initial migration
4. ✅ Run migrations to create PostgreSQL tables
5. ✅ Migrate all data from SQLite to PostgreSQL
6. ✅ Verify data integrity
7. ✅ Test PostgreSQL connection

## Step 4: Verify Migration

```bash
# Test PostgreSQL connection
python test_postgres_connection.py

# Check row counts
python -c "
from src.main import app
from src.models.exam import Exam
from src.models.user import db

with app.app_context():
    exams = Exam.query.all()
    print(f'Exams in PostgreSQL: {len(exams)}')
"
```

## Step 5: Run Application

```bash
# Backend
cd telc_exam_backend
python src/main.py

# Frontend (in another terminal)
cd telc_exam_frontend
npm run dev
```

## Production Deployment

### Railway
1. Connect your GitHub repository
2. Add PostgreSQL service
3. Set environment variables:
   - `DATABASE_URL` (auto-set by Railway)
   - `ADMIN_TOKEN=your_admin_token`
   - `FLASK_ENV=production`

### Render
1. Create new Web Service
2. Connect GitHub repository
3. Add PostgreSQL database
4. Set environment variables
5. Build Command: `pip install -r requirements.txt`
6. Start Command: `cd telc_exam_backend && python src/main.py`

### Heroku
1. Create new app
2. Add PostgreSQL addon
3. Set environment variables
4. Deploy from GitHub

## Database Management

### Creating New Migrations
```bash
cd telc_exam_backend

# After model changes
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head
```

### Rolling Back Migrations
```bash
# Rollback one step
alembic downgrade -1

# Rollback to specific revision
alembic downgrade <revision_id>
```

### Checking Migration Status
```bash
# Current migration status
alembic current

# Migration history
alembic history
```

## Environment Variables

### Required
```bash
DATABASE_URL=postgresql://username:password@host:port/database
```

### Optional
```bash
ADMIN_TOKEN=your_admin_token
FLASK_ENV=production
FRONTEND_ORIGIN=https://your-frontend-url.com
```

## Troubleshooting

### Connection Issues
```bash
# Test PostgreSQL connection
psql $DATABASE_URL -c "SELECT 1;"

# Check environment variable
echo $DATABASE_URL
```

### Migration Issues
```bash
# Reset migrations (if needed)
rm -rf migrations/versions/*
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

### Data Verification
```bash
# Compare row counts
python -c "
import sqlite3
import psycopg2
import os

# SQLite
sqlite_conn = sqlite3.connect('src/database/app.db')
sqlite_cursor = sqlite_conn.cursor()
sqlite_cursor.execute('SELECT COUNT(*) FROM exam')
sqlite_count = sqlite_cursor.fetchone()[0]

# PostgreSQL
pg_conn = psycopg2.connect(os.getenv('DATABASE_URL'))
pg_cursor = pg_conn.cursor()
pg_cursor.execute('SELECT COUNT(*) FROM exam')
pg_count = pg_cursor.fetchone()[0]

print(f'SQLite: {sqlite_count}, PostgreSQL: {pg_count}')
"
```

## Performance Optimization

### Connection Pooling
Already configured in `main.py`:
```python
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_pre_ping': True,
    'pool_recycle': 300,
    'pool_size': 10,
    'max_overflow': 20
}
```

### Indexes
Consider adding indexes for frequently queried columns:
```sql
CREATE INDEX idx_exam_created_at ON exam(created_at);
CREATE INDEX idx_exam_result_exam_id ON exam_result(exam_id);
```

## Monitoring

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Database Size
```sql
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats
WHERE schemaname = 'public';
```

## Backup Strategy

### Automated Backups
```bash
# Create backup script
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
psql $DATABASE_URL < backup_file.sql
```

### Railway/Render Backups
- Enable automated backups in your platform dashboard
- Set backup retention period
- Test restore procedures

## Security Considerations

1. **Connection Security**: Use SSL for production
2. **User Permissions**: Limit database user permissions
3. **Environment Variables**: Never commit credentials
4. **Backup Encryption**: Encrypt backup files
5. **Network Security**: Use VPC/private networks when possible

## Migration Checklist

- [ ] PostgreSQL database created
- [ ] DATABASE_URL environment variable set
- [ ] Dependencies installed (`psycopg2-binary`, `alembic`)
- [ ] Migration script run successfully
- [ ] Data verification completed
- [ ] Application tested with PostgreSQL
- [ ] Production environment configured
- [ ] Backup strategy implemented
- [ ] Monitoring set up

## Support

If you encounter issues:

1. Check the migration logs
2. Verify DATABASE_URL format
3. Test PostgreSQL connection manually
4. Review Alembic migration history
5. Check application logs for errors

The migration is designed to be safe and reversible. Your original SQLite data is always backed up before migration begins.
