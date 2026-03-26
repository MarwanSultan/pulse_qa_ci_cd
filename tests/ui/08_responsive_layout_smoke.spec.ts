import { test, expect } from '../fixtures/testFixtures';
import { HomePage } from '../../src/pages/home/HomePage';

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

      await expect(homePage.marketplace.marketplaceCtaLink()).toBeVisible();
      await expect(homePage.updates.viewFullChangelogLink()).toBeVisible();
      await expect(page.getByRole('heading', { name: /Upcoming Events/i })).toBeVisible();
    });
  }
});

