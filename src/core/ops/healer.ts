import * as path from 'path';
import chalk from 'chalk';
import * as fs from 'fs';
import { ArchitectBridge } from '../architect/llm_bridge';

export class Healer {
    private bridge: ArchitectBridge;

    constructor() {
        this.bridge = new ArchitectBridge(); // Instantiate the new TS Bridge
    }

    /**
     * Attempts to fix a broken test file using AI.
     * Must be async now since it directly calls the LLM Bridge.
     */
    public async attemptHeal(testFilePath: string, errorLog: string): Promise<boolean> {
        // 🔍 STEP 1: DEFINE LOCATOR ERROR PATTERNS
        const locatorErrorKeywords = [
            'locator', 'selector', 'waiting for', 'timeout', 
            'not found', 'is not visible', 'Target closed'
        ];

        const isLocatorIssue = locatorErrorKeywords.some(keyword => 
            errorLog.toLowerCase().includes(keyword.toLowerCase())
        );

        if (!isLocatorIssue) {
            console.log(chalk.blue(`\n🚫 [HEALER] Failure detected, but it doesn't look like a locator issue.`));
            console.log(chalk.gray(`   Skipping AI healing to preserve quota and prevent incorrect code changes.`));
            return false; 
        }

        console.log(chalk.magenta(`\n🩹 [OPS] Locator mismatch suspected. Engaging Healer Protocol for: ${path.basename(testFilePath)}`));

        if (!fs.existsSync(testFilePath)) {
            console.error(chalk.red(`❌ [OPS] Test file not found: ${testFilePath}`));
            return false;
        }

        const cleanLog = errorLog.replace(/"/g, "'").slice(0, 2000);

        try {
            // 🚀 STEP 3: CALL THE NATIVE TS BRAIN
            const fixData = await this.bridge.healTest(testFilePath, cleanLog);

            if (fixData && fixData.fixed_code) {
                // Determine target file (fallback to the original test file if AI doesn't specify)
                const targetFile = fixData.target_file && fixData.target_file !== "PATH_TO_FILE_YOU_FIXED" 
                    ? path.resolve(process.cwd(), fixData.target_file) 
                    : testFilePath;

                // Save the fixed code
                fs.writeFileSync(targetFile, fixData.fixed_code, 'utf-8');

                console.log(chalk.green(`\n✅ [DOCTOR] Applied fix to: ${path.basename(targetFile)}`));
                console.log(chalk.white(`   📝 [FIX REPORT] ${fixData.explanation || "Applied automated fix based on error logs."}`));
                return true;
            } else {
                console.error(chalk.red("❌ [OPS] AI Doctor failed to return a valid fix format."));
                return false;
            }

        } catch (error: any) {
            console.error(chalk.red("❌ [OPS] Critical Healer Failure:"), error.message);
            return false;
        }
    }
}