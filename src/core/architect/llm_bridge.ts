import * as fs from 'fs';
import * as path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import { PromptEngine } from './prompt_engine';

dotenv.config();

export class ArchitectBridge {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor() {
        // 🧠 Check for the modern Gemini key OR the legacy Google key
        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
        
        if (!apiKey) {
            throw new Error("❌ GEMINI_API_KEY or GOOGLE_API_KEY is missing in .env file!");
        }
        
        this.genAI = new GoogleGenerativeAI(apiKey);
        // Force the model to output strict JSON
        this.model = this.genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        }); 
    }

    // =========================================================
    // MODE 1: GENERATE (The Architect)
    // =========================================================
    public async generateTest(goal: string, url: string, type: 'ui' | 'api', intelPath?: string) {
        console.log(`\n🧠 [BRIDGE] Requesting Test Architecture for: "${goal}"`);

        let prompt = "";
        let requestContent: any[] = [];
        const baseName = goal.replace(/ /g, '_').toLowerCase();

        if (type === 'api') {
            prompt = PromptEngine.buildAPIGenerationPrompt(goal, url);
            requestContent.push(prompt);
        } else {
            // --- UI MODE ---
            const pageFilename = `${baseName}_page.ts`;
            const pagePath = path.resolve(process.cwd(), 'pages', pageFilename);
            const pageImportPath = `../../pages/${baseName}_page`;

            // 🔍 SMART CHECK: Does the Page Object already exist?
            if (fs.existsSync(pagePath)) {
                console.log(`♻️  [ARCHITECT] Found existing Page Object: ${pageFilename}`);
                const existingPOM = fs.readFileSync(pagePath, 'utf-8');
                prompt = PromptEngine.buildUIReusePrompt(goal, existingPOM, pageImportPath);
                requestContent.push(prompt);
            } else {
                // SCENARIO: Create Everything New
                let intelSummary = "No Vision Data Available";
                if (intelPath && fs.existsSync(intelPath)) {
                    const intel = JSON.parse(fs.readFileSync(intelPath, 'utf-8'));
                    intelSummary = JSON.stringify(intel.interactiveElements.slice(0, 50));
                    
                    if (intel.screenshotPath && fs.existsSync(intel.screenshotPath)) {
                        requestContent.push(this.fileToGenerativePart(intel.screenshotPath, "image/png"));
                    }
                }
                prompt = PromptEngine.buildUIGenerationPrompt(goal, url, intelSummary, pageFilename, pageImportPath);
                requestContent.unshift(prompt); // Ensure prompt is the first item
            }
        }

        try {
            const result = await this.model.generateContent(requestContent);
            return JSON.parse(result.response.text());
        } catch (error) {
            console.error("❌ [BRIDGE] AI Generation Failed:", error);
            return null;
        }
    }

    // =========================================================
    // MODE 2: HEAL (The Doctor)
    // =========================================================
    public async healTest(testFilePath: string, errorLog: string) {
        console.log(`🩹 [BRAIN] Diagnosing failure in: ${path.basename(testFilePath)}`);
        
        if (!fs.existsSync(testFilePath)) throw new Error("Test file not found.");
        const testContent = fs.readFileSync(testFilePath, 'utf-8');

        // 🔍 DETECT PAGE OBJECTS: Look for imports
        let pageObjectContext = "";
        const importRegex = /import.*from\s+['"](.*)['"];/g;
        let match;
        
        while ((match = importRegex.exec(testContent)) !== null) {
            const rawImportPath = match[1];
            if (rawImportPath.startsWith('.')) {
                // Resolve relative path
                const baseDir = path.dirname(testFilePath);
                let resolvedPath = path.resolve(baseDir, rawImportPath);
                if (!resolvedPath.endsWith('.ts')) resolvedPath += '.ts';

                if (fs.existsSync(resolvedPath)) {
                    console.log(`   [CONTEXT] Found Page Object: ${path.basename(resolvedPath)}`);
                    const pomContent = fs.readFileSync(resolvedPath, 'utf-8');
                    pageObjectContext = `\n=== RELATED PAGE OBJECT (${path.basename(resolvedPath)}) ===\n${pomContent}`;
                    break; // Just grab the first local import for context
                }
            }
        }

        const prompt = PromptEngine.buildHealerPrompt(errorLog, testContent, pageObjectContext);

        try {
            const result = await this.model.generateContent([prompt]);
            return JSON.parse(result.response.text());
        } catch (error) {
            console.error("❌ [BRAIN ERROR] Healing failed:", error);
            return null;
        }
    }

    private fileToGenerativePart(filePath: string, mimeType: string) {
        return {
            inlineData: {
                data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
                mimeType
            },
        };
    }
}