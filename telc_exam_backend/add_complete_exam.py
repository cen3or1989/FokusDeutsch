#!/usr/bin/env python3
import os
import sys
import json
from dotenv import load_dotenv

# Add the src directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from models.user import db
from models.exam import Exam
from main import app

load_dotenv()

def add_complete_exam():
    """Add a complete TELC B2 exam with all sections"""
    
    with app.app_context():
        # Check if exam already exists
        existing_exam = Exam.query.filter_by(title='TELC B2 Complete Sample Exam').first()
        if existing_exam:
            print("✅ Complete exam already exists!")
            return
        
        # Create the complete exam
        exam = Exam(
            title='TELC B2 Complete Sample Exam',
            
            # Leseverstehen Teil 1 - Match headlines to texts
            lv1_titles=json.dumps([
                "Neuer Trend: Digitales Lernen",
                "Umweltschutz im Alltag", 
                "Karriere und Familie",
                "Gesunde Ernährung",
                "Reisen in der Zukunft",
                "Technologie am Arbeitsplatz",
                "Sport und Gesundheit",
                "Kunst und Kultur",
                "Nachhaltiges Wohnen",
                "Soziale Medien"
            ]),
            lv1_texts=json.dumps([
                "Immer mehr Menschen nutzen Online-Kurse für ihre Weiterbildung.",
                "Kleine Änderungen im täglichen Leben können große Auswirkungen auf die Umwelt haben.",
                "Die Balance zwischen Beruf und Familie wird immer wichtiger.",
                "Eine ausgewogene Ernährung trägt wesentlich zu unserem Wohlbefinden bei.",
                "Virtual Reality wird das Reisen revolutionieren."
            ]),
            lv1_answers=json.dumps(["A", "B", "C", "D", "E"]),
            
            # Leseverstehen Teil 2 - Detailed comprehension
            lv2_texts=json.dumps([
                "Der moderne Arbeitsplatz hat sich in den letzten Jahren stark verändert. Homeoffice und flexible Arbeitszeiten sind zur Normalität geworden. Diese Entwicklung bringt sowohl Vorteile als auch Herausforderungen mit sich.",
                "Nachhaltigkeit ist ein Thema, das alle Bereiche unseres Lebens betrifft. Von der Ernährung über den Transport bis hin zum Wohnen - überall können wir einen Beitrag zum Umweltschutz leisten."
            ]),
            lv2_questions=json.dumps([
                "Was ist der Hauptvorteil von Homeoffice?",
                "Welche Herausforderungen entstehen durch flexible Arbeitszeiten?",
                "Wie können Unternehmen ihre Mitarbeiter beim Homeoffice unterstützen?",
                "Welche Bereiche des Lebens betrifft Nachhaltigkeit?",
                "Welche konkreten Maßnahmen für Umweltschutz werden genannt?"
            ]),
            lv2_answers=json.dumps(["A", "B", "C", "A", "B"]),
            
            # Leseverstehen Teil 3 - Match situations to ads
            lv3_situations=json.dumps([
                "Sie suchen ein Restaurant für einen besonderen Anlass.",
                "Sie möchten ein neues Hobby beginnen.",
                "Sie planen einen Urlaub mit der Familie.",
                "Sie benötigen Hilfe bei Computerproblemen.",
                "Sie wollen Ihre Deutschkenntnisse verbessern.",
                "Sie suchen eine neue Wohnung.",
                "Sie möchten fit werden.",
                "Sie brauchen einen Babysitter.",
                "Sie planen eine Hochzeit.",
                "Sie suchen einen Arzt."
            ]),
            lv3_ads=json.dumps([
                "Restaurant Bella Vista - Italienische Küche in romantischer Atmosphäre",
                "Computerkurse für Senioren - Jeden Dienstag im Gemeindezentrum",
                "Deutschkurse am Abend - Intensive Vorbereitung auf B2-Prüfung",
                "Fitness-Studio Aktiv - Probetraining kostenlos",
                "Babysitting-Service Maria - Erfahren und zuverlässig",
                "Dr. Schmidt - Hausarzt mit langen Öffnungszeiten",
                "Wohnung zu vermieten - 3 Zimmer, zentral gelegen",
                "Tanzstudio Rhythm - Salsa für Anfänger",
                "Hochzeitsplanung Traumtag - Ihr perfekter Tag",
                "Familienhotel Sonnenschein - Kinderfreundlich am Meer",
                "PC-Hilfe schnell und günstig - Hausbesuche möglich",
                "Yoga-Kurse für Entspannung - Montags und mittwochs"
            ]),
            lv3_answers=json.dumps(["A", "K", "C", "D", "E", "G", "L", "B", "I", "F"]),
            
            # Sprachbausteine Teil 1 - Grammar
            sb1_text="Liebe Studierende, die Universitätsbibliothek wird ab nächster Woche ihre Öffnungszeiten _____ (21). Montag bis Freitag ist sie von 8:00 bis 22:00 Uhr geöffnet, _____ (22) Wochenende von 10:00 bis 18:00 Uhr. Diese _____ (23) sollen den Studierenden mehr Flexibilität beim Lernen _____ (24). Zusätzlich werden neue Arbeitsplätze _____ (25) Gruppenarbeit eingerichtet.",
            sb1_options=json.dumps([
                ["erweitern", "verkürzen", "ändern"],
                ["am", "im", "beim"],
                ["Maßnahmen", "Probleme", "Schwierigkeiten"],
                ["ermöglichen", "verhindern", "erschweren"],
                ["für", "gegen", "ohne"]
            ]),
            sb1_answers=json.dumps(["A", "A", "A", "A", "A"]),
            
            # Sprachbausteine Teil 2 - Vocabulary
            sb2_text="Die moderne Gesellschaft steht vor vielen _____ (26). Besonders der Klimawandel _____ (27) uns alle. Jeder kann einen _____ (28) zum Umweltschutz leisten. Durch bewusste _____ (29) können wir die Umwelt _____ (30). Es ist wichtig, dass wir _____ (31) handeln.",
            sb2_words=json.dumps([
                "Herausforderungen", "betrifft", "Beitrag", "Entscheidungen", "schützen", "verantwortlich",
                "Probleme", "interessiert", "Fehler", "Meinungen", "zerstören", "schnell",
                "Lösungen", "hilft", "Versuch"
            ]),
            sb2_answers=json.dumps(["A", "B", "C", "D", "E", "F"]),
            
            # Hörverstehen Teil 1
            hv1_audio_url="https://example.com/audio/hv1.mp3",
            hv1_statements=json.dumps([
                "Die Sprecherin ist mit ihrer neuen Arbeit zufrieden.",
                "Der Arbeitsweg dauert länger als eine Stunde.",
                "Die Kollegen sind sehr hilfsbereit.",
                "Das Büro befindet sich in der Innenstadt.",
                "Die Sprecherin arbeitet in einem großen Unternehmen."
            ]),
            hv1_answers=json.dumps([True, False, True, True, False]),
            
            # Hörverstehen Teil 2
            hv2_audio_url="https://example.com/audio/hv2.mp3",
            hv2_statements=json.dumps([
                "Das Wetter war während des Urlaubs schlecht.",
                "Die Familie hat in einem Hotel gewohnt.",
                "Sie sind mit dem Auto gereist.",
                "Die Kinder waren begeistert vom Strand.",
                "Der Urlaub hat zwei Wochen gedauert.",
                "Sie haben viele Sehenswürdigkeiten besucht.",
                "Das Essen war sehr gut.",
                "Sie werden nächstes Jahr wieder dorthin fahren.",
                "Die Unterkunft war zu teuer.",
                "Sie haben neue Freunde kennengelernt."
            ]),
            hv2_answers=json.dumps([False, True, False, True, True, True, False, True, False, True]),
            
            # Hörverstehen Teil 3
            hv3_audio_url="https://example.com/audio/hv3.mp3",
            hv3_statements=json.dumps([
                "Der Sprecher empfiehlt das Restaurant.",
                "Das Personal war unfreundlich.",
                "Die Preise sind angemessen.",
                "Die Atmosphäre ist gemütlich.",
                "Man sollte unbedingt reservieren."
            ]),
            hv3_answers=json.dumps([True, False, True, True, True]),
            
            # Schriftlicher Ausdruck
            sa_task_a="Sie haben in einer Zeitschrift einen Artikel über umweltfreundliches Reisen gelesen. Schreiben Sie einen Leserbrief an die Redaktion. Gehen Sie dabei auf folgende Punkte ein: - Ihre Meinung zum Artikel - Ihre eigenen Erfahrungen - Konkrete Vorschläge für umweltfreundliches Reisen - Bitten Sie um weitere Informationen",
            sa_task_b="Ihr Freund möchte eine Weltreise machen, hat aber wenig Geld. Schreiben Sie ihm eine E-Mail mit Ratschlägen. Gehen Sie dabei auf folgende Punkte ein: - Günstige Reisemöglichkeiten - Spartipps für unterwegs - Unterkunftsmöglichkeiten - Work and Travel Programme"
        )
        
        db.session.add(exam)
        db.session.commit()
        
        print("🎉 Complete TELC B2 exam added successfully!")
        print(f"📝 Exam ID: {exam.id}")
        print(f"📚 Title: {exam.title}")
        print(f"🗓️ Created: {exam.created_at}")

if __name__ == '__main__':
    add_complete_exam()
