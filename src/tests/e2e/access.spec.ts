import { test, expect } from "@playwright/test";
import { PORT } from "./utils";

test("on localhost, should redirect / to /notes", async ({ page }) => {
  await page.goto(`http://localhost:${PORT}`);
  await page.waitForURL(`http://localhost:${PORT}/notes`);
});

test("from any other host than localhost, should redirect any page to /denied", async ({
  page,
}) => {
  await page.goto(`http://127.0.0.1:${PORT}/anything`);
  await expect(page.locator("h1")).toContainText("Access denied");
});
