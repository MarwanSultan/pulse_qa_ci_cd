import type { APIRequestContext, Locator, Page } from '@playwright/test';
import { BasePage } from '../../BasePage';

export class SiteFooter extends BasePage {
  private readonly footer: Locator;

  constructor(page: Page) {
    super(page);
    this.footer = page.getByRole('contentinfo').first();
  }

  footerLinkByName(nameRegex: RegExp): Locator {
    return this.footer.getByRole('link', { name: nameRegex });
  }

  accessibilityStatementLink(): Locator {
    return this.footerLinkByName(/Accessibility statement/i).first();
  }

  privacyPolicyLink(): Locator {
    return this.footerLinkByName(/Privacy policy/i).first();
  }

  foiaLink(): Locator {
    return this.footerLinkByName(/FOIA/i).first();
  }

  noFearActDataLink(): Locator {
    return this.footerLinkByName(/No FEAR Act data/i).first();
  }

  performanceReportsLink(): Locator {
    return this.footerLinkByName(/Performance reports/i).first();
  }

  vulnerabilityDisclosureLink(): Locator {
    return this.footerLinkByName(/Vulnerability disclosure policy/i).first();
  }

  async verifyCommonFooterLinksOk(request: APIRequestContext): Promise<void> {
    const links: Locator[] = [
      this.accessibilityStatementLink(),
      this.privacyPolicyLink(),
      this.foiaLink(),
      this.noFearActDataLink(),
      this.performanceReportsLink(),
      this.vulnerabilityDisclosureLink(),
    ];

    for (const link of links) {
      if ((await link.count()) === 0) continue;
      const href = await this.getHref(link);
      if (!href) continue;
      await this.expectHrefOk(request, href);
    }
  }
}
