#!/usr/bin/env -S npx ts-node

import { Command } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import ora from 'ora';
import { exec, execSync, spawn } from 'child_process';
import * as path from 'path';

// Note: We are keeping these imports if you have valid TS classes for them.
// If not, the Python script now handles the 'Scout' and 'Architect' logic.
import { TestRunner } from '../src/core/ops/runner';

const program = new Command();

console.log(chalk.cyan(figlet.textSync('TestForge AI by JP', { horizontalLayout: 'full' })));

program
    .version('1.0.0')
    .description('AI-Powered QA Automation Agent');

program
    .command('start')
    .description('Full Cycle: Scan -> Architect -> Run -> Report')
    .argument('<goal>', 'The testing goal (e.g., "Login to app")') // <--- ADDED GOAL ARGUMENT
    .requiredOption('-u, --url <url>', 'Target URL to test')
    .action(async (goal, options) => { // <--- Added 'goal' here
        const spinner = ora('Initializing TestForge Agent...').start();
        const pythonScript = path.resolve(__dirname, '../src/core/agent_core.py');

        try {
            // ---------------------------------------------------------
            // PHASE 1 & 2: THE BRAIN (Python Agent)
            // ---------------------------------------------------------
            spinner.text = `🧠 Phase 1 & 2: Engaging AI Brain on: ${options.url}`;
            spinner.color = 'yellow';

            // We wrap the Python spawn in a Promise so we can "await" it
            await new Promise<void>((resolve, reject) => {
                const pythonProcess = spawn('python', [pythonScript, '--url', options.url, '--goal', goal]);

                // Stream Python Output to Console
                pythonProcess.stdout.on('data', (data) => {
                    // Clean up the output string
                    const output = data.toString().trim();
                    // Update spinner or log info
                    spinner.text = `🧠 [AI Thinking]: ${output.slice(0, 50)}...`; 
                    // Verify if you want verbose logs:
                    console.log(chalk.gray(`\n[Brain]: ${output}`)); 
                });

                pythonProcess.stderr.on('data', (data) => {
                    console.error(chalk.red(`\n[AI Error]: ${data}`));
                });

                pythonProcess.on('close', (code) => {
                    if (code === 0) {
                        resolve();
                    } else {
                        reject(new Error(`AI Agent exited with code ${code}`));
                    }
                });
            });

            spinner.succeed(chalk.green('Brain Mission Complete: Test Code Generated.'));

            // ---------------------------------------------------------
            // PHASE 3: RUNNER (Playwright)
            // ---------------------------------------------------------
            spinner.start('🏃 Phase 3: RUNNER - Executing Tests...');
            
            // If you have a TestRunner class, use it. Otherwise, we run Playwright directly.
            // const runner = new TestRunner();
            // await runner.executeTests(); 
            
            // DIRECT EXECUTION METHOD (Reliable):
            try {
                // Running playwright test specifically on the generated folder or all tests
                execSync('npx playwright test', { stdio: 'inherit' });
                spinner.succeed(chalk.green('Tests Executed Successfully'));
            } catch (e) {
                // If tests fail, we don't crash the tool, we just mark it.
                spinner.warn(chalk.yellow('Tests finished with some failures (Check Report)'));
            }

            // ---------------------------------------------------------
            // PHASE 4: REPORTING (Allure)
            // ---------------------------------------------------------
            console.log(chalk.magenta('\n📊 Generating Allure Report...'));

            try {
                // Generate the HTML report
                execSync('npx allure generate allure-results --clean -o allure-report', { stdio: 'pipe' });
                console.log(chalk.green('✅ Report Generated!'));

                console.log(chalk.cyan('👉 Opening Dashboard...'));
                // Open the report (Fire and forget)
                exec('npx allure open allure-report');

            } catch (error: any) {
                console.error(chalk.red(`❌ Reporting Failed: ${error.message}`));
            }

            console.log(chalk.bold.green('\n✨ MISSION SUCCESS: Test Cycle Finished!'));

        } catch (error: any) {
            spinner.fail(chalk.red('Mission Failed'));
            console.error(chalk.red(error.message));
        }
    });

program.parse(process.argv);
