import { test, expect } from '../fixtures/testFixtures';
import { env } from '../../src/config/env';
import { getNavigationDurationMs } from '../../src/utils/performance';

test('Performance: homepage navigation duration stays within budget', async ({ page }) => {
  await page.goto('/');
  const navMs = await getNavigationDurationMs(page);

  expect(
    navMs,
    `navigation duration ${navMs}ms exceeded budget ${env.maxPageLoadMs}ms`,
  ).toBeLessThanOrEqual(env.maxPageLoadMs);
});
