#!/usr/bin/env python3
"""
Test script to verify backend and database connection
"""

import requests
import time
import sys

def test_backend_health():
    """Test if the backend is responding"""
    try:
        response = requests.get('http://localhost:5000/api/health', timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Backend is healthy!")
            print(f"📊 Database status: {data.get('database', 'unknown')}")
            return True
        else:
            print(f"❌ Backend returned status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend at http://localhost:5000")
        print("💡 Make sure the backend is running: python telc_exam_backend/run_local.py")
        return False
    except Exception as e:
        print(f"❌ Error testing backend: {e}")
        return False

def test_frontend_api():
    """Test if frontend can connect to backend"""
    try:
        response = requests.get('http://localhost:5000/', timeout=5)
        if response.status_code == 200:
            print("✅ Frontend can connect to backend API")
            return True
        else:
            print(f"❌ API returned status code: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error testing API: {e}")
        return False

def main():
    print("🧪 Testing TELC Exam System Connections")
    print("=" * 40)
    
    # Wait a bit for services to start
    print("⏳ Waiting for services to be ready...")
    time.sleep(2)
    
    # Test backend health
    backend_ok = test_backend_health()
    
    if backend_ok:
        # Test API endpoints
        api_ok = test_frontend_api()
        
        if api_ok:
            print("\n🎉 All tests passed!")
            print("✅ Backend is running and healthy")
            print("✅ Database is connected")
            print("✅ API is accessible")
            print("\n🌐 You can now access:")
            print("   Frontend: http://localhost:5173")
            print("   Backend:  http://localhost:5000")
        else:
            print("\n⚠️  Backend is running but API has issues")
            sys.exit(1)
    else:
        print("\n❌ Backend is not responding")
        print("💡 Make sure to:")
        print("   1. Start PostgreSQL: docker-compose up -d postgres")
        print("   2. Initialize database: python init_database.py")
        print("   3. Start backend: python telc_exam_backend/run_local.py")
        sys.exit(1)

if __name__ == '__main__':
    main()
