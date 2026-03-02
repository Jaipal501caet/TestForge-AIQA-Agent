🚀 TestForge: The Autonomous QA Agent
TestForge is an AI-powered automation infrastructure that doesn't just run tests—it creates them, runs them, heals them, and maintains them.

1. The "TestForge" Workflow Summary
Imagine TestForge as a construction crew managed entirely by a native Node.js AI pipeline.

CLI says "Go."

Scout scrapes the website data and DOM structure.

Prompt Engine formats the data into strict instructions.

LLM Bridge sends the instructions to Gemini and retrieves the code.

Runner executes the newly written code.

Healer intercepts errors and permanently fixes the code if it breaks.

Step 1: The Command (The Commander)
Who: tf-cli.ts

Action: You type testforge generate "login with standard user" --url "https://www.saucedemo.com"

Role: Acts as the project manager. It parses your command, starts a loading spinner, and orchestrates the entire intelligence pipeline without ever leaving the Node.js ecosystem.

Step 2: The Reconnaissance (The Eyes)
Who: vision_scout.ts

Action: Opens a hidden browser and navigates to the target URL.

Role: Extracts "Vision Intel." It maps every interactable element (IDs, classes, text) and intercepts network API calls. This prevents the LLM from hallucinating fake CSS selectors.

Step 3: The Architect (The Brain)
Who: prompt_engine.ts & llm_bridge.ts

Action: * The Prompt Engine packages your goal and the Vision Intel into strict, markdown-style prompts, enforcing Page Object Models and standard assertions.

The LLM Bridge connects securely to Google's Gemini 2.5 Flash model using the native @google/generative-ai SDK. It enforces strict JSON output, parses the response, and writes the TypeScript files directly to your hard drive.

Step 4: The Execution (The Muscle)
Who: runner.ts (Playwright)

Action: Once the TS files are generated, the CLI automatically spawns a child process to run npx playwright test.

Role: Launches the browser, executes the AI-generated instructions, and captures the standard output for pass/fail verification.

Step 5: The Doctor (The Healer)
Who: healer.ts

Action: If the runner reports a failure (e.g., "selector not found" or "timeout"), the Healer intercepts the error log.

Role: It cross-references the error with the broken .spec.ts file, asks Gemini for the fix via the Bridge, and literally overwrites your broken code on your hard drive to permanently fix the issue.

Step 6: The Report
Who: Allure (via Playwright)

Action: Generates a visually rich HTML report showing execution status, graphs, and attached video recordings of the AI's run.

🧠 Core Capabilities
1. 🗣️ Natural Language to Code
Command: testforge generate "add bike light in cart" --url "https://www.saucedemo.com"

Result: Generates a production-grade Playwright test file (add_bike_light_in_cart.spec.ts) implementing best practices and Page Object Models automatically.

2. 🛡️ Hallucination-Free Generation
By relying on the VisionScout to extract the live DOM, the AI only writes selectors that actually exist on the page, drastically reducing flaky code generation on the first pass.

3. 🚑 Self-Healing Selectors
Problem: UI changes cause tests to fail (e.g., #login-btn becomes #login-btn-v2).

Solution: TestForge catches the exact error, analyzes the broken Playwright file, and uses the LLM Bridge to rewrite the source code, fixing the selector permanently for future runs.

🛠️ Architecture
Executor: Playwright (TypeScript)

Orchestrator: Node.js CLI (commander)

Intelligence Layer: 100% Native TypeScript (@google/generative-ai) + Gemini 2.5 Flash

Safety: Local disk writes with strict JSON schema parsing to prevent arbitrary code execution.
# 1. Install Dependencies (No Python required!)
npm install

# 2. Add your API Key to .env
GEMINI_API_KEY="your_api_key_here"

# 3. Run the Agent
testforge generate "Login and buy a bag" --url "https://saucedemo.com"

$ testforge start
[dotenv@17.2.4] injecting env (1) from .env -- tip: 🛠️  run anywhere with `dotenvx run -- yourcommand`
  _____                _     _____                                      _      ___     _                     _           _                   _
 |_   _|   ___   ___  | |_  |  ___|   ___    _ __    __ _    ___       / \    |_ _|   | |__    _   _        | |   __ _  (_)  _ __     __ _  | |
   | |    / _ \ / __| | __| | |_     / _ \  | '__|  / _` |  / _ \     / _ \    | |    | '_ \  | | | |    _  | |  / _` | | | | '_ \   / _` | | |
   | |   |  __/ \__ \ | |_  |  _|   | (_) | | |    | (_| | |  __/    / ___ \   | |    | |_) | | |_| |   | |_| | | (_| | | | | |_) | | (_| | | |
   |_|    \___| |___/  \__| |_|      \___/  |_|     \__, |  \___|   /_/   \_\ |___|   |_.__/   \__, |    \___/   \__,_| |_| | .__/   \__,_| |_|
                                                    |___/                                      |___/                        |_|
💡 Pro Tip: TestForge automatically records a VIDEO of every test run! Check the Allure Report.

❌ Oops! You missed the target URL.

📘 TestForge Quick Guide:
1️⃣  Create a NEW test if not present or Run same testcase
   $ testforge start "add bike light" --url "https://www.saucedemo.com"

2️⃣  Run API test:
   $ testforge start "login" --url "https://reqres.in/api/login" --type api

3️⃣  Run ALL tests:
   $ testforge start all --url "https://www.saucedemo.com"

3️⃣  Delete a test:
   $ testforge clean "add bike light"

