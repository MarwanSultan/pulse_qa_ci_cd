import type { APIRequestContext, Locator, Page } from '@playwright/test';

export abstract class BasePage {
  protected readonly page: Page;

  protected constructor(page: Page) {
    this.page = page;
  }

  // Only actual navigational pages should override this.
  // Component/section objects (used by POM) should not be forced to implement it.
  async goto(): Promise<void> {
    // no-op by default
  }

  protected async getHref(locator: Locator): Promise<string | null> {
    return locator.getAttribute('href');
  }

  protected toAbsoluteUrl(href: string): string {
    // If href is relative, resolve against current baseURL.
    // Playwright already sets `baseURL` for page.goto(), so `page.url()` is safe to resolve against.
    try {
      return new URL(href, this.page.url()).toString();
    } catch {
      return href;
    }
  }

  protected async expectHrefOk(
    request: APIRequestContext,
    href: string,
    options?: { expectedStatuses?: number[] },
  ): Promise<void> {
    const absolute = this.toAbsoluteUrl(href);
    const res = await request.get(absolute);
    const expectedStatuses = options?.expectedStatuses ?? [200, 301, 302, 303, 307, 308];
    if (!expectedStatuses.includes(res.status())) {
      // Include response status for easier debugging in secure logs.
      throw new Error(
        `Expected ${absolute} to return ${expectedStatuses.join(', ')} but got ${res.status()}`,
      );
    }
  }
}
