import type { Locator, Page } from '@playwright/test';
import { BasePage } from '../../BasePage';

export class NewsletterJoinSection extends BasePage {
  private readonly joinHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.joinHeading = page.getByRole('heading', { name: /Join/i }).first();
  }

  joinCta(): Locator {
    // Try common labels used for newsletter/subscription CTAs.
    return this.page.getByRole('button', { name: /Subscribe|Join/i }).first();
  }

  joinLink(): Locator {
    return this.page.getByRole('link', { name: /Subscribe|Join/i }).first();
  }

  emailInput(): Locator {
    // Generic email field selectors.
    return this.page.locator('input[type="email"], input[name="email"], input[aria-label*="email" i]').first();
  }

  submitButton(): Locator {
    return this.page.getByRole('button', { name: /Subscribe|Join/i }).first();
  }

  validationOrStatusMessage(): Locator {
    return this.page.locator('[role="alert"], .error, .validation, text=/success|subscribed/i').first();
  }

  async isJoinFormPresent(): Promise<boolean> {
    return (await this.emailInput().count()) > 0;
  }
}

