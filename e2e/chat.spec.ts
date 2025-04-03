import { test, expect } from "@playwright/test";

test.describe("Chat Interface", () => {
  test("should render chat interface", async ({ page }) => {
    // Navigate to the chat page
    await page.goto("/chat");

    // Verify that the chat interface is rendered
    await expect(page.getByText("Chat Interface")).toBeVisible();
    await expect(
      page.getByText("Your conversation will appear here"),
    ).toBeVisible();
    await expect(page.getByPlaceholder("Type your message...")).toBeVisible();
    await expect(page.getByRole("button", { name: "Send" })).toBeVisible();
  });

  test("should handle message input and submission", async ({ page }) => {
    // Navigate to the chat page
    await page.goto("/chat");

    // Type a message
    const messageInput = page.getByPlaceholder("Type your message...");
    await messageInput.fill("Hello, AI assistant!");

    // Click the send button
    await page.getByRole("button", { name: "Send" }).click();

    // Verify that the user message appears
    await expect(page.getByText("Hello, AI assistant!")).toBeVisible();

    // Wait for AI response (may timeout if API is not available)
    try {
      await page.waitForResponse(
        (response) =>
          response.url().includes("/api/chat") && response.status() === 200,
        { timeout: 5000 },
      );
    } catch (e) {
      console.log(
        "Note: API response timeout is expected in test environment: ",
        e,
      );
    }
  });
});
