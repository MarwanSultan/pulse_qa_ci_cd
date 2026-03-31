import type { APIRequestContext, Locator, Page } from '@playwright/test';
import { BasePage } from '../../BasePage';

export class SiteHeader extends BasePage {
  private readonly nav: Locator;

  constructor(page: Page) {
    super(page);
    this.nav = page.getByRole('navigation').first();
  }

  // Link(s) commonly used for FedRAMP.gov navigation.
  marketplaceLink(): Locator {
    return this.nav.getByRole('link', { name: /FedRAMP Marketplace|Browse Marketplace/i });
  }

  fedramp20xLink(): Locator {
    return this.nav.getByRole('link', { name: /FedRAMP 20x/i });
  }

  updatesLink(): Locator {
    return this.nav.getByRole('link', { name: /Updates? & Changelog|Changelog/i });
  }

  private async verifyNavLinkOkInternal(request: APIRequestContext, link: Locator): Promise<void> {
    if ((await link.count()) === 0) return;
    const href = await this.getHref(link.first());
    if (!href) return;
    await this.expectHrefOk(request, href);
  }

  async verifyNavLinkOk(request: APIRequestContext): Promise<void> {
    await this.verifyNavLinkOkInternal(request, this.marketplaceLink());
    await this.verifyNavLinkOkInternal(request, this.fedramp20xLink());
    await this.verifyNavLinkOkInternal(request, this.updatesLink());
  }
}
