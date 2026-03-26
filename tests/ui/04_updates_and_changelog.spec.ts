import { test, expect } from '../fixtures/testFixtures';

test('F5: Updates & Changelog module and "View full changelog"', async ({ page, homePage }) => {
  // Module renders.
  await homePage.updates.expectUpdatesVisible();
  await expect(homePage.updates.viewFullChangelogLink()).toBeVisible();

  // Navigation link works.
  await Promise.all([
    page.waitForLoadState('domcontentloaded'),
    homePage.updates.viewFullChangelogLink().click(),
  ]);

  // Destination should show changelog content (heading or equivalent).
  await expect(
    page.getByRole('heading', { name: /(Changelog|Updates)/i }),
  ).toBeVisible();
});

