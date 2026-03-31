import type { APIRequestContext, Locator, Page } from '@playwright/test';
import { BasePage } from '../../BasePage';

export class MarketplaceSection extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  marketplaceCtaLink(): Locator {
    return this.page.getByRole('link', {
      name: /FedRAMP Marketplace|Browse Marketplace/i,
    });
  }

  totalServicesLabel(): Locator {
    return this.page.getByText(/Total FedRAMP Authorized Services/i, { exact: false });
  }

  addedLast30DaysLabel(): Locator {
    return this.page.getByText(/Added in the last 30 days/i, { exact: false });
  }

  private totalServicesContainer(): Locator {
    return this.page
      .locator('section, [role="region"]')
      .filter({ has: this.totalServicesLabel() })
      .first();
  }

  private addedLast30DaysContainer(): Locator {
    return this.page
      .locator('section, [role="region"]')
      .filter({ has: this.addedLast30DaysLabel() })
      .first();
  }

  totalServicesCountText(): Locator {
    // Look for the first standalone numeric node near the label.
    return this.totalServicesContainer().locator('text=/\\d[\\d,]*/').first();
  }

  addedLast30DaysItems(): Locator {
    return this.addedLast30DaysContainer().locator('a').filter({ hasText: /\S/ });
  }

  async verifyCtaOk(request: APIRequestContext): Promise<void> {
    const cta = this.marketplaceCtaLink();
    if ((await cta.count()) === 0) return;
    const href = await this.getHref(cta.first());
    if (!href) return;
    await this.expectHrefOk(request, href);
  }
}
