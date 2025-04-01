import { test as setup } from "@playwright/test";
import fs from "fs";
import path from "path";

// Define constants for test user
const TEST_EMAIL = "test@example.com";
const TEST_PASSWORD = "password";

// Path to store authentication state
const authFile = path.join(process.cwd(), "./playwright/.auth/user.json");

// Ensure the auth directory exists
const authDir = path.dirname(authFile);
if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir, { recursive: true });
}

// Setup authentication before tests
setup("authenticate", async ({ page, context }) => {
  console.log("🔐 [AUTH SETUP] ==========================================");
  console.log("🔐 [AUTH SETUP] Starting authentication setup");

  try {
    // Navigate to the login page
    await page.goto("http://localhost:3000/auth/signin");

    console.log("🔐 [AUTH SETUP] On signin page, filling credentials");

    // Wait for the form to be ready
    await page.waitForSelector('input[type="email"]', { timeout: 5000 });
    await page.waitForSelector('input[type="password"]', { timeout: 5000 });

    // Fill in the login form
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);

    console.log("🔐 [AUTH SETUP] Credentials filled, submitting form");

    // Start listening for response to the signin request
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/auth/signin") && response.status() === 303,
    );

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for successful response
    console.log("🔐 [AUTH SETUP] Waiting for successful login response...");
    await responsePromise;

    // Wait a bit to ensure all cookies are set
    await page.waitForTimeout(1000);

    // Verify we're actually logged in by checking the protected page
    console.log("🔐 [AUTH SETUP] Verifying authentication...");
    await page.goto("http://localhost:3000/protected");

    // Wait for some content that indicates we're logged in
    await page.waitForSelector("text=Protected Page", { timeout: 5000 });

    // Store the authentication state
    console.log("🔐 [AUTH SETUP] Storing authentication state");
    const storage = await context.storageState();

    // Verify we have the session cookie before saving
    if (
      !storage.cookies.some(
        (cookie) => cookie.name === "next-auth.session-token",
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
  }
});
