import { test as base, expect } from "@playwright/test";
import type { Page, BrowserContext } from "@playwright/test";

/** Shared helpers and selectors used across smoke specs. */

const LOBBY = {
  logo: () => (page: Page) => page.getByRole("img", { name: "Logo" }),
  appName: () => (page: Page) => page.getByText("Peerix Talk"),
  roomId: () => (page: Page) => page.getByText(/#[\w-]+/),
  // Use .or() to match either on/off state — avoids stale locator after toggle
  micButton: () => (page: Page) =>
    page
      .getByRole("button", { name: "Turn on microphone" })
      .or(page.getByRole("button", { name: "Turn off microphone" })),
  camButton: () => (page: Page) =>
    page
      .getByRole("button", { name: "Turn on camera" })
      .or(page.getByRole("button", { name: "Turn off camera" })),
  micDropdown: () => (page: Page) =>
    page.getByRole("button", { name: "Select microphone" }),
  camDropdown: () => (page: Page) =>
    page.getByRole("button", { name: "Select camera" }),
  nameInput: () => (page: Page) =>
    page.getByRole("textbox", { name: "Your name" }),
  joinButton: () => (page: Page) =>
    page.getByRole("button", { name: "Join room" }),
};

const ROOM = {
  timer: () => (page: Page) => page.getByText(/#[\w-]+ · \d{2}:\d{2}/),
  micButton: () => (page: Page) =>
    page
      .getByRole("button", { name: "Turn on microphone" })
      .or(page.getByRole("button", { name: "Turn off microphone" })),
  camButton: () => (page: Page) =>
    page
      .getByRole("button", { name: "Turn on camera" })
      .or(page.getByRole("button", { name: "Turn off camera" })),
  shareScreen: () => (page: Page) =>
    page.getByRole("button", { name: "Share screen" }),
  toggleChat: () => (page: Page) =>
    page.getByRole("button", { name: "Toggle chat" }),
  shareRoom: () => (page: Page) =>
    page.getByRole("button", { name: "Share room" }),
  leaveButton: () => (page: Page) =>
    page.getByRole("button", { name: "Leave room" }),
  chatClose: () => (page: Page) =>
    page.getByRole("button", { name: "Close chat" }),
  chatInput: () => (page: Page) =>
    page.getByRole("textbox", { name: "Type a message" }),
  sendButton: () => (page: Page) => page.getByRole("button", { name: "Send" }),
};

const SHARE = {
  dialog: () => (page: Page) => page.getByRole("dialog"),
  title: () => (page: Page) =>
    page.getByRole("heading", { name: "Invite link" }),
  qrImage: () => (page: Page) =>
    page.getByRole("img", { name: "QR code for invite link" }),
  linkInput: () => (page: Page) =>
    page.getByRole("textbox", { name: "Invite link" }),
  copyButton: () => (page: Page) =>
    page.getByRole("button", { name: "Copy link" }),
  closeButton: () => (page: Page) =>
    page.getByRole("button", { name: "Close" }),
};

/**
 * Set localStorage via context init script (runs before page load).
 */
export async function withStorage(
  context: BrowserContext,
  storage: Record<string, string>,
) {
  await context.addInitScript(
    ({ data }) => {
      for (const [key, value] of Object.entries(data)) {
        localStorage.setItem(key, value);
      }
    },
    { data: storage },
  );
}

export { LOBBY, ROOM, SHARE };
export { expect };
export { base as test };
