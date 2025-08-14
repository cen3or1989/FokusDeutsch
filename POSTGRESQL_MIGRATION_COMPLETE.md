# Complete PostgreSQL Migration Guide

This guide provides step-by-step instructions for migrating your TELC Exam System from SQLite to PostgreSQL for both local development and production environments.

## 🎯 Migration Overview

The migration includes:
- ✅ Removal of all SQLite fallback code
- ✅ PostgreSQL-only configuration
- ✅ Alembic schema management
- ✅ Zero data loss migration
- ✅ Data integrity verification
- ✅ Production deployment ready

## 📋 Prerequisites

1. **PostgreSQL Installation**: Local PostgreSQL or cloud service
2. **Python Dependencies**: Updated requirements.txt with `psycopg2-binary`
3. **Environment Setup**: `DATABASE_URL` configuration
4. **Backup**: SQLite data backup (automatic)

## 🚀 Migration Steps

### Step 1: Set Up PostgreSQL Database

#### Option A: Local PostgreSQL
```bash
# Install PostgreSQL (if not already installed)
# Windows: Download from https://www.postgresql.org/download/windows/
# Linux: sudo apt-get install postgresql postgresql-contrib
# macOS: brew install postgresql

# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE telc_exam_db;
CREATE USER telc_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE telc_exam_db TO telc_user;
ALTER USER telc_user CREATEDB;  -- For running tests
\q
```

#### Option B: Cloud PostgreSQL
- **Railway**: Add PostgreSQL service to your project
- **Render**: Create PostgreSQL database in dashboard  
- **Heroku**: Add PostgreSQL addon
- **AWS RDS**: Create PostgreSQL instance

### Step 2: Configure Environment Variables

Set your PostgreSQL connection string:

```bash
# For local development
export DATABASE_URL="postgresql://telc_user:your_secure_password@localhost:5432/telc_exam_db"

# For production (Railway)
# Railway automatically sets DATABASE_URL when you add PostgreSQL service

# For production (Render)
# Set in Render dashboard environment variables
```

### Step 3: Install Updated Dependencies

```bash
cd telc_exam_backend
pip install -r requirements.txt
```

### Step 4: Run the Migration

```bash
# Set required Flask app environment variable
export FLASK_APP=src/main.py

# Migrate your existing SQLite data to PostgreSQL
python migrate_sqlite_to_postgres.py
```

Expected output:
```
🚀 Starting SQLite to PostgreSQL Migration
============================================================

📦 Creating SQLite backup...
✅ SQLite backup created: src/database/app_backup_20250814_220000.db

🔌 Connecting to databases...
✅ Connected to both databases

🏗️  Setting up PostgreSQL schema...
✅ PostgreSQL schema created

📊 Migrating data...
📊 Found tables to migrate: ['exam', 'exam_result']

📋 Migrating table: exam
   ✅ Migrated 2 rows
   🔢 Reset sequence exam_id_seq to 2

📋 Migrating table: exam_result  
   ℹ️  No data in table exam_result

🎉 Migration completed! Total rows migrated: 2

🔍 Verifying migration...

📊 Verifying table: exam
   SQLite: 2 rows
   PostgreSQL: 2 rows
   ✅ Row counts match
   ✅ Data integrity verified

🎉 All verification checks passed!
```

### Step 5: Verify Migration

```bash
# Run comprehensive verification
python verify_postgres_migration.py
```

This will test:
- Database connection
- Table structure
- Data integrity
- Foreign key relationships
- Auto-increment sequences
- API functionality

### Step 6: Update Alembic (Optional)

If you need to sync Alembic state:

```bash
# Mark current schema as migrated
flask db stamp head
```

## 🔧 Development Workflow

### Running the Application

```bash
# Start backend
cd telc_exam_backend
export DATABASE_URL="postgresql://telc_user:password@localhost:5432/telc_exam_db"
export FLASK_APP=src/main.py
python src/main.py

# Start frontend  
cd telc_exam_frontend
npm run dev
```

### Database Migrations

```bash
# Create new migration
flask db revision --autogenerate -m "Description"

# Apply migrations
flask db upgrade

# Downgrade (if needed)
flask db downgrade
```

## 🚀 Production Deployment

### Railway Deployment

