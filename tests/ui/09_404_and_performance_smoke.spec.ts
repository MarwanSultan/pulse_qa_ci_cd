import { test, expect } from '../fixtures/testFixtures';
import { env } from '../../src/config/env';
import { getNavigationDurationMs } from '../../src/utils/performance';

test('F10: Graceful 404 experience and baseline load performance', async ({ page }) => {
  // Baseline performance budget for homepage load (enterprise-friendly smoke).
  await page.goto('/');
  const homepageLoadMs = await getNavigationDurationMs(page);
  expect(
    homepageLoadMs,
    `Homepage navigation duration ${homepageLoadMs}ms exceeded MAX_PAGE_LOAD_MS=${env.maxPageLoadMs}ms`,
  ).toBeLessThanOrEqual(env.maxPageLoadMs);

  // Error handling for unknown routes.
  const bogusPath = `/__qa_non_existent_${Date.now()}__`;
  const response = await page.goto(bogusPath, { waitUntil: 'domcontentloaded' });
  if (response) {
    expect(response.status(), `Expected 4xx for bogus path ${bogusPath}`).toBeGreaterThanOrEqual(400);
  }

  await expect(
    page.getByText(/404|not found|page not found/i),
  ).toBeVisible();
});

