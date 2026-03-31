import type { APIRequestContext } from '@playwright/test';
import { test as base } from '@playwright/test';
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
  api: async ({ request, baseURL }, use) => {
    const apiRequestContext = request;
    // Create a wrapper that handles relative URLs with baseURL
    const apiWithBase = {
      get: async (url: string) => apiRequestContext.get(`${baseURL}${url}`),
      post: async (url: string, options?: any) =>
        apiRequestContext.post(`${baseURL}${url}`, options),
      put: async (url: string, options?: any) => apiRequestContext.put(`${baseURL}${url}`, options),
      delete: async (url: string, options?: any) =>
        apiRequestContext.delete(`${baseURL}${url}`, options),
    } as any;
    await use(apiWithBase);
  },
});

export { expect } from '@playwright/test';
