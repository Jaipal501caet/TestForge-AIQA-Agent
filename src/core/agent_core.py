import os
import sys
import argparse
import json
import re
import time
import threading
from google import genai
from dotenv import load_dotenv
from google.api_core import client_options

# 🛠️ WINDOWS FIX: Force UTF-8 standard output to prevent encoding crashes
sys.stdout.reconfigure(encoding='utf-8')

load_dotenv()
TESTS_UI_DIR = "tests/ui"
PAGES_DIR = "pages"
SCOUT_REPORT = "output/vision_intel/scout_report.json"

# Ensure directories exist
os.makedirs(TESTS_UI_DIR, exist_ok=True)
os.makedirs(PAGES_DIR, exist_ok=True)

def get_ai_client():
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key: return None
    
    # 🛠️ WINDOWS FIX: Force HTTP (REST) instead of gRPC
    # This prevents the "Hang" on MinGW/Git Bash
    return genai.Client(api_key=api_key)

def load_scout_intel():
    if os.path.exists(SCOUT_REPORT):
        try:
            with open(SCOUT_REPORT, "r", encoding="utf-8") as f:
                return f.read()
        except: pass
    return None

def parse_llm_response(response_text):
    if "```" in response_text:
        match = re.search(r"```(?:json)?(.*?)```", response_text, re.DOTALL)
        if match: response_text = match.group(1)
    response_text = response_text.strip()
    try:
        return json.loads(response_text)
    except json.JSONDecodeError as e:
        if "Extra data" in str(e): return json.loads(response_text[:e.pos])
        raise e

