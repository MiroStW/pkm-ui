import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

// Mock function to bypass authentication for testing
async function mockLogin(page: Page): Promise<void> {
  await page.goto("/chat");

  // Check if we need to log in
  if (page.url().includes("/auth/login")) {
    // Fill in test credentials
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "password");
    await page.click('button[type="submit"]');

    // Wait for redirect to chat page
    await page.waitForURL("/chat");
  }
}

test.describe("Search Filters Feature", () => {
  test("search filters button exists and opens dialog", async ({ page }) => {
    await mockLogin(page);

    // Verify the search filters button exists
    const filtersButton = page.locator('button[title="Search Filters"]');
    await expect(filtersButton).toBeVisible();

    // Click the filters button
    await filtersButton.click();

    // Verify the dialog is open with filter options
    await expect(page.locator('div[role="dialog"]')).toBeVisible();
    await expect(page.getByText("Date Range")).toBeVisible();
    await expect(page.getByText("Categories")).toBeVisible();
    await expect(page.getByText("Search Scope")).toBeVisible();

    // Close the dialog
    await page.keyboard.press("Escape");
  });

  test("changing filters and sending a message", async ({ page }) => {
    await mockLogin(page);

    // Open filters dialog
    await page.locator('button[title="Search Filters"]').click();

    // Select a category
    await page.getByText("notes").click();

    // Change search scope to recent
    await page.getByText("Recent Documents (last 30 days)").click();

    // Apply filters
    await page.getByRole("button", { name: "Apply Filters" }).click();

    // Verify dialog is closed
    await expect(page.locator('div[role="dialog"]')).not.toBeVisible();

    // Send a message
    await page.fill(
      'input[placeholder="Type your message..."]',
      "Test message with filters",
    );
    await page.click('button[type="submit"]');

    // Wait for response
    await page.waitForSelector('div[class*="message"]', { timeout: 10000 });

    // Verify there is a response
    const responseMessage = page.locator('div[class*="message"]').last();
    await expect(responseMessage).toBeVisible();
  });

  test("resetting filters", async ({ page }) => {
    await mockLogin(page);

    // Open filters dialog
    await page.locator('button[title="Search Filters"]').click();

    // Select multiple categories
    await page.getByText("notes").click();
    await page.getByText("recipes").click();

    // Change scope to category
    await page.getByLabel("Selected Categories Only").click();

    // Add date range
    await page.fill('input[id="start-date"]', "2023-01-01");
    await page.fill('input[id="end-date"]', "2023-12-31");

    // Reset filters
    await page.getByRole("button", { name: "Reset Filters" }).click();

    // Verify dialog is closed
    await expect(page.locator('div[role="dialog"]')).not.toBeVisible();

    // Reopen to check if filters were reset
    await page.locator('button[title="Search Filters"]').click();

    // Verify date fields are empty
    await expect(page.locator('input[id="start-date"]')).toHaveValue("");
    await expect(page.locator('input[id="end-date"]')).toHaveValue("");

    // Verify "All Documents" is selected
    await expect(
      page.locator('input[name="search-scope"]').first(),
    ).toBeChecked();

    // Verify no categories are selected
    for (const category of ["notes", "recipes"]) {
      await expect(
        page.getByLabel(category).locator('input[type="checkbox"]'),
      ).not.toBeChecked();
    }

    // Close dialog
    await page.keyboard.press("Escape");
  });
});
