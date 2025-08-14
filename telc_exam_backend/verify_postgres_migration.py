#!/usr/bin/env python3
"""
PostgreSQL Migration Verification Script
Verifies data integrity, table structure, and application functionality after migration
"""

import os
import sys
import json
from urllib.parse import urlparse

# Add the project root to Python path
sys.path.insert(0, os.path.dirname(__file__))

def verify_database_url():
    """Verify DATABASE_URL is set and valid"""
    database_url = os.getenv('DATABASE_URL')
    
    if not database_url:
        print("❌ DATABASE_URL environment variable not set")
        return False
    
    if not database_url.startswith('postgresql://'):
        print(f"❌ DATABASE_URL must be PostgreSQL, got: {database_url[:20]}...")
        return False
    
    # Parse URL
    try:
        parsed = urlparse(database_url)
        print(f"✅ DATABASE_URL valid: {parsed.hostname}:{parsed.port}/{parsed.path[1:]}")
        return True
    except Exception as e:
        print(f"❌ Invalid DATABASE_URL format: {e}")
        return False

def verify_app_startup():
    """Verify the Flask app can start with PostgreSQL"""
    try:
        from src.main import app
        with app.app_context():
            print("✅ Flask app startup successful")
            return True
    except Exception as e:
        print(f"❌ Flask app startup failed: {e}")
        return False

