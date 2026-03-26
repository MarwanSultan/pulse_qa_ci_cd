import { test, expect } from './fixtures/testFixtures';
import { expectLinkHrefReturnsOk } from '../src/utils/http';

test('UI + API: clicking "View full changelog" resolves via HTTP', async ({ page, homePage, api }) => {
  // UI: navigate using the POM link.
  const link = homePage.updates.viewFullChangelogLink();
  await expect(link).toBeVisible();

  // Capture href before navigation for the API check.
  await expectLinkHrefReturnsOk(api, link);

  await Promise.all([
    page.waitForLoadState('domcontentloaded'),
    link.click(),
  ]);

  // UI: destination should render changelog content.
  await expect(page.getByRole('heading', { name: /(Changelog|Updates)/i })).toBeVisible();
});
