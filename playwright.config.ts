import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // 🟢 CHANGE THIS LINE: Point to the root 'tests' folder
  testDir: './tests', 
  
  timeout: 30000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  reporter: [
    ['line'], // Keep console output
    ['allure-playwright', { outputFolder: 'allure-results' }] // Add Allure
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'on', // Capture screenshots on failure
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
