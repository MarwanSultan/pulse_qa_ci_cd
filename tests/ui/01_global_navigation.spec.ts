import { test, expect } from '../fixtures/testFixtures';
import { logger } from '../../src/logging/logger';

test('F1: Global navigation links load successfully', async ({ page, homePage, api }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (err) => pageErrors.push(err.message));

  await homePage.verifyPrimaryLinksOk(api);

  // Ensure we didn't trigger any uncaught client-side errors.
  expect(pageErrors, `Page errors: ${pageErrors.join(' | ')}`).toHaveLength(0);
  logger.debug({ pageUrl: page.url() }, 'Global navigation verified');
});

