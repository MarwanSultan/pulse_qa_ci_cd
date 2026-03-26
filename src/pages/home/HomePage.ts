import type { APIRequestContext, Page } from '@playwright/test';
import { BasePage } from '../BasePage';
import { SiteHeader } from './components/SiteHeader';
import { MarketplaceSection } from './components/MarketplaceSection';
import { UpdatesSection } from './components/UpdatesSection';
import { EventsSection } from './components/EventsSection';
import { NewsletterJoinSection } from './components/NewsletterJoinSection';
import { SiteFooter } from './components/SiteFooter';

export class HomePage extends BasePage {
  readonly header: SiteHeader;
  readonly marketplace: MarketplaceSection;
  readonly updates: UpdatesSection;
  readonly events: EventsSection;
  readonly newsletter: NewsletterJoinSection;
  readonly footer: SiteFooter;

  // POM path to load the page (Playwright uses baseURL in config).
  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  constructor(page: Page) {
    super(page);
    this.header = new SiteHeader(page);
    this.marketplace = new MarketplaceSection(page);
    this.updates = new UpdatesSection(page);
    this.events = new EventsSection(page);
    this.newsletter = new NewsletterJoinSection(page);
    this.footer = new SiteFooter(page);
  }

  async verifyPrimaryLinksOk(request: APIRequestContext): Promise<void> {
    // Centralized “sanity” verification for navigation/CTA links.
    await this.header.verifyNavLinkOk(request);
    await this.marketplace.verifyCtaOk(request);
    await this.updates.verifyViewFullChangelogOk(request);
  }
}