def verify_database_connection():
    """Test PostgreSQL connection and basic operations"""
    try:
        from src.main import app
        from src.models.user import db
        from sqlalchemy import text
        
        with app.app_context():
            # Test basic connection
            result = db.session.execute(text("SELECT 1"))
            assert result.scalar() == 1
            print("✅ Database connection successful")
            
            # Test transaction
            db.session.begin()
            db.session.rollback()
            print("✅ Database transactions working")
            
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def verify_table_structure():
    """Verify all tables exist with correct structure"""
    try:
        from src.main import app
        from src.models.user import db
        from sqlalchemy import text
        
        with app.app_context():
            # Check if all expected tables exist
            expected_tables = ['user', 'exam', 'exam_result', 'translation_cache', 'exam_translation', 'alembic_version']
            
            result = db.session.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
            """))
            
            existing_tables = [row[0] for row in result.fetchall()]
            
            for table in expected_tables:
                if table in existing_tables:
                    print(f"✅ Table '{table}' exists")
                else:
                    print(f"❌ Table '{table}' missing")
                    return False
            
            # Check exam table structure
            result = db.session.execute(text("""
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns 
                WHERE table_name = 'exam'
                ORDER BY ordinal_position
            """))
            
            exam_columns = result.fetchall()
            required_columns = [
                'id', 'title', 'created_at', 
                'lv1_titles', 'lv1_texts', 'lv1_answers',
                'lv2_texts', 'lv2_questions', 'lv2_answers',
                'lv3_situations', 'lv3_ads', 'lv3_answers',
                'sb1_text', 'sb1_options', 'sb1_answers',
                'sb2_text', 'sb2_words', 'sb2_answers',
                'hv1_audio_url', 'hv1_statements', 'hv1_answers',
                'hv2_audio_url', 'hv2_statements', 'hv2_answers',
                'hv3_audio_url', 'hv3_statements', 'hv3_answers',
                'sa_task_a', 'sa_task_b'
            ]
            
            existing_columns = [col[0] for col in exam_columns]
            
            for col in required_columns:
                if col in existing_columns:
                    print(f"✅ Column 'exam.{col}' exists")
                else:
                    print(f"❌ Column 'exam.{col}' missing")
                    return False
            
            return True
    except Exception as e:
        print(f"❌ Table structure verification failed: {e}")
        return False

def verify_data_integrity():
    """Verify data was migrated correctly"""
    try:
        from src.main import app
        from src.models.exam import Exam, ExamResult
        from src.models.user import User, db
        from src.models.translation import TranslationCache, ExamTranslation
        
        with app.app_context():
            # Check exam data
            exams = Exam.query.all()
            print(f"✅ Found {len(exams)} exams in database")
            
            for exam in exams:
                # Test to_dict method
                exam_dict = exam.to_dict()
                assert 'id' in exam_dict
                assert 'title' in exam_dict
                assert 'created_at' in exam_dict
                
                # Test JSON field parsing
                if exam.lv1_titles:
                    try:
                        titles = json.loads(exam.lv1_titles)
                        assert isinstance(titles, list)
                    except json.JSONDecodeError:
                        print(f"❌ Invalid JSON in exam {exam.id} lv1_titles")
                        return False
                
                print(f"✅ Exam {exam.id} data integrity verified")
            
            # Check exam results
            results = ExamResult.query.all()
            print(f"✅ Found {len(results)} exam results")
            
            # Check users
            users = User.query.all()
            print(f"✅ Found {len(users)} users")
            
            # Check translation cache
            translations = TranslationCache.query.all()
            print(f"✅ Found {len(translations)} translation cache entries")
            
            # Check exam translations
            exam_translations = ExamTranslation.query.all()
            print(f"✅ Found {len(exam_translations)} exam translations")
            
            return True
    except Exception as e:
        print(f"❌ Data integrity verification failed: {e}")
        return False

def verify_foreign_keys():
    """Verify foreign key relationships work"""
    try:
        from src.main import app
        from src.models.exam import Exam, ExamResult
        from src.models.user import db
        
        with app.app_context():
            # Test exam -> exam_result relationship
            exam_with_results = db.session.query(Exam).join(ExamResult).first()
            
            if exam_with_results:
                results = exam_with_results.results
                print(f"✅ Foreign key relationship working: exam {exam_with_results.id} has {len(results)} results")
            else:
                print("ℹ️  No exam with results found (this is normal for new installations)")
            
            return True
    except Exception as e:
        print(f"❌ Foreign key verification failed: {e}")
        return False

def verify_sequences():
    """Verify auto-increment sequences work"""
    try:
        from src.main import app
        from src.models.exam import Exam
        from src.models.user import db
        
        with app.app_context():
            # Test creating a new exam
            test_exam = Exam(title="MIGRATION_TEST_EXAM")
            db.session.add(test_exam)
            db.session.commit()
            
            new_id = test_exam.id
            assert new_id is not None
            assert new_id > 0
            
            print(f"✅ Auto-increment working: new exam got ID {new_id}")
            
            # Clean up test exam
            db.session.delete(test_exam)
            db.session.commit()
            print("✅ Test exam cleaned up")
            
            return True
    except Exception as e:
        print(f"❌ Sequence verification failed: {e}")
        return False

def verify_api_functionality():
    """Verify API endpoints work with PostgreSQL"""
    try:
        from src.main import app
        
        with app.test_client() as client:
            # Test health endpoint
            response = client.get('/api/health')
            assert response.status_code == 200
            data = response.get_json()
            assert data['status'] == 'healthy'
            assert data['database'] == 'connected'
            print("✅ Health endpoint working")
            
            # Test exams endpoint
            response = client.get('/api/exams')
            assert response.status_code == 200
            exams = response.get_json()
            print(f"✅ Exams endpoint working: {len(exams)} exams returned")
            
            return True
    except Exception as e:
        print(f"❌ API functionality verification failed: {e}")
        return False

def main():
    """Run all verification tests"""
    print("🔍 PostgreSQL Migration Verification")
    print("=" * 50)
    
    tests = [
        ("Database URL", verify_database_url),
        ("App Startup", verify_app_startup),
        ("Database Connection", verify_database_connection),
        ("Table Structure", verify_table_structure),
        ("Data Integrity", verify_data_integrity),
        ("Foreign Keys", verify_foreign_keys),
        ("Sequences", verify_sequences),
        ("API Functionality", verify_api_functionality),
    ]
    
    passed = 0
    failed = 0
    
    for test_name, test_func in tests:
        print(f"\n🧪 Testing: {test_name}")
        print("-" * 30)
        
        try:
            if test_func():
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print(f"❌ Test '{test_name}' crashed: {e}")
            failed += 1
    
    print(f"\n📊 Verification Results")
    print("=" * 30)
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print(f"📈 Success Rate: {passed}/{passed + failed} ({100 * passed / (passed + failed):.1f}%)")
    
    if failed == 0:
        print("\n🎉 All verification tests passed!")
        print("Your PostgreSQL migration is successful and ready for production!")
    else:
        print(f"\n⚠️  {failed} verification tests failed!")
        print("Please review the errors above and fix them before proceeding.")
        sys.exit(1)

if __name__ == "__main__":
    main()
