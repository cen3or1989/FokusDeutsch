# PostgreSQL Migration Guide

This guide will help you migrate your TELC Exam System from SQLite to PostgreSQL with zero data loss and no application code changes.

## Prerequisites

1. **PostgreSQL Database**: You need access to a PostgreSQL database (local or cloud)
2. **Python Dependencies**: The migration script requires `psycopg2-binary`
3. **Backup**: Always backup your current SQLite database before migration

## Step 1: Install PostgreSQL Dependencies

The migration script requires PostgreSQL Python driver. It's already added to `requirements.txt`:

```bash
cd telc_exam_backend
pip install psycopg2-binary>=2.9.9
```

## Step 2: Set Up PostgreSQL Database

### Option A: Local PostgreSQL
1. Install PostgreSQL on your system
2. Create a new database:
```sql
CREATE DATABASE telc_exam_system;
CREATE USER telc_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE telc_exam_system TO telc_user;
```

### Option B: Cloud PostgreSQL (Recommended for Production)
- **Railway**: Add PostgreSQL service to your project
- **Render**: Create a PostgreSQL database in your dashboard
- **Heroku**: Add PostgreSQL addon
- **AWS RDS**: Create a PostgreSQL instance

## Step 3: Configure Environment Variables

Set your PostgreSQL connection string:

```bash
# For local PostgreSQL
export DATABASE_URL="postgresql://telc_user:your_password@localhost:5432/telc_exam_system"

# For Railway
export DATABASE_URL="postgresql://username:password@host:port/database"

# For Render
export DATABASE_URL="postgresql://username:password@host:port/database"
```

## Step 4: Run the Migration

The migration script will:
1. Create a backup of your SQLite database
2. Create PostgreSQL tables with exact same structure
3. Migrate all data preserving relationships
4. Reset auto-increment sequences
5. Verify the migration

```bash
cd telc_exam_backend
python migrate_to_postgres.py
```

### Expected Output:
```
🚀 Starting PostgreSQL Migration
==================================================

📦 Creating SQLite backup...
SQLite backup created: src/database/app_backup_20241214_143022.db

🔌 Connecting to databases...
✅ Connected to both databases

🏗️  Creating PostgreSQL tables...
✅ Tables created

📊 Migrating data...
Found tables: ['user', 'exam', 'exam_result', 'translation_cache', 'exam_translation']

Migrating table: user
  Migrated 0 rows

Migrating table: exam
  Migrated 2 rows

Migrating table: exam_result
  Migrated 0 rows

Migrating table: translation_cache
  Migrated 0 rows

Migrating table: exam_translation
  Migrated 0 rows

Resetting PostgreSQL sequences...
✅ Data migration completed

Verifying migration...

Verifying table: user
  SQLite rows: 0
  PostgreSQL rows: 0
  ✅ Row count matches

Verifying table: exam
  SQLite rows: 2
  PostgreSQL rows: 2
  ✅ Row count matches
  ✅ Sample data structure verified

Verifying table: exam_result
  SQLite rows: 0
  PostgreSQL rows: 0
  ✅ Row count matches

Verifying table: translation_cache
  SQLite rows: 0
  PostgreSQL rows: 0
  ✅ Row count matches

Verifying table: exam_translation
  SQLite rows: 0
  PostgreSQL rows: 0
  ✅ Row count matches

✅ Migration verification completed

🎉 Migration completed successfully!
📁 SQLite backup saved at: src/database/app_backup_20241214_143022.db

Next steps:
1. Update your DATABASE_URL to point to PostgreSQL
2. Restart your application
3. Test all functionality
4. Keep the backup for safety
```

## Step 5: Update Application Configuration

After successful migration, ensure your application uses PostgreSQL:

1. **Environment Variables**: Make sure `DATABASE_URL` points to PostgreSQL
2. **Application Restart**: Restart your Flask application
3. **Test Functionality**: Verify all features work correctly

## Step 6: Verify Application Works

Test these key functionalities:

1. **Admin Panel**: Login and create/edit exams
2. **Exam List**: View available exams
3. **Exam Taking**: Start and complete an exam
4. **Results**: View exam results
5. **Translation**: Test translation features

## Troubleshooting

### Common Issues

#### 1. Connection Errors
```
Error: could not connect to server
```
**Solution**: Check your `DATABASE_URL` format and network connectivity

#### 2. Permission Errors
```
Error: permission denied for database
```
**Solution**: Ensure your PostgreSQL user has proper permissions

#### 3. Data Type Errors
```
Error: column "created_at" is of type timestamp without time zone
```
**Solution**: The migration script handles this automatically

#### 4. Sequence Errors
```
Error: duplicate key value violates unique constraint
```
**Solution**: The migration script resets sequences automatically

### Rollback Plan

If something goes wrong:

1. **Stop the application**
2. **Restore from backup**:
   ```bash
   cp src/database/app_backup_TIMESTAMP.db src/database/app.db
   ```
3. **Remove DATABASE_URL** environment variable to use SQLite
4. **Restart the application**

## Database Schema Details

### Tables Migrated

1. **user**: User accounts and authentication
2. **exam**: Exam content and structure
3. **exam_result**: Student exam results
4. **translation_cache**: Cached translations
5. **exam_translation**: Full exam translations

### Data Types Preserved

- **INTEGER**: Auto-increment primary keys
- **VARCHAR**: String fields with length limits
- **TEXT**: JSON strings and long text content
- **REAL**: Float values for scores
- **TIMESTAMP**: DateTime fields
- **UNIQUE Constraints**: Preserved exactly
- **Foreign Keys**: Relationships maintained

### PostgreSQL Optimizations

The migration includes PostgreSQL-specific optimizations:

- **Connection Pooling**: Configured for better performance
- **Indexes**: Preserved from SQLite
- **Sequences**: Properly reset for auto-increment fields
- **Constraints**: All unique constraints and foreign keys preserved

## Performance Benefits

After migration to PostgreSQL, you'll experience:

1. **Better Concurrency**: Multiple users can access simultaneously
2. **Improved Performance**: Faster queries on large datasets
3. **Better Scalability**: Can handle more data and users
4. **ACID Compliance**: Full transaction support
5. **Advanced Features**: JSON operations, full-text search, etc.

## Security Considerations

1. **Connection Security**: Use SSL for production databases
2. **User Permissions**: Limit database user permissions
3. **Environment Variables**: Never commit database credentials
4. **Backup Strategy**: Regular PostgreSQL backups

## Monitoring

After migration, monitor:

1. **Connection Pool**: Check for connection leaks
2. **Query Performance**: Monitor slow queries
3. **Database Size**: Track growth over time
4. **Error Logs**: Watch for database-related errors

## Support

If you encounter issues:

1. Check the migration logs for specific errors
2. Verify your PostgreSQL connection string
3. Ensure all dependencies are installed
4. Test with a small dataset first

The migration script is designed to be safe and reversible. Your original SQLite data is always backed up before migration begins.
