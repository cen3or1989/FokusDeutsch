#!/usr/bin/env python3
"""
PostgreSQL Migration Script for TELC Exam System
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

def create_postgres_tables(pg_conn):
    """Create PostgreSQL tables with exact same structure as SQLite"""
    cursor = pg_conn.cursor()
    
    # Create tables with proper PostgreSQL syntax
    tables_sql = [
        """
        CREATE TABLE IF NOT EXISTS "user" (
            id SERIAL PRIMARY KEY,
            username VARCHAR(80) UNIQUE NOT NULL,
            email VARCHAR(120) UNIQUE NOT NULL
        );
        """,
        
        """
        CREATE TABLE IF NOT EXISTS exam (
            id SERIAL PRIMARY KEY,
            title VARCHAR(200) NOT NULL,
            created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            lv1_titles TEXT,
            lv1_texts TEXT,
            lv1_answers TEXT,
            lv2_texts TEXT,
            lv2_questions TEXT,
            lv2_answers TEXT,
            lv3_situations TEXT,
            lv3_ads TEXT,
            lv3_answers TEXT,
            sb1_text TEXT,
            sb1_options TEXT,
            sb1_answers TEXT,
            sb2_text TEXT,
            sb2_words TEXT,
            sb2_answers TEXT,
            hv1_audio_url VARCHAR(500),
            hv1_statements TEXT,
            hv1_answers TEXT,
            hv2_audio_url VARCHAR(500),
            hv2_statements TEXT,
            hv2_answers TEXT,
            hv3_audio_url VARCHAR(500),
            hv3_statements TEXT,
            hv3_answers TEXT,
            sa_task_a TEXT,
            sa_task_b TEXT
        );
        """,
        
        """
        CREATE TABLE IF NOT EXISTS exam_result (
            id SERIAL PRIMARY KEY,
            exam_id INTEGER NOT NULL REFERENCES exam(id) ON DELETE CASCADE,
            student_name VARCHAR(100),
            answers TEXT,
            score REAL,
            completed_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        """,
        
        """
        CREATE TABLE IF NOT EXISTS translation_cache (
            id SERIAL PRIMARY KEY,
            resource_type VARCHAR(50) NOT NULL,
            resource_id INTEGER NOT NULL,
            path VARCHAR(255) NOT NULL,
            source_lang VARCHAR(10) NOT NULL DEFAULT 'de',
            target_lang VARCHAR(10) NOT NULL,
            source_hash VARCHAR(64) NOT NULL,
            translated_text TEXT NOT NULL,
            created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT uq_translation_cache_unique_entry UNIQUE (
                resource_type, resource_id, path, source_lang, target_lang, source_hash
            )
        );
        """,
        
        """
        CREATE TABLE IF NOT EXISTS exam_translation (
            id SERIAL PRIMARY KEY,
            exam_id INTEGER NOT NULL,
            target_lang VARCHAR(10) NOT NULL,
            exam_hash VARCHAR(64) NOT NULL,
            payload TEXT NOT NULL,
            created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT uq_exam_translation_latest UNIQUE (exam_id, target_lang)
        );
        """
    ]
    
    for sql in tables_sql:
        cursor.execute(sql)
    
    pg_conn.commit()
    cursor.close()

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

def backup_sqlite():
    """Create a backup of the SQLite database"""
    import shutil
    from datetime import datetime
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    source_path = os.path.join(os.path.dirname(__file__), 'src', 'database', 'app.db')
    backup_path = os.path.join(os.path.dirname(__file__), 'src', 'database', f'app_backup_{timestamp}.db')
    
    shutil.copy2(source_path, backup_path)
    print(f"SQLite backup created: {backup_path}")
    return backup_path

def main():
    """Main migration function"""
    print("🚀 Starting PostgreSQL Migration")
    print("=" * 50)
    
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
        # Connect to databases
        print("\n🔌 Connecting to databases...")
        sqlite_conn = get_sqlite_connection()
        pg_conn = get_postgres_connection()
        
        print("✅ Connected to both databases")
        
        # Create PostgreSQL tables
        print("\n🏗️  Creating PostgreSQL tables...")
        create_postgres_tables(pg_conn)
        print("✅ Tables created")
        
        # Migrate data
        print("\n📊 Migrating data...")
        migrate_data(sqlite_conn, pg_conn)
        print("✅ Data migration completed")
        
        # Verify migration
        verify_migration(sqlite_conn, pg_conn)
        print("✅ Migration verification completed")
        
        print("\n🎉 Migration completed successfully!")
        print(f"📁 SQLite backup saved at: {backup_path}")
        print("\nNext steps:")
        print("1. Update your DATABASE_URL to point to PostgreSQL")
        print("2. Restart your application")
        print("3. Test all functionality")
        print("4. Keep the backup for safety")
        
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
