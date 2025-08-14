from flask import Blueprint, request, jsonify
from src.models.exam import db, Exam, ExamResult
import json
from src.security import rate_limit, require_admin

exam_bp = Blueprint('exam', __name__)

@exam_bp.route('/exams', methods=['GET'])
@rate_limit(limit=120, window_seconds=60)
def get_exams():
    """Get list of all exams"""
    exams = Exam.query.all()
    return jsonify([{
        'id': exam.id,
        'title': exam.title,
        'created_at': exam.created_at.isoformat()
    } for exam in exams])

@exam_bp.route('/exams/<int:exam_id>', methods=['GET'])
@rate_limit(limit=120, window_seconds=60)
def get_exam(exam_id):
    """Get details of a specific exam"""
    exam = Exam.query.get_or_404(exam_id)
    return jsonify(exam.to_dict())

@exam_bp.route('/exams', methods=['POST'])
@require_admin
@rate_limit(limit=30, window_seconds=60)
def create_exam():
    """Create a new exam - supports both old and new data formats"""
    data = request.get_json()
    
    # Support both old format (leseverstehen_teil1.titles) and new format (lv1_titles)
    exam = Exam(
        title=data.get('title', 'Neue Prüfung'),
        
        # Leseverstehen Teil 1 - try new format first, then old format
        lv1_titles=json.dumps(
            data.get('lv1_titles') or 
            data.get('leseverstehen_teil1', {}).get('titles', [])
        ),
        lv1_texts=json.dumps(
            data.get('lv1_texts') or 
            data.get('leseverstehen_teil1', {}).get('texts', [])
        ),
        lv1_answers=json.dumps(
            data.get('lv1_answers') or 
            data.get('leseverstehen_teil1', {}).get('answers', [])
        ),
        
        # Leseverstehen Teil 2
        lv2_texts=json.dumps(
            data.get('lv2_texts') or 
            data.get('leseverstehen_teil2', {}).get('texts', [])
        ),
        lv2_questions=json.dumps(
            data.get('lv2_questions') or 
            data.get('leseverstehen_teil2', {}).get('questions', [])
        ),
        lv2_answers=json.dumps(
            data.get('lv2_answers') or 
            data.get('leseverstehen_teil2', {}).get('answers', [])
        ),
        
        # Leseverstehen Teil 3
        lv3_situations=json.dumps(
            data.get('lv3_situations') or 
            data.get('leseverstehen_teil3', {}).get('situations', [])
        ),
        lv3_ads=json.dumps(
            data.get('lv3_ads') or 
            data.get('leseverstehen_teil3', {}).get('ads', [])
        ),
        lv3_answers=json.dumps(
            data.get('lv3_answers') or 
            data.get('leseverstehen_teil3', {}).get('answers', [])
        ),
        
        # Sprachbausteine Teil 1
        sb1_text=data.get('sb1_text') or data.get('sprachbausteine_teil1', {}).get('text', ''),
        sb1_options=json.dumps(
            data.get('sb1_words') or  # new format uses 'words' instead of 'options'
            data.get('sb1_options') or 
            data.get('sprachbausteine_teil1', {}).get('options', [])
        ),
        sb1_answers=json.dumps(
            data.get('sb1_answers') or 
            data.get('sprachbausteine_teil1', {}).get('answers', [])
        ),
        
        # Sprachbausteine Teil 2
        sb2_text=data.get('sb2_text') or data.get('sprachbausteine_teil2', {}).get('text', ''),
        sb2_words=json.dumps(
            data.get('sb2_options') or  # new format uses 'options' for Teil 2
            data.get('sb2_words') or 
            data.get('sprachbausteine_teil2', {}).get('words', [])
        ),
        sb2_answers=json.dumps(
            data.get('sb2_answers') or 
            data.get('sprachbausteine_teil2', {}).get('answers', [])
        ),
        
        # Hörverstehen Teil 1
        hv1_audio_url=(
            data.get('hoerverstehen', {}).get('teil1', {}).get('audio_url', '') or 
            data.get('hv1_audio_url', '')
        ),
        hv1_statements=json.dumps(
            data.get('hoerverstehen', {}).get('teil1', {}).get('statements', [])
        ),
        hv1_answers=json.dumps(
            data.get('hoerverstehen', {}).get('teil1', {}).get('answers', [])
        ),
        
        # Hörverstehen Teil 2
        hv2_audio_url=(
            data.get('hoerverstehen', {}).get('teil2', {}).get('audio_url', '') or 
            data.get('hv2_audio_url', '')
        ),
        hv2_statements=json.dumps(
            data.get('hoerverstehen', {}).get('teil2', {}).get('statements', [])
        ),
        hv2_answers=json.dumps(
            data.get('hoerverstehen', {}).get('teil2', {}).get('answers', [])
        ),
        
        # Hörverstehen Teil 3
        hv3_audio_url=(
            data.get('hoerverstehen', {}).get('teil3', {}).get('audio_url', '') or 
            data.get('hv3_audio_url', '')
        ),
        hv3_statements=json.dumps(
            data.get('hoerverstehen', {}).get('teil3', {}).get('statements', [])
        ),
        hv3_answers=json.dumps(
            data.get('hoerverstehen', {}).get('teil3', {}).get('answers', [])
        ),
        
        # Schriftlicher Ausdruck
        sa_task_a=data.get('schriftlicher_ausdruck', {}).get('task_a', ''),
        sa_task_b=data.get('schriftlicher_ausdruck', {}).get('task_b', '')
    )
    
    db.session.add(exam)
    db.session.commit()
    
    return jsonify(exam.to_dict()), 201

