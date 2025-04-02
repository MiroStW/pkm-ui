import { test, expect } from "@playwright/test";

// This test suite focuses on the protected routes after authentication
test.describe("Protected Routes", () => {
  // Use the auth setup to ensure we have a logged-in session
  test.use({ storageState: "./playwright/.auth/user.json" });

  test("should navigate between protected routes", async ({ page }) => {
    // Start at the protected page
    await page.goto("/protected");
    await expect(page).toHaveURL("/protected");

    // Check that we're logged in
    await expect(
      page.getByRole("heading", { name: "Protected Page" }),
    ).toBeVisible();

    // Navigate to Chat page
    await page.getByRole("link", { name: /chat/i }).click();
    await expect(page).toHaveURL("/protected/chat");
    await expect(page.getByRole("heading", { name: "Chat" })).toBeVisible();

    // Check chat interface elements
    await expect(
      page.getByRole("heading", { name: "Chat Interface" }),
    ).toBeVisible();
    await expect(page.getByPlaceholder("Type your message...")).toBeVisible();
    await expect(page.getByRole("button", { name: "Send" })).toBeVisible();

    // Navigate to Settings page
    await page.getByRole("link", { name: /settings/i }).click();
    await expect(page).toHaveURL("/protected/settings");
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();

    // Check settings sections
    await expect(
      page.getByRole("heading", { name: "Appearance" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Account" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Notifications" }),
    ).toBeVisible();
  });

  test("should have working theme toggle in header", async ({ page }) => {
    await page.goto("/protected");

    // Find and click the theme toggle button
    const themeToggle = page.getByRole("button", { name: "Toggle theme" });
    await expect(themeToggle).toBeVisible();

    // Open the dropdown
    await themeToggle.click();

    // Check that theme options are present
    await expect(page.getByText("Light")).toBeVisible();
    await expect(page.getByText("Dark")).toBeVisible();
    await expect(page.getByText("System")).toBeVisible();

    // Select Dark theme
    await page.getByText("Dark").click();

    // Check the HTML element for dark class (may need to wait for theme change)
    await expect(page.locator("html")).toHaveClass(/dark/);

    // Toggle again and select Light theme
    await themeToggle.click();
    await page.getByText("Light").click();

    // Check html no longer has dark class
    await expect(page.locator("html")).not.toHaveClass(/dark/);
  });

  test("should have a responsive layout with sidebar", async ({ page }) => {
    await page.goto("/protected/chat");

    // On larger screens, the sidebar should be visible
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(page.locator("nav").first()).toBeVisible();

    // On mobile screens, the sidebar should be hidden
    await page.setViewportSize({ width: 640, height: 800 });
    await expect(page.locator("nav").first()).not.toBeVisible();
  });

  test("chat interface should have basic input functionality", async ({
    page,
  }) => {
    await page.goto("/protected/chat");

    // Type a message
    const inputField = page.getByPlaceholder("Type your message...");
    await inputField.fill("Hello, this is a test message");

    // Check if the input has the value we typed
    await expect(inputField).toHaveValue("Hello, this is a test message");

    // Click send button (note: we're not testing the actual sending functionality yet,
    // just that the UI components work as expected)
    const sendButton = page.getByRole("button", { name: "Send" });
    await sendButton.click();
  });
});
