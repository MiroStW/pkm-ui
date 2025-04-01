import { test, expect } from "@playwright/test";

// Define constants for URLs and credentials
const BASE_URL = "http://localhost:3000";
const PROTECTED_URL = `${BASE_URL}/protected`;

// Test group for authenticated flows
test.describe("Authenticated Tests", () => {
  // These tests will use the auth state from auth.setup.ts

  // Test: Can access protected page when authenticated
  test("can access protected page when authenticated", async ({ page }) => {
    // Navigate to a protected page
    await page.goto(PROTECTED_URL);

    // Take a screenshot for debugging
    await page.screenshot({ path: "protected-page-test.png" });

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
      console.log("Logout button not found with text, trying more selectors");
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
});
