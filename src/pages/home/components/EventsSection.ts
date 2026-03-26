import type { Locator, Page } from '@playwright/test';
import { BasePage } from '../../BasePage';

export class EventsSection extends BasePage {
  private readonly heading: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: /Upcoming Events/i });
  }

  eventsContainer(): Locator {
    return this.page.locator('section, [role="region"]').filter({ has: this.heading }).first();
  }

  eventLinks(): Locator {
    // Assume each event is represented as a link inside the module container.
    return this.eventsContainer().locator('a').filter({ hasText: /\S/ });
  }

  async firstEventText(): Promise<string | null> {
    const firstLink = this.eventLinks().first();
    if ((await firstLink.count()) === 0) return null;
    const text = await firstLink.textContent();
    return text?.trim() ?? null;
  }

  firstEventLink(): Locator {
    return this.eventLinks().first();
  }
}

