#!/usr/bin/env python3
"""
Database initialization script
Runs migrations to set up the database schema
"""

import os
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent / "telc_exam_backend"
sys.path.insert(0, str(backend_dir))

# Set environment variables
os.environ.setdefault('DATABASE_URL', 'postgresql://telc_user:telc_password@localhost:5433/telc_exam_db')
os.environ.setdefault('FLASK_APP', 'src.main')

# Import Flask app and db
from src.main import app, db
from flask_migrate import upgrade

def init_database():
    """Initialize the database with migrations"""
    print("🗄️  Initializing database...")
    
    with app.app_context():
        try:
            # Run migrations
            upgrade()
            print("✅ Database initialized successfully!")
            print("📊 Tables created and ready for use.")
        except Exception as e:
            print(f"❌ Error initializing database: {e}")
            print("💡 Make sure PostgreSQL is running: docker-compose up -d postgres")
            return False
    
    return True

if __name__ == '__main__':
    print("🚀 TELC Exam Database Initialization")
    print("=" * 40)
    
    success = init_database()
    
    if success:
        print("\n🎉 Database is ready!")
        print("📝 You can now start the backend with: python telc_exam_backend/run_local.py")
    else:
        print("\n❌ Database initialization failed!")
        sys.exit(1)
