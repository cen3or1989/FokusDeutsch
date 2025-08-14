from datetime import datetime
from src.models.user import db


class TranslationCache(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    resource_type = db.Column(db.String(50), nullable=False)  # e.g., 'exam'
    resource_id = db.Column(db.Integer, nullable=False)
    path = db.Column(db.String(255), nullable=False)  # e.g., 'leseverstehen_teil1.titles[0]'
    source_lang = db.Column(db.String(10), nullable=False, default='de')
    target_lang = db.Column(db.String(10), nullable=False)
    source_hash = db.Column(db.String(64), nullable=False)
    translated_text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint(
            'resource_type', 'resource_id', 'path', 'source_lang', 'target_lang', 'source_hash',
            name='uq_translation_cache_unique_entry'
        ),
    )


class ExamTranslation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    exam_id = db.Column(db.Integer, nullable=False)
    target_lang = db.Column(db.String(10), nullable=False)
    exam_hash = db.Column(db.String(64), nullable=False)
    payload = db.Column(db.Text, nullable=False)  # JSON string of the fully translated exam
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('exam_id', 'target_lang', name='uq_exam_translation_latest'),
    )


