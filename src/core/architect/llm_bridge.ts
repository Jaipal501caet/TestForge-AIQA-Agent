import * as fs from 'fs';
import * as path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

// Load API Key
dotenv.config();

interface VisionIntel {
    url: string;
    interactiveElements: any[];
    screenshotPath: string; // We need the image path now!
}

export class Architect {
    private intelPath: string;
    private outputBase: string;
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor() {
        this.intelPath = path.resolve(process.cwd(), 'output', 'vision_intel', 'scout_report.json');
        this.outputBase = path.resolve(process.cwd(), 'output', 'generated_tests');
        
        // Initialize Gemini
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("❌ GEMINI_API_KEY is missing in .env file!");
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
        // Using the latest 2.5 Flash model available to your key
		this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 
    }

    async generateTestStrategy() {
        console.log(`\n🧠 [ARCHITECT] Connecting to Gemini Pro...`);

        if (!fs.existsSync(this.intelPath)) {
            console.error("❌ No Intel found! Run the Scout first.");
            return;
        }

        const intel: VisionIntel = JSON.parse(fs.readFileSync(this.intelPath, 'utf-8'));
        
        // 1. Prepare the Prompt (The "Request")
        const prompt = `
        You are a Senior QA Automation Architect.
        I have mapped a web page. Here is the list of interactive elements (ID, Selector, Text):
        ${JSON.stringify(intel.interactiveElements.slice(0, 50))} 
        (I limited to 50 elements to save context).

        **YOUR GOAL:**
        Generate a Playwright (TypeScript) Page Object Model framework for a "Login Flow".
        
        **REQUIREMENTS:**
        1. Return ONLY valid JSON. No markdown, no backticks.
        2. The JSON must have two keys: "pageObjectCode" and "testSpecCode".
        3. Use the 'selector' from my list. If a meaningful ID exists, prefer that.
        4. The Page Object class name should be 'SauceDemoPage'.
        5. The Test should use the Page Object to navigate, login with 'standard_user' / 'secret_sauce', and assert success.
        `;

        // 2. Load the Screenshot (The "Vision")
        const imagePath = intel.screenshotPath; 
        if (!fs.existsSync(imagePath)) {
            console.error("❌ Screenshot missing!", imagePath);
            return;
        }
        const imagePart = this.fileToGenerativePart(imagePath, "image/png");

        try {
            console.log("   👉 Sending Visual Data to Gemini...");
            const result = await this.model.generateContent([prompt, imagePart]);
            const response = await result.response;
            const text = response.text();

            // Clean up Markdown code blocks if Gemini adds them
            const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const generatedCode = JSON.parse(cleanedText);

            // 3. Save the Files
            this.saveCode(generatedCode.pageObjectCode, 'pages/SauceDemoPage.ts');
            this.saveCode(generatedCode.testSpecCode, 'tests/login_gemini.spec.ts');

            console.log(`\n🚀 Gemini has built your Framework!`);

        } catch (error) {
            console.error("❌ AI Generation Failed:", error);
        }
    }

    // Helper to convert image for API
    private fileToGenerativePart(path: string, mimeType: string) {
        return {
            inlineData: {
                data: Buffer.from(fs.readFileSync(path)).toString("base64"),
                mimeType
            },
        };
    }

    private saveCode(code: string, relativePath: string) {
        // Ensure directory exists
        const fullPath = path.join(this.outputBase, relativePath);
        const dir = path.dirname(fullPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        fs.writeFileSync(fullPath, code.trim());
        console.log(`✅ [CODEGEN] Written: ${relativePath}`);
    }
}

// 🟢 RUNNER
if (require.main === module) {
    new Architect().generateTestStrategy();
}