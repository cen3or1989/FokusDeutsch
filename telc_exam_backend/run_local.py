#!/usr/bin/env python3
"""
Local development script for running the backend locally
while connecting to Docker PostgreSQL database
"""

import os
import sys
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

# Load environment variables from env.local if it exists
env_file = project_root / "env.local"
if env_file.exists():
    from dotenv import load_dotenv
    load_dotenv(env_file)

# Set default environment variables for local development
os.environ.setdefault('DATABASE_URL', 'postgresql://telc_user:telc_password@localhost:5433/telc_exam_db')
os.environ.setdefault('SECRET_KEY', 'local-dev-secret-key')
os.environ.setdefault('DEBUG', 'true')
os.environ.setdefault('HOST', '127.0.0.1')
os.environ.setdefault('PORT', '5000')
os.environ.setdefault('FRONTEND_ORIGIN', 'http://localhost:5173')

# Import and run the Flask app
from src.main import app

if __name__ == '__main__':
    print("🚀 Starting TELC Exam Backend (Local Development)")
    print("📊 Connecting to PostgreSQL in Docker...")
    print("🌐 Frontend origin:", os.environ.get('FRONTEND_ORIGIN'))
    print("🔗 Backend URL: http://127.0.0.1:5000")
    print("📝 Make sure PostgreSQL is running in Docker: docker-compose up -d")
    print("-" * 50)
    
    app.run(
        host=os.environ.get('HOST', '127.0.0.1'),
        port=int(os.environ.get('PORT', '5000')),
        debug=os.environ.get('DEBUG', 'true').lower() == 'true'
    )
