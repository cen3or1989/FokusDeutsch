#!/usr/bin/env python3
"""
SQLite to PostgreSQL Migration Script
Migrates all data from SQLite to PostgreSQL with zero data loss.
Preserves all IDs, foreign keys, timestamps, and data integrity.
"""

import os
import sys
import json
import sqlite3
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime
import re
from urllib.parse import urlparse

def get_sqlite_connection():
    """Connect to SQLite database"""
    db_path = os.path.join(os.path.dirname(__file__), 'src', 'database', 'app.db')
    if not os.path.exists(db_path):
        raise FileNotFoundError(f"SQLite database not found at {db_path}")
    return sqlite3.connect(db_path)

def parse_database_url(database_url):
    """Parse DATABASE_URL into connection parameters"""
    parsed = urlparse(database_url)
    return {
        'host': parsed.hostname,
        'port': parsed.port or 5432,
        'database': parsed.path[1:],  # Remove leading slash
        'user': parsed.username,
        'password': parsed.password
    }

def get_postgres_connection():
    """Connect to PostgreSQL database"""
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        raise ValueError("DATABASE_URL environment variable not set")
    
    if not database_url.startswith('postgresql://'):
        raise ValueError("DATABASE_URL must be a PostgreSQL connection string")
    
    conn_params = parse_database_url(database_url)
    return psycopg2.connect(**conn_params)

def backup_sqlite():
    """Create a backup of the SQLite database"""
    import shutil
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    source_path = os.path.join(os.path.dirname(__file__), 'src', 'database', 'app.db')
    backup_path = os.path.join(os.path.dirname(__file__), 'src', 'database', f'app_backup_{timestamp}.db')
    
    shutil.copy2(source_path, backup_path)
    print(f"✅ SQLite backup created: {backup_path}")
    return backup_path

