import { defineConfig, devices } from "@playwright/test";
import path from "path";
import { setupTestEnv } from "./tests/setup/mockSupabase";

// Setup test environment when playwright config is loaded
setupTestEnv();

const PORT = process.env.PORT ?? 3001;
const BASE_URL = `http://localhost:${PORT}`;

// Configuration for test authentication
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
  testDir: "./e2e",
  outputDir: "./test-results",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list", { printSteps: true }]],
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    contextOptions: {
      ignoreHTTPSErrors: true,
    },
  },

  projects: [
    // Setup project
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },

    // Test project that does not require authentication
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: undefined,
      },
      dependencies: ["setup"],
      testMatch: [
        /auth\.spec\.ts/, // Authentication flow tests
        /register\.spec\.ts/, // Registration flow tests
      ],
    },

    // Test project that requires authentication
    {
      name: "authenticated",
      use: {
        ...devices["Desktop Chrome"],
        storageState: authFile,
      },
      dependencies: ["setup"],
      testMatch: [
        /authenticated\.spec\.ts/, // Tests requiring user to be signed in
      ],
    },
  ],

  webServer: {
    command: "bun run dev",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // Increase timeout to 2 minutes
    stdout: "pipe",
    stderr: "pipe",
    env: {
      ...process.env,
      PORT: PORT.toString(),
      NODE_ENV: "test",
      USE_MOCK_SUPABASE: "true",
      NEXT_PUBLIC_SUPABASE_URL: "http://mock-supabase-url",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "mock-anon-key",
      NEXTAUTH_URL: BASE_URL,
      NEXTAUTH_SECRET: "test-secret",
    },
  },
});
