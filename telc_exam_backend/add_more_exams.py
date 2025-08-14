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
        # Check if exam already exists
        existing = Exam.query.filter_by(title="TELC B2 Modelltest - Gesundheit & Lifestyle").first()
        if existing:
            print("Exam 3 already exists, skipping...")
            return
            
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
            lv2_texts=json.dumps(["Die moderne Gesellschaft legt immer mehr Wert auf Gesundheit und Wohlbefinden. Fitnessstudios boomen, gesunde Ernährung ist ein Trend und Wellness-Apps werden millionenfach heruntergeladen."]),
            lv2_questions=json.dumps([
                {"question": "Was boomt in der modernen Gesellschaft?", "options": ["Restaurants", "Fitnessstudios", "Kinos"], "correct": 1},
                {"question": "Was ist ein aktueller Trend?", "options": ["Fast Food", "Gesunde Ernährung", "Fernsehen"], "correct": 1}
            ]),
            lv2_answers=json.dumps([1, 1]),
            lv3_situations=json.dumps([
                "Sie suchen einen Fitness-Trainer",
                "Sie möchten einen Yoga-Kurs besuchen",
                "Sie brauchen einen Ernährungsberater"
            ]),
            lv3_ads=json.dumps([
                "Personal Trainer für individuelles Training",
                "Yoga-Studio mit Anfängerkursen",
                "Ernährungsberatung für gesunde Lebensweise"
            ]),
            lv3_answers=json.dumps(["a", "b", "c"]),
            sb1_text="Gesunde Ernährung (21) _____ immer wichtiger. Viele Menschen (22) _____ auf Bio-Produkte. Sport (23) _____ einen großen Beitrag zur Gesundheit.",
            sb1_options=json.dumps([
                {"a": "wird", "b": "werden", "c": "wurde"},
                {"a": "setzen", "b": "setzt", "c": "gesetzt"},
                {"a": "leisten", "b": "leistet", "c": "geleistet"}
            ]),
            sb1_answers=json.dumps(["a", "a", "b"]),
            sb2_text="Wellness und (31) _____ sind moderne Trends. Viele (32) _____ achten auf ihre Gesundheit. (33) _____ spielt eine wichtige Rolle.",
            sb2_words=json.dumps(["Fitness", "Menschen", "Ernährung", "Sport", "Bewegung"]),
            sb2_answers=json.dumps(["Fitness", "Menschen", "Ernährung"]),
            hv1_audio_url="",
            hv1_statements=json.dumps([
                "Gesunde Ernährung ist teuer",
                "Sport macht glücklich",
                "Meditation ist schwierig"
            ]),
            hv1_answers=json.dumps([False, True, False]),
            hv2_audio_url="",
            hv2_statements=json.dumps([
                "Fitness-Apps sind hilfreich",
                "Yoga entspannt den Körper"
            ]),
            hv2_answers=json.dumps([True, True]),
            hv3_audio_url="",
            hv3_statements=json.dumps([
                "Wellness-Trends ändern sich schnell"
            ]),
            hv3_answers=json.dumps([True]),
            sa_task_a="Schreiben Sie über die Bedeutung von Sport in Ihrem Leben. Erwähnen Sie: welchen Sport Sie treiben, wie oft Sie trainieren, welche Vorteile Sport hat.",
            sa_task_b="Sie haben schlechte Erfahrungen in einem Fitnessstudio gemacht. Schreiben Sie eine Beschwerde. Erwähnen Sie: was das Problem war, wie Sie sich gefühlt haben, was Sie erwarten."
        )
        
        db.session.add(exam)
        db.session.commit()
        print(f"Successfully added exam: {exam.title} (ID: {exam.id})")

