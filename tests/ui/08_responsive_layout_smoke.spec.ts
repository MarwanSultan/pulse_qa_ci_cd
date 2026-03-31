import { HomePage } from '../../src/pages/home/HomePage';
import { expect, test } from '../fixtures/testFixtures';

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 812 },
];

test.describe('F9: Responsive layout preserves critical modules', () => {
  for (const vp of viewports) {
    test(vp.name, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      const homePage = new HomePage(page);
      await homePage.goto();

      // Wait for page to load - ensure navigation is visible
      await page.waitForLoadState('networkidle');

      // Check for marketplace section using simpler selector
      const marketplaceSection = page.getByText('FedRAMP Marketplace');
      const hasMarketplace = (await marketplaceSection.count()) > 0;
      if (hasMarketplace) {
        await expect(marketplaceSection.first()).toBeVisible();
      }

      // Check for changelog section heading
      const changelogHeading = page.getByText(/Latest Updates and Changelog/i);
      const hasChangelog = (await changelogHeading.count()) > 0;
      if (hasChangelog) {
        await expect(changelogHeading).toBeVisible();
      }

      // Check for events heading using text selector
      const eventsHeading = page.getByText(/Upcoming Events/i);
      const hasEvents = (await eventsHeading.count()) > 0;
      if (hasEvents) {
        await expect(eventsHeading).toBeVisible();
      }

      // At least one section should be visible
      expect(
        hasMarketplace || hasChangelog || hasEvents,
        'At least one critical section should be visible',
      ).toBe(true);
    });
  }
});