@exam_bp.route('/exams/<int:exam_id>', methods=['PUT'])
@require_admin
@rate_limit(limit=30, window_seconds=60)
def update_exam(exam_id):
    """Update an existing exam - supports both old and new data formats"""
    exam = Exam.query.get_or_404(exam_id)
    data = request.get_json()
    
    exam.title = data.get('title', exam.title)
    
    # Leseverstehen Teil 1 - support both formats
    if 'lv1_titles' in data or 'leseverstehen_teil1' in data:
        exam.lv1_titles = json.dumps(
            data.get('lv1_titles') or 
            data.get('leseverstehen_teil1', {}).get('titles', [])
        )
    if 'lv1_texts' in data or 'leseverstehen_teil1' in data:
        exam.lv1_texts = json.dumps(
            data.get('lv1_texts') or 
            data.get('leseverstehen_teil1', {}).get('texts', [])
        )
    if 'lv1_answers' in data or 'leseverstehen_teil1' in data:
        exam.lv1_answers = json.dumps(
            data.get('lv1_answers') or 
            data.get('leseverstehen_teil1', {}).get('answers', [])
        )
    
    # Leseverstehen Teil 2
    if 'lv2_questions' in data or 'leseverstehen_teil2' in data:
        exam.lv2_questions = json.dumps(
            data.get('lv2_questions') or 
            data.get('leseverstehen_teil2', {}).get('questions', [])
        )
    
    # Leseverstehen Teil 3
    if 'lv3_situations' in data or 'leseverstehen_teil3' in data:
        exam.lv3_situations = json.dumps(
            data.get('lv3_situations') or 
            data.get('leseverstehen_teil3', {}).get('situations', [])
        )
    
    # Sprachbausteine Teil 1
    if 'sb1_text' in data or 'sprachbausteine_teil1' in data:
        exam.sb1_text = data.get('sb1_text') or data.get('sprachbausteine_teil1', {}).get('text', '')
    if 'sb1_words' in data or 'sprachbausteine_teil1' in data:
        exam.sb1_options = json.dumps(
            data.get('sb1_words') or 
            data.get('sprachbausteine_teil1', {}).get('options', [])
        )
    if 'sb1_answers' in data or 'sprachbausteine_teil1' in data:
        exam.sb1_answers = json.dumps(
            data.get('sb1_answers') or 
            data.get('sprachbausteine_teil1', {}).get('answers', [])
        )
    
    # Sprachbausteine Teil 2
    if 'sb2_text' in data or 'sprachbausteine_teil2' in data:
        exam.sb2_text = data.get('sb2_text') or data.get('sprachbausteine_teil2', {}).get('text', '')
    if 'sb2_options' in data or 'sprachbausteine_teil2' in data:
        exam.sb2_words = json.dumps(
            data.get('sb2_options') or 
            data.get('sprachbausteine_teil2', {}).get('words', [])
        )
    if 'sb2_answers' in data or 'sprachbausteine_teil2' in data:
        exam.sb2_answers = json.dumps(
            data.get('sb2_answers') or 
            data.get('sprachbausteine_teil2', {}).get('answers', [])
        )
    
    # Hörverstehen - support both formats
    if 'hoerverstehen' in data:
        hv = data['hoerverstehen']
        if 'teil1' in hv:
            exam.hv1_audio_url = hv['teil1'].get('audio_url', '')
            exam.hv1_statements = json.dumps(hv['teil1'].get('statements', []))
            exam.hv1_answers = json.dumps(hv['teil1'].get('answers', []))
        if 'teil2' in hv:
            exam.hv2_audio_url = hv['teil2'].get('audio_url', '')
            exam.hv2_statements = json.dumps(hv['teil2'].get('statements', []))
            exam.hv2_answers = json.dumps(hv['teil2'].get('answers', []))
        if 'teil3' in hv:
            exam.hv3_audio_url = hv['teil3'].get('audio_url', '')
            exam.hv3_statements = json.dumps(hv['teil3'].get('statements', []))
            exam.hv3_answers = json.dumps(hv['teil3'].get('answers', []))
    
    if 'schriftlicher_ausdruck' in data:
        sa = data['schriftlicher_ausdruck']
        exam.sa_task_a = sa.get('task_a', '')
        exam.sa_task_b = sa.get('task_b', '')
    
    db.session.commit()
    return jsonify(exam.to_dict())

