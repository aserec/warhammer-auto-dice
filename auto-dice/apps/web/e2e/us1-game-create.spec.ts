import { expect, test } from "@playwright/test";

test("US1: create game, reload, see both players", async ({ page }) => {
  await page.goto("/games/new");
  await page.locator("#p1").fill("Alpha");
  await page.locator("#p2").fill("Beta");
  await page.getByRole("button", { name: /Create & save/i }).click();
  await page.waitForURL(/\/games\/.+/);
  await expect(page.getByText("Alpha", { exact: true })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText("Beta", { exact: true })).toBeVisible({ timeout: 30_000 });
  await page.reload();
  await expect(page.getByText("Alpha", { exact: true })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText("Beta", { exact: true })).toBeVisible({ timeout: 30_000 });
});
