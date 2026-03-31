import type { APIRequestContext, Locator, Page } from '@playwright/test';
import { BasePage } from '../../BasePage';

export class UpdatesSection extends BasePage {
  private readonly heading: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: /Latest Updates and Changelog/i });
  }

  viewFullChangelogLink(): Locator {
    // The link should appear within the updates module.
    const section = this.page
      .locator('section, [role="region"], [data-testid]')
      .filter({ has: this.heading });
    return section.getByRole('link', { name: /View the full changelog/i }).first();
  }

  async verifyViewFullChangelogOk(request: APIRequestContext): Promise<void> {
    const link = this.viewFullChangelogLink();
    if ((await link.count()) === 0) return;
    const href = await this.getHref(link);
    if (!href) return;
    await this.expectHrefOk(request, href);
  }

  async expectUpdatesVisible(): Promise<void> {
    await this.heading.first().waitFor({ state: 'visible' });
  }
}
