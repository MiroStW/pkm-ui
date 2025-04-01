import { defineConfig, devices } from "@playwright/test";
import path from "path";
import { setupTestEnv } from "./tests/setup/mockSupabase";

// Setup test environment when playwright config is loaded
setupTestEnv();

// Path for authenticated state
const authFile = path.join(process.cwd(), "./playwright/.auth/user.json");

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests", // Directory where tests are located

  /* Default timeout for each test in milliseconds. */
  timeout: 30000, // Increased timeout to 30 seconds

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 1,

  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [["list", { printSteps: true }]],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL ?? "http://localhost:3000",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",

    /* Additional useful test options */
    screenshot: "only-on-failure",

    /* Wait for navigation to complete even on slow CI/local machines */
    navigationTimeout: 30000,
  },

  /* Configure projects for major browsers */
  projects: [
    // Setup project to authenticate and save signed-in state
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
      testIgnore: /.*\.spec\.ts/,
    },

    // Basic tests that don't require authentication
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: [/.*\.setup\.ts/, /.*authenticated.*/i],
    },

    // This project specifically tests authenticated scenarios
    // using the auth state saved by the setup project
    {
      name: "authenticated",
      use: {
        ...devices["Desktop Chrome"],
        // Use prepared auth state
        storageState: authFile,
      },
      dependencies: ["setup"],
      testMatch: /.*authenticated.*/i,
    },

    // Optionally uncomment to test other browsers
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "bun run dev", // Command to start your dev server
    url: "http://localhost:3000", // URL to wait for
    reuseExistingServer: !process.env.CI, // Reuse server if not on CI
    stdout: "pipe",
    stderr: "pipe",
    timeout: 60000, // Give the server 60 seconds to start
    env: {
      // Test mode environment variables
      NODE_ENV: "test",
      SUPABASE_URL: "https://test-url.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
      SUPABASE_ANON_KEY: "test-anon-key",
      USE_MOCK_SUPABASE: "true",
    },
  },
});
