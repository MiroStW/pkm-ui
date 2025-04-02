import { chromium } from "@playwright/test";
import type { BrowserContext, Page, Response, Cookie } from "@playwright/test";
import fs from "fs";
import path from "path";

// Define constants for test user
const TEST_EMAIL = "test@example.com";
const TEST_PASSWORD = "StrongP@ssw0rd123";
const TEST_NAME = "Test User";

// Base URL for tests
const BASE_URL = "http://localhost:3000";

// Path to store authentication state
const authFile = path.join(process.cwd(), "./playwright/.auth/user.json");

// Ensure the auth directory exists
const authDir = path.dirname(authFile);
if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir, { recursive: true });
  console.log("Auth directory created for test authentication state");
}

// Define storage state interface based on what Playwright actually returns
interface StorageState {
  cookies: Cookie[];
  origins: Array<{
    origin: string;
    localStorage: Array<{
      name: string;
      value: string;
    }>;
  }>;
}

// Setup authentication as a global setup function
async function globalSetup() {
  console.log("🔐 [AUTH SETUP] ==========================================");
  console.log("🔐 [AUTH SETUP] Starting authentication setup");

  const browser = await chromium.launch();
  const context: BrowserContext = await browser.newContext();
  const page: Page = await context.newPage();

  try {
    // First, try to register the test user
    console.log("🔐 [AUTH SETUP] Registering test user...");
    await page.goto(`${BASE_URL}/auth/register`, {
      timeout: 60000,
    });

    // Fill in registration form
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.fill('input[placeholder*="confirm" i]', TEST_PASSWORD);
    await page.fill('input[placeholder*="name" i]', TEST_NAME);

    // Submit registration form
    await Promise.all([
      page.waitForResponse(
        (response: Response) =>
          response.url().includes("/api/auth/register") &&
          (response.status() === 200 ||
            response.status() === 201 ||
            response.status() === 409),
      ),
      page.click('button[type="submit"]'),
    ]).catch(() => {
      console.log(
        "🔐 [AUTH SETUP] User might already exist, proceeding to login",
      );
    });

    // Navigate to the login page
    await page.goto(`${BASE_URL}/auth/signin`, { timeout: 60000 });

    console.log("🔐 [AUTH SETUP] On signin page, filling credentials");

    // Fill in the login form
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);

    console.log("🔐 [AUTH SETUP] Credentials filled, submitting form");

    // Submit form and wait for response
    await Promise.all([
      page.waitForResponse(
        (response: Response) =>
          response.url().includes("/auth/signin") && response.status() === 303,
      ),
      page.click('button[type="submit"]'),
    ]);

    // Wait a bit to ensure all cookies are set
    await page.waitForTimeout(2000);

    // Verify we're actually logged in by checking the protected page
    console.log("🔐 [AUTH SETUP] Verifying authentication...");
    await page.goto(`${BASE_URL}/protected`, { timeout: 60000 });

    // Wait for some content that indicates we're logged in
    await page.waitForSelector("text=Protected Page", { timeout: 60000 });

    // Store the authentication state
    console.log("🔐 [AUTH SETUP] Storing authentication state");
    const storage = (await context.storageState()) as StorageState;

    // Verify we have the session cookie before saving
    if (
      !storage.cookies.some(
        (cookie: Cookie) => cookie.name === "next-auth.session-token",
      )
    ) {
      throw new Error("Session cookie not found in storage state");
    }

    fs.writeFileSync(authFile, JSON.stringify(storage, null, 2));
    console.log(
      "🔐 [AUTH SETUP] Authentication state saved with cookies:",
      storage.cookies.length,
    );

    console.log("🔐 [AUTH SETUP] Authentication setup complete");
    console.log("🔐 [AUTH SETUP] ==========================================");
  } catch (error) {
    console.error("🔐 [AUTH SETUP] ERROR:", error);
    throw error; // Let the test fail if we can't authenticate
  } finally {
    try {
      await browser.close();
    } catch (error) {
      console.warn("🔐 [AUTH SETUP] Warning: Browser already closed:", error);
    }
  }
}

export default globalSetup;
