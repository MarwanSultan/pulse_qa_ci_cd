import { expect, type APIRequestContext, type Locator } from '@playwright/test';
import { env } from '../config/env';

export async function expectLinkHrefReturnsOk(
  request: APIRequestContext,
  locator: Locator,
): Promise<void> {
  const href = await locator.getAttribute('href');
  if (!href) {
    throw new Error('Link did not have an href attribute.');
  }

  // Resolve relative href against the page's current URL using BasePage logic.
  // We create a minimal BasePage-like resolver by passing request URL context via a dummy page.
  // For simplicity in tests, rely on absolute href if present.
  const absolute =
    href.startsWith('http://') || href.startsWith('https://')
      ? href
      : new URL(href, env.baseUrl).toString();


  const res = await request.get(absolute);
  expect(res.status(), `HTTP status for ${absolute}`).toBeGreaterThanOrEqual(200);
  expect(res.status(), `HTTP status for ${absolute}`).toBeLessThan(400);
}

