import { test, expect } from "./fixtures";
import { withStorage } from "./fixtures";

test.describe("i18n", () => {
  test("all strings render correctly in German", async ({ page, context }) => {
    // Set language to German via context init script
    await withStorage(context, { i18nextLng: "de" });

    await page.goto("/");

    // Verify German translations are present
    await expect(page.getByText("Peerix Talk")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Mikrofon einschalten" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Kamera einschalten" }),
    ).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Ihr Name" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Raum betreten" }),
    ).toBeVisible();

    // Verify placeholder is translated
    const input = page.getByRole("textbox", { name: "Ihr Name" });
    const placeholder = await input.getAttribute("placeholder");
    expect(placeholder).toBe("Gast");
  });

  test("language switch persists across navigation", async ({
    page,
    context,
  }) => {
    // Set language to German via context init script
    await withStorage(context, { i18nextLng: "de" });

    await page.goto("/");
    await expect(
      page.getByRole("button", { name: "Raum betreten" }),
    ).toBeVisible();

    // Navigate and reload
    await page.reload();
    await expect(
      page.getByRole("button", { name: "Raum betreten" }),
    ).toBeVisible();
  });
});
