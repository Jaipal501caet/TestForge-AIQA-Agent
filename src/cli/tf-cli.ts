#!/usr/bin/env -S npx tsx
import { ArchitectBridge } from '../core/architect/llm_bridge';
import { Command } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import ora from 'ora';
import { execSync, spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import { Healer } from '../core/ops/healer';

const program = new Command();

console.log(chalk.cyan(figlet.textSync('TestForge AI by Jaipal', { horizontalLayout: 'full' })));
printRandomTip();

// --- 💡 SMART FEATURE 1: Random Tips ---
function printRandomTip() {
    const tips = [
        "You can run 'testforge clean <test_name>' to delete a specific test file.",
        "TestForge automatically records a VIDEO of every test run! Check the Allure Report.",
        "If a selector changes, the 'Healer' will try to fix your code automatically.",
        "Running 'testforge start all' executes your entire regression suite in parallel.",
        "You can manually edit the generated .spec.ts files; TestForge respects your changes.",
        "We generate 'Page Object Models' (POM) to keep your test code reusable and clean."
    ];
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    console.log(chalk.yellow.italic(`💡 Pro Tip: ${randomTip}\n`));
}

// --- 📚 SMART FEATURE 2: Cheat Sheet (Shown on error) ---
function showCheatSheet() {
    console.log(chalk.cyan.bold("\n📘 TestForge Quick Guide:"));
    console.log(chalk.white("1️⃣  Create a NEW test if not present or Run same testcase"));
    console.log(chalk.gray('   $ testforge start "add bike light" --url "https://www.saucedemo.com"'));
    
    console.log(chalk.white("\n2️⃣  Run API test:"));
    console.log(chalk.gray('   $ testforge start "login" --url "https://reqres.in/api/login" --type api'));

    console.log(chalk.white("\n3️⃣  Run ALL tests:"));
    console.log(chalk.gray('   $ testforge start all --url "https://www.saucedemo.com"'));
	
	console.log(chalk.white("\n3️⃣  Delete a test:"));
    console.log(chalk.gray('   $ testforge clean "add bike light"'));
}

// --- 🧠 SMART FEATURE 3: Centralized Input Sanitizer ---
// Prevents CLI "hallucinations" by perfectly formatting any user input
function resolveFileName(rawInput: string, testType: 'ui' | 'api'): string {
    // 1. Lowercase and replace spaces with underscores
    let cleanBase = rawInput.toLowerCase().replace(/ /g, '_');
    
    // 2. Aggressively strip ANY accidental suffixes the user might have typed
    cleanBase = cleanBase.replace('_ui.spec.ts', '')
                         .replace('_api.spec.ts', '')
                         .replace('.spec.ts', '')
                         .replace('_ui', '')
                         .replace('_api', '');

    // 3. Return the structurally perfect filename
    return `${cleanBase}_${testType}.spec.ts`;
}

// --- 🧠 SMART FEATURE 4: Semantic Fuzzy Matcher ---
// Maps variations like "login function" to existing "login_functionality_api.spec.ts"
function findExistingTestIntelligently(goal: string, testType: 'ui' | 'api'): string | null {
    const folder = path.resolve(process.cwd(), 'tests', testType);
    if (!fs.existsSync(folder)) return null;

    // 1. Get all test files in the target directory
    const existingFiles = fs.readdirSync(folder).filter(f => f.endsWith(`_${testType}.spec.ts`));
    
    // 2. Normalize the user's goal (remove spaces, special chars, make lowercase)
    // "login function" -> "loginfunction"
    const normalizedGoal = goal.toLowerCase().replace(/[^a-z0-9]/g, '');

    for (const file of existingFiles) {
        // Normalize the existing filename (strip extensions and underscores)
        // "login_functionality_api.spec.ts" -> "loginfunctionality"
        const normalizedFile = file.replace(`_${testType}.spec.ts`, '').replace(/_/g, '');

        // 3. The 100% Control Check: Does the base string overlap?
        if (normalizedFile.includes(normalizedGoal) || normalizedGoal.includes(normalizedFile)) {
            return file; // Match found!
        }
    }
    return null; // No semantic match found
}

program
    .version('1.0.0')
    .command('start')
    .description('Autonomous Test Cycle: Create -> Run -> Heal -> Retry')
    .argument('[goal]', 'The testing goal or "all" to run everything', 'all') 
    .option('-u, --url <url>', 'Target URL') 
    .option('-t, --type <type>', 'Test type: ui or api', 'ui') 
    .action(async (goal, options) => {
        
        if (!options.url) {
            console.log(chalk.red("❌ Oops! You missed the target URL."));
            showCheatSheet(); 
            process.exit(1);
        }

        try {
            // 🧹 PRE-CLEANUP (Optimized with Async fsPromises)
            const resultsDir = path.resolve(process.cwd(), 'allure-results');
            const reportDir = path.resolve(process.cwd(), 'allure-report');

            await fsPromises.rm(resultsDir, { recursive: true, force: true }).catch(() => {});
            await fsPromises.rm(reportDir, { recursive: true, force: true }).catch(() => {});
            console.log(chalk.gray(`🧹 Cleaned previous test reports.`));

            const isRunAll = goal.toLowerCase() === 'all';
            const scoutScript = path.resolve(__dirname, '../core/scout/vision_scout.ts');
            const pythonScript = path.resolve(__dirname, '../core/agent_core.py');
            
            let relativeRunPath = "tests"; 
            let testFileName = "";

            // --- PATH CALCULATION LOGIC ---
            if (!isRunAll) {
                const folder = options.type === 'api' ? 'api' : 'ui';
                
                // NEW: 1. Try to find a semantic match first!
                const matchedFile = findExistingTestIntelligently(goal, options.type as 'ui' | 'api');

                if (matchedFile) {
                    testFileName = matchedFile; // Use the existing file
                    console.log(chalk.cyan(`🧠 [ROUTER] Mapped intent "${goal}" to existing file: ${testFileName}`));
                } else {
                    // 2. If no match, generate a strict new filename
                    testFileName = resolveFileName(goal, options.type as 'ui' | 'api');
                }
                
                const testFilePath = path.resolve(process.cwd(), 'tests', folder, testFileName);
                relativeRunPath = path.relative(process.cwd(), testFilePath).replace(/\\/g, '/');
            }

            // =========================================================
            // PHASE 1: CHECK & CREATE
            // =========================================================
            if (!isRunAll) {
                const absoluteTestPath = path.resolve(process.cwd(), relativeRunPath);
                
                if (fs.existsSync(absoluteTestPath)) {
                    console.log(chalk.yellow(`⚡ Fast Mode: Found existing test: ${testFileName}`));
                    console.log(chalk.gray(`   (Skipping AI Generation to save time)`));
                } else {
                    const spinner = ora('Initializing Agent...').start();
                    const bridge = new ArchitectBridge();
                    let intelPath: string | undefined = undefined;
                    
                    if (options.type === 'api') {
                        spinner.text = `🧠 Generating API Test for: "${goal}"...`;
                        spinner.color = 'magenta';
                    } else {
                        spinner.text = `👁️  Scouting & Generating UI Test for: "${goal}"...`;
                        spinner.color = 'blue';
                        
                        intelPath = path.resolve(process.cwd(), 'output', 'vision_intel', 'scout_report.json');
                        const scoutScript = path.resolve(__dirname, '../core/scout/vision_scout.ts');
                        
                        if (fs.existsSync(scoutScript)) {
                            try { execSync(`npx tsx "${scoutScript}" "${options.url}"`, { stdio: 'ignore' }); } 
                            catch(e) { /* Scout failed silently */ }
                        }
                    }
                    
                    // 🚀 Call the Native TS Bridge instead of Python!
                    const generatedData = await bridge.generateTest(goal, options.url, options.type as 'ui' | 'api', intelPath);
                    
                    if (generatedData) {
                        // Ensure folders exist
                        const baseName = goal.replace(/ /g, '_').toLowerCase();
                        fs.mkdirSync(path.dirname(absoluteTestPath), { recursive: true });

                        // 1. Save Page Object if generated
                        if (generatedData.pageObjectCode && options.type === 'ui') {
                            const pagePath = path.resolve(process.cwd(), 'pages', `${baseName}_page.ts`);
                            fs.mkdirSync(path.dirname(pagePath), { recursive: true });
                            fs.writeFileSync(pagePath, generatedData.pageObjectCode);
                            console.log(chalk.green(`\n   📄 Generated: pages/${baseName}_page.ts`));
                        }

                        // 2. Save Test Spec
                        if (generatedData.testSpecCode) {
                            fs.writeFileSync(absoluteTestPath, generatedData.testSpecCode);
                            console.log(chalk.green(`   📄 Generated: ${relativeRunPath}`));
                        }
                        spinner.succeed(chalk.green('Test Created Successfully.'));
                    } else {
                        spinner.fail(chalk.red('Test Generation Failed.'));
                        process.exit(1);
                    }
                }
            } else {
                console.log(chalk.magenta(`🚀 Mode: Executing Full Regression Suite (UI + API)...`));
            }

            // =========================================================
            // PHASE 2 & 3: RUN & HEAL LOOP
            // =========================================================
            let attempts = 0;
            const maxRetries = 2;
            let success = false;
            
            const runSpinner = ora().start();

            while (attempts <= maxRetries && !success) {
                if (attempts === 0) {
                    runSpinner.text = '🏃 Executing Test Suite...';
                    runSpinner.color = 'magenta';
                } else {
                    runSpinner.text = `↻ Retry #${attempts}: Executing Healed Test...`;
                    runSpinner.color = 'yellow';
                }

                try {
                    // 🧠 Determine browser mode based on CLI options (--headed flag)
                    const browserMode = options.headed ? '--headed' : '';

                    // Execute Playwright (Bypassing npx overhead)
                    execSync(`npx playwright test "${relativeRunPath}" ${browserMode} --reporter=line,allure-playwright`, { 
                        stdio: 'pipe',
                        env: { ...process.env, FORCE_COLOR: '1' } 
                    }); 
                    
                    success = true;
                    runSpinner.succeed(chalk.green('✅ TEST PASSED!'));

                } catch (error: any) {
                    const output = error.stdout?.toString() || "";
                    const errorLog = output + (error.stderr?.toString() || "");

                    if (output.includes("passed") && !output.includes("failed")) {
                        success = true;
                        runSpinner.succeed(chalk.green('✅ TEST PASSED (with warnings)!'));
                        break;
                    }

                    runSpinner.fail(chalk.red('❌ Test Failed.'));

                    if (attempts < maxRetries) {
                        console.log(chalk.yellow(`\n⚠️ Failure detected. Initiating recovery...`));
                        const healer = new Healer();
                        
                        // 🚀 NATIVE TS HEALER EXECUTION (Awaits the LLM Bridge)
                        const isFixed = await healer.attemptHeal(relativeRunPath, errorLog);

                        if (isFixed) {
                            console.log(chalk.cyan(`\n✨ Fix Applied. Retrying execution...`));
                            runSpinner.start();
                        } else {
                            console.log(chalk.red("\n📋 [DETAILED FAILURE LOGS]:"));
                            console.log(chalk.gray(errorLog || "No logs captured."));
                            console.log(chalk.red("\n❌ [CLI] Healer could not fix the issue. Aborting."));
                            break; 
                        }
                    } else {
                        console.log(chalk.red(`\n💀 Max retries reached.`));
                    }
                }
                attempts++;
            }

            // =========================================================
            // PHASE 4: REPORT
            // =========================================================
            console.log(chalk.cyan('\n📊 Generating Report...'));
            try {
                if (!fs.existsSync(path.resolve(process.cwd(), 'allure-results'))) {
                     console.log(chalk.red("❌ Error: 'allure-results' folder is missing. The test might have crashed before running."));
                } else {
                    execSync('npx allure generate allure-results --clean -o allure-report', { stdio: 'inherit' });

                    if (!process.env.CI) {
                        // 🧠 Ultimate OS-Aware Spawn (Fixes EINVAL on Windows AND DEP0190 warnings)
                        const command = process.platform === 'win32' ? 'cmd.exe' : 'npx';
                        const args = process.platform === 'win32' 
                                     ? ['/c', 'npx', 'allure', 'open', 'allure-report'] 
                                     : ['allure', 'open', 'allure-report'];
                        
                        const openReport = spawn(command, args, { 
                            detached: true,
                            stdio: 'ignore' 
                            // shell: true is deliberately omitted for security
                        });
                        openReport.unref();
                    }
                }
            } catch (e: any) {
                console.log(chalk.red(`\n❌ Report Generation Failed.`));
                console.log(chalk.yellow("👉 Tip: Allure requires Java. Run 'java -version' to check if it's installed."));
                console.log(chalk.gray(`   Details: ${e.message}`));
            }

        } catch (e: any) {
            console.error(chalk.red('Critical Agent Failure:'), e.message);
        }
    });

program
    .command('clean')
    .description('Remove a specific test case file')
    .argument('<goal>', 'The goal/name of the test to delete')
    .action((goal) => {
        
        // 1. Ask the Semantic Matcher if the file exists first!
        const matchedUiFile = findExistingTestIntelligently(goal, 'ui');
        const matchedApiFile = findExistingTestIntelligently(goal, 'api');

        // 2. If it found a fuzzy match, use it. Otherwise, fall back to the strict sanitizer.
        const uiFile = matchedUiFile || resolveFileName(goal, 'ui');
        const apiFile = matchedApiFile || resolveFileName(goal, 'api');
        
        let deleted = false;
        
        [
            path.resolve(process.cwd(), 'tests', 'ui', uiFile),
            path.resolve(process.cwd(), 'tests', 'api', apiFile)
        ].forEach(filePath => {
             if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(chalk.green(`🗑️  Deleted: ${path.basename(filePath)}`));
                deleted = true;
            }
        });

        if (!deleted) {
            console.log(chalk.red(`❌ File not found for goal: ${goal}`));
            console.log(chalk.yellow(`   (We searched semantically and strictly for ${uiFile} and ${apiFile})`));
        }
    });

program.parse(process.argv);