def save_file(filepath, content):
    # Ensure directory exists before saving (critical for relative paths)
    os.makedirs(os.path.dirname(os.path.abspath(filepath)), exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

# 🛠️ ROBUST READER: Handles Windows paths, quotes, and encodings safely
def robust_read_file(file_path):
    # 1. Strip extra quotes that CLI might have passed
    clean_path = file_path.strip().strip('"').strip("'")
    
    # 2. Normalize slashes (Windows \ -> / or vice versa based on OS)
    clean_path = os.path.normpath(clean_path)
    
    if not os.path.exists(clean_path):
        print(f"❌ [DEBUG] File Not Found. Raw: '{file_path}' | Cleaned: '{clean_path}'")
        raise FileNotFoundError(f"File not found: {clean_path}")
        
    try:
        with open(clean_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"❌ [DEBUG] Read Error. Path: '{clean_path}' | Error: {e}")
        raise e

def resolve_import_path(base_file_path, import_path):
    """
    Resolves a TS import path (e.g., '../../pages/LoginPage') to a real file system path.
    """
    # Remove the file name from the base path to get the directory
    base_dir = os.path.dirname(os.path.abspath(base_file_path))
    
    # Join and resolve
    resolved_path = os.path.normpath(os.path.join(base_dir, import_path))
    
    # Append .ts if missing
    if not resolved_path.endswith('.ts'):
        resolved_path += '.ts'
        
    return resolved_path

# --- ANIMATION LOGIC (For Demo "Pop") ---
stop_thinking = False

def simulate_thinking():
    """Prints 'thinking' steps to the console while waiting for the API."""
    steps = [
        "Analyzing DOM Structure...",
        "Identifying Interactive Elements...",
        "Mapping User Goal to Actions...",
        "Drafting Page Object Class...",
        "Writing Playwright Test Spec...",
        "Validating TypeScript Imports...",
        "Finalizing Code Structure..."
    ]
    i = 0
    while not stop_thinking:
        if i < len(steps):
            print(f"   > [AI] {steps[i]}")
            i += 1
        time.sleep(1.5) # Print a new step every 1.5 seconds


# --- MODE 1: GENERATE (The Architect) ---
def mode_generate(goal, url, test_type="ui"):
    global stop_thinking
    client = get_ai_client()
    if not client: 
        print("❌ [BRAIN] Error: AI Client not initialized.")
        return

    intel_json = load_scout_intel()
    
    # Calculate base paths
    base_name = goal.replace(' ', '_').lower()
    
    # --- DECISION: API or UI? ---
    # We check if the user explicitly passed --type api OR if the URL looks like an API endpoint
    is_api = test_type == "api" or "api/" in url
    
    if is_api:
        print(f"🧠 [BRAIN] Detected API Goal: '{goal}'")
        output_dir = "tests/api"
        file_name = f"{base_name}_api.spec.ts"
        
        prompt = f"""
        You are a Playwright Expert.
        **TASK:** Write a Playwright **API Test** (TypeScript) for the following endpoint:
        **URL:** "{url}"
        **GOAL:** "{goal}"
        
        **RULES:**
        1. Use Playwright's built-in `request` fixture (async ({{ request }}) => ...).
        2. Do NOT use Page Objects. API tests should be self-contained.
        3. Include assertions for Status Code (200, 201, etc.) and Body content.
        4. The test title must be exactly "{goal}".

        **OUTPUT FORMAT (JSON ONLY):**
        {{
            "test_code": "FULL_TYPESCRIPT_CODE"
        }}
        """
        # API doesn't use Page Objects, so we set these to None
        existing_page_object = None
        page_path = None
        
    else:
        # --- UI MODE ---
        print(f"🧠 [BRAIN] Detected UI Goal: '{goal}'")
        output_dir = TESTS_UI_DIR
        file_name = f"{base_name}_ui.spec.ts"
        
        page_filename = f"{base_name}_page.ts"
        page_path = os.path.join(PAGES_DIR, page_filename)
        # PRO ARCHITECTURE: Relative path from tests/ui/ to pages/
        page_import_path = f"../../pages/{base_name}_page"

        # 🔍 SMART CHECK: Does the Page Object already exist?
        existing_page_object = None
        if os.path.exists(page_path):
            try:
                with open(page_path, "r", encoding="utf-8") as f:
                    existing_page_object = f.read()
                print(f"♻️  [ARCHITECT] Found existing Page Object: {page_filename}")
                print(f"    (I will reuse it and ONLY generate the test case)")
            except: pass

        # --- PROMPT LOGIC FOR UI ---
        if existing_page_object:
            # SCENARIO A: Reuse Existing Page Object
            prompt = f"""
            You are a Senior SDET Architect.
            **USER GOAL:** "{goal}"
            
            **EXISTING PAGE OBJECT:**
            {existing_page_object}

            **TASK:** Write a Playwright Test (TypeScript) that uses the **EXISTING** Page Object above.
            - Do NOT create a new Page Object.
            - Import the class correctly using: import {{ [ClassName] }} from '{page_import_path}';
            - The test title must be exactly "{goal}".

            **OUTPUT FORMAT (JSON ONLY):**
            {{
                "test_code": "Full TS code for the Playwright test file"
            }}
            """
        else:
            # SCENARIO B: Create Everything New
            prompt = f"""
            You are a Senior SDET Architect.
            **USER GOAL:** "{goal}"
            **URL:** "{url}"
            **CONTEXT:** {intel_json if intel_json else "NO VISION DATA AVAILABLE."}

            **TASK:** Generate a MODULAR Playwright suite in TypeScript.
            
            1. **Page Object**: Create a class for this page. 
               - Filename: {page_filename}
            
            2. **UI Test**: Create a test that uses the Page Object.
               - Filename: {file_name}
               - MUST IMPORT Page Object using: import {{ {base_name.capitalize()}Page }} from '{page_import_path}';
               - **CRITICAL RULE:** The test title inside test('...', ...) MUST be exactly "{goal}".

            **OUTPUT FORMAT (JSON ONLY):**
            {{
                "page_object": "Full TS code for the Page Object class",
                "test_code": "Full TS code for the Playwright test file"
            }}
            """
    
    print(f"⏳ [ARCHITECT] Designing Test Logic...")

    # START ANIMATION
    stop_thinking = False
    think_thread = threading.Thread(target=simulate_thinking)
    think_thread.start()

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash", 
            contents=prompt,
            config={'response_mime_type': 'application/json'}
        )
        
        # STOP ANIMATION
        stop_thinking = True
        think_thread.join()

        print(f"⚡ [ARCHITECT] Blueprint Received. Parsing JSON...")
        
        data = parse_llm_response(response.text)
        
        # 1. Save Page Object (Only if UI mode AND we generated a new one)
        if not is_api and "page_object" in data and not existing_page_object:
            save_file(page_path, data["page_object"])
            print(f"   📄 Generated: pages/{page_filename}")
        elif not is_api and existing_page_object:
            print(f"   ⏭️  Skipped: pages/{page_filename} (Preserved existing file)")

        # 2. Save Test File (Always)
        # Note: We normalized the JSON key to "test_code" in prompts above, 
        # but kept fallback to "ui_test" just in case LLM hallucinates old key.
        test_code = data.get("test_code") or data.get("ui_test")
        
        if test_code:
            # Ensure output directory exists (tests/ui or tests/api)
            os.makedirs(output_dir, exist_ok=True)
            save_file(os.path.join(output_dir, file_name), test_code)
            print(f"   📄 Generated: {output_dir}/{file_name}")
        
        print(f"✅ [ARCHITECT] Architecture Complete.")
        
    except Exception as e:
        stop_thinking = True
        print(f"❌ [BRAIN ERROR] Generation failed: {e}")


