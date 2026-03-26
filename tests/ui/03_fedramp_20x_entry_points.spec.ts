import { test, expect } from '../fixtures/testFixtures';

test('F4: FedRAMP 20x entry points navigate and render', async ({ page, homePage }) => {
  const link = homePage.header.fedramp20xLink();
  await expect(link).toBeVisible();

  await Promise.all([page.waitForLoadState('domcontentloaded'), link.click()]);

  await expect(page.getByRole('heading', { name: /FedRAMP 20x/i })).toBeVisible();

  // Basic presence checks for commonly referenced FedRAMP 20x sub-sections.
  const phaseOrOverviewLinks = page.locator('a').filter({ hasText: /(Overview|Goals|Phase One|Phase Two)/i });
  await expect(phaseOrOverviewLinks.first()).toBeVisible();
});

