/**
 * Mock Supabase for testing with Playwright
 *
 * This file provides utilities to set up a test environment with mocked Supabase
 * for use with Playwright tests.
 */

import path from "path";
import fs from "fs";

// Test user for authentication
export const TEST_USER = {
  id: "test-user-id",
  email: "test@example.com",
  password: "password",
  password_hash: "hashed_password_here", // This would be a real hash in production
  name: "Test User",
};

/**
 * Set up environment variables for testing
 * Note: In Playwright, environment variables should be set in playwright.config.ts
 * or through the command line before running tests.
 */
export function setupTestEnv() {
  // Create auth directory for Playwright authentication storage
  const authDir = path.join(process.cwd(), "./playwright/.auth");
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  console.log("Auth directory created for test authentication state");
}

/**
 * Add this to global setup for Playwright tests
 */
export function prepareTestEnvironment() {
  setupTestEnv();
  console.log("Test environment prepared");
}
