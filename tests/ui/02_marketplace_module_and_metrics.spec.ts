import { test, expect } from '../fixtures/testFixtures';

test('F2/F3: Marketplace CTA and summary metrics render', async ({ homePage }) => {
  // Functionality 2: Marketplace module entry point.
  await expect(homePage.marketplace.marketplaceCtaLink()).toBeVisible();

  // Functionality 3: Summary metrics (count + recency list).
  await expect(homePage.marketplace.totalServicesLabel()).toBeVisible();
  await expect(homePage.marketplace.totalServicesCountText()).toBeVisible();

  await expect(homePage.marketplace.addedLast30DaysLabel()).toBeVisible();
  await expect(homePage.marketplace.addedLast30DaysItems().first()).toBeVisible();
});

