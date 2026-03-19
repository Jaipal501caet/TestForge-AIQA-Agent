export class PromptEngine {
    
    // ==========================================================
    // SCENARIO 1: FULL UI GENERATION (New Test + New Page Object)
    // ==========================================================
    public static buildUIGenerationPrompt(goal: string, url: string, intelSummary: string, pageFilename: string, pageImportPath: string): string {
        return `
        You are a Senior QA Automation Architect.
        **USER GOAL:** "${goal}"
        **TARGET URL:** "${url}"
        **VISION INTEL:** ${intelSummary}

        **TASK:** Generate a highly modular Playwright (TypeScript) Page Object Model framework.
        
        **STRICT ANTI-HALLUCINATION RULES:**
        1. **Framework Structure:** Create one Page Object class and one Test Spec.
        2. **Naming Convention:** The test title inside \`test('...', async () => {})\` MUST be exactly "${goal}".
        3. **No Console Logs:** NEVER use \`console.log()\`. You MUST use Playwright's \`await test.step('...', async () => { ... })\` for all documentation.
        4. **Imports:** The test MUST import the Page Object using: import { ${pageFilename.replace('.ts', '').replace('_page', 'Page')} } from '${pageImportPath}';
        5. **Workarounds:** If the target application restricts the exact goal, write a \`// NOTE:\` comment explaining your workaround.

        **OUTPUT FORMAT (JSON ONLY):**
        {
            "pageObjectCode": "// Full TypeScript class code here",
            "testSpecCode": "// Full TypeScript spec code here importing the Page Object"
        }
        `;
    }

    // ==========================================================
    // SCENARIO 2: UI GENERATION (Reuse Existing Page Object) -> Replaces "Scenario A" from Python
    // ==========================================================
    public static buildUIReusePrompt(goal: string, existingPageObjectCode: string, pageImportPath: string): string {
        return `
        You are a Senior SDET Architect.
        **USER GOAL:** "${goal}"
        
        **EXISTING PAGE OBJECT:**
        ${existingPageObjectCode}

        **TASK:** Write a Playwright Test (TypeScript) that uses the **EXISTING** Page Object above.
        
        **STRICT ANTI-HALLUCINATION RULES:**
        1. **No New POM:** Do NOT create a new Page Object. Only return the test code.
        2. **Naming Convention:** The test title MUST be exactly "${goal}".
        3. **Imports:** Import the class correctly using: import { ClassName } from '${pageImportPath}';
        4. **No Console Logs:** Use \`test.step\` instead.

        **OUTPUT FORMAT (JSON ONLY):**
        {
            "testSpecCode": "Full TS code for the Playwright test file"
        }
        `;
    }

    // ==========================================================
    // SCENARIO 3: API GENERATION
    // ==========================================================
    public static buildAPIGenerationPrompt(goal: string, url: string): string {
        return `
        You are a Senior QA Automation Architect.
        **USER GOAL:** "${goal}"
        **ENDPOINT:** "${url}"

        **TASK:** Generate a self-contained Playwright API Test in TypeScript.
        
        **STRICT ANTI-HALLUCINATION RULES:**
        1. **No Page Objects:** API tests must use Playwright's \`request\` fixture.
        2. **Naming:** The test title MUST be exactly "${goal}".
        3. **Assertions:** Include strict assertions for the HTTP Status Code (e.g., 200, 201) and JSON body validation.

        **OUTPUT FORMAT (JSON ONLY):**
        {
            "testSpecCode": "// Full TypeScript spec code here"
        }
        `;
    }

    // ==========================================================
    // SCENARIO 4: THE HEALER
    // ==========================================================
    public static buildHealerPrompt(errorLog: string, testContent: string, pageObjectContext: string = ""): string {
        return `
        You are a Playwright Expert (TypeScript).
        
        **THE SCENARIO:**
        A test failed. You must fix the code.
        
        **ERROR LOG:**
        ${errorLog}
        
        **FILE 1: THE TEST FILE**
        ${testContent}
        
        ${pageObjectContext ? `**FILE 2: RELATED PAGE OBJECT**\n${pageObjectContext}` : ""}
        
        **TASK:**
        Analyze the error and fix the broken code.
        
        **OUTPUT FORMAT (JSON ONLY):**
        {
            "target_file": "PATH_TO_FILE_YOU_FIXED",
            "fixed_code": "FULL_TYPESCRIPT_CODE",
            "explanation": "A specific, 1-sentence summary of the fix mentioning the old locator vs the new locator."
        }
        `;
    }
}
