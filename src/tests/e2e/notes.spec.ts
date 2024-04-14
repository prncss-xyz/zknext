import { test, expect } from "@playwright/test";
import { PORT } from "./utils";

test("should navigate to the note and properly render contents", async ({
  page,
}) => {
  await page.goto(`http://localhost:${PORT}/notes`);
  await page.click("text='title a'");
  await expect(page.locator("h1")).toContainText("title a");
});
