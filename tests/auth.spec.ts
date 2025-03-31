import { test, expect } from "@playwright/test";

// Use the hardcoded credentials for now
const USERNAME = "test";
const PASSWORD = "password";

// Define the routes we will interact with
const PROTECTED_ROUTE = "/protected";
const API_AUTH_SIGNIN = "/api/auth/signin"; // The NextAuth API endpoint that handles redirects
const HOME_ROUTE = "/";

test.describe("Authentication Flow", () => {
  test("should redirect unauthenticated user to signin page", async ({
    page,
  }) => {
    // Attempt to navigate to the protected route
    await page.goto(PROTECTED_ROUTE);

    // Wait for redirect to sign-in
    await page.waitForURL((url) => {
      return (
        url.pathname === API_AUTH_SIGNIN &&
        url.searchParams.get("callbackUrl") === PROTECTED_ROUTE
      );
    });
  });

  test("should allow user to sign in and access protected route", async ({
    page,
  }) => {
    // Start at the protected page to get redirected to sign-in with proper callbackUrl
    await page.goto(PROTECTED_ROUTE);

    // Wait for redirect to sign-in page
    await page.waitForURL(
      (url) =>
        url.pathname === API_AUTH_SIGNIN &&
        url.searchParams.get("callbackUrl") === PROTECTED_ROUTE,
    );

    // Submit the credentials
    await page.fill('input[name="username"]', USERNAME);
    await page.fill('input[name="password"]', PASSWORD);

    // Click submit and handle the auth flow
    await Promise.all([
      // Wait for the form submission
      page.waitForRequest(
        (request) =>
          request.method() === "POST" &&
          request.url().includes("/api/auth/callback/credentials"),
      ),
      // Click the submit button
      page.click('button[type="submit"]'),
    ]);

    // Wait for any auth-related redirects to complete
    try {
      await page.waitForURL(
        (url) => {
          return url.pathname === PROTECTED_ROUTE;
        },
        { timeout: 20000 },
      );
    } catch (error) {
      throw error;
    }

    // Wait for the page content to be ready
    await page.waitForLoadState("domcontentloaded");

    // Verify protected content is visible
    await expect(
      page.getByRole("heading", { name: "Protected Page" }),
    ).toBeVisible();
    await expect(page.getByText(`Welcome, Test User!`)).toBeVisible();
    await expect(
      page.getByText(`Your email is: test@example.com`),
    ).toBeVisible();
  });

  test("should allow user to sign out", async ({ page }) => {
    // First sign in using the more reliable flow from above
    await page.goto(PROTECTED_ROUTE);
    await page.waitForURL(
      (url) =>
        url.pathname === API_AUTH_SIGNIN &&
        url.searchParams.get("callbackUrl") === PROTECTED_ROUTE,
    );

    await page.fill('input[name="username"]', USERNAME);
    await page.fill('input[name="password"]', PASSWORD);

    await Promise.all([
      page.waitForRequest(
        (request) =>
          request.method() === "POST" &&
          request.url().includes("/api/auth/callback/credentials"),
      ),
      page.click('button[type="submit"]'),
    ]);

    await page.waitForURL(PROTECTED_ROUTE, { timeout: 20000 });
    await page.waitForLoadState("domcontentloaded");

    // Now handle sign out
    const signOutButton = page.getByRole("button", { name: /sign out/i });
    await Promise.all([page.waitForURL(HOME_ROUTE), signOutButton.click()]);

    // Verify we're logged out by trying to access protected route
    await page.goto(PROTECTED_ROUTE);
    await page.waitForURL(
      (url) =>
        url.pathname === API_AUTH_SIGNIN &&
        url.searchParams.get("callbackUrl") === PROTECTED_ROUTE,
    );
  });
});
