import { test, expect } from "./fixtures";
import { LOBBY } from "./fixtures";

test.describe("Lobby", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(LOBBY.logo()(page)).toBeVisible();
  });

  test("renders lobby with all required elements", async ({ page }) => {
    await expect(LOBBY.logo()(page)).toBeVisible();
    await expect(LOBBY.appName()(page)).toBeVisible();
    await expect(LOBBY.roomId()(page)).toBeVisible();
    await expect(LOBBY.micButton()(page)).toBeVisible();
    await expect(LOBBY.camButton()(page)).toBeVisible();
    await expect(LOBBY.nameInput()(page)).toBeVisible();
    await expect(LOBBY.joinButton()(page)).toBeVisible();
  });

  test("name input fills correctly", async ({ page }) => {
    const input = LOBBY.nameInput()(page);
    await input.fill("Smoke Test User");
    await expect(input).toHaveValue("Smoke Test User");
  });

  test("name persists in localStorage across navigations", async ({ page }) => {
    const input = LOBBY.nameInput()(page);
    await input.fill("Persisted User");

    // Navigate away and back
    await page.goto("/");
    await expect(LOBBY.logo()(page)).toBeVisible();
    await expect(input).toHaveValue("Persisted User");
  });

  test("mic toggle flips label on/off", async ({ page }) => {
    const btn = LOBBY.micButton()(page);

    // Initial state: microphone off
    await expect(btn).toBeVisible();
    await expect(btn).toHaveAttribute("aria-label", "Turn on microphone");

    // Toggle on
    await btn.click();
    await expect(btn).toHaveAttribute("aria-label", "Turn off microphone");

    // Toggle off
    await btn.click();
    await expect(btn).toHaveAttribute("aria-label", "Turn on microphone");
  });

  test("mic dropdown opens to show available microphones", async ({ page }) => {
    const dropdown = LOBBY.micDropdown()(page);
    await dropdown.click();

    // Dropdown menu should appear with device list
    const menu = page.getByRole("menu", { name: "Select microphone" });
    await expect(menu).toBeVisible();

    // Should have at least one device option
    const items = menu.getByRole("menuitemradio");
    await expect(items.first()).toBeVisible();

    // Close dropdown
    await page.keyboard.press("Escape");
  });

  test("cam toggle flips label on/off", async ({ page }) => {
    const btn = LOBBY.camButton()(page);

    // Initial state: camera off
    await expect(btn).toBeVisible();
    await expect(btn).toHaveAttribute("aria-label", "Turn on camera");

    // Toggle on
    await btn.click();
    await expect(btn).toHaveAttribute("aria-label", "Turn off camera");

    // Toggle off
    await btn.click();
    await expect(btn).toHaveAttribute("aria-label", "Turn on camera");
  });

  test("cam dropdown opens to show available cameras", async ({ page }) => {
    const dropdown = LOBBY.camDropdown()(page);
    await dropdown.click();

    // Dropdown menu should appear with device list
    const menu = page.getByRole("menu", { name: "Select camera" });
    await expect(menu).toBeVisible();

    // Should have at least one device option
    const items = menu.getByRole("menuitemradio");
    await expect(items.first()).toBeVisible();

    // Close dropdown
    await page.keyboard.press("Escape");
  });
});
