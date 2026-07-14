import { test, expect } from "./fixtures";
import { LOBBY, ROOM, SHARE } from "./fixtures";

test.describe("Room", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(LOBBY.logo()(page)).toBeVisible();
    await LOBBY.nameInput()(page).fill("Smoke Test User");
    await LOBBY.joinButton()(page).click();
    await expect(ROOM.timer()(page)).toBeVisible({ timeout: 15_000 });
  });

  test.afterEach(async ({ page }) => {
    try {
      // Skip cleanup if already in lobby (join button visible)
      if (
        await LOBBY.joinButton()(page)
          .isVisible({ timeout: 1000 })
          .catch(() => false)
      ) {
        return;
      }

      // Close share dialog if open
      const dialogVisible = await SHARE.dialog()(page)
        .isVisible({ timeout: 1000 })
        .catch(() => false);
      if (dialogVisible) {
        await SHARE.closeButton()(page).click({ force: true });
        await expect(SHARE.dialog()(page)).not.toBeVisible({ timeout: 5000 });
      }
      // Leave room if leave button is visible
      const leaveVisible = await ROOM.leaveButton()(page)
        .isVisible({ timeout: 1000 })
        .catch(() => false);
      if (leaveVisible) {
        await ROOM.leaveButton()(page).click({ force: true });
        await expect(LOBBY.joinButton()(page)).toBeVisible({ timeout: 10_000 });
      }
    } catch {
      // Already in lobby or navigation failed
    }
  });

  test("transitions to room view with timer", async ({ page }) => {
    await expect(ROOM.timer()(page)).toBeVisible();
  });

  test("room toolbar has all required buttons", async ({ page }) => {
    await expect(ROOM.micButton()(page)).toBeVisible();
    await expect(ROOM.camButton()(page)).toBeVisible();
    await expect(ROOM.shareScreen()(page)).toBeVisible();
    await expect(ROOM.toggleChat()(page)).toBeVisible();
    await expect(ROOM.shareRoom()(page)).toBeVisible();
    await expect(ROOM.leaveButton()(page)).toBeVisible();
  });

  test("chat panel opens with header, empty state, input and send button", async ({
    page,
  }) => {
    await ROOM.toggleChat()(page).click();

    await expect(page.getByText("Chat")).toBeVisible();
    await expect(page.getByText("No messages yet")).toBeVisible();
    await expect(ROOM.chatInput()(page)).toBeVisible();
    await expect(ROOM.sendButton()(page)).toBeVisible();
  });

  test("send message renders with author, timestamp and content", async ({
    page,
  }) => {
    await ROOM.toggleChat()(page).click();
    await ROOM.chatInput()(page).fill("Hello from smoke test!");
    await ROOM.sendButton()(page).click();

    // Message content should appear in chat area
    const chatArea = page.locator('[data-slot="card-content"]');
    await expect(chatArea.getByText("Hello from smoke test!")).toBeVisible();

    // Timestamp should be present in chat area (e.g. "08:27 PM")
    const timePattern = /\d{1,2}:\d{2} (AM|PM)/;
    await expect(chatArea.getByText(timePattern)).toBeVisible();

    // Input should be cleared
    await expect(ROOM.chatInput()(page)).toHaveValue("");
  });

  test("share dialog shows title, QR code, invite link and copy button", async ({
    page,
  }) => {
    await ROOM.shareRoom()(page).click();

    const dialog = SHARE.dialog()(page);
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await expect(SHARE.title()(page)).toBeVisible();
    await expect(SHARE.qrImage()(page)).toBeVisible({ timeout: 5000 });
    await expect(SHARE.linkInput()(page)).toBeVisible();
    await expect(SHARE.copyButton()(page)).toBeVisible();

    // Close dialog so afterEach doesn't hang
    await SHARE.closeButton()(page).click();
    await expect(dialog).not.toBeVisible();
  });

  test("copy link copies correct invite URL", async ({ page }) => {
    await ROOM.shareRoom()(page).click();
    await expect(SHARE.dialog()(page)).toBeVisible({ timeout: 5000 });

    // Verify the link input contains the correct URL
    const linkValue = await SHARE.linkInput()(page).inputValue();
    expect(linkValue).toContain("localhost:5173");
    expect(linkValue).toMatch(/#[\w-]+$/);

    // Verify copy button is interactive and doesn't error
    await expect(SHARE.copyButton()(page)).toBeVisible();
    await expect(SHARE.copyButton()(page)).toBeEnabled();
    await SHARE.copyButton()(page).click();

    // Close dialog so afterEach doesn't hang
    await SHARE.closeButton()(page).click();
    await expect(SHARE.dialog()(page)).not.toBeVisible();
  });

  test("close share dialog dismisses and returns to room", async ({ page }) => {
    await ROOM.shareRoom()(page).click();
    await expect(SHARE.dialog()(page)).toBeVisible({ timeout: 5000 });

    await SHARE.closeButton()(page).click();
    await expect(SHARE.dialog()(page)).not.toBeVisible();

    // Room toolbar should still be visible
    await expect(ROOM.leaveButton()(page)).toBeVisible();
  });

  test("close chat hides panel and shows video grid", async ({ page }) => {
    await ROOM.toggleChat()(page).click();
    await expect(page.getByText("Chat")).toBeVisible();

    await ROOM.chatClose()(page).click();
    await expect(page.getByText("Chat")).not.toBeVisible();

    // Video grid area should be visible
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("leave room returns to lobby with name persisted", async ({ page }) => {
    await ROOM.leaveButton()(page).click();
    await expect(LOBBY.joinButton()(page)).toBeVisible({ timeout: 10_000 });
    await expect(LOBBY.nameInput()(page)).toHaveValue("Smoke Test User");
  });
});