1. **Add PostgreSQL Service**:
   - In Railway dashboard, add PostgreSQL service to your project
   - Railway automatically sets `DATABASE_URL`

2. **Deploy Application**:
   - Railway runs `flask db upgrade` automatically before starting the app
   - Your application will use PostgreSQL in production

3. **Environment Variables**:
   ```env
   ADMIN_TOKEN=your_admin_token
   FLASK_ENV=production
   SECRET_KEY=your_production_secret_key
   FRONTEND_ORIGIN=https://your-frontend-domain.railway.app
   ```

### Other Platforms (Render, Heroku)

1. **Add PostgreSQL Add-on/Service**
2. **Set Environment Variables**:
   - `DATABASE_URL` (usually set automatically)
   - `ADMIN_TOKEN`
   - `SECRET_KEY`
   - `FRONTEND_ORIGIN`

3. **Deploy with Migration**:
   - Add `flask db upgrade` to your start command
   - Example: `flask db upgrade && python src/main.py`

## 🔍 Verification Checklist

After migration, verify:

- [ ] ✅ Application starts without errors
- [ ] ✅ `/api/health` endpoint returns healthy status
- [ ] ✅ `/api/exams` returns existing exams
- [ ] ✅ Admin panel works (create/edit exams)
- [ ] ✅ Exam taking functionality works
- [ ] ✅ Translation features work
- [ ] ✅ All data preserved (IDs, timestamps, JSON content)

## 🆘 Troubleshooting

### Common Issues

#### 1. Connection Errors
```
psycopg2.OperationalError: connection to server failed
```
**Solution**: 
- Check PostgreSQL is running
- Verify DATABASE_URL format
- Check firewall/network settings

#### 2. Authentication Failed
```
FATAL: password authentication failed
```
**Solution**:
- Verify username/password in DATABASE_URL
- Check PostgreSQL user permissions

#### 3. Database Does Not Exist
```
FATAL: database "telc_exam_db" does not exist
```
**Solution**:
- Create database: `CREATE DATABASE telc_exam_db;`
- Grant permissions to user

#### 4. Migration Script Fails
```
ValueError: DATABASE_URL environment variable not set
```
**Solution**:
- Set DATABASE_URL before running migration
- Verify format: `postgresql://user:pass@host:port/db`

### Rollback Procedure

If something goes wrong:

1. **Stop the application**
2. **Restore SQLite backup**:
   ```bash
   cp src/database/app_backup_TIMESTAMP.db src/database/app.db
   ```
3. **Temporarily revert to SQLite** (emergency only):
   - Checkout previous git commit before PostgreSQL changes
   - Restart application

## 🎯 Benefits After Migration

1. **Better Performance**: Optimized for concurrent access
2. **Scalability**: Handles larger datasets efficiently  
3. **ACID Compliance**: Full transaction support
4. **Production Ready**: Suitable for high-traffic deployments
5. **Advanced Features**: JSON operations, full-text search, etc.
6. **Connection Pooling**: Better resource management

## 📊 Migration Impact

### What Changed
- Database backend: SQLite → PostgreSQL
- Configuration: Added DATABASE_URL requirement
- Dependencies: Added psycopg2-binary
- Schema management: Added Alembic migrations
- Deployment: Automatic migrations on deploy

### What Stayed the Same
- All application code and APIs
- Frontend functionality  
- Data structure and relationships
- User interface and features
- Admin panel functionality

## 🔒 Security Considerations

1. **DATABASE_URL Security**: Never commit connection strings to git
2. **SSL Connections**: Use SSL for production databases
3. **User Permissions**: Limit database user privileges
4. **Environment Variables**: Store sensitive data in environment
5. **Backup Strategy**: Regular PostgreSQL backups

## 📈 Performance Monitoring

Monitor these metrics after migration:

1. **Connection Pool Usage**: Check for connection leaks
2. **Query Performance**: Monitor slow query logs
3. **Database Size**: Track growth over time
4. **Error Rates**: Watch for database-related errors

## 🎉 Success!

You have successfully migrated your TELC Exam System to PostgreSQL! Your application is now:

- ✅ Production-ready with PostgreSQL
- ✅ Scalable and performant
- ✅ Using modern database practices
- ✅ Ready for deployment on any platform

For support or questions, refer to the verification script output or check the application logs.
