import { test, expect } from "@playwright/test";
import path from "path";

// Define constants for URLs and credentials
const BASE_URL = "http://localhost:3000";
const PROTECTED_URL = `${BASE_URL}/protected`;
const SCREENSHOTS_DIR = path.join("tests", "screenshots");

// Test group for authenticated flows
test.describe("Authenticated Tests", () => {
  // These tests will use the auth state from auth.setup.ts

  // Test: Can access protected page when authenticated
  test("can access protected page when authenticated", async ({ page }) => {
    // Navigate to a protected page
    await page.goto(PROTECTED_URL);

    // Take a screenshot for debugging
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "protected-page-test.png"),
    });

    // Should NOT be redirected to login - check URL doesn't contain signin
    expect(page.url()).not.toContain("/auth/signin");

    // Verify we can see the protected content - check for the heading
    await expect(
      page.getByRole("heading", { name: "Protected Page" }),
    ).toBeVisible();

    // Check for welcome text
    await expect(page.getByText(/Welcome, Test User/)).toBeVisible();
  });

  // Test: Can sign out successfully
  test("can sign out successfully", async ({ page }) => {
    // Navigate to protected page
    await page.goto(PROTECTED_URL);

    // Make sure we're on the protected page
    expect(page.url()).toContain("protected");

    // Find and click sign out button using multiple possible selectors
    try {
      const logoutButton = await page.waitForSelector(
        'button:has-text("Sign out"), button:has-text("Logout"), a:has-text("Sign out"), button:has-text("Log out")',
        { timeout: 5000 },
      );
      await logoutButton.click();
    } catch (e) {
      console.log(
        "Logout button not found with text, trying more selectors:",
        e,
      );
      // Try alternative selectors
      await page.click(
        'button.logout, [data-testid="logout"], #logout-button, .logout-button',
      );
    }

    // Wait for sign out to complete
    await page.waitForTimeout(3000);

    // Try to access protected page again
    await page.goto(PROTECTED_URL);

    // Should be redirected to login
    await expect(page).toHaveURL(/.*\/auth\/signin.*/);
  });

  // Test: Session persistence after page reload
  test("maintains session after page reload", async ({ page }) => {
    // Navigate to protected page
    await page.goto(PROTECTED_URL);

    // Verify we're logged in
    await expect(page.getByText(/Welcome, Test User/)).toBeVisible();

    // Reload the page
    await page.reload();

    // Verify we're still logged in and not redirected
    expect(page.url()).toBe(PROTECTED_URL);
    await expect(page.getByText(/Welcome, Test User/)).toBeVisible();
  });

  // Test: SKIP until we have other protected routes
  test.skip("can navigate between protected routes", async ({ page }) => {
    // Navigate to protected page
    await page.goto(PROTECTED_URL);

    // Try to navigate to other protected routes if they exist
    const protectedRoutes = ["/dashboard", "/profile", "/settings"];

    for (const route of protectedRoutes) {
      try {
        await page.goto(`${BASE_URL}${route}`);
        // Verify we're not redirected to login
        expect(page.url()).not.toContain("/auth/signin");
        // Take screenshot for verification
        await page.screenshot({
          path: path.join(
            SCREENSHOTS_DIR,
            `protected-route-${route.replace("/", "-")}.png`,
          ),
        });
      } catch (error) {
        console.log(`Navigation to ${route} failed:`, error);
      }
    }
  });

  // Test: Session timeout handling
  test("handles session timeout gracefully", async ({ page }) => {
    // Navigate to protected page
    await page.goto(PROTECTED_URL);

    // Verify we're initially logged in
    await expect(page.getByText(/Welcome, Test User/)).toBeVisible();

    // Simulate session timeout by clearing session storage and cookies
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
      // Also remove any auth-related cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    });

    // Clear context cookies
    const context = page.context();
    await context.clearCookies();

    // Force a new request to trigger auth check
    await page.reload();

    // Should be redirected to login - check with more flexible URL patterns
    await expect(page).toHaveURL(/.*\/(auth\/signin|login|sign-in).*/);

    // Check for session timeout message with more flexible detection
    const timeoutMessage = await Promise.race([
      page.waitForSelector(
        "text=/session.*expired|sign.*in.*again|logged.*out/i",
        { timeout: 5000 },
      ),
      page.waitForSelector('[role="alert"]', { timeout: 5000 }),
      page.waitForSelector(".error-message, .alert, .notification", {
        timeout: 5000,
      }),
    ]);
    expect(timeoutMessage).toBeTruthy();
  });
});
