#!/usr/bin/env python3
import os
import sys
import json

# Add the parent directory to the sys.path to allow importing src.main
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from src.main import app
from src.models.exam import Exam, db

def add_leseverstehen_teil1_test():
    with app.app_context():
        # Check if the exam already exists to prevent duplicates
        existing_exam = Exam.query.filter_by(title='TELC B2 Leseverstehen Teil 1 Test').first()
        if existing_exam:
            print("TELC B2 Leseverstehen Teil 1 Test already exists. Skipping insertion.")
            return

        # Complete Leseverstehen Teil 1 data from the provided image
        lv1_titles = [
            "Immer mehr deutsche Familien reisen mit der Bahn",  # a
            "Buchtipp: Hilfe bei Schlafproblemen",              # b  
            "Der Computer: Liebstes Hobby von Deutschlands Frauen", # c
            "Neu bei der Bahn: Spezielle Informationen und Angebote für Radfahrer", # d
            "Neu am Markt: Billige Schlaftabletten",            # e
            "Familien reisen billiger",                         # f
            "Urlaub mit dem Fahrrad in Deutschland immer beliebter", # g
            "Kultur im Urlaub: Interessen je nach Alter unterschiedlich", # h
            "Umfrage: Wer verwendet den Computer am häufigsten?", # i
            "Deutschland: Immer mehr Touristen reisen in den Westen" # j
        ]
        
        lv1_texts = [
            "Text 1: Die Deutschen fahren gerne in den Urlaub. Besonders Familien mit Kindern nutzen dabei oft öffentliche Verkehrsmittel. Eine neue Studie zeigt: Reisen mit der Eisenbahn wird immer beliebter, weil es umweltfreundlich und kostengünstig ist.",
            
            "Text 2: Viele Menschen in Deutschland haben Probleme beim Einschlafen. Ein neues Buch gibt praktische Tipps für einen besseren Schlaf. Es erklärt einfache Methoden, die jeder zu Hause anwenden kann, ohne teure Medikamente zu kaufen.",
            
            "Text 3: Eine aktuelle Umfrage zeigt überraschende Ergebnisse: Frauen in Deutschland nutzen Computer häufiger als Männer. Sie verwenden sie nicht nur für die Arbeit, sondern auch für Hobbys wie Fotografieren, Musik hören und soziale Kontakte.",
            
            "Text 4: Die Deutsche Bahn hat neue Services entwickelt. Radfahrer können jetzt ihre Fahrräder einfacher im Zug mitnehmen. Es gibt spezielle Informationen über fahrradfreundliche Bahnhöfe und günstige Preise für Fahrradtransport.",
            
            "Text 5: Schlaflosigkeit ist ein weit verbreitetes Problem. Jetzt gibt es neue, preiswerte Medikamente auf dem Markt. Sie kosten weniger als die bekannten Markenprodukte, haben aber die gleiche Wirkung und helfen beim Einschlafen."
        ]
        
        # Correct answers based on the answer sheet in the image
        lv1_answers = ["i", "d", "b", "f", "h"]
        
        # Sample data for other sections (minimal for testing)
        lv2_texts = ["Beispieltext für Leseverstehen Teil 2"]
        lv2_questions = ["Beispielfrage 1", "Beispielfrage 2", "Beispielfrage 3", "Beispielfrage 4", "Beispielfrage 5"]
        
        lv3_situations = [f"Situation {i}" for i in range(1, 11)]
        lv3_ads = [f"Anzeige {chr(97+i)}" for i in range(12)]  # a-l
        
        sb1_text = "Beispieltext mit Lücken für Sprachbausteine Teil 1."
        sb1_options = [["Option1", "Option2", "Option3"] for _ in range(10)]
        
        sb2_text = "Beispieltext für Sprachbausteine Teil 2."
        sb2_words = [f"Wort{i}" for i in range(1, 16)]  # 15 words
        
        # Sample data for Hörverstehen
        hv1_statements = [f"Aussage {i}" for i in range(1, 6)]
        hv2_statements = [f"Aussage {i}" for i in range(1, 11)]
        hv3_statements = [f"Aussage {i}" for i in range(1, 6)]
        
        # Sample writing tasks
        sa_task_a = "Aufgabe A: Schreiben Sie einen Brief über Ihre Meinung zum Thema umweltfreundliches Reisen."
        sa_task_b = "Aufgabe B: Schreiben Sie eine E-Mail an einen Freund über Ihre Urlaubspläne."

        exam_data = {
            'title': 'TELC B2 Leseverstehen Teil 1 Test',
            
            # Leseverstehen Teil 1 - Complete data from image
            'lv1_titles': json.dumps(lv1_titles),
            'lv1_texts': json.dumps(lv1_texts),
            'lv1_answers': json.dumps(lv1_answers),
            
            # Leseverstehen Teil 2 - Basic sample
            'lv2_texts': json.dumps(lv2_texts),
            'lv2_questions': json.dumps(lv2_questions),
            'lv2_answers': json.dumps(["A", "B", "C", "A", "B"]),
            
            # Leseverstehen Teil 3 - Basic sample
            'lv3_situations': json.dumps(lv3_situations),
            'lv3_ads': json.dumps(lv3_ads),
            'lv3_answers': json.dumps(["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"]),
            
            # Sprachbausteine Teil 1 - Basic sample
            'sb1_text': sb1_text,
            'sb1_options': json.dumps(sb1_options),
            'sb1_answers': json.dumps(["A"] * 10),
            
            # Sprachbausteine Teil 2 - Basic sample  
            'sb2_text': sb2_text,
            'sb2_words': json.dumps(sb2_words),
            'sb2_answers': json.dumps(["A"] * 10),
            
            # Hörverstehen - Basic sample
            'hv1_audio_url': 'https://example.com/audio/hv1_test.mp3',
            'hv1_statements': json.dumps(hv1_statements),
            'hv1_answers': json.dumps([True, False, True, False, True]),
            
            'hv2_audio_url': 'https://example.com/audio/hv2_test.mp3', 
            'hv2_statements': json.dumps(hv2_statements),
            'hv2_answers': json.dumps([True, False, True, False, True, False, True, False, True, False]),
            
            'hv3_audio_url': 'https://example.com/audio/hv3_test.mp3',
            'hv3_statements': json.dumps(hv3_statements), 
            'hv3_answers': json.dumps([True, False, True, False, True]),
            
            # Schriftlicher Ausdruck - Basic sample
            'sa_task_a': sa_task_a,
            'sa_task_b': sa_task_b
        }

        new_exam = Exam(**exam_data)
        db.session.add(new_exam)
        db.session.commit()
        print(f"Successfully added TELC B2 Leseverstehen Teil 1 Test with ID: {new_exam.id}")
        print("\nLeseverstehen Teil 1 Details:")
        print("Titles (a-j):")
        for i, title in enumerate(lv1_titles):
            print(f"  {chr(97+i)}: {title}")
        print("\nTexts (1-5):")
        for i, text in enumerate(lv1_texts):
            print(f"  {i+1}: {text[:80]}...")
        print("\nCorrect Answers:")
        for i, answer in enumerate(lv1_answers):
            print(f"  Question {i+1}: {answer}")

if __name__ == '__main__':
    add_leseverstehen_teil1_test()
