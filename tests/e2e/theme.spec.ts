import { test, expect } from "./fixtures";

test.describe("Theme", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("pressing 'd' cycles dark ↔ light", async ({ page }) => {
    await page.goto("/");

    // Click on page body to ensure focus is not on an editable element
    // (the key handler ignores key presses when an input is focused)
    await page.locator("body").click({ position: { x: 0, y: 0 } });

    // Read initial theme
    const initialTheme = await page.evaluate(() => {
      const root = document.documentElement;
      return root.classList.contains("dark") ? "dark" : "light";
    });

    // Press 'd' to toggle
    await page.keyboard.press("d");
    await page.waitForTimeout(300);

    const toggledTheme = await page.evaluate(() => {
      const root = document.documentElement;
      return root.classList.contains("dark") ? "dark" : "light";
    });

    // Theme should have changed
    expect(toggledTheme).not.toEqual(initialTheme);

    // Press 'd' again to toggle back
    await page.keyboard.press("d");
    await page.waitForTimeout(300);

    const finalTheme = await page.evaluate(() => {
      const root = document.documentElement;
      return root.classList.contains("dark") ? "dark" : "light";
    });

    // Should be back to initial theme
    expect(finalTheme).toEqual(initialTheme);
  });
});
