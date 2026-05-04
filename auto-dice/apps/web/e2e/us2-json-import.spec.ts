import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { goldenRosterPath } from "./fixture-paths";

const fixture = readFileSync(goldenRosterPath("votann"), "utf8");

test("US2: import JSON roster and see review table", async ({ page }) => {
  await page.goto("/games/new");
  await page.locator("#p1").fill("P1");
  await page.locator("#p2").fill("P2");
  await page.getByRole("button", { name: /Create & save/i }).click();
  await page.getByRole("button", { name: /Import JSON roster/i }).nth(0).click();
  const dlg = page.getByRole("dialog").last();
  await dlg.getByPlaceholder('{"roster":{...}}').fill(fixture, { timeout: 180_000 });
  await dlg.getByRole("button", { name: /^Parse$/i }).click();
  await expect(page.getByRole("button", { name: /Confirm roster/i })).toBeVisible();
  await page.getByRole("button", { name: /Confirm roster/i }).click();
  await expect(page.getByRole("columnheader", { name: "Unit" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Weapons" })).toBeVisible();
});
