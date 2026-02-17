# 🚀 TestForge: The Autonomous QA Agent

TestForge is an AI-powered automation infrastructure that doesn't just run tests—it **creates** them, **run** them, **heals** them, and **maintains** them.
1. The "TestForge" Workflow Summary
Imagine TestForge as a construction crew managed by an AI.

Step 1: The Command (The Manager)
Who: tf-cli.ts
Action: You type testforge start "login with standard user" --url "https://www.saucedemo.com"
Role: This acts as the project manager. It takes your order, starts a "loading spinner" so you know work is happening, and immediately delegates the heavy thinking to the Python Brain.

Step 2: The Architect (The Brain)
Who: agent_core.py
Action: The Python script wakes up and does three specific things:
The Router: It looks at your pages/ folder. It decides: "Do we already have a file for this (e.g., LoginPage.ts), or do I need to create a new one?"
The Builder: It writes the TypeScript code for the Page Object. It smartly checks if code already exists so it doesn't delete your previous work; it just "injects" new methods.
The Writer: It writes the actual Test Case (the .spec.ts file) and imports the Page Object it just built.
Key Tech: It uses Google's Gemini Flash model to generate this code based on text prompts.

Step 3: The Execution (The Runner)
Who: Playwright (triggered by tf-cli.ts)
Action: Once Python finishes writing the files, the CLI automatically runs npx playwright test.
Role: It launches the browser, follows the instructions the AI just wrote, and verifies if the test passes or fails.

Step 4: The Report
Who: Allure
Action: Finally, it generates a fancy HTML report showing graphs and pass/fail status.

## 🧠 Core Capabilities

### 1. 🗣️ Natural Language to Code
**Command:** `testforge start "add bike light in cart" --url "https://www.saucedemo.com"`
* **Result:** Generates a production-grade Playwright test file (`add_bike_light_in_cart.spec.ts`) implementing best practices automatically.

### 2. 💉 Surgical Page Object Updates
* Parses your existing Page Object Models (`.ts` files).
* Detects missing methods (e.g., `logout()`).
* **Injects** the missing logic safely into the class without breaking existing code.

### 3. 🚑 Self-Healing Selectors
* **Problem:** UI changes cause tests to fail (e.g., `#login-btn` becomes `#login-btn-v2`).
* **Solution:** TestForge captures the DOM snapshot at failure, uses Computer Vision/LLM to find the new element, and **rewrites the source code** to fix the selector permanently.

## 🛠️ Architecture
* **Executor:** Playwright (TypeScript)
* **Orchestrator:** Node.js CLI
* **Intelligence Layer:** Python + Google Gemini Flash 2.0
* **Safety:** Local Disk Locks (Prevents overwriting manual work)

## ⚡ How to Run
```bash
# 1. Install Dependencies
npm install && pip install -r requirements.txt

# 2. Run the Agent
testforge start "Login and buy a bag" --url  "https://saucedemo.com" 
