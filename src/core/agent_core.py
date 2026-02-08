import os
import sys
import argparse
import json
import re
from google import genai
from dotenv import load_dotenv

# 🛠️ WINDOWS FIX: Force UTF-8
sys.stdout.reconfigure(encoding='utf-8')

# --- CONFIGURATION ---
load_dotenv()
TESTS_DIR = "tests"
PAGES_DIR = "pages"
PAGE_OBJECT_FILE = os.path.join(PAGES_DIR, "SauceDemoPage.ts")

# --- THE NATIVE BRAIN (Phase 4: The Healer) ---
def get_ai_client():
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("❌ [ERROR] GOOGLE_API_KEY not found in .env!")
        return None
    return genai.Client(api_key=api_key)

def heal_selector(broken_selector, page_html):
    client = get_ai_client()
    if not client: return None

    # Truncate HTML to avoid token limits
    short_html = page_html[:15000]

    prompt = f"""
    You are a Self-Healing QA Robot.
    
    Problem:
    The test failed because it could not find this selector: "{broken_selector}"
    
    Here is the HTML of the page right now:
    ```html
    {short_html}
    ```
    
    TASK:
    Find the NEW, CORRECT selector for the element that corresponds to "{broken_selector}".
    Look for similar ID, class, or text.
    
    OUTPUT:
    Return ONLY the new selector string. (e.g. "#new-id" or "text=Add to Cart").
    """
    
    try:
        print(f"🚑 [HEALING] Asking AI to fix selector: '{broken_selector}'...")
        response = client.models.generate_content(
            model="gemini-flash-latest", contents=prompt
        )
        return response.text.strip()
    except Exception as e:
        print(f"❌ [BRAIN ERROR] Healing Failed: {e}")
        return None

def apply_fix(file_path, old_selector, new_selector):
    if not os.path.exists(file_path):
        print(f"❌ [ERROR] Target file not found: {file_path}")
        return

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Check if the broken selector is actually in the file
        if old_selector not in content:
            print(f"⚠️ [WARNING] Could not find '{old_selector}' in {file_path}. Manual check required.")
            return

        # Perform the replacement
        new_content = content.replace(old_selector, new_selector)
        
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(new_content)
            
        print(f"✅ [FIX APPLIED] Updated {file_path}:")
        print(f"   🔻 Old: {old_selector}")
        print(f"   mnew New: {new_selector}")
        
    except Exception as e:
        print(f"❌ [ERROR] Could not save file: {e}")

# --- EXISTING ARCHITECT LOGIC ---
def generate_page_method(goal, current_code):
    client = get_ai_client()
    if not client: return None
    prompt = f"You are a Senior QA Architect. Existing Code:\n```typescript\n{current_code}\n```\nUser Goal: '{goal}'.\nReturn ONLY the new method code (async) if missing. If exists, return EXISTING."
    try:
        response = client.models.generate_content(model="gemini-flash-latest", contents=prompt)
        return response.text.strip()
    except: return None

def generate_test_code(goal, url):
    client = get_ai_client()
    if not client: return None
    prompt = f"Write Playwright test for '{goal}' on '{url}'. Import SauceDemoPage. Use POM. Output ONLY code."
    try:
        response = client.models.generate_content(model="gemini-flash-latest", contents=prompt)
        return response.text.strip()
    except: return None

def inject_method_into_page(new_method):
    if not os.path.exists(PAGE_OBJECT_FILE): return
    with open(PAGE_OBJECT_FILE, "r", encoding="utf-8") as f: content = f.read()
    clean_method = new_method.replace("```typescript", "").replace("```", "").strip()
    if "EXISTING" in clean_method: return
    last_brace_index = content.rfind("}")
    new_content = content[:last_brace_index] + "\n\n  " + clean_method + "\n" + content[last_brace_index:]
    with open(PAGE_OBJECT_FILE, "w", encoding="utf-8") as f: f.write(new_content)
    print(f"💉 [SURGERY SUCCESS] Injected new method.")

# --- MAIN LOGIC ---
def smart_architect(goal, target_url, mode="generate", broken_selector=None, html_content=None, target_file=None):
    
    # NEW MODE: HEALING
    if mode == "heal" and broken_selector and html_content:
        # 1. Ask Brain for the new selector
        new_selector = heal_selector(broken_selector, html_content)
        
        if new_selector:
            # 2. Apply the fix to the file (if provided)
            if target_file:
                apply_fix(target_file, broken_selector, new_selector)
            else:
                print(f"✨ [HEALED] Suggested Fix: {new_selector} (Pass --file to apply automatically)")
        return

    # EXISTING MODE: GENERATION
    print(f"🏗️ [ARCHITECT] Analyzing request: '{goal}'")
    
    if os.path.exists(PAGE_OBJECT_FILE):
        with open(PAGE_OBJECT_FILE, "r", encoding="utf-8") as f: current_code = f.read()
        print("🔍 [ANALYSIS] Checking Page Object...")
        new_method = generate_page_method(goal, current_code)
        if new_method and "EXISTING" not in new_method:
            inject_method_into_page(new_method)
    
    safe_filename = goal.replace(" ", "_").lower() + ".spec.ts"
    file_path = os.path.join(TESTS_DIR, safe_filename)
    if os.path.exists(file_path):
        print(f"🛡️ [PROTECTION] Test file exists. Skipping.")
        return

    print(f"📝 [WRITER] Generating test case...")
    test_code = generate_test_code(goal, target_url)
    if test_code:
        clean_code = test_code.replace("```typescript", "").replace("```", "").strip()
        with open(file_path, "w", encoding="utf-8") as f: f.write(clean_code)
        print(f"💾 [SAVED] New test: {safe_filename}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", required=False)
    parser.add_argument("--goal", required=False)
    
    # New Arguments for Healing
    parser.add_argument("--mode", default="generate") 
    parser.add_argument("--selector", required=False)
    parser.add_argument("--html", required=False) 
    parser.add_argument("--file", required=False) # The file to fix

    args = parser.parse_args()

    if args.mode == "heal":
        if os.path.exists(args.html):
            with open(args.html, "r", encoding="utf-8") as f:
                html_content = f.read()
            smart_architect("", "", mode="heal", broken_selector=args.selector, html_content=html_content, target_file=args.file)
    else:
        smart_architect(args.goal, args.url)