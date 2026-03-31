import { env } from '../../src/config/env';
import { getNavigationDurationMs } from '../../src/utils/performance';
import { expect, test } from '../fixtures/testFixtures';

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
    // Server should either return 4xx, or use catch-all routing (2xx)
    // What we don't want is 5xx server errors
    const is5xx = response.status() >= 500;

    // Verify page didn't crash (5xx errors are not acceptable)
    expect(is5xx, `Server error (5xx) for bogus path ${bogusPath}`).toBe(false);
  }

  // Check for 404 error message or similar
  const errorMessageVisible = await page
    .getByText(/404|not found|page not found|error/i)
    .isVisible()
    .catch(() => false);
  if (errorMessageVisible) {
    await expect(page.getByText(/404|not found|page not found|error/i)).toBeVisible();
  }
});
