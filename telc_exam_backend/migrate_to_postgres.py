#!/usr/bin/env python3
"""
Migration script to transfer data from SQLite to PostgreSQL
Run this script when DATABASE_URL is set to PostgreSQL
"""

import os
import sys
import json
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Add the project root to Python path
sys.path.insert(0, os.path.dirname(__file__))

from src.models.exam import Exam, ExamResult
from src.models.user import db
from src.main import app

def migrate_data():
    """Migrate data from SQLite to PostgreSQL"""
    
    # Check if we're using PostgreSQL
    database_url = os.getenv('DATABASE_URL')
    if not database_url or not database_url.startswith('postgresql'):
        print("Not using PostgreSQL. Skipping migration.")
        return
    
    print("Starting migration from SQLite to PostgreSQL...")
    
    # Connect to SQLite (old database)
    sqlite_path = os.path.join(os.path.dirname(__file__), 'src', 'database', 'app.db')
    if not os.path.exists(sqlite_path):
        print(f"SQLite database not found at {sqlite_path}")
        return
    
    sqlite_engine = create_engine(f"sqlite:///{sqlite_path}")
    SQLiteSession = sessionmaker(bind=sqlite_engine)
    sqlite_session = SQLiteSession()
    
    try:
        # Get all exams from SQLite
        sqlite_exams = sqlite_session.execute(text("SELECT * FROM exam")).fetchall()
        print(f"Found {len(sqlite_exams)} exams in SQLite")
        
        # Get all exam results from SQLite
        sqlite_results = sqlite_session.execute(text("SELECT * FROM exam_result")).fetchall()
        print(f"Found {len(sqlite_results)} exam results in SQLite")
        
        # Use Flask app context for PostgreSQL operations
        with app.app_context():
            # Clear existing data in PostgreSQL
            ExamResult.query.delete()
            Exam.query.delete()
            db.session.commit()
            print("Cleared existing data in PostgreSQL")
            
            # Migrate exams
            for sqlite_exam in sqlite_exams:
                exam = Exam(
                    id=sqlite_exam.id,
                    title=sqlite_exam.title,
                    created_at=sqlite_exam.created_at,
                    lv1_titles=sqlite_exam.lv1_titles,
                    lv1_texts=sqlite_exam.lv1_texts,
                    lv1_answers=sqlite_exam.lv1_answers,
                    lv2_texts=sqlite_exam.lv2_texts,
                    lv2_questions=sqlite_exam.lv2_questions,
                    lv2_answers=sqlite_exam.lv2_answers,
                    lv3_situations=sqlite_exam.lv3_situations,
                    lv3_ads=sqlite_exam.lv3_ads,
                    lv3_answers=sqlite_exam.lv3_answers,
                    sb1_text=sqlite_exam.sb1_text,
                    sb1_options=sqlite_exam.sb1_options,
                    sb1_answers=sqlite_exam.sb1_answers,
                    sb2_text=sqlite_exam.sb2_text,
                    sb2_words=sqlite_exam.sb2_words,
                    sb2_answers=sqlite_exam.sb2_answers,
                    hv1_audio_url=sqlite_exam.hv1_audio_url,
                    hv1_statements=sqlite_exam.hv1_statements,
                    hv1_answers=sqlite_exam.hv1_answers,
                    hv2_audio_url=sqlite_exam.hv2_audio_url,
                    hv2_statements=sqlite_exam.hv2_statements,
                    hv2_answers=sqlite_exam.hv2_answers,
                    hv3_audio_url=sqlite_exam.hv3_audio_url,
                    hv3_statements=sqlite_exam.hv3_statements,
                    hv3_answers=sqlite_exam.hv3_answers,
                    sa_task_a=sqlite_exam.sa_task_a,
                    sa_task_b=sqlite_exam.sa_task_b
                )
                db.session.add(exam)
            
            # Migrate exam results
            for sqlite_result in sqlite_results:
                result = ExamResult(
                    id=sqlite_result.id,
                    exam_id=sqlite_result.exam_id,
                    student_name=sqlite_result.student_name,
                    answers=sqlite_result.answers,
                    score=sqlite_result.score,
                    completed_at=sqlite_result.completed_at
                )
                db.session.add(result)
            
            db.session.commit()
            print("Migration completed successfully!")
            print(f"Migrated {len(sqlite_exams)} exams and {len(sqlite_results)} results")
            
    except Exception as e:
        print(f"Migration failed: {e}")
        db.session.rollback()
    finally:
        sqlite_session.close()

if __name__ == '__main__':
    migrate_data()