# --- MODE 2: HEAL (The Doctor) ---
def mode_heal(file_path, error_log):
    client = get_ai_client()
    if not client: return

    # Use the robust reader to prevent Windows path crashes
    try:
        test_content = robust_read_file(file_path)
        print(f"🩹 [BRAIN] Diagnosing failure in: {os.path.basename(file_path)}")
    except Exception as e:
        print(f"❌ [BRAIN] Critical Error reading test file. Aborting.")
        sys.exit(1)

    # 2. DETECT PAGE OBJECTS: Look for imports
    import_match = re.search(r"import.*from\s+['\"](.*)['\"];", test_content)
    
    page_object_context = ""
    page_object_path = None

    if import_match:
        raw_import_path = import_match.group(1)
        if raw_import_path.startswith('.'):
            # Resolve the relative import path against the CLEANED file path
            clean_base_path = os.path.normpath(file_path.strip().strip('"').strip("'"))
            page_object_path = resolve_import_path(clean_base_path, raw_import_path)
            
            if os.path.exists(page_object_path):
                print(f"   [CONTEXT] Found Page Object: {os.path.basename(page_object_path)}")
                try:
                    page_object_content = robust_read_file(page_object_path)
                    page_object_context = f"\n\n=== RELATED PAGE OBJECT ({os.path.basename(page_object_path)}) ===\n{page_object_content}"
                except:
                    print(f"⚠️ [BRAIN] Warning: Could not read Page Object at {page_object_path}")

    # 3. Construct the Multi-File Prompt
    prompt = f"""
    You are a Playwright Expert (TypeScript).
    
    **THE SCENARIO:**
    A test failed. You must fix the code.
    
    **ERROR LOG:**
    {error_log}
    
    **FILE 1: THE TEST FILE**
    {test_content}
    {page_object_context}
    
    **TASK:**
    Analyze the error and fix the broken code.
    
    **OUTPUT FORMAT (JSON ONLY):**
    {{
        "target_file": "PATH_TO_FILE_YOU_FIXED",
        "fixed_code": "FULL_TYPESCRIPT_CODE",
        "explanation": "A specific, 1-sentence summary of the fix. EXPLICITLY mention the old locator vs the new locator. (Example: 'Updated Checkout Button selector from #old-id to [data-test=new-id]')"
    }}
    """

    try:
        # 🚀 UPGRADED MODEL: gemini-2.5-flash
        response = client.models.generate_content(
            model="gemini-2.5-flash", 
            contents=prompt,
            config={'response_mime_type': 'application/json'}
        )
        
        data = parse_llm_response(response.text)
        
        target_file = data.get("target_file")
        fixed_code = data.get("fixed_code")
        explanation = data.get("explanation", "Applied automated fix based on error logs.")
        
        # Fallback: If AI didn't specify a path, default to the original file
        if not target_file or target_file == "None" or target_file == "PATH_TO_FILE_YOU_FIXED":
            target_file = file_path

        # Normalize the target path before saving
        target_file = os.path.normpath(target_file.strip().strip('"').strip("'"))

        save_file(target_file, fixed_code)
        
        # ✨ NEW LOGGING: Shows exactly what changed
        print(f"✅ [DOCTOR] Applied fix to: {os.path.basename(target_file)}")
        print(f"   📝 [FIX REPORT] {explanation}")
        
    except Exception as e:
        print(f"❌ [BRAIN ERROR] Healing failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=["generate", "heal"], required=True)
    parser.add_argument("--url")
    parser.add_argument("--goal")
    parser.add_argument("--type", default="ui") # New Argument
    parser.add_argument("--file")
    parser.add_argument("--error")
    
    args = parser.parse_args()

    if args.mode == "generate":
        # Check if test exists before generating
        suffix = "api" if args.type == "api" else "ui"
        test_file = f"{args.goal.replace(' ', '_').lower()}_{suffix}.spec.ts"
        test_dir = "tests/api" if args.type == "api" else TESTS_UI_DIR
        
        if os.path.exists(os.path.join(test_dir, test_file)):
            print(f"♻️  [SKIP] Test already exists for: {args.goal}")
        else:
            mode_generate(args.goal, args.url, args.type)
            
    elif args.mode == "heal":
        mode_heal(args.file, args.error)