@exam_bp.route('/exams/<int:exam_id>', methods=['DELETE'])
@require_admin
@rate_limit(limit=20, window_seconds=60)
def delete_exam(exam_id):
    """Delete an exam"""
    exam = Exam.query.get_or_404(exam_id)
    db.session.delete(exam)
    db.session.commit()
    return '', 204

@exam_bp.route('/exams/<int:exam_id>/submit', methods=['POST'])
@rate_limit(limit=30, window_seconds=60)
def submit_exam(exam_id):
    """Submit student answers and calculate score"""
    exam = Exam.query.get_or_404(exam_id)
    data = request.get_json()
    
    student_answers = data.get('answers', {})
    student_name = data.get('student_name', 'Unbekannt')
    
    # Calculate total score
    total_score = 0
    max_score = 60  # 60 total questions
    
    # Grade Leseverstehen Teil 1 (5 points)
    if 'leseverstehen_teil1' in student_answers:
        correct_answers = json.loads(exam.lv1_answers) if exam.lv1_answers else []
        student_lv1 = student_answers['leseverstehen_teil1']
        for i, correct in enumerate(correct_answers):
            if i < len(student_lv1) and student_lv1[i] == correct:
                total_score += 1
    
    # Grade Leseverstehen Teil 2 (5 points)
    if 'leseverstehen_teil2' in student_answers:
        correct_answers = json.loads(exam.lv2_answers) if exam.lv2_answers else []
        student_lv2 = student_answers['leseverstehen_teil2']
        for i, correct in enumerate(correct_answers):
            if i < len(student_lv2) and student_lv2[i] == correct:
                total_score += 1
    
    # Grade Leseverstehen Teil 3 (10 points)
    if 'leseverstehen_teil3' in student_answers:
        correct_answers = json.loads(exam.lv3_answers) if exam.lv3_answers else []
        student_lv3 = student_answers['leseverstehen_teil3']
        for i, correct in enumerate(correct_answers):
            if i < len(student_lv3) and student_lv3[i] == correct:
                total_score += 1
    
    # Grade Sprachbausteine Teil 1 (10 points)
    if 'sprachbausteine_teil1' in student_answers:
        correct_answers = json.loads(exam.sb1_answers) if exam.sb1_answers else []
        student_sb1 = student_answers['sprachbausteine_teil1']
        for i, correct in enumerate(correct_answers):
            if i < len(student_sb1) and student_sb1[i] == correct:
                total_score += 1
    
    # Grade Sprachbausteine Teil 2 (10 points)
    if 'sprachbausteine_teil2' in student_answers:
        correct_answers = json.loads(exam.sb2_answers) if exam.sb2_answers else []
        student_sb2 = student_answers['sprachbausteine_teil2']
        for i, correct in enumerate(correct_answers):
            if i < len(student_sb2) and student_sb2[i] == correct:
                total_score += 1
    
    # Grade Hörverstehen (20 points)
    if 'hoerverstehen' in student_answers:
        hv_answers = student_answers['hoerverstehen']
        
        # Teil 1 (5 points)
        if 'teil1' in hv_answers:
            correct_answers = json.loads(exam.hv1_answers) if exam.hv1_answers else []
            for i, correct in enumerate(correct_answers):
                if i < len(hv_answers['teil1']) and hv_answers['teil1'][i] == correct:
                    total_score += 1
        
        # Teil 2 (10 points)
        if 'teil2' in hv_answers:
            correct_answers = json.loads(exam.hv2_answers) if exam.hv2_answers else []
            for i, correct in enumerate(correct_answers):
                if i < len(hv_answers['teil2']) and hv_answers['teil2'][i] == correct:
                    total_score += 1
        
        # Teil 3 (5 points)
        if 'teil3' in hv_answers:
            correct_answers = json.loads(exam.hv3_answers) if exam.hv3_answers else []
            for i, correct in enumerate(correct_answers):
                if i < len(hv_answers['teil3']) and hv_answers['teil3'][i] == correct:
                    total_score += 1
    
    # Calculate percentage score
    score_percentage = (total_score / max_score) * 100
    
    # Persist result
    result = ExamResult(
        exam_id=exam_id,
        student_name=student_name,
        answers=json.dumps(student_answers),
        score=score_percentage
    )
    
    db.session.add(result)
    db.session.commit()
    
    return jsonify({
        'result_id': result.id,
        'total_score': total_score,
        'max_score': max_score,
        'score_percentage': score_percentage,
        'detailed_scores': {
            'leseverstehen_teil1': (lambda: (
                f"{sum(1 for i, correct in enumerate(json.loads(exam.lv1_answers) if exam.lv1_answers else [])
                      if i < len(student_answers.get('leseverstehen_teil1', []))
                      and student_answers.get('leseverstehen_teil1', [])[i] == correct)}/5"
            ))(),
            'leseverstehen_teil2': (lambda: (
                f"{sum(1 for i, correct in enumerate(json.loads(exam.lv2_answers) if exam.lv2_answers else [])
                      if i < len(student_answers.get('leseverstehen_teil2', []))
                      and student_answers.get('leseverstehen_teil2', [])[i] == correct)}/5"
            ))(),
            'leseverstehen_teil3': (lambda: (
                f"{sum(1 for i, correct in enumerate(json.loads(exam.lv3_answers) if exam.lv3_answers else [])
                      if i < len(student_answers.get('leseverstehen_teil3', []))
                      and student_answers.get('leseverstehen_teil3', [])[i] == correct)}/10"
            ))(),
            'sprachbausteine_teil1': (lambda: (
                f"{sum(1 for i, correct in enumerate(json.loads(exam.sb1_answers) if exam.sb1_answers else [])
                      if i < len(student_answers.get('sprachbausteine_teil1', []))
                      and student_answers.get('sprachbausteine_teil1', [])[i] == correct)}/10"
            ))(),
            'sprachbausteine_teil2': (lambda: (
                f"{sum(1 for i, correct in enumerate(json.loads(exam.sb2_answers) if exam.sb2_answers else [])
                      if i < len(student_answers.get('sprachbausteine_teil2', []))
                      and student_answers.get('sprachbausteine_teil2', [])[i] == correct)}/10"
            ))(),
            'hoerverstehen': (lambda: (
                (
                    lambda hv_total: f"{hv_total}/20"
                )(
                    sum(
                        1
                        for teil in ['teil1', 'teil2', 'teil3']
                        for i, correct in enumerate(
                            json.loads(getattr(exam, f'hv{teil[-1]}_answers')) if getattr(exam, f'hv{teil[-1]}_answers') else []
                        )
                        if i < len(student_answers.get('hoerverstehen', {}).get(teil, []))
                        and student_answers.get('hoerverstehen', {}).get(teil, [])[i] == correct
                    )
                )
            ))()
        }
    })

@exam_bp.route('/results/<int:result_id>', methods=['GET'])
def get_result(result_id):
    """Get exam result by id"""
    result = ExamResult.query.get_or_404(result_id)
    return jsonify(result.to_dict())

