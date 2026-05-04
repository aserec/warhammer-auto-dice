import { expect, test } from "@playwright/test";

test("US3: when BCP fetch fails, manual JSON import fallback is shown", async ({ page }) => {
  await page.route("**/api/bcp/match**", (route) => route.fulfill({ status: 500, body: "{}" }));
  await page.goto("/games/new");
  await expect(page.getByText(/Could not load Best Coast Pairings lists/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /manual JSON list import/i })).toBeVisible();
});
