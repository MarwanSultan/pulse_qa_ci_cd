import { test as base, expect } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';
import { HomePage } from '../../src/pages/home/HomePage';

export const test = base.extend<{
  homePage: HomePage;
  api: APIRequestContext;
}>({
  homePage: async ({ page }, use) => {
    const home = new HomePage(page);
    await home.goto();
    await use(home);
  },
  api: async ({ request }, use) => {
    await use(request);
  },
});

export { expect };

