import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Look for tests in these directories
  testDir: './tests',
  
  // Run tests in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI.
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use. We are adding 'allure-playwright' here.
  reporter: [
    ['line'], // Keep the terminal output
    ['allure-playwright', {
      detail: true,
      outputFolder: "allure-results",
      suiteTitle: false
    }]
  ],

  use: {
    // Base URL to use in actions like `await page.goto('/')`.
    baseURL: 'https://www.saucedemo.com',

    // Collect trace when retrying the failed test.
    trace: 'on-first-retry',
    video: 'on',
    // Take a screenshot only on failure
    screenshot: 'on',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
