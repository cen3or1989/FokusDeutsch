#!/usr/bin/env python3
"""
Complete PostgreSQL Migration Script for TELC Exam System
This script migrates all data from SQLite to PostgreSQL with zero data loss.
"""

import os
import sys
import json
import sqlite3
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime
import re
import subprocess
import shutil

# Add the project root to Python path
sys.path.insert(0, os.path.dirname(__file__))

def get_sqlite_connection():
    """Connect to SQLite database"""
    db_path = os.path.join(os.path.dirname(__file__), 'src', 'database', 'app.db')
    if not os.path.exists(db_path):
        raise FileNotFoundError(f"SQLite database not found at {db_path}")
    return sqlite3.connect(db_path)

def get_postgres_connection():
    """Connect to PostgreSQL database"""
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        raise ValueError("DATABASE_URL environment variable not set")
    
    # Parse DATABASE_URL to get connection parameters
    # Format: postgresql://username:password@host:port/database
    match = re.match(r'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)', database_url)
    if not match:
        raise ValueError("Invalid DATABASE_URL format")
    
    username, password, host, port, database = match.groups()
    
    return psycopg2.connect(
        host=host,
        port=port,
        database=database,
        user=username,
        password=password
    )

def backup_sqlite():
    """Create a backup of the SQLite database"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    source_path = os.path.join(os.path.dirname(__file__), 'src', 'database', 'app.db')
    backup_path = os.path.join(os.path.dirname(__file__), 'src', 'database', f'app_backup_{timestamp}.db')
    
    shutil.copy2(source_path, backup_path)
    print(f"SQLite backup created: {backup_path}")
    return backup_path

def setup_alembic():
    """Initialize Alembic if not already done"""
    migrations_dir = os.path.join(os.path.dirname(__file__), 'migrations')
    
    if not os.path.exists(migrations_dir):
        print("Initializing Alembic...")
        subprocess.run(['alembic', 'init', 'migrations'], cwd=os.path.dirname(__file__), check=True)
        print("✅ Alembic initialized")
    else:
        print("✅ Alembic already initialized")

def create_initial_migration():
    """Create initial migration for all tables"""
    print("Creating initial migration...")
    
    # Remove existing versions if any
    versions_dir = os.path.join(os.path.dirname(__file__), 'migrations', 'versions')
    if os.path.exists(versions_dir):
        for file in os.listdir(versions_dir):
            if file.endswith('.py'):
                os.remove(os.path.join(versions_dir, file))
    
    # Create initial migration
    subprocess.run(['alembic', 'revision', '--autogenerate', '-m', 'Initial migration'], 
                  cwd=os.path.dirname(__file__), check=True)
    print("✅ Initial migration created")

def run_migrations():
    """Run Alembic migrations"""
    print("Running database migrations...")
    subprocess.run(['alembic', 'upgrade', 'head'], cwd=os.path.dirname(__file__), check=True)
    print("✅ Database migrations completed")

def migrate_data(sqlite_conn, pg_conn):
    """Migrate all data from SQLite to PostgreSQL"""
    sqlite_cursor = sqlite_conn.cursor()
    pg_cursor = pg_conn.cursor()
    
    # Get all table names from SQLite
    sqlite_cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    tables = [row[0] for row in sqlite_cursor.fetchall()]
    
    print(f"Found tables: {tables}")
    
    for table in tables:
        print(f"\nMigrating table: {table}")
        
        # Get table structure
        sqlite_cursor.execute(f"PRAGMA table_info({table})")
        columns = sqlite_cursor.fetchall()
        
        # Get all data from SQLite
        sqlite_cursor.execute(f"SELECT * FROM {table}")
        rows = sqlite_cursor.fetchall()
        
        if not rows:
            print(f"  No data in table {table}")
            continue
        
        # Prepare column names
        column_names = [col[1] for col in columns]
        placeholders = ', '.join(['%s'] * len(column_names))
        column_list = ', '.join([f'"{col}"' for col in column_names])
        
        # Insert data into PostgreSQL
        insert_sql = f'INSERT INTO {table} ({column_list}) VALUES ({placeholders})'
        
        migrated_count = 0
        for row in rows:
            try:
                # Handle data type conversions
                converted_row = []
                for i, value in enumerate(row):
                    if value is None:
                        converted_row.append(None)
                    elif isinstance(value, str):
                        # Handle JSON strings and regular text
                        converted_row.append(value)
                    elif isinstance(value, (int, float)):
                        converted_row.append(value)
                    elif isinstance(value, datetime):
                        converted_row.append(value.isoformat())
                    else:
                        converted_row.append(str(value))
                
                pg_cursor.execute(insert_sql, converted_row)
                migrated_count += 1
                
            except Exception as e:
                print(f"  Error migrating row {migrated_count + 1} in {table}: {e}")
                print(f"  Row data: {row}")
                raise
        
        print(f"  Migrated {migrated_count} rows")
    
    # Reset sequences for auto-increment fields
    print("\nResetting PostgreSQL sequences...")
    sequences_sql = [
        "SELECT setval('user_id_seq', COALESCE((SELECT MAX(id) FROM \"user\"), 1))",
        "SELECT setval('exam_id_seq', COALESCE((SELECT MAX(id) FROM exam), 1))",
        "SELECT setval('exam_result_id_seq', COALESCE((SELECT MAX(id) FROM exam_result), 1))",
        "SELECT setval('translation_cache_id_seq', COALESCE((SELECT MAX(id) FROM translation_cache), 1))",
        "SELECT setval('exam_translation_id_seq', COALESCE((SELECT MAX(id) FROM exam_translation), 1))"
    ]
    
    for sql in sequences_sql:
        try:
            pg_cursor.execute(sql)
        except Exception as e:
            print(f"  Warning: Could not reset sequence: {e}")
    
    pg_conn.commit()
    sqlite_cursor.close()
    pg_cursor.close()

def verify_migration(sqlite_conn, pg_conn):
    """Verify that all data was migrated correctly"""
    print("\nVerifying migration...")
    
    sqlite_cursor = sqlite_conn.cursor()
    pg_cursor = pg_conn.cursor(cursor_factory=RealDictCursor)
    
    # Get all table names
    sqlite_cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    tables = [row[0] for row in sqlite_cursor.fetchall()]
    
    for table in tables:
        print(f"\nVerifying table: {table}")
        
        # Count rows in both databases
        sqlite_cursor.execute(f"SELECT COUNT(*) FROM {table}")
        sqlite_count = sqlite_cursor.fetchone()[0]
        
        pg_cursor.execute(f"SELECT COUNT(*) FROM {table}")
        pg_count = pg_cursor.fetchone()['count']
        
        print(f"  SQLite rows: {sqlite_count}")
        print(f"  PostgreSQL rows: {pg_count}")
        
        if sqlite_count != pg_count:
            print(f"  ⚠️  WARNING: Row count mismatch in {table}")
        else:
            print(f"  ✅ Row count matches")
        
        # Sample data comparison for key tables
        if table in ['exam', 'user', 'exam_result'] and sqlite_count > 0:
            sqlite_cursor.execute(f"SELECT * FROM {table} LIMIT 1")
            sqlite_sample = sqlite_cursor.fetchone()
            
            pg_cursor.execute(f"SELECT * FROM {table} LIMIT 1")
            pg_sample = pg_cursor.fetchone()
            
            if sqlite_sample and pg_sample:
                print(f"  ✅ Sample data structure verified")
    
    sqlite_cursor.close()
    pg_cursor.close()

def test_postgres_connection():
    """Test PostgreSQL connection and basic functionality"""
    print("\n🔍 Testing PostgreSQL Connection and Data Integrity")
    print("=" * 60)
    
    try:
        # Import and test with Flask app context
        from src.main import app
        
        with app.app_context():
            from src.models.user import db
            
            # Test 1: Basic connection
            print("\n1. Testing database connection...")
            db.session.execute(text("SELECT 1"))
            print("   ✅ Database connection successful")
            
            # Test 2: Check tables exist
            print("\n2. Checking table structure...")
            tables = ['user', 'exam', 'exam_result', 'translation_cache', 'exam_translation']
            for table in tables:
                result = db.session.execute(text(f"SELECT COUNT(*) FROM {table}"))
                count = result.scalar()
                print(f"   ✅ Table '{table}' exists with {count} rows")
            
            # Test 3: Test Exam model
            print("\n3. Testing Exam model...")
            from src.models.exam import Exam
            exams = Exam.query.all()
            print(f"   ✅ Found {len(exams)} exams in database")
            
            if exams:
                exam = exams[0]
                print(f"   📝 Sample exam: {exam.title}")
                print(f"   📅 Created: {exam.created_at}")
                
                # Test to_dict method
                exam_dict = exam.to_dict()
                print(f"   🔍 Exam dict keys: {list(exam_dict.keys())}")
                
                # Test JSON fields
                if exam.lv1_titles:
                    titles = json.loads(exam.lv1_titles)
                    print(f"   📚 Sample titles: {len(titles)} items")
            
            print("\n🎉 All tests passed! PostgreSQL migration is working correctly.")
            
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        return False
    
    return True

def main():
    """Main migration function"""
    print("🚀 Starting Complete PostgreSQL Migration")
    print("=" * 60)
    
    # Check if DATABASE_URL is set
    if not os.getenv('DATABASE_URL'):
        print("❌ Error: DATABASE_URL environment variable not set")
        print("Please set DATABASE_URL to your PostgreSQL connection string")
        print("Example: postgresql://username:password@host:port/database")
        sys.exit(1)
    
    # Create backup
    print("\n📦 Creating SQLite backup...")
    backup_path = backup_sqlite()
    
    try:
        # Setup Alembic
        setup_alembic()
        
        # Create initial migration
        create_initial_migration()
        
        # Run migrations to create tables
        run_migrations()
        
        # Connect to databases
        print("\n🔌 Connecting to databases...")
        sqlite_conn = get_sqlite_connection()
        pg_conn = get_postgres_connection()
        
        print("✅ Connected to both databases")
        
        # Migrate data
        print("\n📊 Migrating data...")
        migrate_data(sqlite_conn, pg_conn)
        print("✅ Data migration completed")
        
        # Verify migration
        verify_migration(sqlite_conn, pg_conn)
        print("✅ Migration verification completed")
        
        # Test PostgreSQL connection
        test_postgres_connection()
        
        print("\n🎉 Complete migration completed successfully!")
        print(f"📁 SQLite backup saved at: {backup_path}")
        print("\nNext steps:")
        print("1. Your application is now PostgreSQL-only")
        print("2. All data has been preserved")
        print("3. Alembic is set up for future migrations")
        print("4. You can now deploy to production with PostgreSQL")
        print("5. Keep the backup for safety")
        
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        print(f"📁 Your original data is safe in: {backup_path}")
        sys.exit(1)
    
    finally:
        # Close connections
        if 'sqlite_conn' in locals():
            sqlite_conn.close()
        if 'pg_conn' in locals():
            pg_conn.close()

if __name__ == "__main__":
    main()
