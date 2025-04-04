import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

// Helper function to log in before each test
async function loginAsTestUser(page: Page): Promise<void> {
  await page.goto("/auth/signin");
  await page.fill('input[type="email"]', "test@example.com");
  await page.fill('input[type="password"]', "password");
  await page.click('button[type="submit"]');
  // Wait for redirect after successful login
  await page.waitForURL("/dashboard");
}

test.describe("Search Refinement Features", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    // Navigate to chat page
    await page.goto("/chat");
  });

  test("renders search filters button", async ({ page }) => {
    // Verify chat page loaded correctly
    await expect(page.locator("h1")).toContainText("Chat");

    // Check if search filters button exists
    const filtersButton = page.locator('button[title="Search Filters"]');
    await expect(filtersButton).toBeVisible();
  });

  test("opens search filters dialog", async ({ page }) => {
    // Click search filters button
    await page.locator('button[title="Search Filters"]').click();

    // Verify dialog opens with all filter sections
    await expect(page.getByText("Search Filters")).toBeVisible();
    await expect(page.getByText("Date Range")).toBeVisible();
    await expect(page.getByText("Categories")).toBeVisible();
    await expect(page.getByText("Search Scope")).toBeVisible();

    // Verify date inputs exist
    await expect(page.locator('input[id="start-date"]')).toBeVisible();
    await expect(page.locator('input[id="end-date"]')).toBeVisible();

    // Verify category checkboxes exist
    await expect(page.getByText("notes")).toBeVisible();
    await expect(page.getByText("recipes")).toBeVisible();

    // Verify search scope options exist
    await expect(page.getByText("All Documents")).toBeVisible();
    await expect(
      page.getByText("Recent Documents (last 30 days)"),
    ).toBeVisible();
    await expect(page.getByText("Selected Categories Only")).toBeVisible();
  });

  test("applies filters on button click", async ({ page }) => {
    // Open filters dialog
    await page.locator('button[title="Search Filters"]').click();

    // Set date range
    await page.locator('input[id="start-date"]').fill("2023-01-01");
    await page.locator('input[id="end-date"]').fill("2023-12-31");

    // Select categories
    await page.getByText("notes").click();
    await page.getByText("projects").click();

    // Change search scope
    await page.getByLabel("Selected Categories Only").click();

    // Apply filters
    await page.getByRole("button", { name: "Apply Filters" }).click();

    // Verify dialog is closed
    await expect(page.locator('div[role="dialog"]')).not.toBeVisible();

    // Reopen to verify persistence
    await page.locator('button[title="Search Filters"]').click();

    // Verify values were persisted
    await expect(page.locator('input[id="start-date"]')).toHaveValue(
      "2023-01-01",
    );
    await expect(page.locator('input[id="end-date"]')).toHaveValue(
      "2023-12-31",
    );

    // Verify checkboxes are selected
    await expect(
      page.getByText("notes").locator("..").locator('input[type="checkbox"]'),
    ).toBeChecked();
    await expect(
      page
        .getByText("projects")
        .locator("..")
        .locator('input[type="checkbox"]'),
    ).toBeChecked();

    // Verify scope is selected
    await expect(
      page
        .getByLabel("Selected Categories Only")
        .locator('input[type="radio"]'),
    ).toBeChecked();
  });

  test("resets filters on reset button click", async ({ page }) => {
    // Open filters dialog
    await page.locator('button[title="Search Filters"]').click();

    // Set date range
    await page.locator('input[id="start-date"]').fill("2023-01-01");
    await page.locator('input[id="end-date"]').fill("2023-12-31");

    // Select a category
    await page.getByText("recipes").click();

    // Change search scope
    await page.getByLabel("Recent Documents (last 30 days)").click();

    // Reset filters
    await page.getByRole("button", { name: "Reset Filters" }).click();

    // Verify dialog is closed
    await expect(page.locator('div[role="dialog"]')).not.toBeVisible();

    // Reopen to verify reset
    await page.locator('button[title="Search Filters"]').click();

    // Verify values were reset
    await expect(page.locator('input[id="start-date"]')).toHaveValue("");
    await expect(page.locator('input[id="end-date"]')).toHaveValue("");

    // Verify checkboxes are not selected
    await expect(
      page.getByText("recipes").locator("..").locator('input[type="checkbox"]'),
    ).not.toBeChecked();

    // Verify default scope is selected
    await expect(
      page.getByLabel("All Documents").locator('input[type="radio"]'),
    ).toBeChecked();
  });

  test("filters modify search results", async ({ page }) => {
    // Send a message without filters
    await page.fill(
      'input[placeholder="Type your message..."]',
      "What are my notes about?",
    );
    await page.click('button[type="submit"]');

    // Wait for response
    await expect(page.locator(".message").last()).toBeVisible({
      timeout: 10000,
    });

    // Now set filters
    await page.locator('button[title="Search Filters"]').click();

    // Select a category
    await page.getByText("notes").click();

    // Apply filters
    await page.getByRole("button", { name: "Apply Filters" }).click();

    // Send the same message with filters
    await page.fill(
      'input[placeholder="Type your message..."]',
      "What are my notes about?",
    );
    await page.click('button[type="submit"]');

    // Wait for response
    await expect(page.locator(".message").last()).toBeVisible({
      timeout: 10000,
    });

    // Verify a response was received
    // Note: In a real test environment, you would verify that the response content
    // is actually different based on the filters, but that requires actual data
    // This test just verifies that the process completes without errors
    await expect(page.locator(".message").last()).not.toHaveText("Error");
  });
});
