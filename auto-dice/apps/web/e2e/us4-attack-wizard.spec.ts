import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { goldenRosterPath } from "./fixture-paths";

const fixture = readFileSync(goldenRosterPath("votann"), "utf8");

test("US4: attack wizard shows summary after selections", async ({ page }) => {
  await page.goto("/games/new");
  await page.locator("#p1").fill("A");
  await page.locator("#p2").fill("B");
  await page.getByRole("button", { name: /Create & save/i }).click();
  for (let i = 0; i < 2; i++) {
    await page.getByRole("button", { name: /Import JSON roster/i }).nth(i).click();
    const dlg = page.getByRole("dialog").last();
    await dlg.getByPlaceholder('{"roster":{...}}').fill(fixture, { timeout: 180_000 });
    await dlg.getByRole("button", { name: /^Parse$/i }).click();
    await expect(page.getByRole("button", { name: /Confirm roster/i })).toBeVisible();
    await page.getByRole("button", { name: /Confirm roster/i }).click();
  }
  await page.getByRole("link", { name: /Attack wizard/i }).click();
  await page.getByRole("group", { name: /Attacking unit/i }).getByRole("button").first().click();
  await page.getByRole("group", { name: /Defending unit/i }).getByRole("button").first().click();
  await page.getByRole("group", { name: /Weapon selection/i }).getByRole("button").first().click();
  await expect(page.getByText("Attack summary")).toBeVisible();
});
