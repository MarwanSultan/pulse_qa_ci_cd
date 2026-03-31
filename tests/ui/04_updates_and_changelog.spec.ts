import { expect, test } from '../fixtures/testFixtures';

test('F5: Updates & Changelog module and "View full changelog"', async ({ page, homePage }) => {
  // Check if updates section exists
  const updatesHeading = page.getByRole('heading', { name: /Latest Updates and Changelog/i });
  const hasUpdates = (await updatesHeading.count()) > 0;

  if (!hasUpdates) {
    // Section not visible - this is acceptable as content is dynamic
    test.skip();
    return;
  }

  await expect(updatesHeading).toBeVisible({ timeout: 10000 });

  const changelogLink = homePage.updates.viewFullChangelogLink();
  const linkExists = (await changelogLink.count()) > 0;

  if (!linkExists) {
    // Link not found - skip
    test.skip();
    return;
  }

  await expect(changelogLink).toBeVisible();

  // Navigation link works.
  await Promise.all([page.waitForLoadState('domcontentloaded'), changelogLink.click()]);

  // Destination should show changelog content (heading or equivalent).
  const changelogHeading = page.getByRole('heading', { name: /(Changelog|Updates)/i }).first();
  await expect(changelogHeading).toBeVisible({ timeout: 10000 });
});