def run_postgres_migrations(pg_conn):
    """Run Alembic migrations on PostgreSQL database"""
    cursor = pg_conn.cursor()
    
    # Create alembic_version table if it doesn't exist
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS alembic_version (
            version_num VARCHAR(32) NOT NULL,
            CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num)
        )
    """)
    
    # Check if any migrations have been run
    cursor.execute("SELECT version_num FROM alembic_version")
    current_version = cursor.fetchone()
    
    if current_version:
        print(f"⚠️  Database already has migration version: {current_version[0]}")
        print("Skipping schema creation...")
        return False
    
    # Run the initial migration
    print("🏗️  Creating PostgreSQL schema...")
    
    # Execute the migration directly
    migration_sql = """
    -- Create user table
    CREATE TABLE IF NOT EXISTS "user" (
        id SERIAL PRIMARY KEY,
        username VARCHAR(80) UNIQUE NOT NULL,
        email VARCHAR(120) UNIQUE NOT NULL
    );
    
    -- Create exam table
    CREATE TABLE IF NOT EXISTS exam (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
    
    -- Create exam_result table
    CREATE TABLE IF NOT EXISTS exam_result (
        id SERIAL PRIMARY KEY,
        exam_id INTEGER NOT NULL REFERENCES exam(id) ON DELETE CASCADE,
        student_name VARCHAR(100),
        answers TEXT,
        score REAL,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Create translation_cache table
    CREATE TABLE IF NOT EXISTS translation_cache (
        id SERIAL PRIMARY KEY,
        resource_type VARCHAR(50) NOT NULL,
        resource_id INTEGER NOT NULL,
        path VARCHAR(255) NOT NULL,
        source_lang VARCHAR(10) NOT NULL DEFAULT 'de',
        target_lang VARCHAR(10) NOT NULL,
        source_hash VARCHAR(64) NOT NULL,
        translated_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_translation_cache_unique_entry UNIQUE (
            resource_type, resource_id, path, source_lang, target_lang, source_hash
        )
    );
    
    -- Create exam_translation table
    CREATE TABLE IF NOT EXISTS exam_translation (
        id SERIAL PRIMARY KEY,
        exam_id INTEGER NOT NULL,
        target_lang VARCHAR(10) NOT NULL,
        exam_hash VARCHAR(64) NOT NULL,
        payload TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_exam_translation_latest UNIQUE (exam_id, target_lang)
    );
    
    -- Record migration version
    INSERT INTO alembic_version (version_num) VALUES ('001_initial_postgresql_schema');
    """
    
    cursor.execute(migration_sql)
    pg_conn.commit()
    cursor.close()
    print("✅ PostgreSQL schema created")
    return True

def migrate_data(sqlite_conn, pg_conn):
    """Migrate all data from SQLite to PostgreSQL preserving IDs and relationships"""
    sqlite_cursor = sqlite_conn.cursor()
    pg_cursor = pg_conn.cursor()
    
    # Get all table names from SQLite (excluding system tables)
    sqlite_cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    tables = [row[0] for row in sqlite_cursor.fetchall()]
    
    print(f"📊 Found tables to migrate: {tables}")
    
    # Define migration order to respect foreign key constraints
    table_order = ['user', 'exam', 'exam_result', 'translation_cache', 'exam_translation']
    
    # Add any additional tables that might exist
    for table in tables:
        if table not in table_order:
            table_order.append(table)
    
    # Only migrate tables that exist in SQLite
    migration_tables = [table for table in table_order if table in tables]
    
    total_migrated = 0
    
    for table in migration_tables:
        print(f"\n📋 Migrating table: {table}")
        
        # Get all data from SQLite
        sqlite_cursor.execute(f"SELECT * FROM {table}")
        rows = sqlite_cursor.fetchall()
        
        if not rows:
            print(f"   ℹ️  No data in table {table}")
            continue
        
        # Get column names
        sqlite_cursor.execute(f"PRAGMA table_info({table})")
        columns_info = sqlite_cursor.fetchall()
        column_names = [col[1] for col in columns_info]
        
        # Prepare SQL for insertion
        placeholders = ', '.join(['%s'] * len(column_names))
        column_list = ', '.join([f'"{col}"' for col in column_names])
        insert_sql = f'INSERT INTO {table} ({column_list}) VALUES ({placeholders})'
        
        migrated_count = 0
        
        for row in rows:
            try:
                # Convert data types for PostgreSQL compatibility
                converted_row = []
                for i, value in enumerate(row):
                    if value is None:
                        converted_row.append(None)
                    elif isinstance(value, str):
                        converted_row.append(value)
                    elif isinstance(value, (int, float)):
                        converted_row.append(value)
                    else:
                        converted_row.append(str(value))
                
                pg_cursor.execute(insert_sql, converted_row)
                migrated_count += 1
                
            except Exception as e:
                print(f"   ❌ Error migrating row {migrated_count + 1}: {e}")
                print(f"   📄 Row data: {row}")
                raise
        
        # Reset sequences to continue from the highest ID
        if column_names[0] == 'id':  # Assuming first column is always 'id'
            try:
                max_id_query = f"SELECT COALESCE(MAX(id), 0) FROM {table}"
                pg_cursor.execute(max_id_query)
                max_id = pg_cursor.fetchone()[0]
                
                if max_id > 0:
                    sequence_name = f"{table}_id_seq"
                    reset_sequence_sql = f"SELECT setval('{sequence_name}', {max_id})"
                    pg_cursor.execute(reset_sequence_sql)
                    print(f"   🔢 Reset sequence {sequence_name} to {max_id}")
            except Exception as e:
                print(f"   ⚠️  Warning: Could not reset sequence for {table}: {e}")
        
        print(f"   ✅ Migrated {migrated_count} rows")
        total_migrated += migrated_count
    
    pg_conn.commit()
    sqlite_cursor.close()
    pg_cursor.close()
    
    print(f"\n🎉 Migration completed! Total rows migrated: {total_migrated}")

def verify_migration(sqlite_conn, pg_conn):
    """Verify that all data was migrated correctly"""
    print("\n🔍 Verifying migration...")
    
    sqlite_cursor = sqlite_conn.cursor()
    pg_cursor = pg_conn.cursor(cursor_factory=RealDictCursor)
    
    # Get all table names
    sqlite_cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    tables = [row[0] for row in sqlite_cursor.fetchall()]
    
    verification_passed = True
    
    for table in tables:
        print(f"\n📊 Verifying table: {table}")
        
        # Count rows in both databases
        sqlite_cursor.execute(f"SELECT COUNT(*) FROM {table}")
        sqlite_count = sqlite_cursor.fetchone()[0]
        
        pg_cursor.execute(f"SELECT COUNT(*) FROM {table}")
        pg_count = pg_cursor.fetchone()['count']
        
        print(f"   SQLite: {sqlite_count} rows")
        print(f"   PostgreSQL: {pg_count} rows")
        
        if sqlite_count != pg_count:
            print(f"   ❌ Row count mismatch!")
            verification_passed = False
        else:
            print(f"   ✅ Row counts match")
        
        # Verify data integrity for key tables
        if table in ['exam'] and sqlite_count > 0:
            # Check if JSON fields are still valid
            sqlite_cursor.execute(f"SELECT id, lv1_titles, lv1_texts FROM {table} WHERE lv1_titles IS NOT NULL LIMIT 1")
            sqlite_sample = sqlite_cursor.fetchone()
            
            if sqlite_sample:
                pg_cursor.execute(f"SELECT id, lv1_titles, lv1_texts FROM {table} WHERE id = %s", (sqlite_sample[0],))
                pg_sample = pg_cursor.fetchone()
                
                if pg_sample and sqlite_sample[1] == pg_sample['lv1_titles']:
                    print(f"   ✅ Data integrity verified")
                else:
                    print(f"   ❌ Data integrity check failed")
                    verification_passed = False
    
    sqlite_cursor.close()
    pg_cursor.close()
    
    if verification_passed:
        print("\n🎉 All verification checks passed!")
    else:
        print("\n❌ Some verification checks failed!")
    
    return verification_passed

def main():
    """Main migration function"""
    print("🚀 Starting SQLite to PostgreSQL Migration")
    print("=" * 60)
    
    # Check prerequisites
    if not os.getenv('DATABASE_URL'):
        print("❌ Error: DATABASE_URL environment variable not set")
        print("Please set DATABASE_URL to your PostgreSQL connection string")
        print("Example: postgresql://username:password@host:port/database")
        sys.exit(1)
    
    try:
        # Create backup
        print("\n📦 Creating SQLite backup...")
        backup_path = backup_sqlite()
        
        # Connect to databases
        print("\n🔌 Connecting to databases...")
        sqlite_conn = get_sqlite_connection()
        pg_conn = get_postgres_connection()
        print("✅ Connected to both databases")
        
        # Run PostgreSQL migrations
        print("\n🏗️  Setting up PostgreSQL schema...")
        schema_created = run_postgres_migrations(pg_conn)
        
        if schema_created:
            # Migrate data
            print("\n📊 Migrating data...")
            migrate_data(sqlite_conn, pg_conn)
            
            # Verify migration
            print("\n🔍 Verifying migration...")
            verification_passed = verify_migration(sqlite_conn, pg_conn)
            
            if verification_passed:
                print("\n🎉 Migration completed successfully!")
                print(f"📁 SQLite backup: {backup_path}")
                print("\n📋 Next steps:")
                print("1. Test your application with PostgreSQL")
                print("2. Update your deployment configurations")
                print("3. Keep the SQLite backup for safety")
                print("4. Run: flask db upgrade (to sync Alembic)")
            else:
                print("\n⚠️  Migration completed with warnings!")
                print("Please review the verification output above.")
        else:
            print("\n✅ PostgreSQL database already initialized")
            print("Skipping data migration (database already contains data)")
        
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        print(f"📁 Your original data is safe in the SQLite backup")
        sys.exit(1)
    
    finally:
        # Close connections
        if 'sqlite_conn' in locals():
            sqlite_conn.close()
        if 'pg_conn' in locals():
            pg_conn.close()

if __name__ == "__main__":
    main()
