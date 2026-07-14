import { test, expect } from "./fixtures";

test.describe("Multi-peer", () => {
  test("both peers visible in video grid", async ({ browser }) => {
    test.setTimeout(90_000);

    // BroadcastChannelDriver requires both peers in the same browser context
    // Set a fixed room ID via hash before pages load so both peers join the same room
    const context = await browser.newContext();
    await context.addInitScript(() => (location.hash = "#smoke-test-room"));

    const page1 = await context.newPage();
    const page2 = await context.newPage();

    // Peer 1 joins
    await page1.goto("/");
    await expect(page1.getByRole("img", { name: "Logo" })).toBeVisible();
    await page1.getByRole("textbox", { name: /Your name/i }).fill("Peer 1");
    await page1.getByRole("button", { name: "Join room" }).click();
    await expect(page1.getByText(/#[\w-]+ \u00b7 \d{2}:\d{2}/)).toBeVisible({
      timeout: 15_000,
    });

    // Peer 2 joins same room (same context = BroadcastChannel works, same hash = same room)
    await page2.goto("/");
    await expect(page2.getByRole("img", { name: "Logo" })).toBeVisible();
    await page2.getByRole("textbox", { name: /Your name/i }).fill("Peer 2");
    await page2.getByRole("button", { name: "Join room" }).click();
    await expect(page2.getByText(/#[\w-]+ \u00b7 \d{2}:\d{2}/)).toBeVisible({
      timeout: 15_000,
    });

    // Wait for peers to connect via WebRTC
    await page1.waitForTimeout(10000);

    // Both peers should see each other in the video grid
    await expect(page1.getByText("Peer 1")).toBeVisible();
    await expect(page1.getByText("Peer 2")).toBeVisible();

    await expect(page2.getByText("Peer 1")).toBeVisible();
    await expect(page2.getByText("Peer 2")).toBeVisible();

    await context.close();
  });

  test("cross-peer chat delivers messages with correct author and timestamp", async ({
    browser,
  }) => {
    test.setTimeout(90_000);

    // BroadcastChannelDriver requires both peers in the same browser context
    const context = await browser.newContext();
    await context.addInitScript(() => (location.hash = "#smoke-test-room"));

    const page1 = await context.newPage();
    const page2 = await context.newPage();

    // Both peers join
    await page1.goto("/");
    await page1.getByRole("textbox", { name: /Your name/i }).fill("Peer 1");
    await page1.getByRole("button", { name: "Join room" }).click();
    await expect(page1.getByText(/#[\w-]+ \u00b7 \d{2}:\d{2}/)).toBeVisible({
      timeout: 15_000,
    });

    await page2.goto("/");
    await page2.getByRole("textbox", { name: /Your name/i }).fill("Peer 2");
    await page2.getByRole("button", { name: "Join room" }).click();
    await expect(page2.getByText(/#[\w-]+ \u00b7 \d{2}:\d{2}/)).toBeVisible({
      timeout: 15_000,
    });

    // Wait for connection
    await page1.waitForTimeout(10000);

    // Peer 1 opens chat and sends message
    await page1.getByRole("button", { name: "Toggle chat" }).click();
    await page1
      .getByRole("textbox", { name: /Type a message/i })
      .fill("Cross-peer test message");
    await page1.getByRole("button", { name: "Send" }).click();

    // Wait for message to be delivered
    await page2.waitForTimeout(5000);

    // Peer 2 should see the message in chat (opens automatically on message receive)
    // Scope to chat panel to avoid matching video tile names
    const chatPanel = page2.locator('[data-slot="card-content"]');
    await expect(chatPanel.getByText("Peer 1")).toBeVisible();
    await expect(chatPanel.getByText("Cross-peer test message")).toBeVisible();

    // Timestamp should be present
    const timePattern = /(\d{1,2}:\d{2} (AM|PM))|([01]\d|2[0-3]):[0-5]\d/;
    await expect(chatPanel.getByText(timePattern)).toBeVisible();

    await context.close();
  });
});
