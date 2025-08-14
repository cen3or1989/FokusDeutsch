#!/usr/bin/env python3
import os
import sys
import json

# Add the project root to Python path
sys.path.insert(0, os.path.dirname(__file__))

from src.main import app
from src.models.exam import db, Exam

def add_second_exam():
    """Add a second sample exam to database"""
    with app.app_context():
        # Create second exam data
        data = {
            "title": "آزمون تمرینی شماره ۲",
            "leseverstehen_teil1": {
                "titles": [
                    "Künstliche Intelligenz",
                    "Nachhaltiger Tourismus", 
                    "Moderne Medizin",
                    "Online Shopping",
                    "Soziale Medien",
                    "Elektromobilität",
                    "Fernstudium",
                    "Gesunde Lebensweise",
                    "Stadtentwicklung",
                    "Internationale Küche"
                ],
                "texts": [
                    "KI-Systeme werden in vielen Bereichen eingesetzt und verändern unsere Arbeitswelt.",
                    "Nachhaltiges Reisen wird immer wichtiger für umweltbewusste Touristen.",
                    "Telemedicine ermöglicht medizinische Beratung von zu Hause aus.",
                    "E-Commerce hat den traditionellen Einzelhandel stark beeinflusst.",
                    "Elektroautos werden durch staatliche Förderung immer beliebter."
                ],
                "answers": ["a", "b", "c", "d", "f"]
            },
            "leseverstehen_teil2": {
                "texts": [
                    "Die Zukunft der Mobilität liegt in nachhaltigen Verkehrsmitteln. Elektroautos, öffentliche Verkehrsmittel und Fahrräder gewinnen an Bedeutung. Städte investieren in bessere Infrastruktur für umweltfreundliche Fortbewegung.",
                    "Bildung im digitalen Zeitalter erfordert neue Ansätze. Online-Lernen, interaktive Medien und personalisierte Lernpfade werden immer wichtiger für effektives Lernen."
                ],
                "questions": [
                    {"question": "Was ist das Hauptthema des ersten Textes?", "options": ["Umwelt", "Mobilität", "Technologie"], "correct": 1},
                    {"question": "Welche Verkehrsmittel werden erwähnt?", "options": ["Auto, Bus, Bahn", "E-Auto, ÖPNV, Fahrrad", "Flugzeug, Schiff"], "correct": 1}
                ],
                "answers": [1, 1]
            },
            "leseverstehen_teil3": {
                "situations": [
                    "Sie suchen einen Deutschkurs",
                    "Sie möchten ein Zimmer mieten",
                    "Sie brauchen einen Arzttermin",
                    "Sie wollen Sport treiben",
                    "Sie suchen einen Job"
                ],
                "ads": [
                    "Deutschkurse für alle Niveaus - Jetzt anmelden!",
                    "Möbliertes Zimmer in WG zu vermieten",
                    "Hausarztpraxis - Termine online buchbar",
                    "Fitnessstudio mit modernen Geräten",
                    "Stellenangebote in der IT-Branche"
                ],
                "answers": ["a", "b", "c", "d", "e"]
            }
        }
        
        # Check if exam already exists
        existing_exam = Exam.query.filter_by(title=data['title']).first()
        if existing_exam:
            print(f"Exam '{data['title']}' already exists. Skipping...")
            return
        
        # Create new exam
        exam = Exam(
            title=data.get('title', 'آزمون نمونه ۲'),
            lv1_titles=json.dumps(data.get('leseverstehen_teil1', {}).get('titles', [])),
            lv1_texts=json.dumps(data.get('leseverstehen_teil1', {}).get('texts', [])),
            lv1_answers=json.dumps(data.get('leseverstehen_teil1', {}).get('answers', [])),
            
            lv2_texts=json.dumps(data.get('leseverstehen_teil2', {}).get('texts', [])),
            lv2_questions=json.dumps(data.get('leseverstehen_teil2', {}).get('questions', [])),
            lv2_answers=json.dumps(data.get('leseverstehen_teil2', {}).get('answers', [])),
            
            lv3_situations=json.dumps(data.get('leseverstehen_teil3', {}).get('situations', [])),
            lv3_ads=json.dumps(data.get('leseverstehen_teil3', {}).get('ads', [])),
            lv3_answers=json.dumps(data.get('leseverstehen_teil3', {}).get('answers', [])),
            
            sb1_text="Dies ist ein Beispieltext mit ___1___ für Sprachbausteine Teil 1.",
            sb1_options=json.dumps([{"a": "Lücken", "b": "Wörter", "c": "Sätze"}]),
            sb1_answers=json.dumps(["a"]),
            
            sb2_text="Dies ist ein Beispieltext mit ___1___ für Sprachbausteine Teil 2.",
            sb2_words=json.dumps(["Lücken", "Wörter", "Sätze", "Texte", "Aufgaben"]),
            sb2_answers=json.dumps(["Lücken"]),
            
            hv1_audio_url="",
            hv1_statements=json.dumps(["Statement 1", "Statement 2", "Statement 3"]),
            hv1_answers=json.dumps([True, False, True]),
            
            hv2_audio_url="",
            hv2_statements=json.dumps(["Statement 4", "Statement 5"]),
            hv2_answers=json.dumps([True, False]),
            
            hv3_audio_url="",
            hv3_statements=json.dumps(["Statement 6"]),
            hv3_answers=json.dumps([True]),
            
            sa_task_a="Schreiben Sie einen Brief an einen Freund.",
            sa_task_b="Schreiben Sie einen Aufsatz über Umweltschutz."
        )
        
        db.session.add(exam)
        db.session.commit()
        
        print(f"Successfully added exam: {exam.title} (ID: {exam.id})")

if __name__ == '__main__':
    add_second_exam()

