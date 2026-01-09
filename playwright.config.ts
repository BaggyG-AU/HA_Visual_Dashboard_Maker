import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Electron Testing
 *
 * This configuration is optimized for testing Electron applications.
 * It includes settings for timeouts, retries, and test organization.
 */
export default defineConfig({
  // Test directory
  testDir: './tests',

  // Maximum time one test can run for
  timeout: 60 * 1000, // 60 seconds (Electron apps may take longer to start)

  // Test execution settings
  fullyParallel: false, // Run tests serially for Electron (avoid multiple instances)
  forbidOnly: !!process.env.CI, // Fail if test.only is left in CI
  retries: process.env.CI ? 2 : 0, // Retry failed tests in CI
  workers: 1, // Only 1 worker for Electron tests (avoid conflicts)

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'test-results/html' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'], // Console output
  ],

  // Global test settings
  use: {
    // Base URL for web content (if needed)
    // baseURL: 'http://localhost:5173',

    // Collect trace on first retry
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',

    // Action timeout (increased for Electron apps)
    actionTimeout: 30 * 1000, // 30 seconds

    // Navigation timeout
    navigationTimeout: 30 * 1000, // 30 seconds
  },

  // Test match patterns
  testMatch: '**/*.spec.ts',

  // Ignore patterns - exclude backup directories and migration artifacts
  testIgnore: [
    '**/BACKUP_*/**',
    '**/*-MIGRATED.spec.ts', // Exclude migrated files (use originals)
    '**/unit/**', // Unit tests are handled by Vitest
  ],

  // Global setup/teardown
  globalSetup: './tests/setup/global-setup.ts',

  // Projects for different test types
  projects: [
    {
      name: 'electron-e2e',
      testMatch: '**/e2e/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'electron-integration',
      testMatch: '**/integration/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'electron-unit',
      testMatch: '**/unit/**/*.spec.ts',
      grep: /__ignore_unit_in_playwright__/, // prevent running unit specs under Playwright
    },
  ],

  // Output folder for test artifacts
  outputDir: 'test-results/artifacts',
});
