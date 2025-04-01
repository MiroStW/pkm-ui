import { test, expect } from "@playwright/test";

// Define constants for URLs and credentials
const BASE_URL = "http://localhost:3001";
const REGISTER_URL = `${BASE_URL}/auth/register`;

// Test user info
const NEW_USER_EMAIL = "new_user@example.com";

// Test suite for registration functionality
test.describe("User Registration", () => {
  // Test: Registration page loads correctly
  test("registration page loads correctly", async ({ page }) => {
    await page.goto(REGISTER_URL);

    // Check that the page has loaded with any title
    await expect(page.locator("h1")).toBeVisible();
    // We know it's "Create an Account" from the earlier test failures
    await expect(page.locator("h1")).toContainText("Account");

    // Verify form elements are present - using ID selectors to avoid ambiguity
    await expect(page.locator('input[type="email"]')).toBeVisible();

    // Use multiple possible selectors for password fields to increase test resilience
    await expect(
      page
        .locator(
          'input#password, input[name="password"], input[placeholder="Password"]',
        )
        .first(),
    ).toBeVisible();

    await expect(
      page
        .locator(
          'input#confirmPassword, input[name="confirmPassword"], input[placeholder*="confirm" i]',
        )
        .first(),
    ).toBeVisible();

    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  // Test: Can register a new user with valid data and optional fields
  test("can register a new user with valid data", async ({ page }) => {
    await page.goto(REGISTER_URL);

    // Generate unique email - use a truly unique timestamp and random string
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const email = `test.user.${timestamp}.${random}@example.com`;
    const password = "StrongP@ssw0rd123";
    const name = "John Doe";

    // Fill in all required fields
    await page.fill('input[type="email"]', email);
    await page.fill(
      '#password, input[name="password"], input[placeholder="Password"]',
      password,
    );
    await page.fill(
      '#confirmPassword, input[name="confirmPassword"], input[placeholder*="confirm" i]',
      password,
    );

    // Try to fill optional name field if it exists
    try {
      await page.fill(
        'input[name="name"], input[placeholder*="name" i], #name',
        name,
      );
    } catch (e) {
      console.log("Name field not found, continuing without it: ", e);
    }

    // Submit the form and wait for navigation or API response
    // First, set up response promise to wait for the API
    const responsePromise = page.waitForResponse(
      (response) => response.url().includes("/api/auth/register"),
      { timeout: 10000 },
    );

    // Click the submit button
    await page.click('button[type="submit"]');

    // Wait for the API response
    const response = await responsePromise;
    const success = response.status() === 201 || response.status() === 200;

    // If API responded successfully, wait for redirect or check for success message
    if (success) {
      // Wait for redirection or success message with a generous timeout
      await page.waitForTimeout(2000);

      // Check for either:
      // 1. We're on the sign-in page with a registered=true parameter
      // 2. Or we see a success message
      const currentUrl = page.url();
      const successUrl =
        currentUrl.includes("/auth/signin") &&
        currentUrl.includes("registered=true");

      const successMessage = await page
        .locator('[data-testid="registration-success"]')
        .isVisible()
        .catch(() => false);

      expect(
        success && (successUrl || successMessage),
        "Registration should succeed and redirect to login",
      ).toBe(true);
    } else {
      // If API response was not successful, the test should fail
      expect
        .soft(success, `Registration failed with status ${response.status()}`)
        .toBe(true);

      // Additional debug info about the response
      try {
        const responseText = await response.text();
        console.log(
          "Registration API response:",
          response.status(),
          responseText,
        );
      } catch (e) {
        console.log("Could not get response text: ", e);
      }
    }
  });

  // Test: Password mismatch with different validation scenarios
  test("shows error when passwords don't match", async ({ page }) => {
    await page.goto(REGISTER_URL);

    // Test multiple password mismatch scenarios
    const testCases = [
      {
        password: "ValidP@ss123",
        confirm: "ValidP@ss124",
        desc: "slightly different passwords",
      },
      {
        password: "CompletelyDifferent123!",
        confirm: "TotallyUnrelated456!",
        desc: "completely different passwords",
      },
      {
        password: "CaseSensitive123!",
        confirm: "casesensitive123!",
        desc: "case-sensitive passwords",
      },
    ];

    for (const testCase of testCases) {
      // Fill in the form
      await page.fill('input[type="email"]', NEW_USER_EMAIL);
      await page.fill(
        '#password, input[name="password"], input[placeholder="Password"]',
        testCase.password,
      );
      await page.fill(
        '#confirmPassword, input[name="confirmPassword"], input[placeholder*="confirm" i]',
        testCase.confirm,
      );

      // Submit and check for error
      await page.click('button[type="submit"]');

      // Look for error message with multiple possible selectors
      const errorFound = await Promise.race([
        page
          .waitForSelector(
            "text=/password.*match|match.*password|not.*match/i",
            { timeout: 2000 },
          )
          .then(() => true)
          .catch(() => false),
        page
          .waitForSelector('[role="alert"]:has-text("match")', {
            timeout: 2000,
          })
          .then(() => true)
          .catch(() => false),
        page
          .waitForSelector('.error-message:has-text("match")', {
            timeout: 2000,
          })
          .then(() => true)
          .catch(() => false),
      ]);

      expect(
        errorFound,
        `Password mismatch error should show for ${testCase.desc}`,
      ).toBe(true);
    }
  });

  // Test: Password strength requirements
  test("shows error when password is too short", async ({ page }) => {
    await page.goto(REGISTER_URL);

    // Test various weak password scenarios
    const weakPasswords = [
      { value: "short", desc: "too short" },
      { value: "123456", desc: "numbers only" },
      { value: "abcdef", desc: "lowercase only" },
      { value: "ABCDEF", desc: "uppercase only" },
    ];

    for (const testCase of weakPasswords) {
      // Fill in the form
      await page.fill('input[type="email"]', NEW_USER_EMAIL);

      // Fill password fields
      const passwordSelector =
        '#password, input[name="password"], input[placeholder="Password"]';
      await page.fill(passwordSelector, testCase.value);
      await page.fill(
        '#confirmPassword, input[name="confirmPassword"], input[placeholder*="confirm" i]',
        testCase.value,
      );

      // Submit the form
      await page.click('button[type="submit"]');

      // Look for error message with multiple possible selectors
      const errorFound = await Promise.race([
        // Check for error messages
        page
          .waitForSelector(
            "text=/password.*length|password.*strong|password.*requirement|password.*weak|invalid.*password/i",
            { timeout: 2000 },
          )
          .then(() => true)
          .catch(() => false),
        page
          .waitForSelector(
            '[role="alert"]:has-text("password"), [role="alert"]:has-text("Password")',
            { timeout: 2000 },
          )
          .then(() => true)
          .catch(() => false),
        page
          .waitForSelector(".error-message, .error, .invalid-feedback", {
            timeout: 2000,
          })
          .then(() => true)
          .catch(() => false),
        // Check for invalid state on password field
        page
          .waitForSelector(`${passwordSelector}:invalid`, { timeout: 2000 })
          .then(() => true)
          .catch(() => false),
      ]);

      expect(
        errorFound,
        `Password strength error should show for ${testCase.desc}`,
      ).toBe(true);

      // Clear fields for next test
      await page.fill(passwordSelector, "");
      await page.fill(
        '#confirmPassword, input[name="confirmPassword"], input[placeholder*="confirm" i]',
        "",
      );
    }
  });
});
