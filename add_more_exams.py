#!/usr/bin/env python3
import os
import sys
import json

# Add the project root to Python path
sys.path.insert(0, os.path.dirname(__file__))

from src.main import app
from src.models.exam import db, Exam

def add_exam_3():
    """Add third sample exam"""
    with app.app_context():
        data = {
            "title": "TELC B2 Modelltest - Gesundheit & Lifestyle",
            "leseverstehen_teil1": {
                "titles": [
                    "Gesunde Ernährung",
                    "Fitness und Sport", 
                    "Work-Life-Balance",
                    "Meditation und Entspannung",
                    "Vegane Lebensweise",
                    "Schlafqualität",
                    "Stressmanagement",
                    "Wellness-Trends",
                    "Mentale Gesundheit",
                    "Naturheilkunde"
                ],
                "texts": [
                    "Regelmäßiger Sport stärkt nicht nur den Körper, sondern auch das Immunsystem und die mentale Gesundheit.",
                    "Eine ausgewogene Work-Life-Balance ist entscheidend für Zufriedenheit und Produktivität im Beruf.",
                    "Meditation hilft dabei, Stress abzubauen und die Konzentrationsfähigkeit zu verbessern.",
                    "Vegane Ernährung kann bei richtiger Planung alle notwendigen Nährstoffe liefern.",
                    "Ausreichender und erholsamer Schlaf ist fundamental für körperliche und geistige Regeneration."
                ],
                "answers": ["b", "c", "d", "e", "f"]
            }
        }
        
        exam = Exam(
            title=data['title'],
            lv1_titles=json.dumps(data['leseverstehen_teil1']['titles']),
            lv1_texts=json.dumps(data['leseverstehen_teil1']['texts']),
            lv1_answers=json.dumps(data['leseverstehen_teil1']['answers']),
            lv2_texts=json.dumps(["Beispieltext Leseverstehen Teil 2"]),
            lv2_questions=json.dumps([{"question": "Beispielfrage", "options": ["a", "b", "c"], "correct": 0}]),
            lv2_answers=json.dumps([0]),
            lv3_situations=json.dumps(["Beispielsituation"]),
            lv3_ads=json.dumps(["Beispielanzeige"]),
            lv3_answers=json.dumps(["a"]),
            sb1_text="Beispieltext Sprachbausteine Teil 1",
            sb1_options=json.dumps([{"a": "Option A", "b": "Option B", "c": "Option C"}]),
            sb1_answers=json.dumps(["a"]),
            sb2_text="Beispieltext Sprachbausteine Teil 2",
            sb2_words=json.dumps(["Wort1", "Wort2", "Wort3"]),
            sb2_answers=json.dumps(["a"]),
            hv1_audio_url="",
            hv1_statements=json.dumps(["Statement 1"]),
            hv1_answers=json.dumps([True]),
            hv2_audio_url="",
            hv2_statements=json.dumps(["Statement 2"]),
            hv2_answers=json.dumps([False]),
            hv3_audio_url="",
            hv3_statements=json.dumps(["Statement 3"]),
            hv3_answers=json.dumps([True]),
            sa_task_a="Schreiben Sie über gesunde Lebensweise.",
            sa_task_b="Verfassen Sie einen Brief zum Thema Sport."
        )
        
        db.session.add(exam)
        db.session.commit()
        print(f"Successfully added exam: {exam.title} (ID: {exam.id})")

def add_exam_4():
    """Add fourth sample exam"""
    with app.app_context():
        data = {
            "title": "TELC B2 Praxis - Technologie & Zukunft", 
            "leseverstehen_teil1": {
                "titles": [
                    "Künstliche Intelligenz",
                    "Elektromobilität",
                    "Smart Home Technologie",
                    "Kryptowährungen",
                    "Virtual Reality",
                    "Robotik im Alltag",
                    "5G-Technologie",
                    "Nachhaltigkeit durch Tech",
                    "Digitale Transformation",
                    "Internet der Dinge"
                ],
                "texts": [
                    "Elektroautos werden immer beliebter und die Ladeinfrastruktur wird kontinuierlich ausgebaut.",
                    "Smart Home Systeme ermöglichen es, das Zuhause intelligent und energieeffizient zu steuern.",
                    "Virtual Reality Technologie findet Anwendung in Bildung, Medizin und Unterhaltung.",
                    "5G-Netzwerke ermöglichen ultraschnelle Datenübertragung und neue Anwendungsmöglichkeiten.",
                    "Das Internet der Dinge vernetzt Geräte und sammelt wertvolle Daten für Optimierungen."
                ],
                "answers": ["b", "c", "e", "g", "j"]
            }
        }
        
        exam = Exam(
            title=data['title'],
            lv1_titles=json.dumps(data['leseverstehen_teil1']['titles']),
            lv1_texts=json.dumps(data['leseverstehen_teil1']['texts']),
            lv1_answers=json.dumps(data['leseverstehen_teil1']['answers']),
            lv2_texts=json.dumps(["Technologie verändert unsere Arbeitswelt grundlegend."]),
            lv2_questions=json.dumps([{"question": "Was ist der Hauptpunkt?", "options": ["Wandel", "Stabilität", "Tradition"], "correct": 0}]),
            lv2_answers=json.dumps([0]),
            lv3_situations=json.dumps(["Sie suchen einen IT-Kurs"]),
            lv3_ads=json.dumps(["Programmierkurs für Einsteiger"]),
            lv3_answers=json.dumps(["a"]),
            sb1_text="Die Digitalisierung (21) _____ viele Bereiche.",
            sb1_options=json.dumps([{"a": "betrifft", "b": "betroffen", "c": "betreffend"}]),
            sb1_answers=json.dumps(["a"]),
            sb2_text="Neue (31) _____ entstehen täglich.",
            sb2_words=json.dumps(["Technologien", "Methoden", "Verfahren"]),
            sb2_answers=json.dumps(["a"]),
            hv1_audio_url="",
            hv1_statements=json.dumps(["Technologie hilft im Alltag"]),
            hv1_answers=json.dumps([True]),
            hv2_audio_url="",
            hv2_statements=json.dumps(["KI ersetzt alle Jobs"]),
            hv2_answers=json.dumps([False]),
            hv3_audio_url="",
            hv3_statements=json.dumps(["5G ist sehr schnell"]),
            hv3_answers=json.dumps([True]),
            sa_task_a="Beschreiben Sie die Vorteile von Technologie.",
            sa_task_b="Schreiben Sie über digitale Bildung."
        )
        
        db.session.add(exam)
        db.session.commit()
        print(f"Successfully added exam: {exam.title} (ID: {exam.id})")

if __name__ == '__main__':
    add_exam_3()
    add_exam_4()
