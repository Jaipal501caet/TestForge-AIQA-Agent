import { exec } from 'child_process';
import * as util from 'util';
import * as path from 'path';
import * as fs from 'fs';

const execAsync = util.promisify(exec);

export class TestRunner {
    async executeTests() {
        console.log(`\n🏃 [RUNNER] Executing Generated Tests...`);
        
        // 1. Hardcode the path to the SPECIFIC file we know exists
        // This avoids "directory scanning" issues in Git Bash
        const testFile = path.resolve(process.cwd(), 'output', 'generated_tests', 'tests', 'login_gemini.spec.ts');

        // 2. Convert to Forward Slashes (Crucial for Git Bash)
        const cleanPath = testFile.replace(/\\/g, '/');

        try {
            console.log(`   👉 Target: ${cleanPath}`);
            // 3. Executing directly
            const { stdout, stderr } = await execAsync(`npx playwright test "${cleanPath}" --headed`);
            console.log(stdout);
        } catch (error: any) {
            console.error(`❌ [RUNNER] Tests Failed:`);
            console.log(error.stdout); // Print the actual Playwright error
        }
    }
}