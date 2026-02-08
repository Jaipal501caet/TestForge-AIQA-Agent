# 🚀 TestForge: The Autonomous QA Agent

TestForge is an AI-powered automation infrastructure that doesn't just run tests—it **writes** them, **heals** them, and **maintains** them.

## 🧠 Core Capabilities

### 1. 🗣️ Natural Language to Code
**Command:** `testforge start --url "https://amazon.in" "Add iPhone 15 to cart"`
* **Result:** Generates a production-grade Playwright test file (`add_iphone.spec.ts`) implementing best practices automatically.

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
testforge start --url "[https://saucedemo.com](https://saucedemo.com)" "Login and buy a bag"
