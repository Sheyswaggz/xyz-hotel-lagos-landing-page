import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Test Configuration
 * 
 * Comprehensive end-to-end testing configuration for XYZ Hotel Lagos Landing Page.
 * Tests run across multiple browsers (Chromium, Firefox, WebKit) and device viewports
 * to ensure consistent functionality and responsive design.
 * 
 * Key Features:
 * - Multi-browser testing (Chromium, Firefox, WebKit)
 * - Mobile and desktop viewport testing
 * - Automatic retry on failure in CI
 * - HTML and list reporters for test results
 * - Screenshot and trace capture on failure
 * - Local development server integration
 */
export default defineConfig({
  // Test directory containing all test files
  testDir: './tests',

  // Run tests in parallel for faster execution
  fullyParallel: true,

  // Fail the build on CI if tests contain .only (prevents accidental commits)
  forbidOnly: !!process.env.CI,

  // Retry failed tests in CI for flake detection (0 retries locally for faster feedback)
  retries: process.env.CI ? 2 : 0,

  // Limit workers in CI to prevent resource exhaustion (undefined = auto-detect locally)
  workers: process.env.CI ? 1 : undefined,

  // Test reporters: HTML report for detailed results, list for console output
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list']
  ],

  // Global test configuration shared across all tests
  use: {
    // Base URL for all page navigations (allows relative URLs in tests)
    baseURL: 'http://localhost:8000',

    // Capture trace on first retry to debug flaky tests
    trace: 'on-first-retry',

    // Capture screenshots only when tests fail (reduces storage overhead)
    screenshot: 'only-on-failure',

    // Video recording disabled by default (enable with 'retain-on-failure' if needed)
    video: 'off',

    // Timeout for individual actions (30 seconds)
    actionTimeout: 30000,

    // Timeout for navigation actions (30 seconds)
    navigationTimeout: 30000,
  },

  // Global timeout for each test (2 minutes)
  timeout: 120000,

  // Timeout for expect() assertions (10 seconds)
  expect: {
    timeout: 10000,
  },

  // Browser and device configurations for cross-browser and responsive testing
  projects: [
    // Desktop browsers
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'firefox-desktop',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'webkit-desktop',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
      },
    },

    // Mobile devices
    {
      name: 'mobile-iphone-13',
      use: {
        ...devices['iPhone 13'],
      },
    },
    {
      name: 'mobile-pixel-5',
      use: {
        ...devices['Pixel 5'],
      },
    },
  ],

  // Local development server configuration
  webServer: {
    // Command to start the local server (Python HTTP server on port 8000)
    command: 'python3 -m http.server 8000',

    // URL to wait for before running tests
    url: 'http://localhost:8000',

    // Reuse existing server in local development (start new server in CI)
    reuseExistingServer: !process.env.CI,

    // Timeout for server to start (60 seconds)
    timeout: 60000,

    // Standard output handling (pipe to console in CI, ignore locally)
    stdout: 'pipe',
    stderr: 'pipe',
  },
});