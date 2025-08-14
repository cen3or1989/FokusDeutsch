#!/usr/bin/env python3
import os
import sys
import json

# Add the project root to Python path
sys.path.insert(0, os.path.dirname(__file__))

from src.main import app
from src.models.exam import db, Exam

def add_sample_exam():
    """Add sample exam data to database"""
    with app.app_context():
        # Read sample exam data
        sample_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'sample_exam.json')
        
        with open(sample_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Check if exam already exists
        existing_exam = Exam.query.filter_by(title=data['title']).first()
        if existing_exam:
            print(f"Exam '{data['title']}' already exists. Skipping...")
            return
        
        # Create new exam
        exam = Exam(
            title=data.get('title', 'آزمون نمونه'),
            lv1_titles=json.dumps(data.get('leseverstehen_teil1', {}).get('titles', [])),
            lv1_texts=json.dumps(data.get('leseverstehen_teil1', {}).get('texts', [])),
            lv1_answers=json.dumps(data.get('leseverstehen_teil1', {}).get('answers', [])),
            
            lv2_texts=json.dumps(data.get('leseverstehen_teil2', {}).get('texts', [])),
            lv2_questions=json.dumps(data.get('leseverstehen_teil2', {}).get('questions', [])),
            lv2_answers=json.dumps(data.get('leseverstehen_teil2', {}).get('answers', [])),
            
            lv3_situations=json.dumps(data.get('leseverstehen_teil3', {}).get('situations', [])),
            lv3_ads=json.dumps(data.get('leseverstehen_teil3', {}).get('ads', [])),
            lv3_answers=json.dumps(data.get('leseverstehen_teil3', {}).get('answers', [])),
            
            sb1_text=data.get('sprachbausteine_teil1', {}).get('text', ''),
            sb1_options=json.dumps(data.get('sprachbausteine_teil1', {}).get('options', [])),
            sb1_answers=json.dumps(data.get('sprachbausteine_teil1', {}).get('answers', [])),
            
            sb2_text=data.get('sprachbausteine_teil2', {}).get('text', ''),
            sb2_words=json.dumps(data.get('sprachbausteine_teil2', {}).get('words', [])),
            sb2_answers=json.dumps(data.get('sprachbausteine_teil2', {}).get('answers', [])),
            
            hv1_audio_url=data.get('hoerverstehen', {}).get('teil1', {}).get('audio_url', ''),
            hv1_statements=json.dumps(data.get('hoerverstehen', {}).get('teil1', {}).get('statements', [])),
            hv1_answers=json.dumps(data.get('hoerverstehen', {}).get('teil1', {}).get('answers', [])),
            
            hv2_audio_url=data.get('hoerverstehen', {}).get('teil2', {}).get('audio_url', ''),
            hv2_statements=json.dumps(data.get('hoerverstehen', {}).get('teil2', {}).get('statements', [])),
            hv2_answers=json.dumps(data.get('hoerverstehen', {}).get('teil2', {}).get('answers', [])),
            
            hv3_audio_url=data.get('hoerverstehen', {}).get('teil3', {}).get('audio_url', ''),
            hv3_statements=json.dumps(data.get('hoerverstehen', {}).get('teil3', {}).get('statements', [])),
            hv3_answers=json.dumps(data.get('hoerverstehen', {}).get('teil3', {}).get('answers', [])),
            
            sa_task_a=data.get('schriftlicher_ausdruck', {}).get('task_a', ''),
            sa_task_b=data.get('schriftlicher_ausdruck', {}).get('task_b', '')
        )
        
        db.session.add(exam)
        db.session.commit()
        
        print(f"Successfully added exam: {exam.title} (ID: {exam.id})")

if __name__ == '__main__':
    add_sample_exam()

