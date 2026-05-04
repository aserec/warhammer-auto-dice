import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { goldenRosterPath } from "./fixture-paths";

const fixture = readFileSync(goldenRosterPath("votann"), "utf8");

test("US5: model stack +/- updates output", async ({ page }) => {
  await page.goto("/games/new");
  await page.locator("#p1").fill("A");
  await page.locator("#p2").fill("B");
  await page.getByRole("button", { name: /Create & save/i }).click();
  await page.getByRole("button", { name: /Import JSON roster/i }).nth(0).click();
  const dlg = page.getByRole("dialog").last();
  await dlg.getByPlaceholder('{"roster":{...}}').fill(fixture, { timeout: 180_000 });
  await dlg.getByRole("button", { name: /^Parse$/i }).click();
  await expect(page.getByRole("button", { name: /Confirm roster/i })).toBeVisible();
  await page.getByRole("button", { name: /Confirm roster/i }).click();
  const out = page.locator("output").first();
  const before = await out.textContent();
  await page.getByRole("button", { name: "+" }).first().click();
  const after = await out.textContent();
  expect(after).not.toBe(before);
});