def add_exam_4():
    """Add fourth sample exam"""
    with app.app_context():
        # Check if exam already exists
        existing = Exam.query.filter_by(title="TELC B2 Praxis - Technologie & Zukunft").first()
        if existing:
            print("Exam 4 already exists, skipping...")
            return
            
        exam = Exam(
            title="TELC B2 Praxis - Technologie & Zukunft",
            lv1_titles=json.dumps([
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
            ]),
            lv1_texts=json.dumps([
                "Elektroautos werden immer beliebter und die Ladeinfrastruktur wird kontinuierlich ausgebaut.",
                "Smart Home Systeme ermöglichen es, das Zuhause intelligent und energieeffizient zu steuern.",
                "Virtual Reality Technologie findet Anwendung in Bildung, Medizin und Unterhaltung.",
                "5G-Netzwerke ermöglichen ultraschnelle Datenübertragung und neue Anwendungsmöglichkeiten.",
                "Das Internet der Dinge vernetzt Geräte und sammelt wertvolle Daten für Optimierungen."
            ]),
            lv1_answers=json.dumps(["b", "c", "e", "g", "j"]),
            lv2_texts=json.dumps([
                "Die Digitalisierung verändert unsere Gesellschaft fundamental. Künstliche Intelligenz übernimmt immer mehr Aufgaben, während Menschen sich auf kreative und soziale Tätigkeiten konzentrieren können. Gleichzeitig entstehen neue Herausforderungen im Bereich Datenschutz und Ethik."
            ]),
            lv2_questions=json.dumps([
                {"question": "Was verändert unsere Gesellschaft?", "options": ["Politik", "Digitalisierung", "Wirtschaft"], "correct": 1},
                {"question": "Worauf können sich Menschen konzentrieren?", "options": ["Technik", "Kreative Tätigkeiten", "Maschinen"], "correct": 1}
            ]),
            lv2_answers=json.dumps([1, 1]),
            lv3_situations=json.dumps([
                "Sie suchen einen Computerkurs",
                "Sie möchten ein Smartphone kaufen",
                "Sie brauchen Internet für zu Hause"
            ]),
            lv3_ads=json.dumps([
                "PC-Kurse für alle Altersgruppen",
                "Neueste Smartphones zu günstigen Preisen",
                "Schnelles Internet ohne Vertragsbindung"
            ]),
            lv3_answers=json.dumps(["a", "b", "c"]),
            sb1_text="Die Technologie (21) _____ unser Leben. Smartphones (22) _____ heute überall genutzt. KI (23) _____ viele Prozesse automatisieren.",
            sb1_options=json.dumps([
                {"a": "verändert", "b": "verändern", "c": "veränderte"},
                {"a": "wird", "b": "werden", "c": "wurden"},
                {"a": "kann", "b": "könnte", "c": "konnte"}
            ]),
            sb1_answers=json.dumps(["a", "b", "a"]),
            sb2_text="Die (31) _____ bringt viele Vorteile. (32) _____ werden einfacher und (33) _____ steigt.",
            sb2_words=json.dumps(["Digitalisierung", "Prozesse", "Effizienz", "Technik", "Innovation"]),
            sb2_answers=json.dumps(["Digitalisierung", "Prozesse", "Effizienz"]),
            hv1_audio_url="",
            hv1_statements=json.dumps([
                "KI wird alle Jobs ersetzen",
                "Technologie hilft im Alltag",
                "Datenschutz ist unwichtig"
            ]),
            hv1_answers=json.dumps([False, True, False]),
            hv2_audio_url="",
            hv2_statements=json.dumps([
                "5G ist sehr schnell",
                "Smart Homes sparen Energie"
            ]),
            hv2_answers=json.dumps([True, True]),
            hv3_audio_url="",
            hv3_statements=json.dumps([
                "Technologie entwickelt sich langsam"
            ]),
            hv3_answers=json.dumps([False]),
            sa_task_a="Beschreiben Sie, wie Technologie Ihr Leben verändert hat. Erwähnen Sie: welche Geräte Sie nutzen, was einfacher geworden ist, welche Nachteile es gibt.",
            sa_task_b="Sie haben ein defektes Smartphone gekauft. Schreiben Sie eine Reklamation. Erwähnen Sie: wann und wo Sie es gekauft haben, was das Problem ist, was Sie möchten (Reparatur/Austausch/Geld zurück)."
        )
        
        db.session.add(exam)
        db.session.commit()
        print(f"Successfully added exam: {exam.title} (ID: {exam.id})")

if __name__ == '__main__':
    add_exam_3()
    add_exam_4()
