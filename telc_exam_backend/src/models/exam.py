from src.models.user import db
from datetime import datetime
import json

class Exam(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Leseverstehen Teil 1 - match headlines
    lv1_titles = db.Column(db.Text)  # JSON string of titles a-j
    lv1_texts = db.Column(db.Text)   # JSON string of texts 1-5
    lv1_answers = db.Column(db.Text) # JSON string of correct answers
    
    # Leseverstehen Teil 2 - detailed comprehension
    lv2_texts = db.Column(db.Text)   # JSON string of long texts
    lv2_questions = db.Column(db.Text) # JSON string of questions 6-10
    lv2_answers = db.Column(db.Text) # JSON string of correct answers
    
    # Leseverstehen Teil 3 - match situations
    lv3_situations = db.Column(db.Text) # JSON string of situations 11-20
    lv3_ads = db.Column(db.Text)     # JSON string of ads a-l
    lv3_answers = db.Column(db.Text) # JSON string of correct answers
    
    # Sprachbausteine Teil 1 - grammar
    sb1_text = db.Column(db.Text)    # Text with blanks
    sb1_options = db.Column(db.Text) # JSON string of options for each blank
    sb1_answers = db.Column(db.Text) # JSON string of correct answers
    
    # Sprachbausteine Teil 2 - vocabulary
    sb2_text = db.Column(db.Text)    # Text with blanks
    sb2_words = db.Column(db.Text)   # JSON string of word list a-o
    sb2_answers = db.Column(db.Text) # JSON string of correct answers
    
    # Hörverstehen
    hv1_audio_url = db.Column(db.String(500)) # Audio file URL for Teil 1
    hv1_statements = db.Column(db.Text) # JSON string of statements 41-45
    hv1_answers = db.Column(db.Text)   # JSON string of correct answers (true/false)
    
    hv2_audio_url = db.Column(db.String(500)) # Audio file URL for Teil 2
    hv2_statements = db.Column(db.Text) # JSON string of statements 46-55
    hv2_answers = db.Column(db.Text)   # JSON string of correct answers (true/false)
    
    hv3_audio_url = db.Column(db.String(500)) # Audio file URL for Teil 3
    hv3_statements = db.Column(db.Text) # JSON string of statements 56-60
    hv3_answers = db.Column(db.Text)   # JSON string of correct answers (true/false)
    
    # Schriftlicher Ausdruck
    sa_task_a = db.Column(db.Text)   # Task A description
    sa_task_b = db.Column(db.Text)   # Task B description
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'created_at': self.created_at.isoformat(),
            
            # Support both old and new formats in response
            # Old format (for backward compatibility)
            'leseverstehen_teil1': {
                'titles': json.loads(self.lv1_titles) if self.lv1_titles else [],
                'texts': json.loads(self.lv1_texts) if self.lv1_texts else [],
                'answers': json.loads(self.lv1_answers) if self.lv1_answers else []
            },
            'leseverstehen_teil2': {
                'texts': json.loads(self.lv2_texts) if self.lv2_texts else [],
                'questions': json.loads(self.lv2_questions) if self.lv2_questions else []
            },
            'leseverstehen_teil3': {
                'situations': json.loads(self.lv3_situations) if self.lv3_situations else [],
                'ads': json.loads(self.lv3_ads) if self.lv3_ads else []
            },
            'sprachbausteine_teil1': {
                'text': self.sb1_text,
                'options': json.loads(self.sb1_options) if self.sb1_options else [],
                'answers': json.loads(self.sb1_answers) if self.sb1_answers else []
            },
            'sprachbausteine_teil2': {
                'text': self.sb2_text,
                'words': json.loads(self.sb2_words) if self.sb2_words else [],
                'answers': json.loads(self.sb2_answers) if self.sb2_answers else []
            },
            'hoerverstehen': {
                'teil1': {
                    'audio_url': self.hv1_audio_url,
                    'statements': json.loads(self.hv1_statements) if self.hv1_statements else [],
                    'answers': json.loads(self.hv1_answers) if self.hv1_answers else []
                },
                'teil2': {
                    'audio_url': self.hv2_audio_url,
                    'statements': json.loads(self.hv2_statements) if self.hv2_statements else [],
                    'answers': json.loads(self.hv2_answers) if self.hv2_answers else []
                },
                'teil3': {
                    'audio_url': self.hv3_audio_url,
                    'statements': json.loads(self.hv3_statements) if self.hv3_statements else [],
                    'answers': json.loads(self.hv3_answers) if self.hv3_answers else []
                }
            },
            'schriftlicher_ausdruck': {
                'task_a': self.sa_task_a,
                'task_b': self.sa_task_b
            },
            
            # New format (for new admin editor)
            'lv1_titles': json.loads(self.lv1_titles) if self.lv1_titles else [],
            'lv1_texts': json.loads(self.lv1_texts) if self.lv1_texts else [],
            'lv1_answers': json.loads(self.lv1_answers) if self.lv1_answers else [],
            'lv2_texts': json.loads(self.lv2_texts) if self.lv2_texts else [],
            'lv2_questions': json.loads(self.lv2_questions) if self.lv2_questions else [],
            'lv3_situations': json.loads(self.lv3_situations) if self.lv3_situations else [],
            'lv3_ads': json.loads(self.lv3_ads) if self.lv3_ads else [],
            'sb1_text': self.sb1_text,
            'sb1_words': json.loads(self.sb1_options) if self.sb1_options else [],
            'sb1_answers': json.loads(self.sb1_answers) if self.sb1_answers else [],
            'sb2_text': self.sb2_text,
            'sb2_options': json.loads(self.sb2_words) if self.sb2_words else [],
            'sb2_answers': json.loads(self.sb2_answers) if self.sb2_answers else []
        }

class ExamResult(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    exam_id = db.Column(db.Integer, db.ForeignKey('exam.id'), nullable=False)
    student_name = db.Column(db.String(100))
    answers = db.Column(db.Text)  # JSON string of student answers
    score = db.Column(db.Float)   # Total score
    completed_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    exam = db.relationship('Exam', backref=db.backref('results', lazy=True))
    
    def to_dict(self):
        return {
            'id': self.id,
            'exam_id': self.exam_id,
            'student_name': self.student_name,
            'answers': json.loads(self.answers) if self.answers else {},
            'score': self.score,
            'completed_at': self.completed_at.isoformat()
        }

