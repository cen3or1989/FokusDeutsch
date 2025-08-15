#!/usr/bin/env python3
import os
import sys
import json

# Add the parent directory to the sys.path to allow importing src.main
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from src.main import app
from src.routes.translation import translate_text, translate_via_mymemory

def debug_translation():
    with app.app_context():
        print("=== Translation Debug Test ===")
        
        # Test 1: Direct MyMemory API
        print("\n1. Testing MyMemory API directly:")
        result1 = translate_via_mymemory("Hello", "EN", "FA")
        print(f"MyMemory result: '{result1}'")
        
        # Test 2: Full translate_text function
        print("\n2. Testing full translate_text function:")
        result2 = translate_text("Hello", "EN", "FA")
        print(f"translate_text result: '{result2}'")
        
        # Test 3: German to Persian
        print("\n3. Testing German to Persian:")
        result3 = translate_text("Guten Tag", "DE", "FA")
        print(f"German->Persian result: '{result3}'")
        
        # Test 4: Long text
        print("\n4. Testing longer text:")
        long_text = "Die Deutschen fahren gerne in den Urlaub."
        result4 = translate_text(long_text, "DE", "FA")
        print(f"Long text result: '{result4}'")

if __name__ == '__main__':
    debug_translation()

